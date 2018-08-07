import React from 'react'
import {createContextHOC} from './helper'
import {defaultFieldRegistry} from '../fields/defaultRegistry'
import {FieldRegistry} from '../api/field'
import {ClientPlugin} from '../plugin'

export interface Config {
  karmaDataURL: string
  basePath: string
  title: string
  plugins: ClientPlugin[]
  fieldRegistry: FieldRegistry
}

export const defaultConfig: Config = {
  karmaDataURL: '',
  basePath: '',
  title: '',
  plugins: [],
  fieldRegistry: defaultFieldRegistry
}

export const ConfigContext = React.createContext<Config>(defaultConfig)
export const withConfig = createContextHOC(ConfigContext, 'config', 'withConfig')
