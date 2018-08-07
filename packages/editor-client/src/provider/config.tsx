import React from 'react'

import {ClientPlugin} from '../plugin'
import {Config, defaultConfig, ConfigContext} from '../context/config'
import {mergeFieldRegistries, createFieldRegistry, AnyFieldConstructor} from '../api/field'
import {defaultFieldRegistry} from '../fields/defaultRegistry'

export interface ConfigProviderProps {
  config: {
    karmaDataURL?: string
    basePath?: string
    title?: string
    plugins?: ClientPlugin[]
  }
}

export class ConfigProvider extends React.Component<ConfigProviderProps, Config> {
  public constructor(props: ConfigProviderProps) {
    super(props)

    this.state = {
      ...defaultConfig,
      karmaDataURL: props.config.karmaDataURL || defaultConfig.karmaDataURL,
      basePath: props.config.basePath || defaultConfig.basePath,
      title: props.config.title || defaultConfig.title
    }
  }

  public componentDidMount() {
    const plugins = this.props.config.plugins || []
    const fields: AnyFieldConstructor[] = []

    for (const plugin of plugins) {
      if (plugin.registerFields) {
        fields.push(...plugin.registerFields())
      }

      console.info(`Initialized plugin: ${plugin.name}@${plugin.version}`)
    }

    this.setState({
      fieldRegistry: mergeFieldRegistries(createFieldRegistry(...fields), defaultFieldRegistry)
    })
  }

  public render() {
    return <ConfigContext.Provider value={this.state}>{this.props.children}</ConfigContext.Provider>
  }
}
