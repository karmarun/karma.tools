import React from 'react'
import Slate from 'slate'
import {IconName, ButtonType, Button} from '@karma.run/editor-client'

import {
  SlateControl,
  SlateRenderControlProps,
  SlateControlComponentRenderProps,
  SlateRenderNodeProps,
  SlateNodeComponentRenderProps
} from './control'

export interface SlateInlineElementRenderNodeProps extends SlateNodeComponentRenderProps {
  onEditNode: () => void
}

export interface SlateInlineElementControlOptions {
  readonly type: string
  readonly label?: string
  readonly icon?: IconName
  readonly dataKey?: string

  render(props: SlateInlineElementRenderNodeProps): React.ReactNode
}

export class SlateInlineElementControl implements SlateControl {
  public readonly type: string
  public readonly label?: string
  public readonly icon?: IconName
  public readonly dataKey?: string
  public readonly renderFn: SlateInlineElementControlOptions['render']

  constructor(opts: SlateInlineElementControlOptions) {
    this.type = opts.type
    this.label = opts.label
    this.icon = opts.icon
    this.dataKey = opts.dataKey
    this.renderFn = opts.render
  }

  public renderNode(props: SlateRenderNodeProps): React.ReactNode {
    if ((props.node.object as string) !== 'inline' || this.type !== props.node.type) return
    return <SlateInlineElementNodeComponent {...props} control={this} />
  }

  public renderControl(props: SlateRenderControlProps) {
    return <SlateInlineElementControlComponent {...props} control={this} />
  }
}

export class SlateInlineElementNodeComponent extends React.Component<
  SlateNodeComponentRenderProps<SlateInlineElementControl>
> {
  private handleEditNode = async () => {
    const node = this.props.node
    const control = this.props.control

    if (!node || (node.object as string) !== 'inline' || !control.dataKey) return

    const newFieldValue = await this.props.onEditData(control.dataKey, node.data)

    if (newFieldValue) {
      this.props.onValueChange(change =>
        change.replaceNodeByKey(
          node.key,
          Slate.Inline.create({
            type: node.type,
            data: newFieldValue
            // isVoid: true
          })
        )
      )
    } else {
      this.props.onValueChange(change => change.removeNodeByKey(node.key))
    }
  }

  public render() {
    return this.props.control.renderFn({...this.props, onEditNode: this.handleEditNode})
  }
}

export class SlateInlineElementControlComponent extends React.Component<
  SlateControlComponentRenderProps<SlateInlineElementControl>
> {
  private handleMouseDown = async () => {
    const control = this.props.control
    const newFieldValue = control.dataKey ? await this.props.onEditData(control.dataKey) : undefined

    // Pressed back in FieldEditor.
    if (control.dataKey && !newFieldValue) return

    this.props.onValueChange(change => {
      return change.insertInline({
        type: control.type,
        data: newFieldValue
        // isVoid: true // TODO
      })
    })
  }

  public render() {
    return (
      <Button
        disabled={this.props.disabled}
        type={ButtonType.Light}
        icon={this.props.control.icon}
        label={this.props.control.label}
        onMouseDown={this.handleMouseDown}
      />
    )
  }
}
