var swagger = {
  "swagger": "2.0",
  "info": {
    "title": "Test API",
    "version": "0.0.0",
    "description": "This swagger file is for test purposes"
  },
  "schemes": ["http"],
  "host": "api.example.com",
  "basePath": "/basepath",
  "paths": {
    "/test/static": {
      "get": {
        "responses": {
          "default": {
            "description": "getStatic"
          }
        }
      }
    },
    "/test/query": {
      "get": {
        "responses": {
          "default": {
            "description": "getQuery"
          }
        },
        "parameters": [{
          "name": "a",
          "in": "query",
          "type": "string"
        }]
      }
    },
    "/test/dynamic/{param}": {
      "get": {
        "responses": {
          "default": {
            "description": "getDynamic"
          }
        },
        "parameters": [{
          "name": "param",
          "required": true,
          "in": "path",
          "type": "string"
        }]
      }
    },
    "/test/private": {
      "get": {
        "responses": {
          "default": {
            "description": "getPrivate"
          }
        }
      }
    },
    "/test/upload": {
      "post": {
        "responses": {
          "default": {
            "description": "postData"
          }
        }
      }
    },
    "/test/private/upload": {
      "put": {
        "responses": {
          "default": {
            "description": "putPrivateData"
          }
        }
      }
    },
    "/test/json": {
      "get": {
        "responses": {
          "default": {
            "description": "getJSONData"
          }
        }
      }
    },
    "/test/json2": {
      "get": {
        "responses": {
          "default": {
            "description": "getJSONData2"
          }
        }
      }
    },
    "/test/json3": {
      "get": {
        "responses": {
          "default": {
            "description": "getJSONData3"
          }
        }
      }
    },
    "/test/json4": {
      "get": {
        "responses": {
          "default": {
            "description": "getJSONData4"
          }
        }
      }
    },
    "/test/xml": {
      "get": {
        "responses": {
          "default": {
            "description": "getXMLData"
          }
        }
      }
    },
    "/test/json/fail": {
      "get": {
        "responses": {
          "default": {
            "description": "getJSONFailData"
          }
        }
      }
    },
    "/test/json/fail2": {
      "get": {
        "responses": {
          "default": {
            "description": "getJSONFailData2"
          }
        }
      }
    },
    "/test/timeout": {
      "get": {
        "responses": {
          "default": {
            "description": "getTimeout"
          }
        }
      }
    },
    "/test/abort": {
      "get": {
        "responses": {
          "default": {
            "description": "testAbortion"
          }
        }
      },
      "post": {
        "responses": {
          "default": {
            "description": "testAbortion"
          }
        }
      } 
    },
    "/test/retain": {
      "get": {
        "responses": {
          "default": {
            "description": "retain"
          }
        }
      }
    },
    "/test/partial": {
      "get": {
        "responses": {
          "default": {
            "description": "partial-body"
          }
        }
      }
    },
    "/test/beforeSend": {
      "get": {
        "responses": {
          "default": {
            "description": "before-send"
          }
        }
      }
    },
    "/test/path": {
      "get": {
        "responses": {
          "default": {
            "description": "get-path"
          }
        }
      }
    },
    "/test/verb": {
      "get": {
        "responses": {
          "default": {
            "description": "get-verb"
          }
        }
      }
    },
    "/test/headers": {
      "get": {
        "responses": {
          "default": {
            "description": "get-headers"
          }
        }
      }
    },
    "/test/catch": {
      "get": {
        "responses": {
          "default": {
            "description": "catch"
          }
        }
      }
    }
  }
};

if(typeof module != "undefined" && module.exports) {
  module.exports = swagger;
}
