import React from 'react'
import Datetime from 'react-datetime'
import moment from 'moment'

import {NestedCSSProperties} from 'typestyle/lib/types'
import {style} from 'typestyle'

import {Color, DefaultBorderRadiusPx, Spacing, FontWeight} from './style'
import classNames from 'classnames'

export const CommonInputStyle: NestedCSSProperties = {
  $debugName: 'Input',

  width: '100%',
  padding: '0.6rem 1rem',

  fontSize: '1em',
  lineHeight: 1.2,
  color: Color.neutral.black,

  border: `1px solid ${Color.neutral.light1}`,
  backgroundColor: Color.neutral.white,
  borderRadius: DefaultBorderRadiusPx,

  $nest: {
    '&:focus': {
      backgroundColor: Color.neutral.white,
      boxShadow: `0 0 0 2px ${Color.focus}`,
      outline: 'none'
    },

    '&:disabled': {
      opacity: 0.5
    }
  }
}

export const InputStyle = style(CommonInputStyle)

export const enum TextInputType {
  Lighter = 'ligter',
  Light = 'light',
  Dark = 'dark'
}

export namespace TextInput {
  export interface Props {
    type?: TextInputType
    onChange?: (value: string, id?: string | number) => void
    onFocus?: (id?: string | number) => void
    onBlur?: (id?: string | number) => void
    id?: string | number
    name?: string
    value: string
    placeholder?: string
    isPassword?: boolean
    disabled?: boolean
    minLength?: number
    maxLength?: number
  }
}

export class TextInput extends React.Component<TextInput.Props> {
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) this.props.onChange(e.currentTarget.value, this.props.id)
  }

  private handleFocus = () => {
    if (this.props.onFocus) this.props.onFocus(this.props.id)
  }

  private handleBlur = () => {
    if (this.props.onBlur) this.props.onBlur(this.props.id)
  }

  public render() {
    let style: string

    switch (this.props.type) {
      default:
      case TextInputType.Lighter:
        style = TextInput.LighterStyle
        break
      case TextInputType.Light:
        style = TextInput.LightStyle
        break
      case TextInputType.Dark:
        style = TextInput.DarkStyle
        break
    }

    return (
      <input
        className={`${InputStyle} ${style}`}
        name={this.props.name}
        type={this.props.isPassword ? 'password' : 'text'}
        placeholder={this.props.placeholder}
        value={this.props.value}
        disabled={this.props.disabled}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />
    )
  }
}

export namespace TextInput {
  export const LighterStyle = style({
    $debugName: 'TextInputLighter',
    padding: `${Spacing.small} ${Spacing.medium}`,
    backgroundColor: Color.neutral.white,
    color: Color.primary.base,

    $nest: {
      '&::placeholder': {
        color: '#8E8E8E',
        fontStyle: 'italic'
      }
    }
  })

  export const LightStyle = style({
    $debugName: 'TextInputLight',
    padding: `${Spacing.small} ${Spacing.medium}`,
    backgroundColor: Color.primary.light5,
    color: Color.primary.base,

    $nest: {
      '&::placeholder': {
        color: Color.primary.base
      }
    }
  })

  export const DarkStyle = style({
    $debugName: 'TextInputDark',
    padding: `0.8rem ${Spacing.largest}`,
    backgroundColor: Color.primary.light1,
    border: 'none',
    color: Color.primary.base,
    fontWeight: FontWeight.light,

    $nest: {
      '&:focus': {
        backgroundColor: Color.neutral.dark1,
        boxShadow: `0 0 0 2px ${Color.focus}`,
        outline: 'none'
      },

      '&::placeholder': {
        color: Color.neutral.light5
      }
    }
  })
}

export const TextAreaInputStyle = style({
  $debugName: 'TextAreaInput',
  height: 'auto',
  maxHeight: '30vh',
  resize: 'none'
})

export namespace TextAreaInput {
  export interface Props {
    onChange?: (value: string, id?: string | number) => void
    onFocus?: (id?: string | number) => void
    onBlur?: (id?: string | number) => void
    id?: string | number
    name?: string
    value: string
    placeholder?: string
    disabled?: boolean
    autoresize?: boolean
  }
}

export class TextAreaInput extends React.Component<TextAreaInput.Props> {
  private textArea!: HTMLTextAreaElement

  public componentDidMount() {
    this.resize()
  }

