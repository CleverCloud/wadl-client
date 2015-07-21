describe("package", function() {
  it("should have the same version in package.json and bower.json", function() {
    var p = require("../package.json");
    var b = require("../bower.json");
    
    expect(p.version).toBe(b.version);
  });
});
