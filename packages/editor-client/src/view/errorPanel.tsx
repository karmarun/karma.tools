import * as React from 'react'
import {Panel, PanelContent} from '../ui'

export enum ErrorPanelType {
  NotFound
}

export interface ErrorPanelProps {
  type: ErrorPanelType
}

export class ErrorPanel extends React.Component<ErrorPanelProps> {
  public render() {
    return (
      <Panel>
        <PanelContent>{messageForErrorPanelType(this.props.type)}</PanelContent>
      </Panel>
    )
  }
}

export function messageForErrorPanelType(errorType: ErrorPanelType) {
  switch (errorType) {
    case ErrorPanelType.NotFound:
      return 'Not Found'
  }
}
