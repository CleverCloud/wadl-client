var http = require("http");
var express = require("express");
var textBody = require('body');

var app = express();

app.get("/", function(req, res) {
  res.send("");
});

app.get("/test/static", function(req, res) {
  res.send("OK");
});

app.get("/test/dynamic/:param", function(req, res) {
  res.send(req.params.param);
});

app.get("/test/private", function(req, res) {
  res.send(req.headers.authorization == "12345" ? "OK" : "NOK");
});

app.post("/test/upload", function(req, res) {
  textBody(req, function(err, body) {
    res.send(body);
  });
});

app.put("/test/private/upload", function(req, res) {
  textBody(req, function(err, body) {
    res.send(req.headers.authorization == "12345" ? body : "NOK");
  });
});

var server;

exports.start = function() {
  console.log("test server is listening on port 3000");
  server = http.createServer(app);
  server.listen(3000);
};

exports.stop = function() {
  console.log("stop test server");
  server.close();
};
