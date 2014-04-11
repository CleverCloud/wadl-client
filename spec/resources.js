var resources = {
  "/test/static": [{
    "verb": "GET",
    "name": "getStatic",
    "params": []
  }],
  "/test/dynamic/{param}": [{
    "verb": "GET",
    "name": "getDynamic",
    "params": [{
      "name": "param",
      "style": "template"
    }]
  }],
  "/test/private": [{
    "verb": "GET",
    "name": "getPrivate",
    "params": []
  }],
  "/test/upload": [{
    "verb": "POST",
    "name": "postData",
    "params": []
  }],
  "/test/private/upload": [{
    "verb": "PUT",
    "name": "putPrivateData",
    "params": []
  }]
};

if(typeof module != "undefined" && module.exports) {
  module.exports = resources;
}
