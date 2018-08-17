import React from 'react'
import memoizeOne from 'memoize-one'
import {data as d, DataExpression} from '@karma.run/sdk'

import {
  EditComponentRenderProps,
  Field,
  EditRenderProps,
  CreateFieldFunction,
  SaveContext,
  DeleteContext,
  FieldValue,
  AnyField,
  AnyFieldValue
} from '../api/field'

import {
  KeyPath,
  Model,
  convertKeyToLabel,
  ValuePath,
  ValuePathSegmentType,
  FilterConfiguration,
  SortConfiguration,
  firstKey,
  ObjectMap,
  TypedFieldOptions,
  FieldOptions,
  filterConfigurationPrependPath,
  UnionPathSegment,
  OptionsConditionConfiguration,
  ConditionType
} from '@karma.run/editor-common'

import {ErrorField} from './error'
import {FieldWrapper, FieldComponent, FieldLabel, FieldInset} from '../ui/field'
import {Select, SelectType} from '../ui/select'

export type UnionFieldChildTuple = [string, string, AnyField]
export type UnionFieldOptionsTuple = [string, string, TypedFieldOptions]

export class UnionFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<UnionField, UnionFieldValue>
> {
  private handleSelectChange = (selectedKey?: string) => {
    const value = this.props.value

    if (!selectedKey) {
      return this.props.onValueChange(
        {
          value: {selectedKey, values: value.value.values},
          isValid: true,
          hasChanges: true
        },
        this.props.changeKey
      )
    }

    let selectedValue = value.value.values[selectedKey]
    if (!selectedValue) selectedValue = this.props.field.fieldForKey(selectedKey).defaultValue

    this.props.onValueChange(
      {
        value: {selectedKey, values: {...value.value.values, [selectedKey]: selectedValue}},
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  private handleValueChange = (value: AnyFieldValue, key: string | undefined) => {
    if (key == undefined) {
      throw new Error('Child field did not call onValueChange with changeKey!')
    }

    this.props.onValueChange(
      {
        value: {
          ...this.props.value.value,
          values: {...this.props.value.value.values, [key]: value}
        },
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  private selectOptions = memoizeOne((field: UnionField) =>
    field.fields.map(([key, label]) => ({key, label: label || key}))
  )

  public render() {
    const field = this.props.value.value.selectedKey
      ? this.props.field.fieldMap.get(this.props.value.value.selectedKey)
      : undefined

    return (
      <FieldWrapper depth={this.props.depth} index={this.props.index}>
        <FieldComponent depth={this.props.depth} index={this.props.index}>
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index || 0}
          />
          <Select
            value={this.props.value ? this.props.value.value.selectedKey : undefined}
            type={SelectType.Transparent}
            options={this.selectOptions(this.props.field)}
            onChange={this.handleSelectChange}
            disabled={this.props.disabled}
          />
        </FieldComponent>
        <FieldInset>
          {field &&
            field.renderEditComponent({
              index: 0,
              depth: this.props.depth + 1,
              isWrapped: true,
              disabled: this.props.disabled,
              value: this.props.value.value.values[this.props.value.value.selectedKey!],
              onValueChange: this.handleValueChange,
              onEditRecord: this.props.onEditRecord,
              onSelectRecord: this.props.onSelectRecord,
              onEditField: this.props.onEditField,
              changeKey: this.props.value!.value.selectedKey
            })}
        </FieldInset>
      </FieldWrapper>
    )
  }
}

export interface UnionFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly fields?: UnionFieldOptionsTuple[]
}

export interface UnionFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly fields: UnionFieldChildTuple[]
}

export type UnionFieldValue = FieldValue<
  {selectedKey?: string; values: ObjectMap<AnyFieldValue>},
  string
>

export class UnionField implements Field<UnionFieldValue> {
  public label?: string
  public description?: string
  public fields: UnionFieldChildTuple[]
  public fieldMap!: ReadonlyMap<string, AnyField>

  public defaultValue: UnionFieldValue = {
    value: {values: {}},
    isValid: true,
    hasChanges: false
  }

  public sortConfigurations: SortConfiguration[] = []
  public filterConfigurations: FilterConfiguration[] = []

  public constructor(opts: UnionFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.fields = opts.fields
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.fields.forEach(([_, __, field]) => field.initialize(recursions))
    this.fieldMap = new Map(
      this.fields.map(([key, _, field]) => [key, field] as [string, AnyField])
    )

    this.filterConfigurations = [
      FilterConfiguration(UnionField.type, UnionField.type, this.label, [
        OptionsConditionConfiguration(
          ConditionType.UnionCaseEqual,
          this.fields.map(([key, label]) => ({key, label}))
        )
      ]),
      ...this.fields.reduce(
        (acc, [key, _label, field]) => [
          ...acc,
          ...field.filterConfigurations.map(config =>
            filterConfigurationPrependPath(config, `${UnionField.type}[${key}]`, [
              UnionPathSegment(key)
            ])
          )
        ],
        [] as FilterConfiguration[]
      )
    ]

    return this
  }

  public renderListComponent() {
    return ''
  }

  public renderEditComponent(props: EditRenderProps<UnionFieldValue>) {
    return (
      <UnionFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public fieldForKey(key: string): AnyField {
    const field = this.fieldMap.get(key)
    if (!field) throw new Error(`Coulnd't find field for key: ${key}`)
    return field
  }

  public transformRawValue(value: unknown): UnionFieldValue {
    if (typeof value !== 'object') throw new Error('Invalid value.')

    const objectValue = value as ObjectMap<unknown>
    const key = firstKey(objectValue)
    const unionValue = objectValue[key]

    return {
      value: {
        selectedKey: key,
        values: {[key]: this.fieldForKey(key).transformRawValue(unionValue)}
      },
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(value: UnionFieldValue): DataExpression {
    if (!value.value.selectedKey) return d.null()

    return d.union(
      value.value.selectedKey,
      this.fieldForKey(value.value.selectedKey).transformValueToExpression(
        value.value.values[value.value.selectedKey]
      )
    )
  }

  public fieldOptions(): UnionFieldOptions & TypedFieldOptions {
    return {
      type: UnionField.type,
      label: this.label,
      description: this.description,
      fields: this.fields.map(
        ([key, label, field]) => [key, label, field.fieldOptions()] as UnionFieldOptionsTuple
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
    if (keyPath.length === 0) return []

    const key = keyPath[0]
    const field = this.fieldMap.get(key.toString())

    if (!field) throw new Error('Invalid KeyPath!')

    return [
      {type: ValuePathSegmentType.Union, key: key.toString()},
      ...field.valuePathForKeyPath(keyPath.slice(1))
    ]
  }

  public valuesForKeyPath(value: UnionFieldValue, keyPath: KeyPath): AnyFieldValue[] {
    if (keyPath.length === 0) return [value]

    const key = keyPath[0].toString()
    const field = this.fieldMap.get(key)

    if (!field || !value.value.values[key]) return []

    return field.valuesForKeyPath(value.value.values[key], keyPath.slice(1))
  }

  public async onSave(value: UnionFieldValue, context: SaveContext): Promise<UnionFieldValue> {
    if (!value.value.selectedKey) return value
    const field = this.fieldForKey(value.value.selectedKey)

    if (!field.onSave) return value

    return {
      value: {
        selectedKey: value.value.selectedKey,
        values: {
          [value.value.selectedKey]: await field.onSave(
            value.value.values[value.value.selectedKey],
            context
          )
        }
      },
      isValid: true,
      hasChanges: true
    }
  }

  public async onDelete(value: UnionFieldValue, context: DeleteContext): Promise<UnionFieldValue> {
    if (!value.value.selectedKey) return value
    const field = this.fieldForKey(value.value.selectedKey)

    if (!field.onDelete) return value
    return {
      value: {
        selectedKey: value.value.selectedKey,
        values: {
          [value.value.selectedKey]: await field.onDelete(
            value.value.values[value.value.selectedKey],
            context
          )
        }
      },
      isValid: true,
      hasChanges: true
    }
  }

  public static type = 'union'

  static canInferFromModel(model: Model) {
    return model.type === 'union'
  }

  static create(
    model: Model,
    opts: UnionFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'union') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "union" received: "${model.type}"`
      })
    }

    const sortArray = opts && opts.fields && opts.fields.map(tuple => tuple[0])
    const fieldOptionsMap = new Map(
      opts &&
        opts.fields &&
        opts.fields.map(
          ([key, label, options]) => [key, [label, options]] as [string, [string, FieldOptions]]
        )
    )

    const fields = Object.entries(model.fields).map(([key, model]) => {
      const options = fieldOptionsMap.get(key)
      const label = options ? options[0] : convertKeyToLabel(key)
      const fieldOptions = options && options[1]

      return [key, label, createField(model, {label, ...fieldOptions})]
    }) as UnionFieldChildTuple[]

    if (sortArray) {
      fields.sort(([keyA], [keyB]) => sortArray.indexOf(keyA) - sortArray.indexOf(keyB))
    }

    return new this({...opts, fields})
  }
}
