import React from 'react'
import {CenteredLoadingIndicator} from '../ui'

export interface AsyncComponentProps {
  children: () => Promise<React.ReactNode>
}

export interface AsyncComponentState {
  component?: React.ReactNode
}

export class AsyncComponent extends React.Component<AsyncComponentProps, AsyncComponentState> {
  public state: AsyncComponentState = {}

  public async componentDidMount() {
    this.setState({
      component: await this.props.children()
    })
  }

  public render() {
    if (this.state.component) return this.state.component
    return <CenteredLoadingIndicator />
  }
}
