import * as React from 'react'
import * as Immutable from 'immutable'
import {style} from 'typestyle'

import {
  RichUtils,
  Editor,
  EditorState,
  DraftInlineStyle,
  ContentBlock,
  EditorBlock,
  genKey,
  Modifier,
  BlockMapBuilder,
  CompositeDecorator,
  ContentState,
  DraftHandleValue
} from 'draft-js'

import {List} from 'immutable'
import {reduceToMap} from '@karma.run/editor-common'

import {
  boolAttr,
  Color,
  DefaultBorderRadiusPx,
  FlexList,
  FlexItem,
  Button,
  ButtonType,
  Select,
  SelectType,
  IconName
} from '@karma.run/editor-client'

export const RichTextInputStyle = style({
  $debugName: 'RichTextInput',

  width: '100%',

  fontSize: '1em',
  lineHeight: 1.2,
  color: Color.primary.base,

  $nest: {
    '&[data-focused] &_content': {
      backgroundColor: Color.neutral.white,
      boxShadow: `0 0 0 2px ${Color.focus}`
    },

    '&_content': {
      width: '100%',
      padding: '0.6rem 1rem',
      maxHeight: '30vh',
      overflowY: 'auto',
      border: `1px solid ${Color.neutral.light1}`,
      backgroundColor: Color.neutral.light4,
      borderRadius: DefaultBorderRadiusPx
    }
  }
})

export type Control =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'orderedList'
  | 'unorderedList'

export interface BlockType {
  type: string
  dataKey?: string
  style?: React.CSSProperties
  label?: string
}

export interface CustomElement {
  type: string
  dataKey?: string
  style?: React.CSSProperties
  content?: string
  label?: string
  icon?: string
}

export interface Style {
  type: string
  style?: React.CSSProperties
  label?: string
}

export interface StyleGroup {
  label?: string
  name: string
  styles: Style[]
}

export interface LinkType {
  dataKey: string
  label?: string
}

export namespace RichTextInput {
  export interface Props {
    onOpenBlockEditor: (
      key: string,
      data: any,
      done: (data: any) => void,
      cancel: () => void
    ) => void

    onOpenLinkEditor: (data: any, done: (data: any) => void, cancel: () => void) => void
    onChange: (value: EditorState) => void
    value: EditorState
    disabled?: boolean
    controls?: Set<Control>
    styleGroups?: StyleGroup[]
    blocks?: BlockType[]
    links?: LinkType[]
    elements?: CustomElement[]
    linkEntityType: string
    maxLength?: number
  }

  export interface State {
    isFocused: boolean
  }
}

namespace CustomBlock {
  export interface Props {
    blockProps: {style: React.CSSProperties}
  }
}

const CustomBlock: React.StatelessComponent<CustomBlock.Props> = props => {
  return (
    <div style={props.blockProps.style}>
      <EditorBlock {...props} />
    </div>
  )
}

namespace CustomImmutableBlock {
  export interface Props {
    blockProps: {
      content?: string
      style: React.CSSProperties
    }
  }
}

const CustomImmutableBlock: React.StatelessComponent<CustomImmutableBlock.Props> = props => {
  return (
    <div style={{...props.blockProps.style, userSelect: 'none'}}>{props.blockProps.content}</div>
  )
}

const DefaultBlockRenderMap = Immutable.Map<any, any>({
  'unordered-list-item': {
    element: 'li',
    wrapper: <ul />
  },
  'ordered-list-item': {
    element: 'li',
    wrapper: <ol />
  },
  unstyled: {
    element: 'div',
    aliasedElements: ['p']
  }
})

function iconForControl(control: Control) {
  switch (control) {
    case 'bold':
      return IconName.FormatBold
    case 'italic':
      return IconName.FormatItalic
    case 'strikethrough':
      return IconName.FormatStrikethrough
    case 'underline':
      return IconName.FormatUnderline
    case 'unorderedList':
      return IconName.FormatUnorderedList
    case 'orderedList':
      return IconName.FormatOrderedList
    default:
      return undefined
  }
}

