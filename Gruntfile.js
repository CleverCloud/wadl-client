module.exports = function(grunt) {
  var testServer = require("./spec/test-server.js");

  grunt.initConfig({
    bower_concat: {
      all: {
        dest: "spec/browser-dependencies.js"
      }
    },
    browserify: {
      test: {
        files: {
          "spec/bundle.js": "spec/wadl-client.spec.js"
        },
        options: {
          ignore: ["request", "xml2json"]
        }
      }
    },
    jasmine: {
      browserify: {
        options: {
          host: "http://localhost:3000/",
          outfile: "index.html",
          specs: "spec/bundle.js"
        }
      },
      default: {
        src: ["spec/browser-dependencies.js", "spec/swagger.js", "wadl-client.js"],
        options: {
          host: "http://localhost:3000/",
          outfile: "index.html",
          specs: "spec/wadl-client.spec.js"
        }
      }
    },
    jasmine_node: {
      all: ["spec/"]
    },
    jshint: {
      all: ["wadl-client.js", "spec/**/*.spec.js"]
    }
  });

  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('start-test-server', function() {
    testServer.start();
  });

  grunt.registerTask('stop-test-server', function() {
    testServer.stop();
  });

  grunt.registerTask("test-node", "jasmine_node");
  grunt.registerTask("test-browser", ["bower_concat", "browserify", "jasmine"]);
  grunt.registerTask("test", ["test-node", "test-browser"]);
  grunt.registerTask("default", ["jshint", "start-test-server", "test", "stop-test-server"]);
};
