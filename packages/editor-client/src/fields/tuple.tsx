import React from 'react'

import * as xpr from '@karma.run/sdk/expression'
import {DataContext as dat} from '@karma.run/sdk/expression'

import {
  KeyPath,
  Model,
  ValuePath,
  TuplePathSegment,
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
  AnyFieldValue,
  FieldValue,
  AnyField
} from '../api/field'

import {FieldWrapper, FieldComponent, FieldLabel, FieldInset} from '../ui/field'
import {ErrorField} from './error'

export type TupleFieldChildTuple = [number, AnyField]
export type TupleFieldOptionsTuple = [number, TypedFieldOptions]

export class TupleFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<TupleField, TupleFieldValue>
> {
  private handleValueChange = (value: AnyFieldValue, key: string | undefined) => {
    if (key == undefined) {
      throw new Error('Child field did not call onValueChange with changeKey!')
    }

    this.props.onValueChange(
      {
        value: Object.assign([], this.props.value.value, {[key]: value}),
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  public render() {
    const fields = this.props.field.fields.map(([tupleIndex, field], index) => (
      <React.Fragment key={tupleIndex}>
        {field.renderEditComponent({
          index: index,
          depth: this.props.isWrapped ? this.props.depth : this.props.depth + 1,
          isWrapped: false,
          disabled: this.props.disabled,
          value: this.props.value.value[tupleIndex],
          onValueChange: this.handleValueChange,
          onEditRecord: this.props.onEditRecord,
          onSelectRecord: this.props.onSelectRecord,
          onEditField: this.props.onEditField,
          changeKey: tupleIndex
        })}
      </React.Fragment>
    ))

    if (fields.length === 0) return null

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

export interface TupleFieldOptions extends FieldOptions {
  readonly description?: string
  readonly fields: TupleFieldOptionsTuple[]
}

export interface TupleFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly fields: TupleFieldChildTuple[]
}

export type TupleFieldValue = FieldValue<AnyFieldValue[], string>

export class TupleField implements Field<TupleFieldValue> {
  public label?: string
  public description?: string

  public fields: TupleFieldChildTuple[]
  public fieldMap!: ReadonlyMap<number, AnyField>

  public defaultValue!: TupleFieldValue
  public sortConfigurations!: SortConfiguration[]
  public filterConfigurations!: FilterConfiguration[]

  public constructor(opts: TupleFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.fields = opts.fields
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.fields.forEach(([_, field]) => field.initialize(recursions))
    this.fieldMap = new Map(this.fields)

    this.defaultValue = {
      value: this.fields.reduce(
        (acc, [index, field]) => {
          acc[index] = field.defaultValue
          return acc
        },
        [] as any[]
      ),
      isValid: true,
      hasChanges: false
    }

    this.sortConfigurations = [
      ...this.fields.reduce(
        (acc, [index, field]) => [
          ...acc,
          ...field.sortConfigurations.map(config => ({
            ...config,
            path: [TuplePathSegment(index), ...config.path]
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

  public renderEditComponent(props: EditRenderProps<TupleFieldValue>) {
    return (
      <TupleFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any[]): TupleFieldValue {
    return {
      value: value.map((value, index) => this.fieldMap.get(index)!.transformRawValue(value)),
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(value: TupleFieldValue): xpr.DataConstructor {
    const tupleValues = this.fields.reduce(
      (acc, [key, field]) => {
        acc[key] = field.transformValueToExpression(value.value[key])
        return acc
      },
      [] as any[]
    )

    return dat.tuple(...tupleValues)
  }

  public fieldOptions(): TupleFieldOptions & TypedFieldOptions {
    return {
      type: TupleField.type,
      label: this.label,
      description: this.description,
      fields: this.fields.map(
        ([key, field]) => [key, field.fieldOptions()] as TupleFieldOptionsTuple
      )
    }
  }

  public traverse(keyPath: KeyPath): AnyField | undefined {
    if (keyPath.length === 0) return this

    const key = keyPath[0]
    const field = this.fieldMap.get(Number(key))

    if (!field) return undefined

    return field.traverse(keyPath.slice(1))
  }

  public valuePathForKeyPath(keyPath: KeyPath): ValuePath {
    const key = keyPath[0]
    const field = this.fieldMap.get(Number(key))

    if (!field) throw new Error('Invalid KeyPath!')

    return [TuplePathSegment(Number(key)), ...field.valuePathForKeyPath(keyPath.slice(1))]
  }

  public valuesForKeyPath(value: TupleFieldValue, keyPath: KeyPath) {
    const key = Number(keyPath[0])
    const field = this.fieldMap.get(key)

    if (!field) return []

    return field.valuesForKeyPath(value.value[key], keyPath.slice(1))
  }

  public async onSave(value: TupleFieldValue, context: SaveContext) {
    const newValues: any[] = []

    for (const [index, tupleValue] of value.value.entries()) {
      const field = this.fieldMap.get(index)

      if (!field) throw new Error(`Couln't find field for index: ${index}`)

      if (field.onSave) {
        newValues.push(await field.onSave(tupleValue, context))
      } else {
        newValues.push(tupleValue)
      }
    }

    return {
      value: newValues,
      isValid: true,
      hasChanges: true
    }
  }

  public async onDelete(value: TupleFieldValue, context: DeleteContext) {
    const newValues: any[] = []

    for (const [index, tupleValue] of value.value.entries()) {
      const field = this.fieldMap.get(index)

      if (!field) throw new Error(`Couln't find field for index: ${index}`)

      if (field.onDelete) {
        newValues.push(await field.onDelete(tupleValue, context))
      } else {
        newValues.push(tupleValue)
      }
    }

    return {
      value: newValues,
      isValid: true,
      hasChanges: true
    }
  }

  public static type = 'tuple'

  static canInferFromModel(model: Model) {
    return model.type === 'tuple'
  }

  static create(
    model: Model,
    opts: TupleFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'tuple') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "tuple" received: "${model.type}"`
      })
    }

    const sortArray = opts && opts.fields && opts.fields.map(tuple => tuple[0])
    const fieldOptionsMap = new Map(opts && opts.fields)

    const fields = model.fields.map((model, index) => {
      const options = fieldOptionsMap.get(index)
      return [index, createField(model, {label: `Index ${index}`, ...options})]
    }) as TupleFieldChildTuple[]

    if (sortArray) {
      fields.sort(([indexA], [indexB]) => sortArray.indexOf(indexA) - sortArray.indexOf(indexB))
    }

    return new this({...opts, fields})
  }
}