const ControlSeparatorStyle = style({
  $debugName: 'ControlSeparator',
  borderLeft: `1px solid ${Color.neutral.light1}`,
  height: '1.5rem'
})

const ControlSeparator: React.StatelessComponent = () => {
  return <div className={ControlSeparatorStyle} />
}

const LinkEntityRendererStyle = style({
  textDecoration: 'underline',
  color: Color.primary.light2
})

const LinkEntityRenderer: React.StatelessComponent = props => {
  return <a className={LinkEntityRendererStyle}>{props.children}</a>
}

const UnknownEntityRendererStyle = style({
  textDecoration: 'line-through',
  color: Color.error.base
})

const UnknownEntityRenderer: React.StatelessComponent = props => {
  return <a className={UnknownEntityRendererStyle}>{props.children}</a>
}

export class RichTextInput extends React.Component<RichTextInput.Props, RichTextInput.State> {
  private editorRef!: Editor

  constructor(props: RichTextInput.Props) {
    super(props)
    this.state = {
      isFocused: false
    }
  }

  private insertImmutableBlock(type: string, data?: any) {
    const contentState = this.props.value.getCurrentContent()
    const selectionState = this.props.value.getSelection()

    const afterRemoval = Modifier.removeRange(contentState, selectionState, 'backward')

    const targetSelection = afterRemoval.getSelectionAfter()
    const afterSplit = Modifier.splitBlock(afterRemoval, targetSelection)
    const insertionTarget = afterSplit.getSelectionAfter()

    const asAtomicBlock = Modifier.setBlockType(afterSplit, insertionTarget, type)

    const fragmentArray = [
      new ContentBlock({
        key: genKey(),
        type,
        text: '',
        characterList: List()
      }),
      new ContentBlock({
        key: genKey(),
        type: 'unstyled',
        text: '',
        characterList: List()
      })
    ]

    const fragment = BlockMapBuilder.createFromArray(fragmentArray)

    const withAtomicBlock = Modifier.replaceWithFragment(asAtomicBlock, insertionTarget, fragment)

    const withData = Modifier.setBlockData(
      withAtomicBlock,
      insertionTarget,
      Immutable.Map(data || {})
    )

    const newContent = withAtomicBlock.merge({
      selectionBefore: selectionState,
      selectionAfter: withData.getSelectionAfter().set('hasFocus', true)
    })

    this.props.onChange(EditorState.push(this.props.value, newContent as any, 'insert-fragment'))
  }

  private handleBlur = () => {
    this.setState({isFocused: false})
  }

  private handleFocus = () => {
    this.setState({isFocused: true})
  }

  private handleChange = (value: EditorState) => {
    this.props.onChange(value)
  }

  private lengthOfSelection(editorState: EditorState) {
    const selection = editorState.getSelection()

    if (selection.isCollapsed()) return 0

    const content = editorState.getCurrentContent()

    const startKey = selection.getStartKey()
    const endKey = selection.getEndKey()

    if (startKey === endKey) {
      return selection.getEndOffset() - selection.getStartOffset()
    } else {
      const startBlock = content.getBlockForKey(startKey)

      let nextBlock = content.getBlockAfter(startBlock.getKey())
      let totalLength =
        startBlock.getLength() - selection.getStartOffset() + selection.getEndOffset() + 1

      while (nextBlock.getKey() !== endKey) {
        totalLength += nextBlock.getLength() + 1
        nextBlock = content.getBlockAfter(nextBlock.getKey())
      }

      return totalLength
    }
  }

  private handleBeforeInput = (chars: string, editorState: EditorState): DraftHandleValue => {
    if (this.props.maxLength != undefined) {
      const contentLength = editorState.getCurrentContent().getPlainText().length
      const selectionLength = this.lengthOfSelection(editorState)
      const charsLength = chars.length

      if (contentLength - selectionLength + charsLength > this.props.maxLength) return 'handled'
    }

    return 'not-handled'
  }

