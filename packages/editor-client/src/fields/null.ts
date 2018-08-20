import {expression as e} from '@karma.run/sdk'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  FieldOptions,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {ErrorField} from './error'
import {Field, FieldValue} from '../api/field'

export type NullFieldValue = FieldValue<null, never>

export class NullField implements Field<NullFieldValue> {
  public readonly defaultValue: NullFieldValue = {
    value: null,
    isValid: true,
    hasChanges: false
  }

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

  public transformRawValue(): NullFieldValue {
    return {
      value: null,
      isValid: true,
      hasChanges: true
    }
  }

  public transformValueToExpression() {
    return e.null()
  }

  public fieldOptions(): TypedFieldOptions {
    return {type: NullField.type}
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

  public static type = 'null'

  static canInferFromModel(model: Model) {
    return model.type === 'null'
  }

  static create(model: Model, opts?: FieldOptions) {
    if (model.type !== 'null') {
      return new ErrorField({
        label: opts && opts.label,
        message: `Expected model type "null" received: "${model.type}"`
      })
    }

    return new this()
  }

  static unserialize() {
    return new this()
  }
}
