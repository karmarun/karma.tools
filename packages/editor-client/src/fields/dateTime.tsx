import React from 'react'
import {expression as e} from '@karma.run/sdk'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {
  EditComponentRenderProps,
  EditRenderProps,
  Field,
  ListRenderProps,
  FieldValue
} from '../api/field'

import {FieldComponent, FieldLabel} from '../ui/field'
import {DateTimeInput} from '../ui/input'
import {CardSection} from '../ui/card'
import {ErrorField} from './error'

export class DateTimeFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<DateTimeField, DateTimeValue>
> {
  private handleChange = (value: string | Date) => {
    this.props.onValueChange({value, isValid: value instanceof Date}, this.props.changeKey)
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
        <DateTimeInput
          onChange={this.handleChange}
          value={this.props.value.value}
          disabled={this.props.disabled}
        />
      </FieldComponent>
    )
  }
}

export interface DateTimeFieldOptions {
  readonly label?: string
  readonly description?: string
}

export type DateTimeValue = FieldValue<string | Date, string>

export class DateTimeField implements Field<DateTimeValue> {
  public readonly label?: string
  public readonly description?: string

  public readonly defaultValue: DateTimeValue = {isValid: false, value: ''}
  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(opts?: DateTimeFieldOptions) {
    this.label = opts && opts.label
    this.description = opts && opts.description
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<DateTimeValue>) {
    return <CardSection>{props.value}</CardSection>
  }

  public renderEditComponent(props: EditRenderProps<DateTimeValue>) {
    return (
      <DateTimeFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any) {
    return {value: new Date(value), isValid: true}
  }

  public transformValueToExpression(value: DateTimeValue) {
    if (!(value.value instanceof Date)) return e.null()
    return e.dateTime(value.value.toISOString())
  }

  public fieldOptions(): DateTimeFieldOptions & TypedFieldOptions {
    return {
      type: DateTimeField.type,
      label: this.label,
      description: this.description
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath(value: DateTimeValue) {
    return [value]
  }

  public static type = 'dateTime'

  static canInferFromModel(model: Model) {
    return model.type === 'dateTime'
  }

  static create(model: Model, opts?: DateTimeFieldOptions) {
    if (model.type !== 'dateTime') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "dateTime" received: "${model.type}"`
      })
    }

    return new this(opts)
  }
}