  private handlePastedText = (
    text: string,
    _html: string,
    editorState: EditorState
  ): DraftHandleValue => {
    if (this.props.maxLength != undefined) {
      const contentLength = editorState.getCurrentContent().getPlainText().length
      const selectionLength = this.lengthOfSelection(editorState)
      const textLength = text.length

      const totalLength = contentLength - selectionLength + textLength
      const overflowLength = this.props.maxLength - totalLength
      const trimmedText = text.substring(0, Math.min(text.length + overflowLength, text.length))

      const newContent = Modifier.replaceText(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        trimmedText
      )

      const newEditorState = EditorState.push(editorState, newContent, 'insert-characters')
      this.props.onChange(newEditorState)
      return 'handled'
    }

    return 'not-handled'
  }

  private handleSplitBlock(): EditorState | undefined {
    const editorState = this.props.value

    if (this.props.maxLength != undefined) {
      const contentLength = editorState.getCurrentContent().getPlainText().length
      const selectionLength = this.lengthOfSelection(editorState)

      if (contentLength - selectionLength + 1 > this.props.maxLength) return editorState
    }

    return undefined
  }

  private isElement(type: string) {
    if (!this.props.elements) return false
    return this.props.elements.some(element => element.type === type)
  }

  private onBackspace() {
    const editorState = this.props.value
    const selection = editorState.getSelection()

    if (!selection.isCollapsed() || selection.getAnchorOffset() || selection.getFocusOffset()) {
      return undefined
    }

    // First, try to remove a preceding atomic block.
    const content = editorState.getCurrentContent()
    const startKey = selection.getStartKey()
    const blockBefore = content.getBlockBefore(startKey)

    if (blockBefore && this.isElement(blockBefore.getType())) {
      const blockMap = content.getBlockMap().delete(blockBefore.getKey())
      const withoutAtomicBlock = content.merge({blockMap, selectionAfter: selection})

      if (withoutAtomicBlock !== content) {
        return EditorState.push(editorState, withoutAtomicBlock as any, 'remove-range')
      }
    }

    // If that doesn't succeed, try to remove the current block style.
    const withoutBlockStyle = RichUtils.tryToRemoveBlockStyle(editorState)

    if (withoutBlockStyle) {
      return EditorState.push(editorState, withoutBlockStyle, 'change-block-type')
    }

    return undefined
  }

  private onDelete() {
    const editorState = this.props.value
    const selection = editorState.getSelection()

    if (!selection.isCollapsed()) {
      return undefined
    }

    const content = editorState.getCurrentContent()
    const startKey = selection.getStartKey()
    const block = content.getBlockForKey(startKey)
    const length = block.getLength()

    // The cursor is somewhere within the text. Behave normally.
    if (selection.getStartOffset() < length) {
      return undefined
    }

    if (block && this.isElement(block.getType())) {
      const atomicBlockTarget = selection.merge({
        focusKey: block.getKey(),
        focusOffset: block.getLength()
      })

      const withoutAtomicBlock = Modifier.removeRange(content, atomicBlockTarget as any, 'forward')

      if (withoutAtomicBlock !== content) {
        return EditorState.push(editorState, withoutAtomicBlock, 'remove-range')
      }
    }

    const blockAfter = content.getBlockAfter(startKey)

    if (!blockAfter || !this.isElement(blockAfter.getType())) {
      return undefined
    }

    const atomicBlockTarget = selection.merge({
      focusKey: blockAfter.getKey(),
      focusOffset: blockAfter.getLength()
    })

    const withoutAtomicBlock = Modifier.removeRange(content, atomicBlockTarget as any, 'forward')

    if (withoutAtomicBlock !== content) {
      return EditorState.push(editorState, withoutAtomicBlock, 'remove-range')
    }

    return undefined
  }

