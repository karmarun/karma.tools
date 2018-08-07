import {expression as e, data as d} from '@karma.run/sdk'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  FieldOptions,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {ErrorField} from './error'
import {Field, FieldValue} from '../api/field'

export type CurrentUserFieldValue = FieldValue<undefined, never>

export class CurrentUserField implements Field<CurrentUserFieldValue> {
  public readonly defaultValue: CurrentUserFieldValue = {value: undefined, isValid: true}
  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public initialize() {
    return this
  }

  public renderListComponent() {
    return null
  }

  public renderEditComponent() {
    return null
  }

  public transformRawValue() {
    return this.defaultValue
  }

  public transformValueToExpression() {
    return d.expr(e.currentUser())
  }

  public isValidValue() {
    return null
  }

  public fieldOptions(): TypedFieldOptions {
    return {type: CurrentUserField.type}
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

  public static type = 'currentUser'

  static create(model: Model, opts: FieldOptions) {
    if (model.type !== 'ref') {
      return new ErrorField({
        label: opts.label,
        message: `Expected model type "ref" received: "${model.type}"`
      })
    }

    return new this()
  }

  static unserialize() {
    return new this()
  }
}
