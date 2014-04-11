var WadlClient = (function() {
  /* Dependency aliases (to make WadlClient work on both node and browser environments) */
  var P = typeof Promise != "undefined" ? Promise : require("pacta");
  var request = typeof module != "undefined" && module.exports && typeof require == "function" ? require("request") : null;

  var WadlClient = {};

  /* Redefine request for node environment */
  var sendNodeRequest = function(options) {
    var result = new P();

    request(options, function(error, response, body) {
      if(error) {
        result.reject(error);
      }
      else if(response.statusCode >= 200 && response.statusCode < 300) {
        result.resolve(body);
      }
      else {
        result.reject(body);
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
          result.resolve(xhr.responseText);
        }
        else {
          result.reject(xhr.responseText);
        }
      }
    };

    xhr.open(options.method || "GET", options.uri);

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

    return function(verb, path_template) {
      return function() {
        var params = Array.apply(Array, arguments);
        var path = path_template.replace(/{[^}]*}/g, function(matched) {
          var param = params.shift();
          return typeof param != "undefined" ? param : matched;
        });

        return function(data) {
          var userOptions = typeof data == "object" && data;
          host = userOptions ? (userOptions.host || host) : host;
          headers = userOptions ? (userOptions.headers || headers) : headers;

          return (request ? sendNodeRequest : sendBrowserRequest)({
            uri: host + path,
            method: verb.toUpperCase(),
            headers: headers,
            body: userOptions ? userOptions.data : data
          });
        };
      };
    };
  };

  WadlClient.buildClient = function(endpoints, settings) {
    var client = {};

    for(var path in endpoints) {
      if(endpoints.hasOwnProperty(path)) {
        var formattedPath = path.replace(/{[^}]*}/g, "_");
        formattedPath = formattedPath[0] == "/" ? formattedPath.slice(1) : formattedPath;
        formattedPath = formattedPath[formattedPath.length - 1] == "/" ? formattedPath.slice(0, formattedPath.length - 1) : formattedPath;

        var segments = formattedPath.split("/");
        var segment = segments.reduce(function(node, segment) {
          return node[segment] = node[segment] || {};
        }, client);

        var methods = endpoints[path];
        for(var i = 0; i < methods.length; i++) {
          var method = methods[i];
          segment[method.verb == "DELETE" ? "remove" : method.verb.toLowerCase()] = sendRequest(settings)(method.verb, path);
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
