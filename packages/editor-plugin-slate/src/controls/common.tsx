import React from 'react'
import {IconName} from '@karma.run/editor-client'

import {SlateMarkControl} from './mark'
import {SlateListBlockControl} from './list'

export const BoldMarkControl = new SlateMarkControl({
  type: 'bold',
  icon: IconName.FormatBold,
  render: props => {
    return <strong {...props.attributes}>{props.children}</strong>
  }
})

export const ItalicMarkControl = new SlateMarkControl({
  type: 'italic',
  icon: IconName.FormatItalic,
  render: props => {
    return <em {...props.attributes}>{props.children}</em>
  }
})

export const UnderlineMarkControl = new SlateMarkControl({
  type: 'underline',
  icon: IconName.FormatUnderline,
  render: props => {
    return (
      <span {...props.attributes} style={{textDecoration: 'underline'}}>
        {props.children}
      </span>
    )
  }
})

export const StrikethroughMarkControl = new SlateMarkControl({
  type: 'strikethrough',
  icon: IconName.FormatStrikethrough,
  render: props => {
    return (
      <span {...props.attributes} style={{textDecoration: 'line-through'}}>
        {props.children}
      </span>
    )
  }
})

export const UnorderedListControl = new SlateListBlockControl({
  type: 'unorderedList',
  itemType: 'listItem',
  label: 'List',
  render: props => <ul {...props.attributes}>{props.children}</ul>,
  renderItem: props => <li {...props.attributes}>{props.children}</li>
})

export const OrderedListControl = new SlateListBlockControl({
  type: 'orderedList',
  itemType: 'listItem',
  label: 'List',
  render: props => <ol {...props.attributes}>{props.children}</ol>,
  renderItem: props => <li {...props.attributes}>{props.children}</li>
})

export const commonMarkControls = {
  bold: BoldMarkControl,
  italic: ItalicMarkControl,
  underline: UnderlineMarkControl,
  strikethrough: StrikethroughMarkControl,
  unorderedList: UnorderedListControl,
  orderedList: OrderedListControl
}
