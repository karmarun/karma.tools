import * as React from 'react'
import {style} from 'typestyle'

import {Button, ButtonType} from '../ui/button'
import {FontSize, Spacing, Color, FontWeight} from '../ui/style'

import * as storage from '../util/storage'

export namespace ErrorView {
  export interface Props {
    error: any
  }
}

export class ErrorView extends React.Component<ErrorView.Props> {
  private handleReloadClick = () => {
    location.reload()
  }

  private handleReloadWithoutSessionClick = () => {
    storage.clear()
    location.reload()
  }

  public render() {
    return (
      <div className={ErrorView.Style}>
        <div className="content">
          <div className="emote">:(</div>
          <div className="title">An unrecoverable error occured:</div>
          <div className="text">{this.props.error.message || 'Unknown Error!'}</div>
          <div className="buttonWrapper">
            <Button type={ButtonType.Primary} label="Reload" onTrigger={this.handleReloadClick} />
            <Button
              type={ButtonType.Primary}
              label="Reload & Clear Local Data"
              onTrigger={this.handleReloadWithoutSessionClick}
            />
          </div>
        </div>
      </div>
    )
  }
}

export namespace ErrorView {
  export const Style = style({
    $debugName: 'ErrorView',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    width: '100%',
    height: '100%',

    textAlign: 'center',

    background: Color.primary.base,

    $nest: {
      '> .content': {
        width: '35rem',

        $nest: {
          '> .emote': {
            fontSize: '6rem',
            fontWeight: 'bold',
            marginBottom: Spacing.largest
          },

          '> .title': {
            fontSize: FontSize.large,
            fontWeight: FontWeight.bold,
            marginBottom: Spacing.medium
          },

          '> .text': {
            fontSize: FontSize.medium,
            marginBottom: Spacing.largest
          },

          '> .buttonWrapper': {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',

            $nest: {
              '> Button': {
                marginBottom: Spacing.large
              }
            }
          }
        }
      }
    }
  })
}
