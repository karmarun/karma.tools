# @karma.run/sdk

[![License][license_shield]][license_link]
[![NPM Package][npm_shield]][npm_link]

## Install

```sh
npm install @karma.run/sdk` or `yarn add @karma.run/sdk
```

## Usage

```ts
import {Remote} from '@karma.run/sdk'

import * as xpr from '@karma.run/sdk/expression'
import * as mdl from '@karma.run/sdk/model'
import * as val from '@karma.run/sdk/value'
import * as utl from '@karma.run/sdk/utility'

const remote = new Remote('http://localhost:8080/')

remote
  .login('admin', 'password')
  .then(async session => {
    console.log(session.toString())

    // Fetch tags
    const tags = await session.do(xpr.all(xpr.tag(utl.Tag.Tag)))
    console.log('Tags:', tags)

    // Create model
    const model = mdl.struct({
      foo: mdl.string,
      bar: mdl.int64
    })

    const modelResult = await session.do(utl.createModels({model}))
    console.log('Model result:', modelResult)

    // Encode value
    const value = {foo: '123', bar: 123}
    const valueResult = await session.do(
      xpr.create(xpr.data(d => d.ref(modelResult.model)), () =>
        xpr.data(model.decode(value).toDataConstructor())
      )
    )
    console.log('Value result:', valueResult)

    // Filter list of integers
    const data = xpr.data(d => d.list([d.int8(3), d.int8(2), d.int8(1)]))
    const filterResult = await session.do(
      xpr.filterList(data, (_index, value) => xpr.gtInt8(value, xpr.int8(2)))
    )
    console.log('Filter Result:', filterResult)
  })
  .catch(err => {
    console.error(err.toString())
  })
```

## Concepts

### Values

There are 21 classes that implement the `Value` interface. They are the JS/TS representation of karma.data values:

`Bool`, `DateTime`, `Float`, `Int16`, `Int32`, `Int64`, `Int8`, `List`, `Map`, `Null`, `Ref`, `Set`, `String`, `Struct`, `Symbol`, `Tuple`, `Uint16`, `Uint32`, `Uint64`, `Uint8`, `Union`

Each Value class has a corresponding constructor on the package top-level, having the same name as the class but with a lower-case first letter. For example a `Uint64` can be constructed calling the constructor function named `uint64`.

As a special case, because `null` is a reserved keyword in JS, we export a package-level name `nil` assigned to an instance of `val.Null` for convenience.

All Value classes implement two methods: `toJSON()` and `toDataConstructor()`.

#### `toJSON`

As you may know, a call to `JSON.stringify(o)` with an object `o` that has a `toJSON()` method will first call that method to delegate serialization.

This method transforms a Value object into the JSON-structure expected by karma.data's `json` codec.

#### `toDataConstructor`

The method `toDataConstructor` returns a `DataConstructor` expression, which can be wrapped in a call to `xpr.data` to embed static data in an expression.

### Expressions

There are hundreds of expression classes with corresponding convenience constructors, just as with Values. These classes all extend the abstract class `Expression`. For example, there is an `All` class, which can be constructed using the `all` convenience constructor.

In addition, expressions can be constructed by chaining. Every expression has methods corresponding to the constructors with a given first expresison argument. For example `xpr.tag("_tag").all()` is equivalent to `xpr.all(xpr.tag("_tag"))`.

All Expression classes implement the method `toValue()` that returns a Value object. This is the value-representation of an expression, which can be JSON-encoded to send over the wire in karma.data's `json` codec.

### Models

There are 26 Model classes: `Recursion`, `Annotation`, `Optional`, `Unique`, `Tuple`, `List`, `Union`, `Any`, `Struct`, `Map`, `Float`, `Bool`, `String`, `Ref`, `DateTime`, `Enum`, `Set`, `Int8`, `Int16`, `Int32`, `Int64`, `Uint8`, `Uint16`, `Uint32`, `Uint64`, `Null`.

All Model classes implement two methods: `decode(json : any)` and `toValue()`, both returning Value objects.

#### `decode`

This method takes a wire-representation of karma.data's `json` codec and converts it into a Value objects, interpreting the data according to the given Model.

#### `toValue`

This method transforms a Model object into its' Value object representation. From there, it can be converted into a data constructor or JSON.

[license_shield]: https://img.shields.io/github/license/karmarun/karma.tools.svg
[license_link]: https://github.com/karmarun/karma.run-sdk-js/blob/master/LICENSE
[npm_shield]: https://img.shields.io/npm/v/@karma.run/sdk.svg
[npm_link]: https://www.npmjs.com/package/@karma.run/sdk
