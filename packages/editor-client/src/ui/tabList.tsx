import * as React from 'react'
import {style} from 'typestyle'
import {base64Encode} from '@karma.run/editor-common'

import {boolAttr} from '../util/react'
import {Color, Spacing, DefaultBorderRadiusPx, FontSize, FontWeight} from './style'
import {FlexList} from './flex'
import {Button, ButtonType} from './button'
import {Icon, IconName} from './icon'

// TODO: Find a better way to include SVG
const arrowDownSVG = `data:image/svg+xml;base64,${base64Encode(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><path d="M18.634 5.798a.768.768 0 0 0-1.146 0L10.5 13.346 3.511 5.798a.768.768 0 0 0-1.145 0 .925.925 0 0 0 0 1.237l7.56 8.167a.768.768 0 0 0 1.146 0l.002-.003 7.56-8.165a.925.925 0 0 0 0-1.236z"/></svg>'
)}`

export const TabStyle = style({
  $debugName: 'Tab',
  display: 'flex',

  flexGrow: 1,
  flexShrink: 0,

  position: 'relative',
  zIndex: 0,

  border: `1px solid ${Color.neutral.light2}`,
  borderBottom: 'none',

  borderTopLeftRadius: DefaultBorderRadiusPx,
  borderTopRightRadius: DefaultBorderRadiusPx,

  opacity: 0.5,
  backgroundColor: Color.primary.light5,
  padding: `${Spacing.smallest} ${Spacing.medium}`,

  paddingBottom: DefaultBorderRadiusPx,
  marginBottom: `-${DefaultBorderRadiusPx}`,

  height: `calc(2em + ${DefaultBorderRadiusPx})`,
  cursor: 'pointer',

  fontWeight: FontWeight.medium,
  color: '#6a8186',

  $nest: {
    '& > div > select.label': {
      paddingRight: '1.75rem',

      '-webkit-appearance': 'none',
      '-moz-appearance': 'none',
      appearance: 'none',

      backgroundImage: `url(${arrowDownSVG})`,
      backgroundPosition: `right 0.5rem center`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '0.75em',

      $nest: {
        '&::-ms-expand': {
          display: 'none'
        }
      }
    },

    '& > div > .label': {
      flexGrow: 1,
      color: Color.primary.base,
      fontSize: FontSize.medium,

      border: 'none',

      padding: '0 0.5rem',

      borderRadius: DefaultBorderRadiusPx,
      backgroundColor: 'transparent',
      fontWeight: 'inherit',

      $nest: {
        '&:disabled': {
          background: 'none',
          pointerEvents: 'none'
        },

        '&:focus': {
          backgroundColor: Color.primary.light5,
          boxShadow: `0 0 0 2px ${Color.focus}`,
          outline: 'none'
        },

        '&::-moz-focus-outer': {
          border: 'none' // Get rid of dotted border on focus
        }
      }
    },

    '& > div > .accessory': {
      display: 'flex'
    },

    '&:first-child': {
      marginLeft: 0
    },

    '&[data-no-grow]': {
      flexGrow: 0
    },

    '&[data-active]': {
      opacity: 1
    },

    '&:focus': {
      outline: 'none'
    }
  }
})

export interface EditableTabOption {
  value: string
  disabled: boolean
}

export interface EditableTabProps {
  active?: boolean
  value: string
  index: number
  options?: ReadonlyArray<EditableTabOption>
  onClick: (index: number) => void
  onChange: (index: number, value: string) => void
  onRemove: (index: number) => void
}

export interface EditableTabState {
  editing: boolean
}

export class EditableTab extends React.PureComponent<EditableTabProps, EditableTabState> {
  private inputElement: HTMLInputElement | HTMLSelectElement | null = null

  constructor(props: EditableTabProps) {
    super(props)
    this.state = {editing: false}
  }

  public focus() {
    this.setState({editing: true}, () => {
      this.inputElement!.focus()
    })
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    this.props.onChange(this.props.index, e.currentTarget.value)
  }

  private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.keyCode === 13) {
      this.setState({editing: false})
      e.preventDefault()
    }
  }

  private handleClick = () => {
    this.props.onClick(this.props.index)
  }

  private handleDoubleClick = () => {
    this.focus()
  }

  private handleBlur = () => {
    this.setState({editing: false})
  }

  private handleRemove = () => {
    this.props.onRemove(this.props.index)
  }

  public render() {
    const accessoryVisible = this.state.editing
    let inputElement: React.ReactNode

    if (this.props.options) {
      const filteredOptions = this.props.options.filter(option => {
        return !option.disabled || option.value === this.props.value
      })

      const optionsElements = filteredOptions.map(option => {
        return (
          <option value={option.value} key={option.value}>
            {option.value}
          </option>
        )
      })

      inputElement = (
        <select
          className="label"
          ref={element => (this.inputElement = element)}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
          value={this.props.value}
          disabled={!this.state.editing}>
          {optionsElements}
        </select>
      )
    } else {
      inputElement = (
        <input
          className="label"
          size={this.props.value.length || 1}
          ref={element => (this.inputElement = element)}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
          value={this.props.value}
          disabled={!this.state.editing}
        />
      )
    }

    return (
      <div
        className={TabStyle}
        data-active={boolAttr(this.props.active)}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}>
        <FlexList fill>
          {inputElement}
          <div className="accessory" style={{visibility: accessoryVisible ? 'visible' : 'hidden'}}>
            <Button type={ButtonType.Link} icon={IconName.Clear} onTrigger={this.handleRemove} />
          </div>
        </FlexList>
      </div>
    )
  }
}

