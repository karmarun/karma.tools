import React from 'react'
import {IconName, ButtonType, Button} from '@karma.run/editor-client'

import {
  SlateControl,
  SlateRenderControlProps,
  SlateControlComponentRenderProps,
  SlateNodeComponentRenderProps,
  SlateRenderNodeProps
} from './control'

export interface SlateListBlockControlOptions {
  readonly type: string
  readonly itemType: string

  readonly label?: string
  readonly icon?: IconName

  render(props: SlateNodeComponentRenderProps): React.ReactNode
  renderItem(props: SlateNodeComponentRenderProps): React.ReactNode
}

export class SlateListBlockControl implements SlateControl {
  public readonly type: string
  public readonly itemType: string

  public readonly label?: string
  public readonly icon?: IconName

  private readonly renderFn: SlateListBlockControlOptions['render']
  private readonly renderItemFn: SlateListBlockControlOptions['renderItem']

  constructor(opts: SlateListBlockControlOptions) {
    this.type = opts.type
    this.itemType = opts.itemType

    this.label = opts.label
    this.icon = opts.icon

    this.renderFn = opts.render
    this.renderItemFn = opts.renderItem
  }

  public renderNode(props: SlateRenderNodeProps): React.ReactNode {
    if (props.node.object !== 'block') return undefined

    if (this.type === props.node.type) {
      return this.renderFn({...props, control: this})
    } else if (this.itemType === props.node.type) {
      return this.renderItemFn({...props, control: this})
    }

    return undefined
  }

  public renderControl(props: SlateRenderControlProps) {
    return <SlateListBlockControlComponent {...props} control={this} />
  }
}

export class SlateListBlockControlComponent extends React.Component<
  SlateControlComponentRenderProps<SlateListBlockControl>
> {
  private get hasBlock() {
    const isItem = this.props.value.blocks.find(
      block => this.props.control.itemType === block!.type
    )

    const isType = this.props.value.blocks.some(
      block =>
        !!this.props.value.document.getClosest(
          block!.key,
          (parent: any) => parent.type == this.props.control.type
        )
    )

    return isItem && isType
  }

  private handleMouseDown = async () => {
    this.props.onValueChange(change => {
      if (this.hasBlock) {
        return change.setBlocks('').unwrapBlock(this.props.control.type)
      }

      return change.setBlocks(this.props.control.itemType).wrapBlock(this.props.control.type)
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
