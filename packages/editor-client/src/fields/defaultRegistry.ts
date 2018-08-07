import {createFieldRegistry} from '../api/field'

import {StringField} from './string'
import {StructField} from './struct'
import {RefField} from './ref'
import {PasswordField} from './password'
import {RecursionField, RecurseField, RecursiveField} from './recursion'
import {OptionalField} from './optional'
import {UnionField} from './union'
import {TupleField} from './tuple'
import {MapField} from './map'
import {ListField} from './list'
import {BoolField} from './bool'
import {NumberField} from './number'
import {EnumField} from './enum'
import {SetField} from './set'
import {DateTimeField} from './dateTime'
import {NullField} from './null'
import {CurrentUserField} from './currentUser'
import {ErrorField} from './error'

export const defaultFieldRegistry = createFieldRegistry(
  ErrorField,
  CurrentUserField,
  PasswordField,
  BoolField,
  StringField,
  NumberField,
  StructField,
  UnionField,
  TupleField,
  MapField,
  ListField,
  SetField,
  RefField,
  RecursionField,
  RecursiveField,
  RecurseField,
  OptionalField,
  EnumField,
  DateTimeField,
  NullField
)
