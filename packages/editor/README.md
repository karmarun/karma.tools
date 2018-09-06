# @karma.run/editor

[![License][license_shield]][license_link]
[![NPM Package][npm_shield]][npm_link]

Administrative editor for karma.data.

![Preview](https://raw.githubusercontent.com/karmarun/karma.tools/master/packages/editor/docs/media/preview.png)

## Install

```sh
npm install -g @karma.run/editor
```

## Basic Usage

```sh
$ karma-editor --help

  Usage: karma-editor [options] [command]

  Options:

    -V, --version          output the version number
    -h, --help             output usage information

  Commands:

    server [options]       Run editor server.
    build [options]        Pre-build editor client.
    viewcontext [options]  Output inferred view context for all models.
    clean [options]        Clean client cache.
```

## Configuration Files

Configuration files allow the usage of plugins and advanced customization of the editor, they can be written in JavaScript or TypeScript.

The CLI will automatically search for `editor.client.config.{js,ts,tsx}` and `editor.server.config.{js,ts,tsx}` upwards from the current working directory, if you'd rather be specific you can always set the config path manually via CLI option `--server-config-path` and `--client-config-path`.

Example configurations can be found [here](./example)

**NOTICE: It's recommended to have both configuration files in the same directory**

### Client Configuration

The client configuration file will be compiled directly into the client bundle via webpack, so no real Node environment is available in this config file.

```ts
{
  // List of client plugins.
  plugins?: ClientPlugins[]
}
```

### Server Configuration

```ts
{
  // Port the server runs on, can be overriden by 'PORT' environment variable or CLI option '--port'.
  port?: number

  // karma.data URL, can be overriden by 'KARMA_DATA_URL' environment variable or CLI option '--karma-data-url'.
  karmaDataURL?: string

  // List of server plugins.
  plugins?: ServerPlugin[]

  // Customize editor contexts based on user roles.
  editorContexts?: (roles: string[], tagMap: ReadonlyMap<string, Ref>) => EditorContext[]

  // Customize view contexts based on user roles.
  viewContexts?: (roles: string[], tagMap: ReadonlyMap<string, Ref>) => ViewContext[];
}
```

**Editor Context**

```ts
{
  name: string
  modelGroups: ModelGroup[]
}
```

**Model Group**

```ts
{
  name: string
  models: (string | Ref)[]
}
```

**View Context**

```ts
{
  model: string | Ref
  name?: string
  description?: string
  slug?: string
  color?: string
  field?: Field
  displayKeyPaths?: string[][]
}
```

[license_shield]: https://img.shields.io/github/license/karmarun/karma.tools.svg
[license_link]: https://github.com/karmarun/karma.tools/blob/master/LICENSE
[npm_shield]: https://img.shields.io/npm/v/@karma.run/editor.svg
[npm_link]: https://www.npmjs.com/package/@karma.run/editor
