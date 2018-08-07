import React from 'react'
import {IconName, ButtonType, Button} from '@karma.run/editor-client'

import {
  SlateControl,
  SlateRenderControlProps,
  SlateControlComponentRenderProps,
  SlateNodeComponentRenderProps,
  SlateRenderNodeProps
} from './control'

export interface SlateBlockControlOptions {
  readonly type: string
  readonly label?: string
  readonly icon?: IconName
  readonly dataKey?: string

  render(props: SlateNodeComponentRenderProps): React.ReactNode
}

export class SlateBlockControl implements SlateControl {
  public readonly type: string
  public readonly label?: string
  public readonly icon?: IconName
  public readonly dataKey?: string

  private readonly renderFn: SlateBlockControlOptions['render']

  constructor(opts: SlateBlockControlOptions) {
    this.type = opts.type
    this.label = opts.label
    this.icon = opts.icon
    this.dataKey = opts.dataKey
    this.renderFn = opts.render
  }

  public renderNode(props: SlateRenderNodeProps): React.ReactNode {
    if (props.node.object !== 'block' || this.type !== props.node.type) return
    return this.renderFn({...props, control: this})
  }

  public renderControl(props: SlateRenderControlProps) {
    return <SlateBlockControlComponent {...props} control={this} />
  }
}

export class SlateBlockControlComponent extends React.Component<
  SlateControlComponentRenderProps<SlateBlockControl>
> {
  private get hasBlock() {
    return this.activeBlock != undefined
  }

  private get activeBlock() {
    return this.props.value.blocks.find(block => this.props.control.type === block!.type)
  }

  private handleMouseDown = async () => {
    const control = this.props.control
    const activeBlock = this.activeBlock

    const newFieldValue = control.dataKey
      ? await this.props.onEditData(control.dataKey, activeBlock ? activeBlock.data : undefined)
      : undefined

    // Pressed back in FieldEditor.
    if (!activeBlock && control.dataKey && !newFieldValue) return

    this.props.onValueChange(change => {
      if (!newFieldValue && activeBlock) {
        return change.setBlocks('')
      }

      return change.setBlocks({
        type: this.props.control.type,
        data: control.dataKey ? newFieldValue : undefined
      })
    })
  }

  public render() {
    return (
      <Button
        disabled={this.props.disabled}
        selected={this.hasBlock}
        type={ButtonType.Light}
        icon={this.props.control.icon}
        label={this.props.control.label}
        onMouseDown={this.handleMouseDown}
      />
    )
  }
}
