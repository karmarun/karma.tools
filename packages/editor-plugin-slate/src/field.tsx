import React from 'react'
import Slate from 'slate'
import {style} from 'typestyle'
import memoizeOne from 'memoize-one'

import {Editor as SlateEditor, RenderMarkProps, RenderNodeProps} from 'slate-react'
import plainTextSerializer from 'slate-plain-serializer'

import {DataContext as dat, DataConstructor} from '@karma.run/sdk/expression'

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
  DefaultBorderRadiusPx,
  Color,
  Spacing,
  boolAttr,
  FlexList,
  CreateFieldFunction,
  FieldValue,
  AnyField,
  AnyFieldConstructor
} from '@karma.run/editor-client'

import {SlateControl, SlateData} from './controls'

export interface SlateFieldEditComponentState {
  hasFocus: boolean
}

export class SlateFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<SlateField, SlateFieldValue>,
  SlateFieldEditComponentState
> {
  public state: SlateFieldEditComponentState = {
    hasFocus: false
  }

  public editorRef = React.createRef<SlateEditor>()

  private handleChange = (change: {value: Slate.Value}) => {
    this.props.onValueChange(
      {
        value: change.value,
        isValid: true,
        hasChanges: this.props.value.value.document !== change.value.document
      },
      this.props.changeKey
    )
  }

  private handleWrapperPointerDown = () => {
    this.setState({hasFocus: true})

    setTimeout(() => {
      this.editorRef.current!.focus()
    })
  }

  private handleEditorFocus = () => {
    this.setState({hasFocus: true})
  }

  private handleEditorBlur = () => {
    this.setState({hasFocus: false})
  }

  private handleControlValueChange = (changeFn: (change: Slate.Editor) => Slate.Editor) => {
    changeFn(this.editorRef.current!.controller)
  }

  private handleControlEditData = async (dataKey: string, data?: SlateData) => {
    const newData = await this.props.onEditField(
      this.props.field.dataFields[dataKey],
      data ? data.get(dataKey) : undefined
    )

    return newData ? {[dataKey]: newData} : undefined
  }

  private handleRenderMark = (props: RenderMarkProps): React.ReactNode => {
    for (const [, control] of this.props.field.controlsMap) {
      if (control.renderMark) {
        const element = control.renderMark(props)
        if (!element) continue
        return element
      }
    }

    return undefined
  }

  private handleRenderNode = (props: RenderNodeProps) => {
    for (const [, control] of this.props.field.controlsMap) {
      if (control.renderNode) {
        const element = control.renderNode({
          ...props,
          onEditData: this.handleControlEditData,
          onValueChange: this.handleControlValueChange
        })

        if (!element) continue
        return element
      }
    }

    return undefined
  }

  private controlGroups = memoizeOne(
    (controlKeys: string[][], controlsMap: ReadonlyMap<string, SlateControl>) => {
      return controlKeys.map(keys =>
        keys
          .filter(key => controlsMap.has(key))
          .map(key => [key, controlsMap.get(key)] as [string, SlateControl])
      )
    }
  )

  private renderToolbar = () => {
    if (!this.props.field.controlKeys.length) return null

    return (
      <div
        className="toolbar"
        data-has-focus={boolAttr(this.state.hasFocus)}
        onPointerDown={this.handleWrapperPointerDown}>
        {this.renderControls()}
      </div>
    )
  }

  private renderControls = () => {
    const controlGroups = this.controlGroups(
      this.props.field.controlKeys,
      this.props.field.controlsMap
    )

    return (
      <FlexList spacing="large">
        {controlGroups.map(
          controls =>
            controls.length !== 0 && (
              <FlexList key={controls.map(([key]) => key).join('.')}>
                {controls.map(([key, control]) => (
                  <React.Fragment key={key}>
                    {control.renderControl({
                      disabled: !this.state.hasFocus,
                      value: this.props.value.value,
                      onEditData: this.handleControlEditData,
                      onValueChange: this.handleControlValueChange
                    })}
                  </React.Fragment>
                ))}
              </FlexList>
            )
        )}
      </FlexList>
    )
  }

  public render() {
    return (
      <FieldComponent
        className={SlateFieldEditComponentStyle}
        depth={this.props.depth}
        index={this.props.index}>
        {!this.props.isWrapped && (
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index}
          />
        )}
        <div
          className="inputWrapper"
          onFocus={this.handleEditorFocus}
          onBlur={this.handleEditorBlur}>
          {this.renderToolbar()}

          <SlateEditor
            ref={this.editorRef}
            className="editor"
            value={this.props.value.value}
            renderMark={this.handleRenderMark}
            renderNode={this.handleRenderNode}
            onChange={this.handleChange}
            schema={this.props.field.schema as any}
          />
        </div>
      </FieldComponent>
    )
  }
}

