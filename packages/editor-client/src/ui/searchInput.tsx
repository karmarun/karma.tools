import * as React from 'react'
import {style} from 'typestyle'

import {Ref} from '@karma.run/sdk'
import {refToString} from '@karma.run/editor-common'

import {TextInputType, TextInput} from './input'
import {Color, DefaultBorderRadiusPx, Spacing} from './style'
import {boolAttr} from '../util/react'
import {EnterKeyCode, UpArrowKeyCode, DownArrowKeyCode} from '../util/keyCodes'

export const SearchInputStyle = style({
  $debugName: 'SearchInput',

  position: 'relative',
  width: '100%',

  $nest: {
    '&_input': {
      position: 'relative',
      zIndex: 1
    },

    '&_resultContainer': {
      position: 'absolute',
      zIndex: 0,
      top: '100%',
      width: '100%',
      marginTop: `-${DefaultBorderRadiusPx}`,
      paddingTop: DefaultBorderRadiusPx,
      border: `1px solid ${Color.neutral.light1}`,
      backgroundColor: Color.primary.light1,
      borderBottomLeftRadius: DefaultBorderRadiusPx,
      borderBottomRightRadius: DefaultBorderRadiusPx
    }
  }
})

export namespace SearchInput {
  export interface ResultItem {
    id: Ref
    title: string
    href: string
  }

  export interface State {
    selectedIndex: number
    hasFocus: boolean
  }

  export interface Props {
    value: string
    placeholder?: string
    results: ResultItem[]
    onItemSubmit: (item: ResultItem) => void
    onChange: (value: string) => void
  }
}

export class SearchInput extends React.Component<SearchInput.Props, SearchInput.State> {
  constructor(props: SearchInput.Props) {
    super(props)
    this.state = {selectedIndex: 0, hasFocus: false}
  }

  private submit() {
    if (this.props.results.length > 0) {
      const item = this.props.results[this.state.selectedIndex]
      this.props.onItemSubmit(item)
    }
  }

  private moveSelectionUp() {
    this.setState({
      selectedIndex: Math.max(0, this.state.selectedIndex - 1)
    })
  }

  private moveSelectionDown() {
    this.setState({
      selectedIndex: Math.min(this.props.results.length - 1, this.state.selectedIndex + 1)
    })
  }

  private handleItemClick = (item: SearchInput.ResultItem) => {
    this.props.onItemSubmit(item)
  }

  private handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.keyCode) {
      case EnterKeyCode:
        e.preventDefault()
        return this.submit()

      case UpArrowKeyCode:
        e.preventDefault()
        return this.moveSelectionUp()

      case DownArrowKeyCode:
        e.preventDefault()
        return this.moveSelectionDown()
    }
  }

  private handleFocus = () => {
    this.setState({hasFocus: true})
  }

  private handleBlur = () => {
    this.setState({hasFocus: false})
  }

  private handleChange = (value: string) => {
    this.setState({selectedIndex: 0})
    this.props.onChange(value)
  }

  public render() {
    const {results, ...inputProps} = this.props

    let resultElements: React.ReactNode

    if (this.state.hasFocus && results.length > 0) {
      resultElements = (
        <div className={`${SearchInputStyle}_resultContainer`}>
          {results.map((result, index) => (
            <SearchInputItem
              key={refToString(result.id)}
              item={result}
              selected={index === this.state.selectedIndex}
              onMouseDown={this.handleItemClick}
            />
          ))}
        </div>
      )
    }

    return (
      <div className={SearchInputStyle} onKeyDown={this.handleKeyDown}>
        <div className={`${SearchInputStyle}_input`}>
          <TextInput
            {...inputProps}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            type={TextInputType.Dark}
          />
        </div>
        {resultElements}
      </div>
    )
  }
}

export const SearchInputItemStyle = style({
  $debugName: 'SearchInputItem',

  display: 'block',
  padding: Spacing.small,
  borderBottom: `1px solid ${Color.neutral.light1}`,

  $nest: {
    '&:last-child': {borderBottom: 'none'},
    '&:hover': {backgroundColor: Color.primary.dark1},
    '&[data-selected]': {backgroundColor: Color.primary.base}
  }
})

export namespace SearchInputItem {
  export interface Props {
    item: SearchInput.ResultItem
    selected: boolean
    onMouseDown: (item: SearchInput.ResultItem) => void
  }
}

export class SearchInputItem extends React.Component<SearchInputItem.Props> {
  private handleMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    this.props.onMouseDown(this.props.item)
  }

  public render() {
    return (
      <a
        key={refToString(this.props.item.id)}
        className={SearchInputItemStyle}
        href={this.props.item.href}
        data-selected={boolAttr(this.props.selected)}
        onMouseDown={this.handleMouseDown}>
        {this.props.item.title}
      </a>
    )
  }
}
