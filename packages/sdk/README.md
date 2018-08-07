# @karma.run/sdk

[![License][license_shield]][license_link]
[![NPM Package][npm_shield]][npm_link]

## Install

```sh
npm install @karma.run/sdk` or `yarn add @karma.run/sdk
```

## Usage

### Raw Query API

```ts
import {data as d, expression as e, func as f} from '@karma.run/sdk'

e.filterList(
  e.data(d.list(d.int8(3), d.int8(2), d.int8(1))),
  f.function(['index', 'value'], e.gtInt8(e.scope('value'), e.data(d.int8(2))))
)

f.function(['param'], e.tag(e.scope('param')))
```

### Query Builder API

```ts
import {buildExpression, buildFunction} from '@karma.run/sdk'

buildExpression(e =>
  e.filterList(e.data(d => d.list(d.int8(3), d.int8(2), d.int8(1))), (_, value) =>
    e.gtInt8(value, e.data(d => d.int8(2)))
  )
)

buildFunction(e => param => e.tag(param))
```

### Karma API

```ts
import {Client, buildFunction} from '@karma.run/sdk'

const client = new Client('https://localhost:8080')

client.authenticate('admin', 'password').then(async session => {
  const response = await client.query(buildFunction(e => () => e.tag('_model')))

  console.log(`Session: ${session}, Response: ${response}`)
})
```

[license_shield]: https://img.shields.io/github/license/karmarun/karma.run-sdk-js.svg
[license_link]: https://github.com/karmarun/karma.run-sdk-js/blob/master/LICENSE
[npm_shield]: https://img.shields.io/npm/v/@karma.run/sdk.svg
[npm_link]: https://www.npmjs.com/package/@karma.run/sdk
