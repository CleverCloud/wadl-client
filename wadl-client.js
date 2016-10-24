var WadlClient = (function() {
  /* Dependency aliases (to make WadlClient work on both node and browser environments) */
  var B = typeof require == "function" && require("baconjs") ? require("baconjs") : Bacon;
  var request = typeof XMLHttpRequest != "undefined" ? null : require("request");

  // If you want xml2json support, add it as a dependency of your project
  var parser;
  try{
    parser = typeof XMLHttpRequest != "undefined" ? null : require("xml2json");
  } catch(err){
    parser = null;
  }

  /* Utils */
  var Utils = {};

  Utils.any = function(values, f) {
    for(var i in values) {
      var result = f(values[i]);

      if(result) {
        return result;
      }
    }

    return false;
  };

  Utils.elem = function(array, values) {
    return Utils.any(values, function(value) {
      return array.indexOf(value) >= 0;
    });
  };

  Utils.parseBody = function(response, body) {
    var contentType = typeof XMLHttpRequest != "undefined" ? response.getResponseHeader("Content-Type") : response.headers["content-type"];

    if(Utils.elem(contentType || "", ["application/json"])) {
      return JSON.parse(typeof response.responseText != "undefined" ? response.responseText : body);
    }
    else if(Utils.elem(contentType || "", ["text/xml", "application/rss+xml", "application/rdf+xml", "application/atom+xml"])) {
      if(!response.responseXML && !parser){
        throw new Error("Parser is undefined. Please add xml2json as a dependency in your project");
      }

      return response.responseXML ? response.responseXML : parser.toJson(body, {
        object: true,
        arrayNotation: true
      });
    }
    else {
      return response.responseText || body;
    }
  };

  Utils.querystring = function(params) {
    var pairs = [];
    params = params || {};

    for(var name in params) {
      if(params.hasOwnProperty(name)) {
        pairs.push(typeof params[name] != "undefined" ? encodeURIComponent(name) + "=" + encodeURIComponent(params[name]) : encodeURIComponent(name));
      }
    }

    return pairs.length === 0 ? "" : "?" + pairs.join("&");
  };

  Utils.send = function(sink, data) {
    sink(data);
    sink(new B.End());
  };

  Utils.logError = function(logger, message) {
    if(logger && logger.error) {
      logger.error(message);
    }
  };

  Utils.logDebug = function(logger, message) {
    if(logger && logger.debug) {
      logger.debug(message);
    }
  };

  Utils.copyObject = function(obj){
    var ret = {};
    for(var key in obj){
      ret[key] = obj[key];
    }

    return ret;
  };

  var WadlClient = {};

  /* Redefine request for node environment */
  var sendNodeRequest = function(options) {
    return B.fromBinder(function(sink) {
      // Node 0.12.x truncates results on https requests if keepAlive is not
      // explicitely enabled. See https://github.com/joyent/node/issues/25749
      if(options.uri.indexOf("https://") === 0) {
        options.agent = new (require("https").Agent)({
          keepAlive: true
        });
      }
      var req = request(options, function(error, response, body) {
        var parseResult;
        try {
          if(error) {
            Utils.logError(options.logger, error);
            parseResult = new B.Error(error);
          }
          else if(response.statusCode >= 200 && response.statusCode < 300) {
            parseResult = options.parse ? Utils.parseBody(response, body) : body;
          }
          else {
            parseResult = new B.Error(options.parse ? Utils.parseBody(response, body) : body);
          }
        } catch(e) {
          Utils.logError(options.logger, "An error occured while parsing: " + body);
          parseResult = new B.Error(e);
        }

        Utils.send(sink, parseResult);
      });

      return function() {
        req.abort();
      };
    }).toProperty();
  };

  /* Redefine request for browser environment */
  var sendBrowserRequest = function(options) {
    options = options || {};
    options.headers = options.headers || {};

    return B.fromBinder(function(sink) {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          try {
            if(xhr.status >= 200 && xhr.status < 300) {
              Utils.send(sink, options.parse ? Utils.parseBody(xhr) : xhr.responseText);
            }
            else if(xhr.status === 0 || xhr.reason === "timeout") {
              Utils.logError(options.logger, xhr.responseText);
              Utils.send(sink, new B.Error({code: "ETIMEDOUT"}));
            }
            else {
              Utils.send(sink, new B.Error(options.parse ? Utils.parseBody(xhr) : xhr.responseText));
            }
          } catch(e) {
            Utils.logError(options.logger, "An error occured while parsing: " + xhr.responseText);
            Utils.send(sink, new B.Error(e));
          }
        }
      };

      xhr.open(options.method || "GET", options.uri + Utils.querystring(options.qs));

      // xhr.timeout must be set after xhr.open() is called (IE throws an InvalidStateError)
      if(typeof xhr.ontimeout != "undefined") {
        xhr.timeout = options.timeout;
      }
      else if(options.timeout > 0) {
        setTimeout(function() {
          xhr.reason = "timeout";
          xhr.abort();
        }, options.timeout);
      }

      for(var name in options.headers) {
        if(options.headers.hasOwnProperty(name)) {
          xhr.setRequestHeader(name, options.headers[name]);
        }
      }

      xhr.send(options.body || null);

      return function() {
        xhr.reason = "abort";
        xhr.abort();
      };
    }).toProperty();
  };

  var prepareRequest = function(verb, pathTemplate, defaultSettings) {
    return function() {
      var req = {};

      req.send = function(body) {
        var getSettings = function() {
          var host = req.host;
          var path = req.getPath();

          return {
            uri: host + path,
            method: verb.toUpperCase(),
            headers: req.headers,
            qs: req.query,
            parse: req.parse,
            timeout: req.timeout,
            logger: req.logger,
            body: body
          };
        };

        Utils.logDebug(defaultSettings.logger, verb + " " + req.host + req.getPath());
        return req.sender(defaultSettings && defaultSettings.hooks && typeof defaultSettings.hooks.beforeSend == "function" ? defaultSettings.hooks.beforeSend(getSettings()) : getSettings());
      };

      req.getVerb = function() {
        return verb;
      };

      req.getPath = function() {
        var params = Array.apply(Array, req.params);

        return pathTemplate.replace(/{[^}]*}/g, function(matched) {
          var param = params.shift();
          return typeof param != "undefined" ? param : matched;
        });
      };

      req.sender = defaultSettings.sendRequest || (request ? sendNodeRequest : sendBrowserRequest);
      req.withSender = function(sender) {
        req.sender = sender;
        return req;
      };

      req.host = defaultSettings.host || "";
      req.withHost = function(host) {
        req.host = host;
        return req;
      };

      req.params = [];
      req.withParams = function(params) {
        req.params = params;
        return req;
      };

      req.headers = Utils.copyObject(defaultSettings.headers || {});
      req.withHeaders = function(headers) {
        for(var name in headers) {
          req.headers[name] = headers[name];
        }
        return req;
      };

      req.query = {};
      req.withQuery = function(query) {
        req.query = query;
        return req;
      };

      req.parse = defaultSettings.parse;
      req.withParsing = function(parse) {
        req.parse = typeof parse == "undefined" ? true : parse;
        return req;
      };

      req.timeout = defaultSettings.timeout;
      req.withTimeout = function(timeout) {
        req.timeout = timeout;
        return req;
      };

      req.logger = defaultSettings.logger;
      req.withLogger = function(logger) {
        req.logger = logger;
        return req;
      };

      return req;
    };
  };

  var buildNodeFromSegments = function(node, segments) {
    var segment = segments[0];

    if(segment) {
      node[segment] = node[segment] || {};
      return buildNodeFromSegments(node[segment], segments.slice(1));
    }
    else {
      return node;
    }
  };

  WadlClient.buildClient = function(swagger, settings) {
    var client = {};
    var endpoints = swagger.paths;

    for(var path in endpoints) {
      if(endpoints.hasOwnProperty(path)) {
        var formattedPath = path.replace(/{[^}]*}/g, "_");
        formattedPath = formattedPath[0] == "/" ? formattedPath.slice(1) : formattedPath;
        formattedPath = formattedPath[formattedPath.length - 1] == "/" ? formattedPath.slice(0, formattedPath.length - 1) : formattedPath;

        var segments = formattedPath.split("/");
        var node = buildNodeFromSegments(client, segments);

        var methods = endpoints[path];
        for(var verb in methods) {
          var method = methods[verb];
          node[verb.toLowerCase()] = prepareRequest(verb.toUpperCase(), path, settings || {});
        }
      }
    }

    return client;
  };

  return WadlClient;
})();

/* Export WadlClient if we are in a node environment */
if(typeof module != "undefined" && module.exports) {
  module.exports = WadlClient;
}
