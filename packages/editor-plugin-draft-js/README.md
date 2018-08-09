```
[
  {
    "annotation": {
      "value": "field:richText",
      "model": {
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
                      "key": {"string": {}},
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
                "data": {
                  "optional": {
                    "union": {
                      "url": {"string": {}}
                    }
                  }
                }
              }
            }
          },
          "entityMap": {
            "map": {
              "struct": {
                "data": {
                  "optional": {
                    "union": {
                      "url": {"string": {}}
                    }
                  }
                },
                "mutability": {"string": {}},
                "type": {"string": {}}
              }
            }
          }
        }
      }
    }
  }
]
```
