import React from 'react'
import shortid from 'shortid'

import * as xpr from '@karma.run/sdk/expression'
import {DataContext as d} from '@karma.run/sdk/expression'

import {
  Model,
  SortType,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions,
  ConditionType,
  SimpleConditionConfiguration
} from '@karma.run/editor-common'
import {ErrorField} from './error'

import {
  EditComponentRenderProps,
  EditRenderProps,
  Field,
  ListRenderProps,
  FieldValue
} from '../api/field'

import {FieldComponent, FieldLabel, FieldErrors} from '../ui/field'
import {TextAreaInput, TextInput, TextInputType} from '../ui/input'
import {CardSection} from '../ui/card'

export class StringFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<StringField, StringFieldValue>
> {
  private handleChange = (value: string) => {
    this.props.onValueChange(this.props.field.validate(value), this.props.changeKey)
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
        {this.props.field.multiline ? (
          <TextAreaInput
            onChange={this.handleChange}
            value={this.props.value.value}
            disabled={this.props.disabled}
            autoresize
          />
        ) : (
          <TextInput
            type={TextInputType.Lighter}
            onChange={this.handleChange}
            value={this.props.value.value}
            disabled={this.props.disabled}
            minLength={this.props.field.minLength}
            maxLength={this.props.field.maxLength}
          />
        )}
        <FieldErrors errors={this.props.value.error || []} />
      </FieldComponent>
    )
  }
}

export interface StringFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly minLength?: number
  readonly maxLength?: number
  readonly multiline?: boolean
}

export type StringFieldValue = FieldValue<string, string[]>

export class StringField implements Field<StringFieldValue> {
  public readonly label?: string
  public readonly description?: string
  public readonly minLength?: number
  public readonly maxLength?: number
  public readonly multiline?: boolean

  public readonly defaultValue: StringFieldValue = {
    value: '',
    isValid: true,
    hasChanges: false
  }

  public readonly sortConfigurations: SortConfiguration[]
  public readonly filterConfigurations: FilterConfiguration[]

  public constructor(opts?: StringFieldOptions) {
    this.label = opts && opts.label
    this.description = opts && opts.description
    this.minLength = opts && opts.minLength
    this.maxLength = opts && opts.maxLength
    this.multiline = opts && opts.multiline

    this.sortConfigurations = [
      {key: shortid.generate(), type: SortType.String, label: this.label || '', path: []}
    ]

    this.filterConfigurations = [
      FilterConfiguration(StringField.type, StringField.type, this.label, [
        SimpleConditionConfiguration(ConditionType.StringEqual),
        SimpleConditionConfiguration(ConditionType.StringIncludes),
        SimpleConditionConfiguration(ConditionType.StringRegExp),
        SimpleConditionConfiguration(ConditionType.StringStartsWith),
        SimpleConditionConfiguration(ConditionType.StringEndsWith)
      ])
    ]
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<StringFieldValue>) {
    return <CardSection>{props.value.value}</CardSection>
  }

  public renderEditComponent(props: EditRenderProps<StringFieldValue>) {
    return (
      <StringFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: unknown): StringFieldValue {
    if (typeof value !== 'string') throw new Error('StringField received invalid value!')
    return this.validate(value)
  }

  public transformValueToExpression(value: StringFieldValue): xpr.DataConstructor {
    return d.string(value.value)
  }

  public fieldOptions(): StringFieldOptions & TypedFieldOptions {
    return {
      type: StringField.type,
      label: this.label,
      description: this.description,
      minLength: this.minLength,
      maxLength: this.maxLength,
      multiline: this.multiline
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath(value: StringFieldValue) {
    return [value]
  }

  public validate(value: string): StringFieldValue {
    const errors: string[] = []

    if (this.maxLength && value.length > this.maxLength) errors.push('stringToLongError')
    if (this.minLength && value.length < this.minLength) errors.push('stringToShortError')

    return {
      value,
      isValid: errors.length === 0,
      error: errors,
      hasChanges: true
    }
  }

  public async onSave(value: StringFieldValue): Promise<StringFieldValue> {
    return this.validate(value.value)
  }

  public static type = 'string'

  static canInferFromModel(model: Model) {
    return model.type === 'string'
  }

  static create(model: Model, opts?: StringFieldOptions) {
    if (model.type !== 'string') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "string" received: "${model.type}"`
      })
    }

    return new this(opts)
  }
}