  private handleKeyCommand = (command: string) => {
    let newValue: EditorState | undefined

    switch (command) {
      case 'backspace':
      case 'backspace-word':
      case 'backspace-to-start-of-line':
        newValue = this.onBackspace()
        break

      case 'delete':
      case 'delete-word':
      case 'delete-to-end-of-block':
        newValue = this.onDelete()
        break

      case 'split-block':
        newValue = this.handleSplitBlock()
        break
    }

    if (newValue) {
      this.props.onChange(newValue)
      return 'handled'
    }

    return 'not-handled'
  }

  private handleControlClick = (control?: number | string) => {
    switch (control as Control) {
      case 'unorderedList':
        return this.toggleBlockStyle('unordered-list-item')
      case 'orderedList':
        return this.toggleBlockStyle('ordered-list-item')
      case 'underline':
        return this.toggleInlineStyleToSelection('UNDERLINE')
      case 'strikethrough':
        return this.toggleInlineStyleToSelection('STRIKETHROUGH')
      case 'italic':
        return this.toggleInlineStyleToSelection('ITALIC')
      case 'bold':
        return this.toggleInlineStyleToSelection('BOLD')
    }
  }

  private isControlActive(control: Control) {
    const currentStyle = this.props.value.getCurrentInlineStyle()
    const selection = this.props.value.getSelection()
    const blockType = this.props.value
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType()

    switch (control) {
      case 'bold':
        return currentStyle.has('BOLD')
      case 'italic':
        return currentStyle.has('ITALIC')
      case 'underline':
        return currentStyle.has('UNDERLINE')
      case 'strikethrough':
        return currentStyle.has('STRIKETHROUGH')
      case 'orderedList':
        return blockType === 'ordered-list-item'
      case 'unorderedList':
        return blockType === 'unordered-list-item'
    }

    return false
  }

  private toggleInlineStyleToSelection(style: string) {
    this.props.onChange(RichUtils.toggleInlineStyle(this.props.value, style))
  }

  private toggleBlockStyle(style: string) {
    this.props.onChange(RichUtils.toggleBlockType(this.props.value, style))
  }

  private setBlockType(type: string, data?: any) {
    let editorState = this.props.value
    let contentState = editorState.getCurrentContent()
    const selectionstate = editorState.getSelection()

    contentState = Modifier.setBlockType(contentState, selectionstate, type)
    contentState = Modifier.setBlockData(contentState, selectionstate, Immutable.Map(data || {}))

    editorState = EditorState.push(editorState, contentState, 'change-block-type')

    this.props.onChange(editorState)
  }

  private applyEntity(type: string, data?: any) {
    let editorState = this.props.value
    let contentState = editorState.getCurrentContent()
    const selectionstate = editorState.getSelection()

    contentState = contentState.createEntity(type, 'MUTABLE', data)
    const entityKey = contentState.getLastCreatedEntityKey()

    contentState = Modifier.applyEntity(contentState, selectionstate, entityKey)

    editorState = EditorState.push(editorState, contentState, 'apply-entity')

    this.props.onChange(editorState)
  }

  private removeEntity() {
    let editorState = this.props.value
    let contentState = editorState.getCurrentContent()
    const selectionstate = editorState.getSelection()

    contentState = Modifier.applyEntity(contentState, selectionstate, null as any)

    editorState = EditorState.push(editorState, contentState, 'apply-entity')

    this.props.onChange(editorState)
  }

  private handleInlineStyle = (inlineStyles: DraftInlineStyle) => {
    if (!this.props.styleGroups) return {}

    const styles = this.props.styleGroups.reduce(
      (prev, styleGroup) => {
        prev.push(...styleGroup.styles)
        return prev
      },
      [] as Style[]
    )

    const activeStyles = styles.filter(style => {
      return inlineStyles.has(style.type)
    })

    return activeStyles.reduce(
      (prev, style) => {
        return Object.assign(prev, style.style)
      },
      {} as object
    )
  }

