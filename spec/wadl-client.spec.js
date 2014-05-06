var resources = resources || require("./resources.js");
var WadlClient = WadlClient || require("../wadl-client.js");

var isServerSide = typeof module != "undefined" && module.exports && typeof require == "function";

var client = WadlClient.buildClient(resources, {
  host: "http://localhost:3000"
});

describe("wadl-client", function() {
  it("should be able to download resources", function(done) {
    var p = client.test.static.get()();

    p.map(function(result) {
      expect(result).toBe("OK");
      done();
    });

    p.mapError(function(error) {
      expect(error).toBe("OK"); // make test fail if any error
      done();
    });
  });

  it("should be able to download resources with query params", function(done) {
    var p = client.test.query.get()({
      query: {a: 12345}
    });

    p.map(function(result) {
      expect(result).toBe("a=12345");
      done();
    });

    p.mapError(function(error) {
      expect(error).toBe("a=12345"); // make test fail if any error
      done();
    });
  });

  it("should be able to download resources with path params", function(done) {
    var p = client.test.dynamic._.get("12345")();

    p.map(function(result) {
      expect(result).toBe("12345");
      done();
    });

    p.mapError(function(error) {
      expect(error).toBe("12345"); // make test fail if any error
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

    var p = client.test.private.get()();

    p.map(function(result) {
      expect(result).toBe("OK");
      done();
    });

    p.mapError(function(error) {
      expect(error).toBe("OK");
      done();
    });
  });

  it("should be able to download resources by giving specific header at sending time", function(done) {
    var p = client.test.private.get()({
      headers: {
        Authorization: "12345"
      }
    });

    p.map(function(result) {
      expect(result).toBe("OK");
      done();
    });

    p.mapError(function(error) {
      expect(error).toBe("OK");
      done();
    });
  });

  it("should be able to upload resources", function(done) {
    var p = client.test.upload.post()("12345");

    p.map(function(result) {
      expect(result).toBe("12345");
      done();
    });

    p.mapError(function(error) {
      expect(error).toBe("12345");
      done();
    });
  });

  it("should be able to upload resources with a specific header", function(done) {
    var p = client.test.private.upload.put()({
      data: "12345",
      headers: {
        Authorization: "12345"
      }
    });

    p.map(function(result) {
      expect(result).toBe("12345");
      done();
    });

    p.mapError(function(error) {
      expect(error).toBe("12345");
      done();
    });
  });

  it("should be able to parse JSON resources if parseJSON setting is set to true", function(done) {
    var client = WadlClient.buildClient(resources, {
      host: "http://localhost:3000",
      parseJSON: true
    });

    var p = client.test.json.get()();

    p.map(function(result) {
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      done();
    });

    p.mapError(function(error) {
      expect(error.a).toBe(1);
      expect(error.b).toBe(2);
      done();
    });
  });

  it("should be able to parse XML resources if parseXML setting is set to true", function(done) {
    var client = WadlClient.buildClient(resources, {
      host: "http://localhost:3000",
      parseXML: true
    });

    var p = client.test.xml.get()();

    p.map(function(result) {
      if(isServerSide) {
        expect(result.a).not.toBeUndefined();
        expect(result.a[0]).toBe(1);
      }
      else {
        var a = result.getElementsByTagName("a");
        expect(a && a[0]).not.toBeUndefined();
        expect(a[0].textContent).toBe("1");
      }
      done();
    });

    p.mapError(function(error) {
      expect(false).toBe(true);
      done();
    });
  });

  it("should be able to parse JSON resources if parseJSON setting is set to true, even on error", function(done) {
    var client = WadlClient.buildClient(resources, {
      host: "http://localhost:3000",
      parseJSON: true
    });

    var p = client.test.json.fail.get()();

    p.map(function(result) {
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      done();
    });

    p.mapError(function(error) {
      expect(error.a).toBe(1);
      expect(error.b).toBe(2);
      done();
    });
  });
});
