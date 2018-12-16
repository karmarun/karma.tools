import React from 'react'

import * as xpr from '@karma.run/sdk/expression'
import {DataContext as d} from '@karma.run/sdk/expression'

import {
  Model,
  ModelType,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions,
  StorageType,
  ConditionType,
  NumberConditionConfiguration
} from '@karma.run/editor-common'

import {ErrorField} from './error'

import {
  EditComponentRenderProps,
  EditRenderProps,
  Field,
  ListRenderProps,
  FieldValue
} from '../api/field'

import {FieldComponent, FieldLabel} from '../ui/field'
import {NumberInput} from '../ui/input'
import {CardSection} from '../ui/card'

export class NumberFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<NumberField, NumberFieldValue>
> {
  private handleChange = (value: string) => {
    this.props.onValueChange(
      {
        value: value,
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
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
        <NumberInput
          onChange={this.handleChange}
          value={this.props.value.value}
          disabled={this.props.disabled}
          step={this.props.field.step}
        />
      </FieldComponent>
    )
  }
}

export interface NumberFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly minValue?: number
  readonly maxValue?: number
  readonly step?: number
}

export interface NumberFieldConstructorOptions extends NumberFieldOptions {
  readonly storageType: StorageType
}

const validModelTypes: ModelType[] = [
  'float',
  'int8',
  'int16',
  'int32',
  'int64',
  'uint8',
  'uint16',
  'uint32',
  'uint64'
]

export type NumberFieldValue = FieldValue<string, string[]>

export class NumberField implements Field<NumberFieldValue> {
  public readonly label?: string
  public readonly description?: string
  public readonly minValue?: number
  public readonly maxValue?: number
  public readonly step?: number
  public readonly storageType: StorageType

  public readonly defaultValue: NumberFieldValue = {
    value: '',
    isValid: true,
    hasChanges: false
  }

  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[]

  public constructor(opts: NumberFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.minValue = opts.minValue
    this.maxValue = opts.maxValue
    this.step = opts.step
    this.storageType = opts.storageType

    this.filterConfigurations = [
      FilterConfiguration(NumberField.type, NumberField.type, this.label, [
        NumberConditionConfiguration(ConditionType.NumberEqual, opts.storageType),
        NumberConditionConfiguration(ConditionType.NumberMin, opts.storageType),
        NumberConditionConfiguration(ConditionType.NumberMax, opts.storageType)
      ])
    ]
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<NumberFieldValue>) {
    return <CardSection>{props.value}</CardSection>
  }

  public renderEditComponent(props: EditRenderProps<NumberFieldValue>) {
    return (
      <NumberFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: unknown): NumberFieldValue {
    if (typeof value !== 'number' && typeof value !== 'string') throw new Error('Invalid value!')
    return {value: value.toString(), isValid: true, hasChanges: false}
  }

  public transformValueToExpression(value: NumberFieldValue): xpr.DataConstructor {
    const numberValue = Number(value.value)

    if (Number.isNaN(numberValue)) throw new Error('Value is NaN.')

    switch (this.storageType) {
      case StorageType.Float:
        return d.float(numberValue)

      case StorageType.Int8:
        return d.int8(numberValue)

      case StorageType.Int16:
        return d.int16(numberValue)

      case StorageType.Int32:
        return d.int32(numberValue)

      case StorageType.Int64:
        return d.int64(numberValue)

      case StorageType.UInt8:
        return d.uint8(numberValue)

      case StorageType.UInt16:
        return d.uint16(numberValue)

      case StorageType.UInt32:
        return d.uint32(numberValue)
        d
      case StorageType.UInt64:
        return d.uint64(numberValue)
    }
  }

  public isValidValue(value: string) {
    const errors: string[] = []
    const numberValue = Number(value)

    if (this.maxValue && numberValue > this.maxValue) errors.push('numberToLarge')
    if (this.minValue && numberValue < this.minValue) errors.push('numberToSmall')

    return errors
  }

  public fieldOptions(): NumberFieldOptions & TypedFieldOptions {
    return {
      type: NumberField.type,
      storageType: this.storageType,
      label: this.label,
      description: this.description,
      minValue: this.minValue,
      maxValue: this.maxValue,
      step: this.step
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath(value: NumberFieldValue) {
    return [value]
  }

  public static type = 'number'

  static canInferFromModel(model: Model) {
    return validModelTypes.includes(model.type)
  }

  static create(model: Model, opts?: NumberFieldConstructorOptions) {
    if (!validModelTypes.includes(model.type)) {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "${validModelTypes.join(', ')}" received: "${model.type}"`
      })
    }

    return new this({...opts, storageType: model.type as StorageType})
  }
}