  private handleBlockStyle = (contentBlock: ContentBlock) => {
    const block =
      this.props.blocks && this.props.blocks.find(block => block.type === contentBlock.getType())

    const element =
      this.props.elements &&
      this.props.elements.find(element => element.type === contentBlock.getType())

    if (block) return {component: CustomBlock, props: {style: block.style}}

    if (element)
      return {
        component: CustomImmutableBlock,
        editable: false,
        props: {
          style: element.style,
          content: element.content
        }
      }

    if (
      contentBlock.getType() === 'unstyled' ||
      contentBlock.getType() === 'ordered-list-item' ||
      contentBlock.getType() === 'unordered-list-item'
    ) {
      return undefined
    }

    return {
      component: CustomBlock,
      props: {
        style: {
          fontSize: '1em',
          border: `2px dotted ${Color.error.base}`,
          backgroundColor: `${Color.error.light1}`
        }
      }
    }
  }

  private selectionHasLink = () => {
    if (!this.props.links) return

    const selection = this.props.value.getSelection()
    const contentState = this.props.value.getCurrentContent()

    const entityKey = contentState
      .getBlockForKey(selection.getStartKey())
      .getEntityAt(selection.getStartOffset())

    if (!entityKey) return false

    const entity = contentState.getEntity(entityKey)
    return entity.getType() === this.props.linkEntityType
  }

  private handleLinkClick = () => {
    const selection = this.props.value.getSelection()
    const contentState = this.props.value.getCurrentContent()

    const entityKey = contentState
      .getBlockForKey(selection.getStartKey())
      .getEntityAt(selection.getStartOffset())

    let data: any

    if (entityKey) {
      const entity = contentState.getEntity(entityKey)
      data = entity.getData()
    }

    this.props.onOpenLinkEditor(
      data,
      data => {
        this.applyEntity(this.props.linkEntityType, data)
        this.editorRef.focus()
      },
      () => {
        this.editorRef.focus()
      }
    )
  }

  private handleRemoveLinkClick = () => {
    this.removeEntity()
  }

  private buttonForControl(control: Control) {
    return (
      <Button
        key={control}
        selected={this.isControlActive(control)}
        type={ButtonType.Icon}
        data={control}
        icon={iconForControl(control)}
        onMouseDown={this.handleControlClick}
      />
    )
  }

