import * as React from 'react'
import classNames from 'classnames'
import {style} from 'typestyle'

import {
  fieldColorForDepthAndIndex,
  Spacing,
  Color,
  FontWeight,
  DefaultBorderRadiusPx,
  FontSize,
  innerShadow
} from './style'

import {Markdown} from './markdown'

export interface FieldComponentProps {
  className?: string
  depth: number
  index: number
}

export class FieldComponent extends React.Component<FieldComponentProps> {
  public render() {
    const style: React.CSSProperties = {
      backgroundColor: fieldColorForDepthAndIndex(this.props.depth, this.props.index)
    }

    const classname = classNames(
      FieldComponentStyle,
      this.props.depth === 0 ? FieldComponentRootStyle : undefined,
      this.props.className
    )

    return (
      <div className={classname} style={style}>
        {this.props.children}
      </div>
    )
  }
}

export const FieldComponentStyle = style({
  $debugName: 'Field',
  padding: Spacing.medium,
  color: Color.primary.base
})

export const FieldComponentRootStyle = style({
  $debugName: 'RootField',
  marginTop: Spacing.medium,
  borderRadius: DefaultBorderRadiusPx,

  $nest: {
    '&:first-child': {
      marginTop: 0,
      borderTopLeftRadius: DefaultBorderRadiusPx,
      borderTopRightRadius: DefaultBorderRadiusPx
    },

    '&:last-child': {
      borderBottomLeftRadius: DefaultBorderRadiusPx,
      borderBottomRightRadius: DefaultBorderRadiusPx
    }
  }
})

export interface FieldLabelProps {
  label?: string
  description?: string
  depth: number
  index: number
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}

export class FieldLabel extends React.Component<FieldLabelProps> {
  public render() {
    if (
      !this.props.label &&
      !this.props.description &&
      !this.props.leftContent &&
      !this.props.rightContent
    ) {
      return null
    }

    return (
      <div className={FieldLabelStyle}>
        {this.props.leftContent && <div className="leftContent">{this.props.leftContent}</div>}
        <div className="content">
          {this.props.label && <div className="label">{this.props.label}</div>}
          {this.props.description && (
            <div className="description">
              <Markdown source={this.props.description} />
            </div>
          )}
        </div>
        {this.props.rightContent && <div className="rightContent">{this.props.rightContent}</div>}
      </div>
    )
  }
}

export const FieldLabelStyle = style({
  $debugName: 'FieldLabel',
  display: 'flex',
  marginBottom: Spacing.medium,

  $nest: {
    '> .leftContent': {
      marginRight: Spacing.medium
    },

    '> .rightContent': {
      marginLeft: Spacing.medium
    },

    '> .content': {
      flexGrow: 1,

      $nest: {
        '> .label': {
          color: Color.primary.base,
          fontWeight: FontWeight.bold,
          fontSize: '1.5rem'
        },
        '> .description': {
          color: Color.neutral.dark2,
          fontSize: FontSize.small,
          fontWeight: FontWeight.medium,
          marginTop: Spacing.small
        }
      }
    },

    '&:only-child': {marginBottom: 0}
  }
})

export class FieldInset extends React.Component {
  public render() {
    if (this.props.children == undefined) return null

    return <div className={FieldInsetStyle}>{this.props.children}</div>
  }
}

export const FieldInsetStyle = style({
  $debugName: 'FieldInset',
  marginLeft: Spacing.medium,
  position: 'relative',

  $nest: {...innerShadow()}
})

export interface FieldWrapperProps {
  className?: string
  depth: number
  index: number
}

export class FieldWrapper extends React.Component<FieldWrapperProps> {
  public render() {
    const classname = classNames(
      FieldWrapperStyle,
      this.props.depth === 0 ? FieldWrapperRootStyle : undefined,
      this.props.className
    )

    return <div className={classname}>{this.props.children}</div>
  }
}

export const FieldWrapperStyle = style({
  $debugName: 'FieldWrapper',
  $nest: {
    [`&:last-child > .${FieldInsetStyle}::after`]: {
      content: 'none'
    }
  }
})

export const FieldWrapperRootStyle = style({
  $debugName: 'RootFieldWrapper',
  marginTop: Spacing.medium,

  $nest: {
    '&:first-child': {
      marginTop: 0
    },

    [`> .${FieldComponentRootStyle}:first-child`]: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    },

    [`> .${FieldComponentRootStyle}:last-child`]: {
      borderRadius: DefaultBorderRadiusPx
    }
  }
})

export interface FieldErrorsProps {
  errors?: string[]
}

export class FieldErrors extends React.Component<FieldErrorsProps> {
  public render() {
    if (!this.props.errors || this.props.errors.length === 0) return null

    return (
      <div className={FieldErrorsStyle}>
        {this.props.errors.map(error => {
          return <div key={error}>{error}</div>
        })}
      </div>
    )
  }
}

export const FieldErrorsStyle = style({
  $debugName: 'FieldErrors',

  padding: Spacing.medium,
  marginTop: Spacing.medium,

  border: `1px solid ${Color.error.light1}`,
  backgroundColor: Color.error.light2,
  color: Color.error.dark1,

  $nest: {
    '&:first-child': {marginTop: 0}
  }
})
