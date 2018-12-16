import React from 'react'
import {DataContext as dat} from '@karma.run/sdk/expression'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {Field, EditComponentRenderProps, EditRenderProps, FieldValue} from '../api/field'
import {FieldErrors, FieldComponent, FieldLabel} from '../ui/field'
import {CardError} from '../ui/card'

export class ErrorEditComponent extends React.PureComponent<
  EditComponentRenderProps<ErrorField, ErrorFieldValue>
> {
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
        <FieldErrors errors={[this.props.field.message]} />
      </FieldComponent>
    )
  }
}

export interface ErrorFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly message?: string
}

export type ErrorFieldValue = FieldValue<undefined, never>

export class ErrorField implements Field<ErrorFieldValue> {
  public readonly label?: string
  public readonly description?: string
  public readonly message: string

  public readonly defaultValue: ErrorFieldValue = {
    value: undefined,
    isValid: false,
    hasChanges: false
  }

  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(opts?: ErrorFieldOptions) {
    this.label = opts && opts.label
    this.description = opts && opts.description
    this.message = (opts && opts.message) || 'Unknown Error'
  }

  public initialize() {
    return this
  }

  public renderListComponent() {
    return <CardError>{this.message}</CardError>
  }

  public renderEditComponent(props: EditRenderProps<ErrorFieldValue>) {
    return (
      <ErrorEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public fieldOptions(): ErrorFieldOptions & TypedFieldOptions {
    return {
      type: ErrorField.type,
      label: this.label,
      description: this.description,
      message: this.message
    }
  }

  public transformRawValue() {
    return this.defaultValue
  }

  public transformValueToExpression() {
    return dat.null()
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath() {
    return []
  }

  public static type = 'error'

  static create(_model: Model, opts?: ErrorFieldOptions) {
    return new this(opts)
  }
}
