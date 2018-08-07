import React, {ErrorInfo} from 'react'
import {ErrorView} from './view'

export interface ErrorBoundaryState {
  error?: any
}

export class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  public state = {error: undefined}
  public componentDidCatch(error: Error, _: ErrorInfo) {
    this.setState({error})
  }

  public render() {
    if (this.state.error != undefined) {
      return <ErrorView error={this.state.error} />
    }

    return this.props.children
  }
}
