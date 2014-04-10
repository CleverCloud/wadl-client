var _ = require("lodash");
var request = require("request");
var Promise = require("pacta");

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

        var requestOptions = {
          uri: host + path,
          method: verb.toUpperCase(),
          headers: headers
        };

        var result = new Promise();

        request(requestOptions, function(error, response, body) {
          if(error) {
            result.reject(error);
          }
          else if(response.statusCode >= 400) {
            result.reject(body);
          }
          else {
            result.resolve(body);
          }
        });

        return result;
      };
    };
  };
};

exports.buildClient = function(endpoints, settings) {
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
