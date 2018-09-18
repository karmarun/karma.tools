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

export interface SlateBlockElementRenderNodeProps extends SlateNodeComponentRenderProps {
  onEditNode: () => void
}

export interface SlateBlockElementControlOptions {
  readonly type: string
  readonly label?: string
  readonly icon?: IconName
  readonly dataKey?: string

  render(props: SlateBlockElementRenderNodeProps): React.ReactNode
}

export class SlateBlockElementControl implements SlateControl {
  public readonly type: string
  public readonly label?: string
  public readonly icon?: IconName
  public readonly dataKey?: string
  public readonly renderFn: SlateBlockElementControlOptions['render']

  constructor(opts: SlateBlockElementControlOptions) {
    this.type = opts.type
    this.label = opts.label
    this.icon = opts.icon
    this.dataKey = opts.dataKey
    this.renderFn = opts.render
  }

  public renderNode(props: SlateRenderNodeProps): React.ReactNode {
    if (props.node.object !== 'block' || this.type !== props.node.type) return
    return <SlateBlockElementNodeComponent {...props} control={this} />
  }

  public renderControl(props: SlateRenderControlProps) {
    return <SlateBlockElementControlComponent {...props} control={this} />
  }
}

export class SlateBlockElementNodeComponent extends React.Component<
  SlateNodeComponentRenderProps<SlateBlockElementControl>
> {
  private handleEditNode = async () => {
    const node = this.props.node
    const control = this.props.control

    if (!node || node.object !== 'block' || !control.dataKey) return

    const newFieldValue = await this.props.onEditData(control.dataKey, node.data)

    if (newFieldValue) {
      this.props.onValueChange(change =>
        change.replaceNodeByKey(
          node.key,
          Slate.Block.create({
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

export class SlateBlockElementControlComponent extends React.Component<
  SlateControlComponentRenderProps<SlateBlockElementControl>
> {
  private handleMouseDown = async () => {
    const control = this.props.control
    const newFieldValue = control.dataKey ? await this.props.onEditData(control.dataKey) : undefined

    // Pressed back in FieldEditor.
    if (control.dataKey && !newFieldValue) return

    this.props.onValueChange(change => {
      return change.insertBlock({
        type: control.type,
        data: newFieldValue
        // isVoid: true
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
