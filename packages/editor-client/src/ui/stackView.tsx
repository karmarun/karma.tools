import * as React from 'react'

import {style} from 'typestyle'
import {color} from 'csx'
import {Color, solidBorderWithColor} from './style'

export const StackViewStyle = style({
  $debugName: 'StackView',

  position: 'relative',

  width: '100%',
  height: '100%',

  backgroundColor: Color.neutral.white,

  $nest: {
    '> .overlay': {
      position: 'absolute',

      top: 0,
      bottom: 0,
      left: 0,

      zIndex: 2000,
      backgroundColor: color(Color.primary.light1)
        .fade(0.9)
        .toString()
    },

    '> .wrapper': {
      position: 'absolute',

      top: 0,
      bottom: 0,
      left: 0,
      right: 0,

      $nest: {
        '> .container': {
          position: 'absolute',
          overflowY: 'auto',

          top: 0,
          bottom: 0,
          left: 0,

          zIndex: 1000,

          pointerEvents: 'none',
          backgroundColor: Color.primary.light1,
          borderLeft: solidBorderWithColor(Color.primary.base),

          $nest: {
            '&:first-child': {
              borderLeft: 'none'
            },

            '&:last-child': {
              pointerEvents: 'auto'
            }
          }
        }
      }
    }
  }
})

export const StackViewTargetPercentage = 0.9

export class StackView extends React.Component {
  public render() {
    const numChildren = React.Children.count(this.props.children)

    const overlayStyle = {
      width: `${(numChildren === 1 ? 0 : 100) * (1 - StackViewTargetPercentage)}%`
    }

    return (
      <div className={StackViewStyle}>
        <div className="wrapper">
          {React.Children.map(this.props.children, (child, index) => {
            const indexPercentage = numChildren === 1 ? 0 : index / (numChildren - 1)
            const percentage = 1 - StackViewTargetPercentage
            const finalPercentage = percentage * indexPercentage

            const style = {
              left: `${finalPercentage * 100}%`,
              width: `${(1 - finalPercentage) * 100}%`
            }

            return (
              <div className="container" style={style}>
                {child}
              </div>
            )
          })}
        </div>
        <div className="overlay" style={overlayStyle} />
      </div>
    )
  }
}