  private handleLinkEntities = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => {
    if (!this.props.links) return

    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity()
      if (!entityKey) return false

      const entity = contentState.getEntity(entityKey)
      return entity.getType() === this.props.linkEntityType
    }, callback)
  }

  private handleUnknownEntities = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void
  ) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity()
      return Boolean(entityKey)
    }, callback)
  }

  private activeStyles() {
    return this.props.value.getCurrentInlineStyle()
  }

  private handleBlockChange = (newBlock: string | undefined) => {
    if (!this.props.blocks) return
    if (!newBlock) return this.setBlockType('unstyled')

    const blockSpec = this.props.blocks.find(block => block.type === newBlock)!
    const content = this.props.value.getCurrentContent()
    const selection = this.props.value.getSelection()

    const startKey = selection.getStartKey()
    const block = content.getBlockForKey(startKey)

    if (!blockSpec) return

    if (blockSpec.dataKey) {
      const data = block.getData().toJS()[blockSpec.dataKey]
      this.props.onOpenBlockEditor(
        blockSpec.dataKey,
        data,
        data => {
          this.setBlockType(blockSpec.type, {[blockSpec.dataKey!]: data})
          this.editorRef.focus()
        },
        () => {
          this.editorRef.focus()
        }
      )
    } else {
      this.setBlockType(blockSpec.type)
      setTimeout(() => this.editorRef.focus(), 0)
    }
  }

  private handleBlockEdit = () => {
    if (!this.props.blocks) return

    const content = this.props.value.getCurrentContent()
    const selection = this.props.value.getSelection()

    const startKey = selection.getStartKey()
    const block = content.getBlockForKey(startKey)
    const blockSpec = this.props.blocks.find(blockSpec => blockSpec.type === block.getType())!

    if (!blockSpec || !blockSpec.dataKey) return

    const data = block.getData().toJS()[blockSpec.dataKey]

    this.props.onOpenBlockEditor(
      blockSpec.dataKey,
      data,
      data => {
        this.setBlockType(blockSpec.type, {[blockSpec.dataKey!]: data})
        this.editorRef.focus()
      },
      () => {
        this.editorRef.focus()
      }
    )
  }

  private handleInsertElement = (type?: string | number) => {
    if (!this.props.elements) return
    const element = this.props.elements.find(element => element.type === type)!

    if (!element.dataKey) return this.insertImmutableBlock(element.type)
    return this.props.onOpenBlockEditor(
      element.dataKey,
      undefined,
      data => {
        this.insertImmutableBlock(element.type, {[element.dataKey!]: data})
        this.editorRef.focus()
      },
      () => {
        this.editorRef.focus()
      }
    )
  }

  private handleStyleChange = (newStyle: string | undefined, group?: string | number) => {
    if (!this.props.styleGroups) return

    const editorState = this.props.value
    const selection = editorState.getSelection()
    const styleGroup = this.props.styleGroups.find(styleGroup => styleGroup.name === group)!

    if (selection.isCollapsed()) {
      let currentOverrideStyle =
        editorState.getInlineStyleOverride() || Immutable.OrderedSet<string>()

      currentOverrideStyle = currentOverrideStyle.filter(
        activeStyle => !styleGroup.styles.some(style => activeStyle === style.type)
      ) as Immutable.OrderedSet<string>

      if (newStyle) currentOverrideStyle = currentOverrideStyle.add(newStyle)

      this.editorRef.focus()

      setTimeout(() => {
        this.props.onChange(
          EditorState.setInlineStyleOverride(this.props.value, currentOverrideStyle)
        )
      }, 0)

      return
    }

    const content = editorState.getCurrentContent()
    let newContent: ContentState = content

    if (styleGroup) {
      styleGroup.styles.forEach(style => {
        newContent = Modifier.removeInlineStyle(newContent, selection, style.type)
      })
    }

    if (newStyle) {
      newContent = Modifier.applyInlineStyle(newContent, selection, newStyle)
    }

    this.props.onChange(EditorState.push(editorState, newContent, 'change-inline-style'))

    setTimeout(() => this.editorRef.focus(), 0)
  }

  public render() {
    let blockRenderMap = DefaultBlockRenderMap
    const {controls} = this.props

    let basicControls: React.ReactNode
    const buttons: React.ReactNode[] = []

    if (controls) {
      if (controls.has('bold')) buttons.push(this.buttonForControl('bold'))
      if (controls.has('italic')) buttons.push(this.buttonForControl('italic'))
      if (controls.has('underline')) buttons.push(this.buttonForControl('underline'))
      if (controls.has('strikethrough')) buttons.push(this.buttonForControl('strikethrough'))

      if (controls.has('unorderedList') || controls.has('orderedList')) {
        if (buttons.length > 0) buttons.push(<ControlSeparator key="separatorList" />)

        if (controls.has('unorderedList')) buttons.push(this.buttonForControl('unorderedList'))
        if (controls.has('orderedList')) buttons.push(this.buttonForControl('orderedList'))
      }
    }

    if (this.props.elements) {
      const map = reduceToMap(this.props.elements, element => [element.type, {element: 'div'}])
      blockRenderMap = blockRenderMap.merge(map)

      if (buttons.length > 0) buttons.push(<ControlSeparator key="separatorElements" />)

      this.props.elements.forEach(element => {
        buttons.push(
          <Button
            key={element.type}
            type={ButtonType.Light}
            label={element.icon && !element.label ? element.type : element.label}
            data={element.type}
            onMouseDown={this.handleInsertElement}
          />
        )
      })
    }

    if (this.props.styleGroups) {
      const activeStyles = this.activeStyles()

      this.props.styleGroups.forEach(styleGroup => {
        const options = styleGroup.styles.map(style => ({
          key: style.type,
          label: style.label || style.type
        }))

        const activeStyle = styleGroup.styles.find(style => activeStyles.has(style.type))

        if (buttons.length > 0)
          buttons.push(<ControlSeparator key={`separator_${styleGroup.name}`} />)

        buttons.push(
          <FlexList key={styleGroup.name}>
            {styleGroup.label && <label>{styleGroup.label}</label>}
            <FlexItem>
              <Select
                type={SelectType.Transparent}
                options={options}
                id={styleGroup.name}
                unselectedLabel={'----'}
                onChange={this.handleStyleChange}
                value={activeStyle && activeStyle.type}
              />
            </FlexItem>
          </FlexList>
        )
      })
    }

    if (this.props.blocks) {
      const map = reduceToMap(this.props.blocks, block => [block.type, {element: 'div'}])
      blockRenderMap = blockRenderMap.merge(map)

      const options = this.props.blocks.map(block => ({
        key: block.type,
        label: block.label || block.type
      }))

      const content = this.props.value.getCurrentContent()
      const selection = this.props.value.getSelection()

      const startKey = selection.getStartKey()
      const block = content.getBlockForKey(startKey)
      const data = block.getData()

      if (buttons.length > 0) buttons.push(<ControlSeparator key="separatorBlocks" />)

      buttons.push(
        <FlexList key="blockType">
          <label>Format</label>
          <FlexItem>
            <Select
              type={SelectType.Transparent}
              options={options}
              unselectedLabel={'----'}
              onChange={this.handleBlockChange}
              value={block.getType()}
            />
          </FlexItem>
          <Button
            type={ButtonType.Icon}
            icon={IconName.Edit}
            disabled={data.count() === 0}
            onMouseDown={this.handleBlockEdit}
          />
        </FlexList>
      )
    }

    if (this.props.links) {
      if (buttons.length > 0) buttons.push(<ControlSeparator key="separatorLinks" />)

      buttons.push(
        <Button
          key="insertLink"
          selected={this.selectionHasLink()}
          type={ButtonType.Icon}
          icon={IconName.InsertLink}
          onMouseDown={this.handleLinkClick}
        />
      )

      buttons.push(
        <Button
          key="removeLink"
          type={ButtonType.Icon}
          icon={IconName.RemoveLink}
          onMouseDown={this.handleRemoveLinkClick}
        />
      )
    }

    if (buttons.length > 0) {
      basicControls = <FlexList>{buttons}</FlexList>
    }

    const editorState = EditorState.set(this.props.value, {
      decorator: new CompositeDecorator([
        {
          strategy: this.handleLinkEntities as any, // Draft.js typings are not up to date
          component: LinkEntityRenderer,
          props: {controls: this.props.controls}
        },
        {
          strategy: this.handleUnknownEntities as any, // Draft.js typings are not up to date
          component: UnknownEntityRenderer,
          props: {controls: this.props.controls}
        }
      ])
    })

    return (
      <div className={RichTextInputStyle} data-focused={boolAttr(this.state.isFocused)}>
        <FlexList direction="column" alignItems="start" spacing="medium">
          {basicControls}
          <div className={`${RichTextInputStyle}_content`}>
            <Editor
              ref={editor => (this.editorRef = editor!)}
              blockRenderMap={blockRenderMap}
              blockRendererFn={this.handleBlockStyle}
              customStyleFn={this.handleInlineStyle}
              handleKeyCommand={this.handleKeyCommand}
              handleBeforeInput={this.handleBeforeInput}
              handlePastedText={this.handlePastedText}
              editorState={editorState}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              stripPastedStyles
            />
          </div>
          {/* <div>
            <pre>{JSON.stringify(convertToRaw(this.props.value.getCurrentContent()), undefined, 2)}</pre>
          </div> */}
        </FlexList>
      </div>
    )
  }
}
