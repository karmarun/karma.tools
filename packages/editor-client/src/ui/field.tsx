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

export namespace FieldComponent {
  export interface Props {
    className?: string
    depth: number
    index: number
  }
}

export class FieldComponent extends React.Component<FieldComponent.Props> {
  public render() {
    const style: React.CSSProperties = {
      backgroundColor: fieldColorForDepthAndIndex(this.props.depth, this.props.index)
    }

    const classname = classNames(
      FieldComponent.Style,
      this.props.depth === 0 ? FieldComponent.RootStyle : undefined,
      this.props.className
    )

    return (
      <div className={classname} style={style}>
        {this.props.children}
      </div>
    )
  }
}

export namespace FieldComponent {
  export const Style = style({
    $debugName: 'Field',
    padding: Spacing.medium,
    color: Color.primary.base
  })

  export const RootStyle = style({
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
}

export namespace FieldLabel {
  export interface Props {
    label?: string
    description?: string
    depth: number
    index: number
    leftContent?: React.ReactNode
    rightContent?: React.ReactNode
  }
}

export class FieldLabel extends React.Component<FieldLabel.Props> {
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
      <div className={FieldLabel.Style}>
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

export namespace FieldLabel {
  export const Style = style({
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
}

export class FieldInset extends React.Component {
  public render() {
    if (this.props.children == undefined) return null

    return <div className={FieldInset.Style}>{this.props.children}</div>
  }
}

export namespace FieldInset {
  export const Style = style({
    $debugName: 'FieldInset',
    marginLeft: Spacing.medium,
    position: 'relative',

    $nest: {...innerShadow()}
  })
}

export namespace FieldWrapper {
  export interface Props {
    className?: string
    depth: number
    index: number
  }
}

export class FieldWrapper extends React.Component<FieldWrapper.Props> {
  public render() {
    const classname = classNames(
      FieldWrapper.Style,
      this.props.depth === 0 ? FieldWrapper.RootStyle : undefined,
      this.props.className
    )

    return <div className={classname}>{this.props.children}</div>
  }
}

export namespace FieldWrapper {
  export const Style = style({
    $debugName: 'FieldWrapper',
    $nest: {
      [`&:last-child > .${FieldInset.Style}::after`]: {
        content: 'none'
      }
    }
  })

  export const RootStyle = style({
    $debugName: 'RootFieldWrapper',
    marginTop: Spacing.medium,

    $nest: {
      '&:first-child': {
        marginTop: 0
      },

      [`> .${FieldComponent.RootStyle}:first-child`]: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      },

      [`> .${FieldComponent.RootStyle}:last-child`]: {
        borderRadius: DefaultBorderRadiusPx
      }
    }
  })
}

export namespace FieldErrors {
  export interface Props {
    errors?: string[]
  }
}

export class FieldErrors extends React.Component<FieldErrors.Props> {
  public render() {
    if (!this.props.errors || this.props.errors.length === 0) return null

    return (
      <div className={FieldErrors.Style}>
        {this.props.errors.map(error => {
          return <div key={error}>{error}</div>
        })}
      </div>
    )
  }
}

export namespace FieldErrors {
  export const Style = style({
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
}
