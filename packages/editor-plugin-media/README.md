```
xpr.create(xpr.tag('_model'), () =>
  xpr.data(() =>
    mdl
      .annotation(
        'field:media',
        mdl.struct({
          mediaType: mdl.union({
            image: mdl.struct({
              width: mdl.int32,
              height: mdl.int32
            }),
            video: mdl.struct({
              dummy: mdl.optional(mdl.string)
            }),
            audio: mdl.struct({
              dummy: mdl.optional(mdl.string)
            }),
            document: mdl.struct({
              dummy: mdl.optional(mdl.string)
            }),
            other: mdl.struct({
              dummy: mdl.optional(mdl.string)
            })
          }),
          id: mdl.string,
          url: mdl.string,
          format: mdl.string,
          mimeType: mdl.string,
          filename: mdl.string,
          fileSize: mdl.int32,
          extension: mdl.string,
          focusPoint: mdl.struct({
            x: mdl.float,
            y: mdl.float
          }),
          focusScale: mdl.float
        })
      )
      .toValue()
      .toDataConstructor()
  )
)
```
