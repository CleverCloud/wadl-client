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
  "/test/json2": [{
    "verb": "GET",
    "name": "getJSONData2",
    "params": []
  }],
  "/test/json3": [{
    "verb": "GET",
    "name": "getJSONData3",
    "params": []
  }],
  "/test/json4": [{
    "verb": "GET",
    "name": "getJSONData4",
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
  }],
  "/test/json/fail2": [{
    "verb": "GET",
    "name": "getJSONFailData2",
    "params": []
  }],
  "/test/timeout": [{
    "verb": "GET",
    "name": "getTimeout",
    "params": []
  }],
  "/test/abort": [{
    "verb": "GET",
    "name": "testAbortion",
    "params": []
  },{
    "verb": "POST",
    "name": "testAbortion",
    "params": []
  }],
  "/test/retain": [{
    "verb": "GET",
    "name": "retain",
    "params": []
  }],
  "/test/partial": [{
    "verb": "GET",
    "name": "partial-body",
    "params": []
  }]
};

if(typeof module != "undefined" && module.exports) {
  module.exports = resources;
}
