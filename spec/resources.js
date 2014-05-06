var resources = {
  "/test/static": [{
    "verb": "GET",
    "name": "getStatic",
    "params": []
  }],
  "/test/query": [{
    "verb": "GET",
    "name": "getQuery",
    "params": [{
      "name": "a",
      "style": "query"
    }]
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
  }],
  "/test/json": [{
    "verb": "GET",
    "name": "getJSONData",
    "params": []
  }],
  "/test/xml": [{
    "verb": "GET",
    "name": "getXMLData",
    "params": []
  }],
  "/test/json/fail": [{
    "verb": "GET",
    "name": "getJSONFailData",
    "params": []
  }]
};

if(typeof module != "undefined" && module.exports) {
  module.exports = resources;
}
