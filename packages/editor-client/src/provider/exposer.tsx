import React from 'react'
import * as xpr from '@karma.run/sdk/expression'

import {SessionContext, withSession} from '../context/session'
import {expose} from '../util/other'

export interface ProviderExposerProps {
  sessionContext: SessionContext
}

export class ProviderExposer extends React.Component<ProviderExposerProps> {
  public componentDidMount() {
    expose({
      setDevelopmentMode: (developmentMode: boolean = true) => {
        this.props.sessionContext.setDevelopmentMode(developmentMode)
        return `Set development mode to: ${developmentMode}`
      },

      toggleDevelopmentMode: () => {
        const developmentMode = !this.props.sessionContext.developmentMode

        this.props.sessionContext.setDevelopmentMode(developmentMode)
        return `Set development mode to: ${developmentMode}`
      },

      query: (expression: xpr.Expression) => {
        return this.props.sessionContext.query(expression)
      }
    })
  }

  public render() {
    return null
  }
}

export const ProviderExposerContainer = withSession(ProviderExposer)
