module.exports = function(grunt) {
  var testServer = require("./spec/test-server.js");

  grunt.initConfig({
    jasmine_node: {
      all: ["spec/"]
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');

  grunt.registerTask('start-test-server', function() {
    testServer.start();
  });

  grunt.registerTask('stop-test-server', function() {
    testServer.stop();
  });

  grunt.registerTask('test', ['jasmine_node']);
  grunt.registerTask('default', ['start-test-server', 'test', 'stop-test-server']);
};