  private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (this.props.onChange) this.props.onChange(e.currentTarget.value, this.props.id)
    this.resize()
  }

  private handleFocus = () => {
    if (this.props.onFocus) this.props.onFocus(this.props.id)
  }

  private hanldeBlur = () => {
    if (this.props.onBlur) this.props.onBlur(this.props.id)
  }

  private resize() {
    if (!this.props.autoresize) return

    this.textArea.style.height = 'auto'
    this.textArea.style.height = `${this.textArea.scrollHeight + 2}px` // Chrome's scrollHeight is off by 2px
  }

  public render() {
    return (
      <textarea
        ref={textArea => (this.textArea = textArea!)}
        rows={1}
        className={classNames(InputStyle, TextAreaInputStyle)}
        name={this.props.name}
        placeholder={this.props.placeholder}
        value={this.props.value}
        disabled={this.props.disabled}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.hanldeBlur}
      />
    )
  }
}

export namespace NumberInput {
  export interface Props {
    onChange: (value: string) => void
    value: string
    placeholder?: string
    disabled?: boolean
    step?: number
  }
}

export class NumberInput extends React.Component<NumberInput.Props> {
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.value)
  }

  public render() {
    return (
      <input
        className={InputStyle}
        type="number"
        step={this.props.step}
        placeholder={this.props.placeholder}
        value={this.props.value}
        disabled={this.props.disabled}
        onChange={this.handleChange}
      />
    )
  }
}

export const CheckboxInputStyle = style({
  $debugName: 'CheckboxInput',
  padding: 0,
  margin: 0,

  fontSize: '1em',
  lineHeight: 1.2,

  $nest: {
    '&:focus': {
      boxShadow: `0 0 0 2px ${Color.focus}`,
      outline: 'none'
    }
  }
})

export namespace CheckboxInput {
  export interface Props {
    onChange: (value: boolean) => void
    value: boolean
    placeholder?: string
    isPassword?: boolean
    disabled?: boolean
  }
}

export class CheckboxInput extends React.Component<CheckboxInput.Props> {
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.checked)
  }

  public render() {
    return (
      <input
        className={CheckboxInputStyle}
        type="checkbox"
        checked={this.props.value}
        disabled={this.props.disabled}
        onChange={this.handleChange}
      />
    )
  }
}

export const DateTimeInputStyle = style({
  $debugName: 'DateTimeInput',
  width: '100%',
  color: Color.primary.base
})

export namespace DateTimeInput {
  export interface Props {
    onChange: (value: Date | string) => void
    value: Date | string
    disabled?: boolean
  }
}

export class DateTimeInput extends React.Component<DateTimeInput.Props> {
  private handleChange = (date: React.ChangeEvent<any> | moment.Moment | string) => {
    if (moment.isMoment(date)) {
      this.props.onChange(date.toDate())
    } else if (typeof date === 'string') {
      this.props.onChange(date)
    }
  }

  public render() {
    // Store Value has to be asserted as any cuz Datetime has wrong typedef for 'value'
    return (
      <Datetime
        className={DateTimeInputStyle}
        inputProps={{className: InputStyle}}
        utc={true}
        value={this.props.value as any}
        onChange={this.handleChange}
      />
    )
  }
}

export const DropAreaFileInputStyle = style({
  $debugName: 'DropAreaFileInputStyle',

  display: 'flex',
  width: '100%',
  minHeight: '10rem',

  justifyContent: 'center',
  alignItems: 'center',

  $nest: {
    '&_fileInput': {
      display: 'none',
      width: 0,
      height: 0,
      margin: 0,
      padding: 0
    }
  }
})

export namespace DropAreaFileInput {
  export interface Props {
    text: string
    onFileDrop: (file: File) => void
  }
}

export class DropAreaFileInput extends React.Component<DropAreaFileInput.Props> {
  private fileInputElement?: HTMLInputElement | null

  private handleClick = () => {
    if (this.fileInputElement) this.fileInputElement.click()
  }

  private handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    this.props.onFileDrop(e.dataTransfer.files[0])
  }

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files && e.currentTarget.files[0]
    if (!file) return

    this.props.onFileDrop(file)
  }

  public render() {
    let content: React.ReactNode

    if (React.Children.count(this.props.children) === 0) {
      content = <div>{this.props.text}</div>
    } else {
      content = this.props.children
    }

    return (
      <div className={DropAreaFileInputStyle} onClick={this.handleClick} onDrop={this.handleDrop}>
        {content}
        <input
          ref={element => (this.fileInputElement = element)}
          className={`${DropAreaFileInputStyle}_fileInput`}
          type="file"
          onChange={this.handleInputChange}
        />
      </div>
    )
  }
}
