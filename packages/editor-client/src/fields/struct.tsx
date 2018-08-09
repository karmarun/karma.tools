import React from 'react'
import {style} from 'typestyle'
import {data as d} from '@karma.run/sdk'

import {
  convertKeyToLabel,
  KeyPath,
  Model,
  reduceToMap,
  mapObjectAsync,
  ValuePath,
  StructPathSegment,
  SortConfiguration,
  FilterConfiguration,
  FieldOptions,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {
  EditComponentRenderProps,
  Field,
  EditRenderProps,
  CreateFieldFunction,
  SaveContext,
  DeleteContext,
  AnyField,
  FieldValue,
  AnyFieldValue
} from '../api/field'

import {ErrorField} from './error'
import {FieldWrapper, FieldComponent, FieldLabel, FieldInset} from '../ui/field'
import {TabList} from '../ui/tabList'

export type StructFieldChildTuple = [string, AnyField]
export type StructFieldOptionsTuple = [string, TypedFieldOptions]

export class LinearStructFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<StructField, StructFieldValue>
> {
  private handleValueChange = (value: AnyFieldValue, key: string | undefined) => {
    if (key == undefined) {
      throw new Error('Child field did not call onValueChange with changeKey!')
    }

    this.props.onValueChange(
      {
        value: {...this.props.value.value, [key]: value},
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  public render() {
    if (this.props.field.fields.length === 0) return null

    const fields = this.props.field.fields.map(([key, field], index) => (
      <React.Fragment key={key}>
        {field.renderEditComponent({
          index: index,
          depth: this.props.isWrapped ? this.props.depth : this.props.depth + 1,
          isWrapped: false,
          disabled: this.props.disabled,
          value: this.props.value.value[key],
          onValueChange: this.handleValueChange,
          onEditRecord: this.props.onEditRecord,
          onSelectRecord: this.props.onSelectRecord,
          onEditField: this.props.onEditField,
          changeKey: key
        })}
      </React.Fragment>
    ))

    if (this.props.isWrapped) {
      return fields
    } else {
      return (
        <FieldWrapper depth={this.props.depth} index={this.props.index}>
          <FieldComponent depth={this.props.depth} index={this.props.index}>
            <FieldLabel
              label={this.props.label}
              description={this.props.description}
              depth={this.props.depth}
              index={this.props.index}
            />
          </FieldComponent>
          <FieldInset>{fields}</FieldInset>
        </FieldWrapper>
      )
    }
  }
}

export interface TabbedStructFieldEditComponentState {
  selectedTabIndex: number
}

export class TabbedStructFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<StructField, StructFieldValue>,
  TabbedStructFieldEditComponentState
> {
  public constructor(props: EditComponentRenderProps<StructField, StructFieldValue>) {
    super(props)
    this.state = {selectedTabIndex: 0}
  }

  private handleValueChange = (value: any, key: string | undefined) => {
    if (key == undefined) {
      throw new Error('Child field did not call onValueChange with changeKey!')
    }

    this.props.onValueChange({...this.props.value, [key]: value}, this.props.changeKey)
  }

  private handleTabChange = (index: number) => {
    this.setState({selectedTabIndex: index})
  }

  public render() {
    if (this.props.field.fields.length === 0) return null

    const tabValues = this.props.field.fields.map(([key, field]) => ({
      key,
      value: field.label || convertKeyToLabel(key)
    }))

    const [fieldKey, field] = this.props.field.fields[this.state.selectedTabIndex]

    return (
      <FieldWrapper depth={this.props.depth} index={this.props.index}>
        <FieldComponent
          className={TabbedStructFieldEditComponentLabelStyle}
          depth={this.props.depth}
          index={this.props.index}>
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index}
          />
          <TabList
            values={tabValues}
            selectedIndex={this.state.selectedTabIndex}
            onChangeActiveTab={this.handleTabChange}
          />
        </FieldComponent>
        <FieldInset>
          {field.renderEditComponent({
            index: 0,
            depth: this.props.depth + 1,
            isWrapped: false,
            disabled: this.props.disabled,
            value: this.props.value.value[fieldKey],
            onValueChange: this.handleValueChange,
            onEditRecord: this.props.onEditRecord,
            onSelectRecord: this.props.onSelectRecord,
            onEditField: this.props.onEditField,
            changeKey: fieldKey
          })}
        </FieldInset>
      </FieldWrapper>
    )
  }
}

export const TabbedStructFieldEditComponentLabelStyle = style({
  paddingBottom: 0
})

export enum StructLayout {
  Linear = 'linear',
  Tabbed = 'tabbed'
}

export interface StructFieldOptions extends FieldOptions {
  readonly description?: string
  readonly fields?: StructFieldOptionsTuple[]
  readonly layout?: StructLayout
}

export interface StructFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly layout?: StructLayout
  readonly fields: StructFieldChildTuple[]
}

export type StructFieldValue = FieldValue<{[key: string]: AnyFieldValue}, string>

export class StructField implements Field<StructFieldValue> {
  public readonly label?: string
  public readonly description?: string
  public readonly layout?: StructLayout

  public readonly fields: StructFieldChildTuple[]
  public fieldMap!: ReadonlyMap<string, AnyField>

  public defaultValue!: StructFieldValue
  public sortConfigurations!: SortConfiguration[]
  public filterConfigurations!: FilterConfiguration[]

  public constructor(opts: StructFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.layout = opts.layout
    this.fields = opts.fields
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.fields.forEach(([_, field]) => field.initialize(recursions))

    this.fieldMap = new Map(this.fields)
    this.defaultValue = {
      value: reduceToMap(this.fields, ([key, field]) => [key, field.defaultValue]),
      isValid: true,
      hasChanges: false
    }

    this.sortConfigurations = [
      ...this.fields.reduce(
        (acc, [key, field]) => [
          ...acc,
          ...field.sortConfigurations.map(config => ({
            ...config,
            path: [StructPathSegment(key), ...config.path]
          }))
        ],
        [] as SortConfiguration[]
      )
    ]

    this.filterConfigurations = []

    return this
  }

  public renderListComponent() {
    return ''
  }

  public renderEditComponent(props: EditRenderProps<StructFieldValue>) {
    switch (this.layout) {
      case StructLayout.Tabbed:
        return (
          <TabbedStructFieldEditComponent
            label={this.label}
            description={this.description}
            field={this}
            {...props}
          />
        )

      default:
      case StructLayout.Linear:
        return (
          <LinearStructFieldEditComponent
            label={this.label}
            description={this.description}
            field={this}
            {...props}
          />
        )
    }
  }

  public transformRawValue(value: any): StructFieldValue {
    return {
      value: reduceToMap(this.fields, ([key, field]) => [key, field.transformRawValue(value[key])]),
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(value: StructFieldValue) {
    return d.struct(
      reduceToMap(this.fields, ([key, field]) => [
        key,
        field.transformValueToExpression(value.value[key])
      ])
    )
  }

  public fieldOptions(): StructFieldOptions & TypedFieldOptions {
    return {
      type: StructField.type,
      label: this.label,
      description: this.description,
      fields: this.fields.map(
        ([key, field]) => [key, field.fieldOptions()] as StructFieldOptionsTuple
      )
    }
  }

  public traverse(keyPath: KeyPath): AnyField | undefined {
    if (keyPath.length === 0) return this

    const key = keyPath[0]
    const field = this.fieldMap.get(key.toString())

    if (!field) return undefined

    return field.traverse(keyPath.slice(1))
  }

  public valuePathForKeyPath(keyPath: KeyPath): ValuePath {
    const key = keyPath[0]
    const field = this.fieldMap.get(key.toString())

    if (!field) throw new Error('Invalid KeyPath!')

    return [StructPathSegment(key.toString()), ...field.valuePathForKeyPath(keyPath.slice(1))]
  }

  public valuesForKeyPath(value: StructFieldValue, keyPath: KeyPath) {
    const key = keyPath[0]
    const field = this.fieldMap.get(key.toString())

    if (!field) return []

    return field.valuesForKeyPath(value.value[key], keyPath.slice(1))
  }

  public async onSave(value: StructFieldValue, context: SaveContext): Promise<StructFieldValue> {
    return {
      value: await mapObjectAsync(value.value, async (value, key) => {
        const field = this.fieldMap.get(key)

        if (!field) throw new Error(`Couln't find field for key: ${key}`)
        if (!field.onSave) return value

        return await field.onSave(value, context)
      }),
      isValid: true,
      hasChanges: true
    }
  }

  public async onDelete(
    value: StructFieldValue,
    context: DeleteContext
  ): Promise<StructFieldValue> {
    return {
      value: await mapObjectAsync(value.value, async (value, key) => {
        const field = this.fieldMap.get(key)
        if (!field) throw new Error(`Couln't find field for key: ${key}`)
        if (!field.onDelete) return value
        return await field.onDelete(value, context)
      }),
      isValid: true,
      hasChanges: true
    }
  }

  public static type = 'struct'

  static canInferFromModel(model: Model) {
    return model.type === 'struct'
  }

  static create(
    model: Model,
    opts: StructFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'struct') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "struct" received: "${model.type}"`
      })
    }

    const sortArray = opts && opts.fields && opts.fields.map(tuple => tuple[0])
    const fieldOptionsMap = new Map(opts && opts.fields)

    const fields = Object.entries(model.fields).map(([key, model]) => {
      const options = fieldOptionsMap.get(key)
      return [key, createField(model, {label: convertKeyToLabel(key), ...options})]
    }) as StructFieldChildTuple[]

    if (sortArray) {
      fields.sort(([keyA], [keyB]) => sortArray.indexOf(keyA) - sortArray.indexOf(keyB))
    }

    return new this({...opts, fields})
  }
}
