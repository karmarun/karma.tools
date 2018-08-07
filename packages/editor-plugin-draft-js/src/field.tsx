import React from 'react'
import {EditorState, convertFromRaw} from 'draft-js'
import {expression as e} from '@karma.run/sdk'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {
  ErrorField,
  EditComponentRenderProps,
  EditRenderProps,
  Field,
  ListRenderProps,
  FieldComponent,
  FieldLabel,
  CardSection
} from '@karma.run/editor-client'

import {RichTextInput, Control, LinkType, BlockType, StyleGroup, CustomElement} from './input'

export class DraftJSFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<DraftJSField, DraftJSFieldValue>
> {
  private handleValueChange = (value: any) => {
    this.props.onValueChange(value, this.props.changeKey)
  }

  private handleOpenBlockEditor = () => {}
  private handleOpenLinkEditor = () => {}

  public render() {
    return (
      <FieldComponent depth={this.props.depth} index={this.props.index}>
        {!this.props.isWrapped && (
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index}
          />
        )}
        <RichTextInput
          value={this.props.value}
          onOpenBlockEditor={this.handleOpenBlockEditor}
          onOpenLinkEditor={this.handleOpenLinkEditor}
          onChange={this.handleValueChange}
          controls={this.props.field.controls}
          links={this.props.field.links}
          styleGroups={this.props.field.styleGroups}
          blocks={this.props.field.blocks}
          elements={this.props.field.elements}
          linkEntityType={this.props.field.linkEntityType}
          maxLength={this.props.field.maxLength}
        />
      </FieldComponent>
    )
  }
}

export interface DraftJSFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly minLength?: number
  readonly maxLength?: number
}

export type DraftJSFieldValue = EditorState

export class DraftJSField implements Field<DraftJSFieldValue> {
  public readonly label?: string
  public readonly description?: string

  public readonly minLength?: number
  public readonly maxLength?: number

  public readonly defaultValue: DraftJSFieldValue = EditorState.createEmpty()
  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public readonly controls: Set<Control> = new Set()
  public readonly links: LinkType[] = []
  public readonly blocks: BlockType[] = []
  public readonly styleGroups: StyleGroup[] = []
  public readonly elements: CustomElement[] = []
  public readonly linkEntityType: string = 'LINK'

  public constructor(opts?: DraftJSFieldOptions) {
    this.label = opts && opts.label
    this.description = opts && opts.description
    this.minLength = opts && opts.minLength
    this.maxLength = opts && opts.maxLength
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<DraftJSFieldValue>) {
    return <CardSection>{props.value.getCurrentContent().getPlainText()}</CardSection>
  }

  public renderEditComponent(props: EditRenderProps<DraftJSFieldValue>) {
    return (
      <DraftJSFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any) {
    return EditorState.createWithContent(convertFromRaw(value))
  }

  public transformValueToExpression(_value: DraftJSFieldValue) {
    return e.null()
  }

  public isValidValue(value: DraftJSFieldValue) {
    const errors: string[] = []
    const plainText = value.getCurrentContent().getPlainText()

    if (this.maxLength && plainText.length > this.maxLength) errors.push('stringToLongError')
    if (this.minLength && plainText.length < this.minLength) errors.push('stringToShortError')

    return errors
  }

  public fieldOptions(): DraftJSFieldOptions & TypedFieldOptions {
    return {
      type: DraftJSField.type,
      label: this.label,
      description: this.description,
      minLength: this.minLength,
      maxLength: this.maxLength
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public static type = 'richText'

  static canInferFromModel(model: Model) {
    if (model.type === 'annotation' && model.value === 'field:richText') {
      return true
    }

    return false
  }

  static create(model: Model, opts?: DraftJSFieldOptions) {
    if (model.type === 'annotation') {
      model = model.model
    }

    if (model.type !== 'struct') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "struct" received: "${model.type}"`
      })
    }

    return new this(opts)
  }
}
