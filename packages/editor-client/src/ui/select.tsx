import React from 'react'

import {style} from 'typestyle'
import {Color, DefaultBorderRadiusPx} from './style'
import {base64Encode} from '@karma.run/editor-common'

const arrowDownSVG = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 21'>
    <path d='M18.634 5.798a.768.768 0 0 0-1.146 0L10.5 13.346 3.511 5.798a.768.768 0 0 0-1.145 0 .925.925 0 0 0 0 1.237l7.56 8.167a.768.768 0 0 0 1.146 0l.002-.003 7.56-8.165a.925.925 0 0 0 0-1.236z'/>
  </svg>
`

export const SelectStyle = style({
  $debugName: 'Select',

  appearance: 'none',
  '-webkit-appearance': 'none',
  '-moz-appearance': 'none',

  width: '100%',
  padding: '0.6rem 1rem',
  paddingRight: '2.6rem',

  fontSize: '1em',
  lineHeight: 1.2,
  color: Color.primary.base,

  border: `1px solid ${Color.neutral.light1}`,
  backgroundColor: Color.primary.light5,
  borderRadius: DefaultBorderRadiusPx,

  backgroundImage: `url(data:image/svg+xml;base64,${base64Encode(arrowDownSVG)})`,
  backgroundPosition: `right 1rem center`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1em',

  flexGrow: 0,
  flexShrink: 0,

  $nest: {
    '&:focus': {
      backgroundColor: Color.primary.light5,
      boxShadow: `0 0 0 2px ${Color.focus}`,
      outline: 'none'
    },

    '&::-moz-focus-outer': {
      border: 'none' // Get rid of dotted border on focus
    },

    '&::-ms-expand': {
      display: 'none'
    }
  }
})

function isOptionGroup(option: Select.Option): option is Select.OptionGroup {
  return Array.isArray((option as any).options)
}

function renderOptionGroup(optionGroup: Select.OptionGroup) {
  return (
    <optgroup key={optionGroup.key} label={optionGroup.label}>
      {optionGroup.options.map(option => renderOptionEntry(option))}
    </optgroup>
  )
}

function renderOptionEntry(optionEntry: Select.OptionEntry) {
  return (
    <option key={optionEntry.key} value={optionEntry.key} disabled={optionEntry.disabled}>
      {'\u00a0\u00a0'.repeat(optionEntry.depth || 0)}
      {optionEntry.label}
    </option>
  )
}

export const enum SelectType {
  Light = 'light',
  Transparent = 'transparent'
}

export namespace Select {
  export interface OptionGroup {
    key: string
    label: string
    options: OptionEntry[]
  }

  export interface OptionEntry {
    key: string
    label: string
    disabled?: boolean
    depth?: number
  }

  export type Option = OptionGroup | OptionEntry

  export interface Props {
    type?: SelectType
    options: Option[]
    disableUnselectedOption?: boolean
    unselectedLabel?: string
    value?: string | undefined
    disabled?: boolean
    id?: string | number
    onChange: (key: string | undefined, id?: string | number) => void
  }
}

export class Select extends React.PureComponent<Select.Props> {
  private handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.currentTarget.value === '') {
      this.props.onChange(undefined, this.props.id)
      return
    }

    this.props.onChange(e.currentTarget.value, this.props.id)
  }

  public render() {
    let style: string

    switch (this.props.type) {
      default:
      case SelectType.Light:
        style = Select.LightStyle
        break
      case SelectType.Transparent:
        style = Select.TransparentStyle
        break
    }

    return (
      <select
        className={`${SelectStyle} ${style}`}
        value={this.props.value || ''}
        disabled={this.props.disabled}
        onChange={this.handleChange}>
        <option disabled={this.props.disableUnselectedOption} value="">
          {this.props.unselectedLabel || '-- Select --'}
        </option>
        {this.props.options.map(
          option => (isOptionGroup(option) ? renderOptionGroup(option) : renderOptionEntry(option))
        )}
      </select>
    )
  }
}

export namespace Select {
  export const LightStyle = style({
    $debugName: 'SelectLight',
    backgroundColor: Color.primary.light5,
    color: Color.primary.base
  })

  export const TransparentStyle = style({
    $debugName: 'SelectTransparent',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    color: Color.primary.base,
    padding: '0.4rem 1rem',
    paddingRight: '2.6rem'
  })
}
