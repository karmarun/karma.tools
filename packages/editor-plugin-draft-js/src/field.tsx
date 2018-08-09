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
  CardSection,
  FieldValue,
  CreateFieldFunction
} from '@karma.run/editor-client'

import {RichTextInput, Control, LinkType, BlockType, StyleGroup, CustomElement} from './input'

export class DraftJSFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<DraftJSField, DraftJSFieldValue>
> {
  private handleValueChange = (value: EditorState) => {
    this.props.onValueChange(
      {
        value: value,
        isValid: true,
        hasChanges: value.getCurrentContent() !== this.props.value.value.getCurrentContent()
      },
      this.props.changeKey
    )
  }

  private handleOpenBlockEditor = (
    key: string,
    data: any,
    done: (data: any) => void,
    cancel: () => void
  ) => {
    console.log(key, data, done, cancel)
    // const newData = await this.props.onEditField({}, data ? data.get(dataKey) : undefined)
  }

  private handleOpenLinkEditor = (data: any, done: (data: any) => void, cancel: () => void) => {
    console.log(data, done, cancel)
    // const newData = await this.props.onEditField(
    //   this.props.field.dataFields[dataKey],
    //   data ? data.get(dataKey) : undefined
    // )
  }

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
          value={this.props.value.value}
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

export type DraftJSFieldValue = FieldValue<EditorState, string[]>

export class DraftJSField implements Field<DraftJSFieldValue> {
  public readonly label?: string
  public readonly description?: string

  public readonly minLength?: number
  public readonly maxLength?: number

  public readonly defaultValue: DraftJSFieldValue = {
    value: EditorState.createEmpty(),
    isValid: true,
    hasChanges: false
  }

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
    return <CardSection>{props.value.value.getCurrentContent().getPlainText()}</CardSection>
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

  public transformRawValue(value: any): DraftJSFieldValue {
    return {
      value: EditorState.createWithContent(convertFromRaw(value)),
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(_value: DraftJSFieldValue) {
    return e.null()
  }

  public isValidValue(value: DraftJSFieldValue) {
    const errors: string[] = []
    const plainText = value.value.getCurrentContent().getPlainText()

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

  public valuesForKeyPath(value: DraftJSFieldValue) {
    return [value]
  }

  public static type = 'richText'

  static canInferFromModel(model: Model) {
    if (model.type === 'annotation' && model.value === 'field:richText') {
      return true
    }

    if (
      model.type === 'recursion' &&
      model.model.type === 'struct' &&
      model.model.fields['type'] &&
      model.model.fields['object'] &&
      model.model.fields['nodes'] &&
      model.model.fields['isVoid'] &&
      model.model.fields['text'] &&
      model.model.fields['nodes'] &&
      model.model.fields['data']
    ) {
      return true
    }

    return false
  }

  static create(
    model: Model,
    opts: DraftJSFieldOptions | undefined,
    _createField: CreateFieldFunction
  ) {
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
