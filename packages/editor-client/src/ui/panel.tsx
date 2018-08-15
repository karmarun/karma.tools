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
    return <div className={Panel.Style}>{this.props.children}</div>
  }
}

export namespace Panel {
  export const Style = style({
    $debugName: 'Panel',
    flexGrow: 1,

    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'scroll'
  })
}

export namespace PanelContent {
  export interface Props {
    title: React.ReactNode
    content: React.ReactNode
  }
}

export class PanelContent extends React.Component {
  public render() {
    return <div className={PanelContent.Style}>{this.props.children}</div>
  }
}

export namespace PanelContent {
  export const Style = style({
    $debugName: 'PanelContent',
    padding: Spacing.large,
    flexGrow: 1
  })
}

export namespace PanelHeader {
  export interface Props {
    title?: React.ReactNode
    description?: React.ReactNode
    markerColor?: string
  }
}

export class PanelHeader extends React.Component<PanelHeader.Props> {
  public render() {
    return (
      <div className={PanelHeader.Style}>
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

export namespace PanelHeader {
  export const Style = style({
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
}

export interface PanelToolbarProps {
  left?: React.ReactNode
  right?: React.ReactNode
  drawer?: React.ReactNode
}

export class PanelToolbar extends React.PureComponent<PanelToolbarProps> {
  public render() {
    return (
      <div className={PanelToolbar.Style}>
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

export namespace PanelToolbar {
  export const Style = style({
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
        padding: Spacing.medium,
        maxHeight: '30vh',
        overflowY: 'auto'
      },

      '&::after': bottomShadow(1)
    }
  })
}

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

export namespace ViewContextPanelHeader {
  export interface Props {
    viewContext: ViewContext
    prefix: string
  }
}

export class ViewContextPanelHeader extends React.PureComponent<ViewContextPanelHeader.Props> {
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
