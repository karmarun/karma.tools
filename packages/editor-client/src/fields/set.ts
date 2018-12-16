import * as xpr from '@karma.run/sdk/expression'
import {DataContext as dat} from '@karma.run/sdk/expression'

import {Model, TypedFieldOptions} from '@karma.run/editor-common'
import {ErrorField} from './error'
import {ListFieldValue, ListField, ListFieldOptions} from './list'
import {CreateFieldFunction} from '../api/field'

export class SetField extends ListField {
  public transformValueToExpression(value: ListFieldValue): xpr.DataConstructor {
    return dat.set(value.value.map(({value}) => this.field.transformValueToExpression(value)))
  }

  public fieldOptions(): ListFieldOptions & TypedFieldOptions {
    return {
      type: SetField.type,
      label: this.label,
      description: this.description,
      field: this.field.fieldOptions()
    }
  }

  public static type = 'set'

  static canInferFromModel(model: Model) {
    return model.type === 'set'
  }

  static create(
    model: Model,
    opts: ListFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'set') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "set" received: "${model.type}"`
      })
    }

    return new this({...opts, field: createField(model.model, opts && opts.field)})
  }
}
