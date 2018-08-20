import React from 'react'
import express from 'express'
import path from 'path'

import {ServerPlugin, PluginContext} from '@karma.run/editor-server'
import {name, version} from '../common/version'

export class DraftJSServerPlugin implements ServerPlugin {
  public readonly name = name
  public readonly version = version

  public registerHeaderElements(context: PluginContext): React.ReactNode {
    return <link href={`${context.pluginBasePath}/draft-js.css`} rel="stylesheet" />
  }

  public registerRoutes(_context: PluginContext, router: express.Router) {
    const draftJSPath = require.resolve('draft-js')
    const draftJSCSSPath = path.join(path.dirname(draftJSPath), '../dist/Draft.css')

    router.get('/draft-js.css', (_, res) => {
      return res.sendFile(draftJSCSSPath, {maxAge: '1d'})
    })
  }
}
