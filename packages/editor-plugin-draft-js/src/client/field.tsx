import React from 'react'
import {EditorState, convertFromRaw, convertToRaw, RawDraftContentState} from 'draft-js'
import {data as d, DataExpression} from '@karma.run/sdk'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions,
  ObjectMap,
  mapObject,
  firstKeyOptional
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
  CreateFieldFunction,
  AnyField,
  UnionField,
  UnionFieldChildTuple
} from '@karma.run/editor-client'

import {RichTextInput, Control, LinkType, BlockType, StyleGroup, CustomElement} from './input'
import {AnyFieldValue} from '@karma.run/editor-client/src/api/field'

export class DraftJSFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<DraftJSField, DraftJSFieldValue>
> {
  private handleValueChange = (value: EditorState) => {
    this.props.onValueChange(
      {
        value: value,
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  private handleOpenBlockEditor = async (key: string, data: any) => {
    return this.props.onEditField(this.props.field.dataFields[key], data)
  }

  private handleOpenLinkEditor = async (data?: AnyFieldValue) => {
    return this.props.onEditField(this.props.field.linkField, data)
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

  readonly controls?: Control[]
  readonly links?: LinkType[]
  readonly styleGroups?: StyleGroup[]
  readonly blocks?: BlockType[]
  readonly elements?: CustomElement[]
  readonly linkEntityType?: string

  readonly dataFields?: ObjectMap<TypedFieldOptions>
}

export interface DraftJSFieldConstructorOptions {
  readonly label?: string
  readonly description?: string

  readonly minLength?: number
  readonly maxLength?: number

  readonly controls?: Set<Control>
  readonly links?: LinkType[]
  readonly styleGroups?: StyleGroup[]
  readonly blocks?: BlockType[]
  readonly elements?: CustomElement[]
  readonly linkEntityType?: string

  readonly dataFields: ObjectMap<AnyField>
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

  public readonly controls?: Set<Control>
  public readonly links?: LinkType[]
  public readonly blocks?: BlockType[]
  public readonly styleGroups?: StyleGroup[]
  public readonly elements?: CustomElement[]

  public readonly linkEntityType: string
  public readonly dataFields: ObjectMap<AnyField>
  public readonly linkField: UnionField

  public constructor(opts: DraftJSFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description

    this.minLength = opts.minLength
    this.maxLength = opts.maxLength

    this.controls = opts.controls
    this.links = opts.links
    this.styleGroups = opts.styleGroups
    this.blocks = opts.blocks
    this.elements = opts.elements
    this.linkEntityType = opts.linkEntityType || 'LINK'

    this.dataFields = opts.dataFields
    this.linkField = new UnionField({
      fields: opts.links
        ? opts.links.map(
            link =>
              [link.dataKey, link.label, this.dataFields[link.dataKey]] as UnionFieldChildTuple
          )
        : []
    })

    this.linkField.initialize(new Map())
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

  public transformRawValue(value: RawDraftContentState): DraftJSFieldValue {
    const transformedValue: RawDraftContentState = {
      blocks: value.blocks.map(block => {
        const dataKey = block.data ? firstKeyOptional(block.data) : undefined
        const data = dataKey ? (block.data as any)[dataKey] : undefined
        const dataField = dataKey ? this.dataFields[dataKey] : undefined

        return {
          ...block,
          data: dataField ? {[dataKey!]: dataField.transformRawValue(data)} : undefined
        }
      }),
      entityMap: mapObject(value.entityMap, entity => ({
        ...entity,
        data: this.linkField.transformRawValue(entity.data)
      }))
    }

    return {
      value: EditorState.createWithContent(convertFromRaw(transformedValue)),
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(value: DraftJSFieldValue): DataExpression {
    const rawData = convertToRaw(value.value.getCurrentContent())

    return d.struct({
      blocks: d.list(
        ...rawData.blocks.map(block => {
          const dataKey = block.data ? firstKeyOptional(block.data) : undefined
          const data = dataKey ? (block.data as any)[dataKey] : undefined

          const dataField = dataKey ? this.dataFields[dataKey] : undefined
          const dataUnionValue = dataField
            ? d.union(dataKey!, dataField.transformValueToExpression(data))
            : undefined

          return d.struct({
            data: dataUnionValue || d.null(),

            type: d.string(block.type),
            text: d.string(block.text),
            key: d.string(block.key),
            depth: d.int32(block.depth),

            entityRanges: d.list(
              ...block.entityRanges.map(entityRange =>
                d.struct({
                  offset: d.int32(entityRange.offset),
                  length: d.int32(entityRange.length),
                  key: d.int32(entityRange.key)
                })
              )
            ),

            inlineStyleRanges: d.list(
              ...block.inlineStyleRanges.map(styleRange =>
                d.struct({
                  offset: d.int32(styleRange.offset),
                  length: d.int32(styleRange.length),
                  style: d.string(styleRange.style)
                })
              )
            )
          })
        })
      ),

      entityMap: d.map(
        mapObject(rawData.entityMap, entity =>
          d.struct({
            type: d.string(entity.type),
            mutability: d.string(entity.mutability),
            data: this.linkField.transformValueToExpression(entity.data as any)
          })
        )
      )
    })
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

    return false
  }

  static create(
    model: Model,
    opts: DraftJSFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type === 'annotation') {
      model = model.model
    }

    if (model.type !== 'recursive') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "recursive" received: "${model.type}"`
      })
    }

    const dataRecursion = model.models.data

    if (!dataRecursion) {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: 'Expected recursion with key "data"'
      })
    }

    if (dataRecursion.type !== 'optional') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "optional" received: "${model.type}"`
      })
    }

    const unionModel = dataRecursion.model

    if (unionModel.type !== 'union') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "union" received: "${model.type}"`
      })
    }

    return new this({
      ...opts,
      controls: opts ? new Set(opts.controls) : undefined,
      dataFields: mapObject(unionModel.fields, (field, key) =>
        createField(field, opts && opts.dataFields && opts.dataFields[key])
      )
    })
  }
}
