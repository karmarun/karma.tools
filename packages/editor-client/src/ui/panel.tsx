import * as React from 'react'

import {style} from 'typestyle'

import {ViewContext} from '../api/viewContext'
import {Markdown} from './markdown'

import {
  Spacing,
  Color,
  FontWeight,
  FontSize,
  MarkerWidth,
  bottomShadow,
  marginTopExceptFirst,
  solidBorderWithColor
} from './style'

export class Panel extends React.Component {
  public render() {
    return <div className={PanelStyle}>{this.props.children}</div>
  }
}

export const PanelStyle = style({
  $debugName: 'Panel',
  flexGrow: 1,

  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflowY: 'auto'
})

export interface PanelContentProps {
  title: React.ReactNode
  content: React.ReactNode
}

export class PanelContent extends React.Component {
  public render() {
    return <div className={PanelContentStyle}>{this.props.children}</div>
  }
}

export const PanelContentStyle = style({
  $debugName: 'PanelContent',
  padding: Spacing.large,
  flexGrow: 1
})

export interface PanelHeaderProps {
  title?: React.ReactNode
  description?: React.ReactNode
  markerColor?: string
}

export class PanelHeader extends React.Component<PanelHeaderProps> {
  public render() {
    return (
      <div className={PanelHeaderStyle}>
        {this.props.markerColor && (
          <div className={`marker`} style={{backgroundColor: this.props.markerColor}} />
        )}
        <div className="content">
          <div className="title">{this.props.title}</div>
          {this.props.description && <div className="description">{this.props.description}</div>}
        </div>
      </div>
    )
  }
}

export const PanelHeaderStyle = style({
  $debugName: 'PanelHeader',

  width: '100%',

  backgroundColor: Color.neutral.light4,
  borderBottom: solidBorderWithColor(Color.neutral.light1),

  display: 'flex',
  flexDirection: 'row',
  flexShrink: 0,

  $nest: {
    '> .marker': {
      width: MarkerWidth,
      flexShrink: 0
    },
    '> .content': {
      padding: Spacing.medium,

      $nest: {
        '> .title': {
          fontSize: FontSize.largest,
          fontWeight: FontWeight.bold,
          color: Color.primary.base
        },

        '> .description': {
          fontWeight: FontWeight.light,
          color: Color.primary.base,
          marginTop: Spacing.small,
          $nest: {p: {margin: 0, ...marginTopExceptFirst(Spacing.small)}}
        }
      }
    }
  }
})

export interface PanelToolbarProps {
  left?: React.ReactNode
  right?: React.ReactNode
  drawer?: React.ReactNode
}

export class PanelToolbar extends React.PureComponent<PanelToolbarProps> {
  public render() {
    return (
      <div className={PanelToolbarStyle}>
        <div className="content">
          <div className="left">{this.props.left}</div>
          <div className="right">{this.props.right}</div>
        </div>
        {this.props.drawer && <div className="drawer">{this.props.drawer}</div>}
        {this.props.children}
      </div>
    )
  }
}

export const PanelToolbarStyle = style({
  $debugName: 'PanelToolbar',

  position: 'sticky',
  top: 0,
  zIndex: 10,

  width: '100%',
  fontSize: FontSize.medium,

  backgroundColor: Color.neutral.light5,
  color: Color.neutral.dark2,

  $nest: {
    '> .content': {
      display: 'flex',
      alignItems: 'center',
      padding: Spacing.medium,
      minHeight: '5rem',

      $nest: {
        '> .left': {
          flexGrow: 1
        },

        '> .right': {
          flexShrink: 0,

          display: 'flex',
          justifyContent: 'flex-end',

          $nest: {
            '> *': {
              marginRight: Spacing.largest,
              $nest: {'&:last-child': {marginRight: 0}}
            }
          }
        }
      }
    },

    '> .drawer': {
      borderTop: solidBorderWithColor(Color.neutral.light1),
      padding: Spacing.medium
    },

    '&::after': bottomShadow(1)
  }
})

export const enum MessageBarType {
  Success = 'success',
  Error = 'error'
}

export interface MessageBarProps {
  type: MessageBarType
  message: string
}

export class MessageBar extends React.PureComponent<MessageBarProps> {
  public render() {
    return (
      <div className={MessageBarStyle} data-type={this.props.type || MessageBarType.Success}>
        {this.props.message}
      </div>
    )
  }
}

export const MessageBarStyle = style({
  padding: Spacing.medium,
  $nest: {
    '&[data-type="success"]': {
      backgroundColor: Color.success.light1,
      color: Color.success.base
    },

    '&[data-type="error"]': {
      backgroundColor: Color.error.light1,
      color: Color.error.base
    }
  }
})

export interface ViewContextPanelHeaderProps {
  viewContext: ViewContext
  prefix: string
}

export class ViewContextPanelHeader extends React.PureComponent<ViewContextPanelHeaderProps> {
  public render() {
    const title = `${this.props.prefix} / ${this.props.viewContext.name}`
    const description = this.props.viewContext.description ? (
      <Markdown source={this.props.viewContext.description} />
    ) : (
      undefined
    )

    return (
      <PanelHeader
        title={title}
        description={description}
        markerColor={this.props.viewContext.color}
      />
    )
  }
}
