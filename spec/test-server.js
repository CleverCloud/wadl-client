var http = require("http");
var express = require("express");
var textBody = require("body");
var Bacon = require("baconjs");

var app = express();

app.use(express.static(__dirname + "/.."));

app.get("/test/static", function(req, res) {
  res.send("OK");
});

app.get("/test/query", function(req, res) {
  res.send(req.query.a ? "a=" + req.query.a : "NOK");
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

app.get("/test/json", function(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    a: 1,
    b: 2
  }));
});

app.get("/test/json2", function(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(JSON.stringify({
    a: 1,
    b: 2
  }));
});

app.get("/test/json3", function(req, res) {
  res.send(null);
});

app.get("/test/json4", function(req, res){
  res.setHeader("Content-Type", "application/json");
  res.send("{'a':'1', 'b'");
});

app.get("/test/xml", function(req, res) {
  res.setHeader("Content-Type", "application/atom+xml");
  res.send("<a>1</a>");
});

app.get("/test/json/fail", function(req, res) {
  res.statusCode = 400;
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    a: 1,
    b: 2
  }));
});

app.get("/test/json/fail2", function(req, res){
  res.statusCode = 400;
  res.setHeader("Content-Type", "application/json");
  res.send("{'a':'1', 'b'");
});

app.get("/test/timeout", function(req, res) {
  setTimeout(function() {
    res.send("6789");
  }, 5000);
});

var s_closed = {};

app.post("/test/abort", function(req, res) {
  textBody(req, function(err, body) {
    s_closed[body] = Bacon.fromEventTarget(res, "close").map(true).toProperty(false);
    s_closed[body].onValue();
  });
});

app.get("/test/abort", function(req, res) {
  if(s_closed[req.query.token]) {
    s_closed[req.query.token].onValue(function(closed) {
      res.send(closed.toString());
    });
  }
  else {
    res.statusCode = 404;
    res.send("Not found.");
  }
});

app.get("/test/retain", function(req, res) {
  res.send("abcdefg");
});

app.get("/test/partial", function(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send("{\"a\": 1, \"b\":");
});

app.get("/test/beforeSend", function(req, res) {
  res.send(req.headers.custom);
});

app.get("/test/headers", function(req, res){
  res.send(req.headers["authorization"] ? "auth" : "not auth").end();
});

app.get("/test/catch", function(req, res) {
  res.send();
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