export interface TabProps {
  noGrow?: boolean
  active?: boolean
  icon?: IconName
  value?: string
  index?: number
  onClick: (index: number) => void
}

export class Tab extends React.Component<TabProps> {
  private handleClick = () => {
    this.props.onClick(this.props.index || 0)
  }

  public render() {
    return (
      <div
        className={TabStyle}
        data-active={boolAttr(this.props.active)}
        data-no-grow={boolAttr(this.props.noGrow)}
        onClick={this.handleClick}>
        <FlexList>
          {this.props.icon && <Icon name={this.props.icon} />}
          {this.props.value && <span>{this.props.value}</span>}
        </FlexList>
      </div>
    )
  }
}

export const TabListStyle = style({
  $debugName: 'TabList',
  minHeight: '3rem',
  overflow: 'hidden'
})

export type EditableTabListValue = {id: string; key: string}

export interface EditableTabListProps {
  values: EditableTabListValue[]
  activeTab?: number
  options?: ReadonlyArray<string>
  onChangeActiveTab: (index: number) => void
  onChangeAt: (index: number, value: string) => void
  onInsertAt: (index: number, value: string) => void
  onRemoveAt: (index: number) => void
}

export class EditableTabList extends React.PureComponent<EditableTabListProps> {
  tabElements: (EditableTab | null)[] = []

  private handleTabClick = (index: number) => {
    this.props.onChangeActiveTab(index)
  }

  private handleChange = (index: number, value: string) => {
    this.props.onChangeAt(index, value)
  }

  private handleRemove = (index: number) => {
    this.props.onRemoveAt(index)
  }

  private handleAddClick = () => {
    let value = ''

    if (this.tabOptions) {
      value = this.tabOptions.find(tabOption => !tabOption.disabled)!.value
    }

    this.props.onInsertAt(this.props.values.length, value)
  }

  public focusIndex(index: number) {
    this.tabElements[index]!.focus()
  }

  public get tabOptions(): EditableTabOption[] | undefined {
    if (this.props.options) {
      return this.props.options.map(optionValue => {
        return {
          value: optionValue,
          disabled: this.props.values.find(value => value.key === optionValue) != undefined
        }
      })
    }

    return undefined
  }

  public get hasAvailableOptions() {
    return this.tabOptions ? this.tabOptions.some(option => !option.disabled) : true
  }

  public render() {
    const tabs = this.props.values.map((value, index) => {
      return (
        <EditableTab
          ref={tab => (this.tabElements[index] = tab)}
          key={value.id}
          value={value.key}
          active={this.props.activeTab === index}
          index={index}
          onClick={this.handleTabClick}
          onChange={this.handleChange}
          onRemove={this.handleRemove}
          options={this.tabOptions}
        />
      )
    })

    let addButton: React.ReactNode

    if (this.hasAvailableOptions) {
      addButton = <Tab icon={IconName.Add} onClick={this.handleAddClick} noGrow />
    }

    return (
      <div className={TabListStyle}>
        <FlexList fill>
          <FlexList spacing="none" wrap>
            {tabs}
          </FlexList>
          {addButton}
        </FlexList>
      </div>
    )
  }
}

export type TabListValue = {key: string; value: string}

export interface TabListProps {
  values: TabListValue[]
  selectedIndex?: number
  onChangeActiveTab: (index: number) => void
}

export class TabList extends React.Component<TabListProps> {
  private handleTabClick = (index: number) => {
    this.props.onChangeActiveTab(index)
  }

  public render() {
    let actionButton: React.ReactNode
    let addButton: React.ReactNode

    const tabs = this.props.values.map((value, index) => {
      return (
        <Tab
          key={value.key}
          value={value.value}
          active={this.props.selectedIndex === index}
          index={index}
          onClick={this.handleTabClick}
        />
      )
    })

    return (
      <div className={TabListStyle}>
        <FlexList fill>
          <FlexList spacing="none">{tabs}</FlexList>
          {addButton}
          {actionButton}
        </FlexList>
      </div>
    )
  }
}