export const SlateFieldEditComponentStyle = style({
  $nest: {
    '> .inputWrapper': {
      fontSize: '1em',
      lineHeight: 1.2,
      position: 'relative',

      border: `1px solid ${Color.neutral.light1}`,
      backgroundColor: Color.neutral.white,
      borderRadius: DefaultBorderRadiusPx,

      $nest: {
        '> .toolbar': {
          position: 'sticky',
          top: '5rem',

          padding: Spacing.small,
          backgroundColor: Color.neutral.light2
        },

        '> .editor': {
          overflowY: 'auto',
          padding: Spacing.medium,
          $nest: {
            '&:not(:first-child)': {
              borderTop: `1px solid ${Color.neutral.light1}`
            }
          }
        }
      }
    }
  }
})

export interface SlateFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly minLength?: number
  readonly maxLength?: number
  readonly controlKeys?: string[][]
  readonly schemaKey?: string
  readonly dataFields?: ObjectMap<TypedFieldOptions>
}

export interface SlateFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly minLength?: number
  readonly maxLength?: number

  readonly schema?: Slate.SchemaProperties
  readonly defaultValue?: Slate.Value

  readonly controlKeys: string[][]

  readonly controlMap: ReadonlyMap<string, SlateControl>
  readonly dataFields: ObjectMap<AnyField>
}

export type SlateFieldValue = FieldValue<Slate.Value, string>

export const blankDefaultValue = Slate.Value.create({
  document: Slate.Document.create([Slate.Block.create('')])
})

export class SlateField implements Field<SlateFieldValue> {
  public readonly label?: string
  public readonly description?: string

  public readonly minLength?: number
  public readonly maxLength?: number

  public readonly schema?: Slate.SchemaProperties
  public readonly controlKeys: string[][]
  public readonly controlsMap: ReadonlyMap<string, SlateControl>
  public readonly dataFields: ObjectMap<AnyField>

  public readonly defaultValue: SlateFieldValue

  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(opts: SlateFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.minLength = opts.minLength
    this.maxLength = opts.maxLength

    this.controlKeys = opts.controlKeys
    this.controlsMap = opts.controlMap
    this.dataFields = opts.dataFields

    this.schema = opts.schema

    this.defaultValue = {
      value: opts.defaultValue || blankDefaultValue,
      isValid: true,
      hasChanges: false
    }
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<SlateFieldValue>) {
    const plainText = plainTextSerializer.serialize(props.value.value)

    if (plainText.length > 140) {
      return (
        <CardSection>
          {plainText.slice(0, 140).trim()}
          ...
        </CardSection>
      )
    } else {
      return <CardSection>{plainText}</CardSection>
    }
  }

