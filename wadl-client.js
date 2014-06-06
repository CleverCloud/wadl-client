var WadlClient = (function() {
  /* Dependency aliases (to make WadlClient work on both node and browser environments) */
  var P = typeof Promise != "undefined" ? Promise : require("pacta");
  var request = typeof module != "undefined" && module.exports && typeof require == "function" ? require("request") : null;
  var parser = typeof module != "undefined" && module.exports && typeof require == "function" ? require("xml2json") : null;

  var WadlClient = {};

  var querystring = function(params) {
    var pairs = [];
    params = params || {};

    for(var name in params) {
      if(params.hasOwnProperty(name)) {
        pairs.push(typeof params[name] != "undefined" ? encodeURIComponent(name) + "=" + encodeURIComponent(params[name]) : encodeURIComponent(name));
      }
    }

    return pairs.length === 0 ? "" : "?" + pairs.join("&");
  };

  var any = function(values, f) {
    for(var i in values) {
      var result = f(values[i]);

      if(result) {
        return result;
      }
    }

    return false;
  };

  var nodeResponseHeaderHasValue = function(response, header, values) {
    return any(values, function(value) {
      return (response.headers[header] || "").indexOf(value) >= 0;
    });
  };

  var browserResponseHeaderHasValue = function(response, header, values) {
    return any(values, function(value) {
      return (response.getResponseHeader(header) || "").indexOf(value) >= 0;
    });
  };

  /* Redefine request for node environment */
  var sendNodeRequest = function(options) {
    var result = new P();

    request(options, function(error, response, body) {
      if(error) {
        result.reject(error);
      }
      else if(response.statusCode >= 200 && response.statusCode < 300) {
        if(options.parseJSON && nodeResponseHeaderHasValue(response, "content-type", ["application/json"])) {
          result.resolve(JSON.parse(body));
        }
        else if(options.parseXML && nodeResponseHeaderHasValue(response, "content-type", ["text/xml", "application/rss+xml", "application/rss+xml", "application/atom+xml"])) {
          result.resolve(parser.toJson(body, {
            object: true,
            arrayNotation: true
          }));
        }
        else {
          result.resolve(body);
        }
      }
      else {
        if(options.parseJSON && nodeResponseHeaderHasValue(response, "content-type", ["application/json"])) {
          result.reject(JSON.parse(body));
        }
        else if(options.parseXML && nodeResponseHeaderHasValue(response, "content-type", ["text/xml", "application/rss+xml", "application/rss+xml", "application/atom+xml"])) {
          result.reject(parser.toJson(body, {
            object: true,
            arrayNotation: true
          }));
        }
        else {
          result.reject(body);
        }
      }
    });

    return result;
  };

  /* Redefine request for browser environment */
  var sendBrowserRequest = function(options) {
    options = options || {};
    options.headers = options.headers || {};

    var result = new P();
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status >= 200 && xhr.status < 300) {
          if(options.parseJSON && browserResponseHeaderHasValue(xhr, "Content-Type", ["application/json"])) {
            result.resolve(JSON.parse(xhr.responseText));
          }
          else if(options.parseXML && browserResponseHeaderHasValue(xhr, "Content-Type", ["text/xml", "application/rss+xml", "application/rss+xml", "application/atom+xml"])) {
            result.resolve(xhr.responseXML);
          }
          else {
            result.resolve(xhr.responseText);
          }
        }
        else {
          if(options.parseJSON && browserResponseHeaderHasValue(xhr, "Content-Type", ["application/json"])) {
            result.reject(JSON.parse(xhr.responseText));
          }
          else if(options.parseXML && browserResponseHeaderHasValue(xhr, "Content-Type", ["text/xml", "application/rss+xml", "application/rss+xml", "application/atom+xml"])) {
            result.reject(xhr.responseXML);
          }
          else {
            result.reject(xhr.responseText);
          }
        }
      }
    };

    xhr.open(options.method || "GET", options.uri + querystring(options.qs));

    for(var name in options.headers) {
      if(options.headers.hasOwnProperty(name)) {
        xhr.setRequestHeader(name, options.headers[name]);
      }
    }

    xhr.send(options.body);

    return result;
  };

  var sendRequest = function(options) {
    var host = options.host || "";
    var headers = options.headers || {};
    var parseJSON = options.parseJSON || false;
    var parseXML = options.parseXML || false;

    return function(verb, path_template) {
      return function() {
        var params = Array.apply(Array, arguments);
        var path = path_template.replace(/{[^}]*}/g, function(matched) {
          var param = params.shift();
          return typeof param != "undefined" ? param : matched;
        });

        return function(data) {
          var userOptions = typeof data == "object" && data;
          var qs = userOptions && userOptions.query;
          host = userOptions ? (userOptions.host || host) : host;
          headers = userOptions ? (userOptions.headers || headers) : headers;

          return (request ? sendNodeRequest : sendBrowserRequest)({
            uri: host + path,
            method: verb.toUpperCase(),
            headers: headers,
            qs: qs,
            body: userOptions ? userOptions.data : data,
            parseJSON: parseJSON,
            parseXML: parseXML
          });
        };
      };
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

  WadlClient.buildClient = function(endpoints, settings) {
    var client = {};

    for(var path in endpoints) {
      if(endpoints.hasOwnProperty(path)) {
        var formattedPath = path.replace(/{[^}]*}/g, "_");
        formattedPath = formattedPath[0] == "/" ? formattedPath.slice(1) : formattedPath;
        formattedPath = formattedPath[formattedPath.length - 1] == "/" ? formattedPath.slice(0, formattedPath.length - 1) : formattedPath;

        var segments = formattedPath.split("/");
        var node = buildNodeFromSegments(client, segments);

        var methods = endpoints[path];
        for(var i = 0; i < methods.length; i++) {
          var method = methods[i];
          node[method.verb == "DELETE" ? "remove" : method.verb.toLowerCase()] = sendRequest(settings)(method.verb, path);
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
