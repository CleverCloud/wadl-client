var resources = require("./resources.js");
var client = require("../wadl-client.js").buildClient(resources, {
  host: "http://api.clever-cloud.com/v2"
});

describe("wadl-client", function() {
  it("should be able to download resources", function(done) {
    var p_packages = client.products.packages.get()();

    p_packages.map(function(packages) {
      expect(packages).not.toBeUndefined();
      done();
    });

    p_packages.mapError(function(error) {
      expect(false).toBe(true); // make test fail if any error
      done();
    });
  });

  it("should be able to download resources with custom headers", function(done) {
    var p_user = client.self.get()({
      headers: {
        Authorization: 'OAuth realm="http://ccapi.cleverapps.io/v2/oauth", oauth_consumer_key="DVXgEDKLATkZkSRqN7iQ0KwWSvtNaD", oauth_token="51607c6d1a0f49e0920581940ed6af99", oauth_signature_method="PLAINTEXT", oauth_signature="GPKbDuphYWFr3faS5dg64eCjsrpxGY&b34a803f643146b0887679b487b06417", oauth_timestamp="1397119729", oauth_nonce="296340"'
      }
    });

    p_user.map(function(user) {
      expect(user).not.toBeUndefined();
      done();
    });

    p_user.mapError(function(error) {
      expect(false).toBe(true); // make test fail if any error
      done();
    });
  });
});
