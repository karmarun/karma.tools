import React from 'react'
import Slate from 'slate'
import {RenderMarkProps, RenderNodeProps} from 'slate-react'

export type SlateData = Slate.Block['data']

export interface SlateRenderControlProps {
  disabled: boolean
  value: Slate.Value
  onValueChange(changeFn: (change: Slate.Editor) => Slate.Editor): void
  onEditData(dataKey: string, data?: SlateData): Promise<{[key: string]: any} | undefined>
}

export interface SlateRenderNodeProps extends RenderNodeProps {
  onValueChange(changeFn: (change: Slate.Editor) => Slate.Editor): void
  onEditData(dataKey: string, data?: SlateData): Promise<{[key: string]: any} | undefined>
}

export interface SlateControlComponentRenderProps<C = any> extends SlateRenderControlProps {
  control: C
}

export interface SlateNodeComponentRenderProps<C = any> extends SlateRenderNodeProps {
  control: C
}

export interface SlateControl {
  renderNode?(props: SlateRenderNodeProps): React.ReactNode
  renderMark?(props: RenderMarkProps): React.ReactNode
  renderControl(props: SlateRenderControlProps): React.ReactNode
}