  public renderEditComponent(props: EditRenderProps<SlateFieldValue>) {
    return (
      <SlateFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any): SlateFieldValue {
    const recurse = (node: Slate.NodeJSON): any => {
      switch (node.object) {
        case 'document':
          return {
            ...node,
            nodes: node.nodes ? node.nodes.map(node => recurse(node)) : undefined
          }

        case 'inline': {
          const dataKey = node.data ? firstKeyOptional(node.data) : undefined
          const dataField = dataKey ? this.dataFields[dataKey] : undefined
          const data = dataField ? dataField.transformRawValue(node.data![dataKey!]) : undefined

          return {
            ...node,
            data: data ? {[dataKey!]: data} : node.data,
            nodes: node.nodes ? node.nodes.map(node => recurse(node)) : undefined
          }
        }

        case 'block': {
          const dataKey = node.data ? firstKeyOptional(node.data) : undefined
          const dataField = dataKey ? this.dataFields[dataKey] : undefined
          const data = dataField ? dataField.transformRawValue(node.data![dataKey!]) : undefined

          return {
            ...node,
            data: data ? {[dataKey!]: data} : node.data,
            nodes: node.nodes ? node.nodes.map(node => recurse(node)) : undefined
          }
        }

        default:
          return node
      }
    }

    return {
      value: Slate.Value.create({
        document: Slate.Document.fromJSON(recurse(value))
      }),
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(value: SlateFieldValue) {
    const documentJSON: Slate.DocumentJSON = value.value.document.toJSON()

    const recurse = (node: Slate.NodeJSON): DataConstructor => {
      switch (node.object) {
        case 'document':
          return dat.struct({
            object: dat.string('document'),
            nodes: node.nodes ? dat.list(node.nodes.map(node => recurse(node))) : dat.null()
          })

        case 'inline': {
          const dataKey = node.data ? firstKeyOptional(node.data) : undefined
          const dataField = dataKey ? this.dataFields[dataKey] : undefined

          const data = dataField
            ? dat.union(dataKey!, dataField.transformValueToExpression(node.data![dataKey!]))
            : dat.null()

          return dat.struct({
            object: dat.string(node.object),
            type: dat.string(node.type),
            data: data,
            nodes: node.nodes ? dat.list(node.nodes.map(node => recurse(node))) : dat.null()
          })
        }

        case 'block': {
          const dataKey = node.data ? firstKeyOptional(node.data) : undefined
          const dataField = dataKey ? this.dataFields[dataKey] : undefined

          const data = dataField
            ? dat.union(dataKey!, dataField.transformValueToExpression(node.data![dataKey!]))
            : dat.null()

          return dat.struct({
            object: dat.string(node.object),
            type: dat.string(node.type),
            data: data,
            nodes: node.nodes ? dat.list(node.nodes.map(node => recurse(node))) : dat.null()
          })
        }

        case 'text':
          return dat.struct({
            object: dat.string('text'),
            leaves: node.leaves
              ? dat.list(
                  node.leaves.map(leave =>
                    dat.struct({
                      object: dat.string('leaf'),
                      text: leave.text ? dat.string(leave.text) : dat.null(),
                      marks: leave.marks
                        ? dat.list(
                            leave.marks.map(mark =>
                              dat.struct({
                                object: dat.string('mark'),
                                type: dat.string(mark.type)
                              })
                            )
                          )
                        : dat.null()
                    })
                  )
                )
              : dat.null()
          })

        default:
          return dat.null()
      }
    }

    return recurse(documentJSON)
  }

  public isValidValue(value: SlateFieldValue) {
    const errors: string[] = []
    const plainText = plainTextSerializer.serialize(value.value)

    if (this.maxLength && plainText.length > this.maxLength) errors.push('stringToLongError')
    if (this.minLength && plainText.length < this.minLength) errors.push('stringToShortError')

    return errors
  }

  public fieldOptions(): SlateFieldOptions & TypedFieldOptions {
    return {
      type: SlateFieldType,
      label: this.label,
      description: this.description,
      minLength: this.minLength,
      maxLength: this.maxLength,
      controlKeys: this.controlKeys,
      dataFields: mapObject(this.dataFields, field => field.fieldOptions())
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath(value: SlateFieldValue) {
    return [value]
  }
}

export const SlateFieldType = 'richText'

export type SchemaDefaultValueTuple = [Slate.SchemaProperties, Slate.ValueJSON]

export const SlateFieldConstructor = (
  controlMap: ReadonlyMap<string, SlateControl>,
  schemaMap: ReadonlyMap<string, SchemaDefaultValueTuple>
) => {
  return {
    type: SlateFieldType,

    canInferFromModel(model: Model) {
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
    },

    create(model: Model, opts: SlateFieldOptions | undefined, createField: CreateFieldFunction) {
      if (model.type === 'annotation') {
        model = model.model
      }

      if (model.type !== 'recursion') {
        return new ErrorField({
          label: opts && opts.label,
          description: opts && opts.description,
          message: `Expected model type "recursion" received: "${model.type}"`
        })
      }

      if (model.model.type !== 'struct') {
        return new ErrorField({
          label: opts && opts.label,
          description: opts && opts.description,
          message: `Expected model type "struct" received: "${model.type}"`
        })
      }

      const dataModel = model.model.fields['data']

      if (dataModel.type !== 'optional') {
        return new ErrorField({
          label: opts && opts.label,
          description: opts && opts.description,
          message: `Expected model type "optional" received: "${model.type}"`
        })
      }

      const unionModel = dataModel.model

      if (unionModel.type !== 'union') {
        return new ErrorField({
          label: opts && opts.label,
          description: opts && opts.description,
          message: `Expected model type "union" received: "${model.type}"`
        })
      }

      let schemaTuple: SchemaDefaultValueTuple | undefined

      if (opts && opts.schemaKey) {
        schemaTuple = schemaMap.get(opts.schemaKey)

        if (!schemaTuple) {
          return new ErrorField({
            label: opts && opts.label,
            description: opts && opts.description,
            message: `Coulnd't find schema for key: "${opts.schemaKey}"`
          })
        }
      }

      return new SlateField({
        label: opts && opts.label,
        description: opts && opts.description,
        minLength: opts && opts.minLength,
        maxLength: opts && opts.maxLength,
        controlKeys: (opts && opts.controlKeys) || [],
        dataFields: mapObject(unionModel.fields, (field, key) =>
          createField(field, opts && opts.dataFields && opts.dataFields[key])
        ),
        controlMap: controlMap,
        schema: schemaTuple && schemaTuple[0],
        defaultValue: schemaTuple && Slate.Value.fromJSON(schemaTuple[1])
      })
    }
  } as AnyFieldConstructor
}
