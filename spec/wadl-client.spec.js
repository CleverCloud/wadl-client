var resources = resources || require("./resources.js");
var WadlClient = WadlClient || require("../wadl-client.js");
var Bacon = Bacon || require("baconjs");

var client = WadlClient.buildClient(resources, {
  host: "http://localhost:3000"
});

describe("wadl-client", function() {
  it("should be able to download resources", function(done) {
    var res = client.test.static.get().send();

    res.onValue(function(data) {
      expect(data).toBe("OK");
      done();
    });
  });

  it("should be able to download resources with query params", function(done) {
    var res = client.test.query.get().withQuery({a: 12345}).send();

    res.onValue(function(data) {
      expect(data).toBe("a=12345");
      done();
    });
  });

  it("should be able to download resources with path params", function(done) {
    var res = client.test.dynamic._.get().withParams(["12345"]).send();

    res.onValue(function(data) {
      expect(data).toBe("12345");
      done();
    });
  });

  it("should be able to download resources by giving specific header at building time", function(done) {
    var client = WadlClient.buildClient(resources, {
      host: "http://localhost:3000",
      headers: {
        Authorization: "12345"
      }
    });

    var res = client.test.private.get().send();

    res.onValue(function(data) {
      expect(data).toBe("OK");
      done();
    });
  });

  it("should be able to download resources by giving specific header at sending time", function(done) {
    var res = client.test.private.get().withHeaders({
      Authorization: "12345"
    }).send();

    res.onValue(function(data) {
      expect(data).toBe("OK");
      done();
    });
  });

  it("should be able to upload resources", function(done) {
    var res = client.test.upload.post().send("12345");

    res.onValue(function(data) {
      expect(data).toBe("12345");
      done();
    });
  });

  it("should be able to upload resources with a specific header", function(done) {
    var res = client.test.private.upload.put().withHeaders({
      Authorization: "12345"
    }).send("12345");

    res.onValue(function(data) {
      expect(data).toBe("12345");
      done();
    });
  });

  it("should be able to parse JSON resources if parse setting is set to true", function(done) {
    var res = client.test.json.get().withParsing().send();

    res.onValue(function(data) {
      expect(data.a).toBe(1);
      expect(data.b).toBe(2);
      done();
    });
  });

  it("should be able to parse JSON resources even if Content-Type header has a charset token", function(done) {
    var res = client.test.json2.get().withParsing().send();

    res.onValue(function(data) {
      expect(data.a).toBe(1);
      expect(data.b).toBe(2);
      done();
    });
  });

  it("should be able to parse XML resources if parse setting is set to true", function(done) {
    var res = client.test.xml.get().withParsing().send();

    res.onValue(function(data) {
      if(data.getElementsByTagName) {
        var a = data.getElementsByTagName("a");
        expect(a && a[0]).not.toBeUndefined();
        expect(a[0].textContent).toBe("1");
      }
      else {
        expect(data.a).not.toBeUndefined();
        expect(data.a[0]).toBe(1);
      }
      done();
    });
  });

  it("should be able to parse JSON resources if parse setting is set to true, even on error", function(done) {
    var res = client.test.json.fail.get().withParsing().send();

    res.onError(function(data) {
      expect(data.a).toBe(1);
      expect(data.b).toBe(2);
      done();
    });
  });

  it("must not fail when checking Content-Type header", function(done) {
    var res = client.test.json3.get().withParsing().send();

    res.onValue(function() {
      done();
    });
  });

  it("must not throw TypeError if resource is not JSON even if Content-Type header says so", function(done){
    var res = client.test.json4.get().withParsing().send();

    res.onError(function(error){
      done();
    });
  });

  it("must not throw TypeError if resource is not JSON even if Content-Type header says so and status is not 200", function(done){
    var res = client.test.json.fail2.get().withParsing().send();

    res.onError(function(error){
      done();
    });
  });

  it("must not throw an 'Argument error, options.body' if body is an object", function(done){
    var body = {
      json: true
    };
    var res = client.test.json5.post().withParsing().send(body);

    res.onValue(function(data){
      expect(data.type).toBe("object");
      done();
    });
  });


  it("must send an error on timeout", function(done) {
    var res = client.test.timeout.get().withTimeout(2000).send();

    res.onError(function(error) {
      expect(error.code).toBe("ETIMEDOUT");
      done();
    });
  });

  it("must be able to abort a request", function(done) {
    var token = Date.now() + ":" + Math.random();

    var res = client.test.abort.post().send(token);
    var unsubscribe = res.onValue();

    setTimeout(unsubscribe, 1000);

    var s_closed = Bacon.later(3000).flatMapLatest(function() {
      return client.test.abort.get().withQuery({token: token}).send();
    });

    s_closed.onValue(function(closed) {
      expect(closed).toBe("true");
      done();
    });
  });

  it("must retain the response of a request", function(done) {
    /* This test will timeout if ….send() does not return a Property */
    var res = client.test.retain.get().send();

    res.onValue(function() {
      /* Do nothing */
    });

    setTimeout(function() {
      res.onValue(function(value) {
        expect(value).toBe("abcdefg");
        done();
      });
    }, 2000);
  });
});
