import React from 'react'
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
      }
    })
  }

  public render() {
    return null
  }
}

export const ProviderExposerContainer = withSession(ProviderExposer)
