import React from 'react'
import {RenderMarkProps} from 'slate-react'
import {IconName, ButtonType, Button} from '@karma.run/editor-client'

import {SlateControl, SlateRenderControlProps, SlateControlComponentRenderProps} from './control'

export interface SlateMarkControlOptions {
  readonly type: string
  readonly label?: string
  readonly icon?: IconName

  render(props: RenderMarkProps): React.ReactNode
}

export class SlateMarkControl implements SlateControl {
  public readonly type: string
  public readonly label?: string
  public readonly icon?: IconName
  private readonly renderFn: SlateMarkControlOptions['render']

  constructor(opts: SlateMarkControlOptions) {
    this.type = opts.type
    this.label = opts.label
    this.icon = opts.icon
    this.renderFn = opts.render
  }

  public renderMark(props: RenderMarkProps): React.ReactNode {
    if (this.type !== props.mark.type) return
    return this.renderFn(props)
  }

  public renderControl(props: SlateRenderControlProps) {
    return <SlateMarkControlComponent {...props} control={this} />
  }
}

export class SlateMarkControlComponent extends React.Component<
  SlateControlComponentRenderProps<SlateMarkControl>
> {
  private get hasMark() {
    return this.props.value.activeMarks.some(mark => mark!.type === this.props.control.type)
  }

  private handleMouseDown = () => {
    this.props.onValueChange(change => change.toggleMark(this.props.control.type))
  }

  public render() {
    return (
      <Button
        disabled={this.props.disabled}
        selected={this.hasMark}
        type={ButtonType.Light}
        icon={this.props.control.icon}
        label={this.props.control.label}
        onMouseDown={this.handleMouseDown}
      />
    )
  }
}
