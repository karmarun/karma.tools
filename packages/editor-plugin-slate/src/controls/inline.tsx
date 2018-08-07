import React from 'react'
import {IconName, ButtonType, Button} from '@karma.run/editor-client'

import {
  SlateControl,
  SlateRenderControlProps,
  SlateControlComponentRenderProps,
  SlateNodeComponentRenderProps,
  SlateRenderNodeProps
} from './control'

export interface SlateInlineControlOptions {
  readonly type: string
  readonly label?: string
  readonly icon?: IconName
  readonly dataKey?: string

  render(props: SlateNodeComponentRenderProps): React.ReactNode
}

export class SlateInlineControl implements SlateControl {
  public readonly type: string
  public readonly label?: string
  public readonly icon?: IconName
  public readonly dataKey?: string

  private readonly renderFn: SlateInlineControlOptions['render']

  constructor(opts: SlateInlineControlOptions) {
    this.type = opts.type
    this.label = opts.label
    this.icon = opts.icon
    this.dataKey = opts.dataKey
    this.renderFn = opts.render
  }

  public renderNode(props: SlateRenderNodeProps): React.ReactNode {
    if ((props.node.object as string) !== 'inline' || this.type !== props.node.type) return
    return this.renderFn({...props, control: this})
  }

  public renderControl(props: SlateRenderControlProps) {
    return <SlateInlineControlComponent {...props} control={this} />
  }
}

export class SlateInlineControlComponent extends React.Component<
  SlateControlComponentRenderProps<SlateInlineControl>
> {
  private get hasInline() {
    return this.activeInline != undefined
  }

  private get activeInline() {
    return this.props.value.inlines.find(inline => this.props.control.type === inline!.type)
  }

  private handleMouseDown = async () => {
    const control = this.props.control
    const activeInline = this.activeInline

    const newFieldValue = control.dataKey
      ? await this.props.onEditData(control.dataKey, activeInline ? activeInline.data : undefined)
      : undefined

    // Pressed back in FieldEditor.
    if (!activeInline && control.dataKey && !newFieldValue) return

    this.props.onValueChange(change => {
      if (!newFieldValue && activeInline) {
        return change.unwrapInline(control.type)
      }

      return activeInline
        ? change.setInlines({type: control.type, data: newFieldValue})
        : change.wrapInline({type: control.type, data: newFieldValue})
    })
  }

  public render() {
    return (
      <Button
        disabled={this.props.disabled}
        selected={this.hasInline}
        type={ButtonType.Light}
        icon={this.props.control.icon}
        label={this.props.control.label}
        onMouseDown={this.handleMouseDown}
      />
    )
  }
}
