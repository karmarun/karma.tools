import * as React from 'react'
import {style} from 'typestyle'
import {Color} from './style'

const LoaderIcon: React.StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="10" viewBox="0 0 24 10">
    <path opacity=".2" d="M0 0h4v10H0z">
      <animate
        attributeName="opacity"
        attributeType="XML"
        values="0.2; 1; .2"
        begin="0s"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
    <path opacity=".2" d="M8 0h4v10H8z">
      <animate
        attributeName="opacity"
        attributeType="XML"
        values="0.2; 1; .2"
        begin="0.15s"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
    <path opacity=".2" d="M16 0h4v10h-4z">
      <animate
        attributeName="opacity"
        attributeType="XML"
        values="0.2; 1; .2"
        begin="0.3s"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
)

export enum LoadingIndicatorStyle {
  Light = 'light',
  Dark = 'dark'
}

export namespace LoadingIndicator {
  export interface Props {
    style?: LoadingIndicatorStyle
  }
}

export class LoadingIndicator extends React.Component<LoadingIndicator.Props> {
  public render() {
    return (
      <div
        className={LoadingIndicator.Style}
        data-style={this.props.style || LoadingIndicatorStyle.Light}>
        <LoaderIcon />
      </div>
    )
  }
}

export namespace LoadingIndicator {
  export const Style = style({
    $debugName: 'LoadingIndicator',

    $nest: {
      '&[data-style="light"] svg path, &[data-style="light"] svg rect': {
        fill: Color.neutral.white
      },

      '&[data-style="dark"] svg path, &[data-style="dark"] svg rect': {
        fill: Color.neutral.dark2
      }
    }
  })
}

export class CenteredLoadingIndicator extends React.Component<LoadingIndicator.Props> {
  public render() {
    return (
      <div className={CenteredLoadingIndicator.Style}>
        <LoadingIndicator style={this.props.style} />
      </div>
    )
  }
}

export namespace CenteredLoadingIndicator {
  export const Style = style({
    $debugName: 'CenteredLoadingIndicator',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    height: '100%'
  })
}
