import * as React from 'react'
import {style} from 'typestyle'

import {
  FontWeight,
  Color,
  Spacing,
  DefaultBorderRadiusPx,
  FontFamily,
  solidBorderWithColor
} from './style'

import {Icon, IconName, IconStyle} from './icon'
import {LoadingIndicator} from './loader'

import {AppLocation, LocationActionContext} from '../context/location'
import {boolAttr} from '../util/react'
import {SpaceKeyCode} from '../util/keyCodes'

export interface ButtonBaseProps<D = any> {
  icon?: IconName
  type?: ButtonType
  label?: string
  data?: D
  selected?: boolean
  disabled?: boolean
  loading?: boolean
  location?: AppLocation
}

export const enum ButtonType {
  Primary = 'dark',
  Light = 'light',
  Link = 'link',
  Icon = 'icon'
}

export interface ButtonProps<D = any> extends ButtonBaseProps<D> {
  onTrigger?: (data: D, location?: AppLocation) => void
  onMouseDown?: (data: D, location?: AppLocation) => void
}

export interface ButtonState {
  isActive: boolean
}

export class Button<D = any> extends React.Component<ButtonProps<D>, ButtonState> {
  public state: ButtonState = {isActive: false}

  private handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (this.props.onTrigger) this.props.onTrigger(this.props.data!, this.props.location)
  }

  private handleMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (this.props.onMouseDown) this.props.onMouseDown(this.props.data!, this.props.location)
  }

  private handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.keyCode === SpaceKeyCode) {
      this.setState({isActive: true})
    }
  }

  private handleKeyUp = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.keyCode === SpaceKeyCode) {
      e.preventDefault()
      this.setState({isActive: false})
      if (this.props.onTrigger) this.props.onTrigger(this.props.data!, this.props.location)
    }
  }

  public render() {
    return (
      <LocationActionContext.Consumer>
        {context => (
          <a
            className={`${ButtonStyle} ${buttonStyleForType(this.props.type)}`}
            data-disabled={boolAttr(this.props.disabled)}
            data-active={boolAttr(this.props.selected || this.state.isActive)}
            href={this.props.location && context.urlPathForLocation(this.props.location)}
            role="button"
            tabIndex={this.props.disabled ? undefined : 0}
            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
            onClick={this.handleClick}
            onMouseDown={this.handleMouseDown}>
            <span className="content">
              {this.props.loading ? (
                <LoadingIndicator />
              ) : (
                <>
                  {this.props.icon && <Icon name={this.props.icon} />}
                  {this.props.label && <span className="label">{this.props.label}</span>}
                </>
              )}
            </span>
          </a>
        )}
      </LocationActionContext.Consumer>
    )
  }
}

export const ButtonStyle = style({
  $debugName: 'Button',

  cursor: 'pointer',

  fontFamily: FontFamily.primary,
  fontSize: '1em',
  lineHeight: 1.2,

  flexShrink: 0,
  flexGrow: 0,
  padding: 0,

  display: 'block',

  $nest: {
    '> .content': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      $nest: {
        [`> .${IconStyle}`]: {
          marginRight: Spacing.small,

          $nest: {
            '&:only-child': {marginRight: 0}
          }
        }
      }
    },

    '&:disabled, &[data-disabled]': {
      cursor: 'default',
      pointerEvents: 'none',
      opacity: 0.6
    },

    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${Color.focus}`
    },

    '&, &:link, &:visited': {
      border: 'none',
      backgroundColor: 'transparent',
      color: Color.neutral.black
    }
  }
})

export const ButtonPrimaryStyle = style({
  $debugName: 'ButtonPrimary',

  border: solidBorderWithColor(Color.primary.base),
  backgroundColor: Color.primary.light1,

  padding: `${Spacing.small} ${Spacing.medium}`,
  borderRadius: DefaultBorderRadiusPx,

  $nest: {
    '&:hover': {
      borderColor: Color.neutral.base,
      backgroundColor: Color.neutral.light1
    },

    '&:active, &[data-active]': {
      borderColor: Color.neutral.dark1,
      backgroundColor: Color.neutral.base
    },

    '&:hover, &:active, &[data-active]': {
      color: Color.primary.light1
    },

    '&:focus': {
      boxShadow: `0 0 0 2px ${Color.focus}`
    },

    '&, &:link, &:visited': {
      color: Color.neutral.light5
    },

    '> .content': {
      $nest: {
        [`> .${IconStyle}`]: {
          fill: Color.neutral.light5
        }
      }
    }
  }
})

export const ButtonLightStyle = style({
  $debugName: 'ButtonLight',

  border: solidBorderWithColor('rgba(0, 0, 0, 0.1)'),
  backgroundColor: 'rgba(255, 255, 255, 0.4)',

  padding: `${Spacing.small} ${Spacing.medium}`,
  borderRadius: DefaultBorderRadiusPx,

  $nest: {
    '&:hover': {
      borderColor: 'rgba(0, 0, 0, 0.2)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },

    '&:active, &[data-active]': {
      borderColor: 'rgba(0, 0, 0, 0.25)',
      backgroundColor: 'rgba(0, 0, 0, 0.15)'
    },

    '&:disabled, &[data-disabled]': {
      opacity: 0.4
    },

    '&:focus': {
      boxShadow: `0 0 0 2px ${Color.focus}`
    },

    '&, &:link, &:visited': {
      color: 'rgba(0, 0, 0, 0.8)'
    },

    '&:hover, &:active, &[data-active]': {
      color: 'rgba(0, 0, 0, 0.5)'
    },

    '> .content': {
      $nest: {
        [`> .${IconStyle}`]: {
          fill: 'rgba(0, 0, 0, 0.8)'
        }
      }
    }
  }
})

export const ButtonIconStyle = style({
  $debugName: 'ButtonIcon',

  display: 'flex',
  alignItems: 'center',

  $nest: {
    '&:hover > .content > .label, &:active > .content > .label, &[data-active] > .content > .label': {
      color: Color.primary.light3
    },

    [`&:hover > .content > .${IconStyle}, &:active > .content > .${IconStyle}, &[data-active] > .content > .${IconStyle}`]: {
      fill: Color.primary.light3
    },

    '> .content': {
      $nest: {
        '> .label': {
          color: Color.primary.base,
          fontWeight: FontWeight.bold
        },

        [`> .${IconStyle}`]: {
          fill: Color.primary.base,
          fontSize: '1.4em'
        }
      }
    }
  }
})

export const ButtonLinkStyle = style({
  $debugName: 'ButtonLink',

  $nest: {
    [`.${IconStyle}`]: {
      fill: Color.neutral.white
    }
  }
})

function buttonStyleForType(type?: ButtonType) {
  switch (type) {
    case ButtonType.Link:
      return ButtonLinkStyle
    case ButtonType.Icon:
      return ButtonIconStyle
    case ButtonType.Light:
      return ButtonLightStyle

    default:
    case ButtonType.Primary:
      return ButtonPrimaryStyle
  }
}
