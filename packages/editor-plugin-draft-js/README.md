```
[
  {
    "annotation": {
      "value": "field:richText",
      "model": {
        "recursive": {
          "models": {
            "data": {
              "optional": {
                "union": {
                  "url": {"string": {}}
                }
              }
            },
            "value": {
              "struct": {
                "blocks": {
                  "list": {
                    "struct": {
                      "key": {"string": {}},
                      "type": {"string": {}},
                      "text": {"string": {}},
                      "depth": {"int32": {}},
                      "entityRanges": {
                        "list": {
                          "struct": {
                            "key": {"int32": {}},
                            "length": {"int32": {}},
                            "offset": {"int32": {}}
                          }
                        }
                      },
                      "inlineStyleRanges": {
                        "list": {
                          "struct": {
                            "length": {"int32": {}},
                            "offset": {"int32": {}},
                            "style": {"string": {}}
                          }
                        }
                      },
                      "data": {"recurse": "data"}
                    }
                  }
                },
                "entityMap": {
                  "map": {
                    "struct": {
                      "data": {"recurse": "data"},
                      "mutability": {"string": {}},
                      "type": {"string": {}}
                    }
                  }
                }
              }
            }
          },
          "top": "value"
        }
      }
    }
  }
]
```
