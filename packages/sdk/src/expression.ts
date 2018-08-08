import * as t from './types'
import {ObjectMap} from './util'

const enum NumberType {
  Int8,
  Int16,
  Int32,
  Int64,
  UInt8,
  UInt16,
  UInt32,
  UInt64,
  Float
}

function dataForNumberExpression(expr: t.NumberExpression, type: NumberType): t.Expression {
  if (typeof expr === 'number') {
    switch (type) {
      default:
      case NumberType.Int8:
        return expression.int8(expr)
      case NumberType.Int16:
        return expression.int16(expr)
      case NumberType.Int32:
        return expression.int32(expr)
      case NumberType.Int64:
        return expression.int64(expr)
      case NumberType.UInt8:
        return expression.uint8(expr)
      case NumberType.UInt16:
        return expression.uint16(expr)
      case NumberType.UInt32:
        return expression.uint32(expr)
      case NumberType.UInt64:
        return expression.uint64(expr)
      case NumberType.Float:
        return expression.float(expr)
    }
  } else {
    return expr
  }
}

function dataForStringExpression(expr: t.StringExpression): t.Expression {
  if (typeof expr === 'string') {
    return expression.string(expr)
  } else {
    return expr
  }
}

function dataForDateExpression(expr: t.DateExpression): t.Expression {
  if (typeof expr === 'string' || typeof expr === 'number' || expr instanceof Date) {
    return expression.dateTime(expr)
  } else {
    return expr
  }
}

function generateNumericTupleFunc<T extends {}>(name: keyof T, type: NumberType) {
  return (valueA: t.NumberExpression, valueB: t.NumberExpression): T => {
    return {
      [name]: [dataForNumberExpression(valueA, type), dataForNumberExpression(valueB, type)]
    } as T
  }
}

export const func = {
  function(params: string[], ...body: t.Expression[]): t.FunctionFn {
    return {function: [params, body]}
  }
}

export const data = {
  bool(value: boolean): t.BoolFn {
    return {bool: value}
  },

  dateTime(value: string | number | Date): t.DateTimeFn {
    if (typeof value === 'number' || typeof value === 'string') {
      value = new Date(value)
    }

    return {dateTime: value.toISOString()}
  },

  string(value: string): t.StringFn {
    return {string: value}
  },

  null(): t.NullFn {
    return {null: null}
  },

  symbol(value: string): t.SymbolFn {
    return {symbol: value}
  },

  int8(value: number): t.Int8Fn {
    return {int8: value}
  },

  int16(value: number): t.Int16Fn {
    return {int16: value}
  },

  int32(value: number): t.Int32Fn {
    return {int32: value}
  },

  int64(value: number): t.Int64Fn {
    return {int64: value}
  },

  uint8(value: number): t.UInt8Fn {
    return {uint8: value}
  },

  uint16(value: number): t.UInt16Fn {
    return {uint16: value}
  },

  uint32(value: number): t.UInt32Fn {
    return {uint32: value}
  },

  uint64(value: number): t.UInt64Fn {
    return {uint64: value}
  },

  float(value: number): t.FloatFn {
    return {float: value}
  },

  map(value: ObjectMap<t.DataExpression>): t.MapFn {
    return {map: value}
  },

  list(...value: t.DataExpression[]): t.ListFn {
    return {list: value}
  },

  set(...value: t.DataExpression[]): t.SetFn {
    return {set: value}
  },

  struct(value: ObjectMap<t.DataExpression | undefined> = {}): t.StructFn {
    return {struct: value}
  },

  tuple(...value: t.DataExpression[]): t.TupleFn {
    return {tuple: value}
  },

  union(caseKey: string, value: t.DataExpression): t.UnionFn {
    return {union: [caseKey, value]}
  },

  ref(ref: t.Ref): t.RefFn {
    return {ref}
  },

  expr(expr: t.Expression): t.ExprFn {
    return {expr}
  }
}

export const expression = {
  // Convinience Primitives
  // ======================

  bool: data.bool,
  dateTime: data.dateTime,
  string: data.string,
  null: data.null,
  symbol: data.symbol,
  int8: data.int8,
  int16: data.int16,
  int32: data.int32,
  int64: data.int64,
  uint8: data.uint8,
  uint16: data.uint16,
  uint32: data.uint32,
  uint64: data.uint64,
  float: data.float,

  // Expression Scope
  // ================

  // Other
  // -----

  model(id: t.Expression): t.ModelFn {
    return {model: id}
  },

  modelOf(expr: t.Expression): t.ModelOfFn {
    return {modelOf: expr}
  },

  metarialize(record: t.Expression): t.MetarializeFn {
    return {metarialize: record}
  },

  zero(): t.ZeroFn {
    return {zero: {}}
  },

  // Scope
  // -----

  data(value: t.DataExpression): t.DataFn {
    return {data: value}
  },

  define(name: string, expr: t.Expression): t.DefineFn {
    return {define: [name, expr]}
  },

  scope(name: string): t.ScopeFn {
    return {scope: name}
  },

  signature(func: t.FuncExpression): t.SignatureFn {
    return {signature: func}
  },

  // Date Time
  // ---------

  after(valueA: t.DateExpression, valueB: t.DateExpression): t.AfterFn {
    return {after: [dataForDateExpression(valueA), dataForDateExpression(valueB)]}
  },

  before(valueA: t.DateExpression, valueB: t.DateExpression): t.BeforeFn {
    return {before: [dataForDateExpression(valueA), dataForDateExpression(valueB)]}
  },

  // String
  // ------

  joinStrings(separator: t.Expression, strings: t.Expression): t.JoinStringsFn {
    return {joinStrings: {separator, strings}}
  },

  stringToLower(value: t.Expression): t.StringToLowerFn {
    return {stringToLower: value}
  },

  matchRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.MatchRegexFn {
    return {matchRegex: {regex, value, caseInsensitive, multiLine}}
  },

  searchAllRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.SearchAllRegexFn {
    return {searchAllRegex: {regex, value, caseInsensitive, multiLine}}
  },

  searchRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.SearchRegexFn {
    return {searchRegex: {regex, value, caseInsensitive, multiLine}}
  },

  // Optional
  // --------

  isPresent(optional: t.Expression): t.IsPresentFn {
    return {isPresent: optional}
  },

  // Set
  // ---

  mapSet(value: t.Expression, mapper: t.FuncExpression): t.MapSetFn {
    return {mapSet: [value, mapper]}
  },

  // Map
  // ---

  setKey(name: string, value: t.Expression, inMap: t.Expression): t.SetKeyFn {
    return {setKey: {name, value, in: inMap}}
  },

  mapMap(value: t.Expression, mapper: t.FuncExpression): t.MapMapFn {
    return {mapMap: [value, mapper]}
  },

  key(name: t.StringExpression, value: t.Expression): t.KeyFn {
    return {key: [dataForStringExpression(name), value]}
  },

  // Union
  // -----

  isCase(value: t.Expression, caseKey: t.Expression): t.IsCaseFn {
    return {isCase: {value, case: caseKey}}
  },

  // Tuple
  // -----

  indexTuple(value: t.Expression, index: number): t.IndexTupleFn {
    return {indexTuple: [value, index]}
  },

  // Struct
  // ------

  extractStrings(value: t.Expression): t.ExtractStringsFn {
    return {extractStrings: value}
  },

  field(name: string, value: t.Expression): t.FieldFn {
    return {field: [name, value]}
  },

  setField(name: string, value: t.Expression, inStruct: t.Expression): t.SetFieldFn {
    return {setField: {name, value, in: inStruct}}
  },

  // List
  // ----

  concatLists(valueA: t.Expression, valueB: t.Expression): t.ConcatListsFn {
    return {concatLists: [valueA, valueB]}
  },

  filterList(value: t.Expression, filter: t.FuncExpression): t.FilterListFn {
    return {filterList: [value, filter]}
  },

  first(value: t.Expression): t.FirstFn {
    return {first: value}
  },

  inList(inList: t.Expression, value: t.Expression): t.InListFn {
    return {inList: {value, in: inList}}
  },

  mapList(value: t.Expression, mapper: t.FuncExpression): t.MapListFn {
    return {mapList: [value, mapper]}
  },

  length(value: t.Expression): t.LengthFn {
    return {length: value}
  },

  memSort(value: t.Expression, sorter: t.FuncExpression): t.MemSortFn {
    return {memSort: [value, sorter]}
  },

  reverseList(value: t.Expression): t.ReverseListFn {
    return {reverseList: value}
  },

  slice(value: t.Expression, offset: t.NumberExpression, length: t.NumberExpression): t.SliceFn {
    return {
      slice: {
        value,
        offset: dataForNumberExpression(offset, NumberType.Int64),
        length: dataForNumberExpression(length, NumberType.Int64)
      }
    }
  },

  reduceList(
    value: t.Expression,
    initial: t.Expression,
    reducer: t.FuncExpression
  ): t.ReduceListFn {
    return {reduceList: {value, initial, reducer}}
  },

  // User / Permission
  // -----------------

  currentUser(): t.CurrentUserFn {
    return {currentUser: {}}
  },

  // Graph / Referential
  // -------------------

  allReferrers(ref: t.Expression): t.AllReferrersFn {
    return {allReferrers: ref}
  },

  refTo(value: t.Expression): t.RefToFn {
    return {refTo: value}
  },

  referred(from: t.Expression, inRef: t.Expression): t.ReferredFn {
    return {referred: {from, in: inRef}}
  },

  referrers(of: t.Expression, inRef: t.Expression): t.ReferrersFn {
    return {referrers: {of, in: inRef}}
  },

  relocateRef(model: t.Expression, ref: t.Expression): t.RelocateRefFn {
    return {relocateRef: {model, ref}}
  },

  resolveAllRefs(ref: t.Expression): t.ResolveAllRefsFn {
    return {resolveAllRefs: ref}
  },

  tag(value: t.StringExpression): t.TagFn {
    return {tag: dataForStringExpression(value)}
  },

  tagExists(value: t.StringExpression): t.TagExistsFn {
    return {tagExists: dataForStringExpression(value)}
  },

  graphFlow(
    start: t.Expression,
    flow: {backward: t.Expression[]; forward: t.Expression[]; from: t.Expression}[]
  ): t.GraphFlowFn {
    return {graphFlow: {start, flow}}
  },

  // CRUD
  // ----

  all(ref: t.Expression): t.AllFn {
    return {all: ref}
  },

  create(modelRef: t.Expression, func: t.FuncExpression): t.CreateFn {
    return {create: [modelRef, func]}
  },

  createMultiple(modelRef: t.Expression, funcs: ObjectMap<t.FuncExpression>): t.CreateMultipleFn {
    return {createMultiple: [modelRef, funcs]}
  },

  delete(ref: t.Expression): t.DeleteFn {
    return {delete: ref}
  },

  get(ref: t.Expression): t.GetFn {
    return {get: ref}
  },

  update(ref: t.Expression, value: t.Expression): t.UpdateFn {
    return {update: {ref, value}}
  },

  // Logic
  // -----

  and(...values: t.Expression[]): t.AndFn {
    return {and: values}
  },

  or(...values: t.Expression[]): t.OrFn {
    return {or: values}
  },

  assertCase(caseKey: string, value: t.Expression): t.AssertCaseFn {
    return {assertCase: {case: caseKey, value}}
  },

  assertModelRef(ref: t.Expression, value: t.Expression): t.AssertModelRefFn {
    return {assertModelRef: {ref, value}}
  },

  assertPresent(value: t.Expression): t.AssertPresentFn {
    return {assertPresent: value}
  },

  equal(valueA: t.Expression, valueB: t.Expression): t.EqualFn {
    return {equal: [valueA, valueB]}
  },

  if(condition: t.Expression, then: t.Expression, els: t.Expression): t.IfFn {
    return {if: {condition, then, else: els}}
  },

  not(value: t.Expression): t.NotFn {
    return {not: value}
  },

  presentOrZero(value: t.Expression): t.PresentOrZeroFn {
    return {presentOrZero: value}
  },

  switchCase(value: t.Expression, cases: ObjectMap<t.FuncExpression>): t.SwitchCaseFn {
    return {switchCase: [value, cases]}
  },

  switchModelRef(
    value: t.Expression,
    defaultValue: t.Expression,
    cases: {match: t.Expression; return: t.Expression}[]
  ): t.SwitchModelRefFn {
    return {switchModelRef: {value, default: defaultValue, cases}}
  },

  // Numeric
  // -------

  floatToInt(value: t.NumberExpression): t.FloatToIntFn {
    return {floatToInt: dataForNumberExpression(value, NumberType.Float)}
  },

  intToFloat(value: t.NumberExpression): t.IntToFloatFn {
    return {intToFloat: dataForNumberExpression(value, NumberType.Int64)}
  },

  addFloat: generateNumericTupleFunc<t.AddFloatFn>('addFloat', NumberType.Float),
  addInt8: generateNumericTupleFunc<t.AddInt8Fn>('addInt8', NumberType.Int8),
  addInt16: generateNumericTupleFunc<t.AddInt16Fn>('addInt16', NumberType.Int16),
  addInt32: generateNumericTupleFunc<t.AddInt32Fn>('addInt32', NumberType.Int32),
  addInt64: generateNumericTupleFunc<t.AddInt64Fn>('addInt64', NumberType.Int64),
  addUint8: generateNumericTupleFunc<t.AddUInt8Fn>('addUint8', NumberType.UInt8),
  addUint16: generateNumericTupleFunc<t.AddUInt16Fn>('addUint16', NumberType.UInt16),
  addUint32: generateNumericTupleFunc<t.AddUInt32Fn>('addUint32', NumberType.UInt32),
  addUint64: generateNumericTupleFunc<t.AddUInt64Fn>('addUint64', NumberType.UInt64),

  subFloat: generateNumericTupleFunc<t.SubFloatFn>('subFloat', NumberType.Float),
  subInt8: generateNumericTupleFunc<t.SubInt8Fn>('subInt8', NumberType.Int8),
  subInt16: generateNumericTupleFunc<t.SubInt16Fn>('subInt16', NumberType.Int16),
  subInt32: generateNumericTupleFunc<t.SubInt32Fn>('subInt32', NumberType.Int32),
  subInt64: generateNumericTupleFunc<t.SubInt64Fn>('subInt64', NumberType.Int64),
  subUint8: generateNumericTupleFunc<t.SubUInt8Fn>('subUint8', NumberType.UInt8),
  subUint16: generateNumericTupleFunc<t.SubUInt16Fn>('subUint16', NumberType.UInt16),
  subUint32: generateNumericTupleFunc<t.SubUInt32Fn>('subUint32', NumberType.UInt32),
  subUint64: generateNumericTupleFunc<t.SubUInt64Fn>('subUint64', NumberType.UInt64),

  divFloat: generateNumericTupleFunc<t.DivFloatFn>('divFloat', NumberType.Float),
  divInt8: generateNumericTupleFunc<t.DivInt8Fn>('divInt8', NumberType.Int8),
  divInt16: generateNumericTupleFunc<t.DivInt16Fn>('divInt16', NumberType.Int16),
  divInt32: generateNumericTupleFunc<t.DivInt32Fn>('divInt32', NumberType.Int32),
  divInt64: generateNumericTupleFunc<t.DivInt64Fn>('divInt64', NumberType.Int64),
  divUint8: generateNumericTupleFunc<t.DivUInt8Fn>('divUint8', NumberType.UInt8),
  divUint16: generateNumericTupleFunc<t.DivUInt16Fn>('divUint16', NumberType.UInt16),
  divUint32: generateNumericTupleFunc<t.DivUInt32Fn>('divUint32', NumberType.UInt32),
  divUint64: generateNumericTupleFunc<t.DivUInt64Fn>('divUint64', NumberType.UInt64),

  mulFloat: generateNumericTupleFunc<t.MulFloatFn>('mulFloat', NumberType.Float),
  mulInt8: generateNumericTupleFunc<t.MulInt8Fn>('mulInt8', NumberType.Int8),
  mulInt16: generateNumericTupleFunc<t.MulInt16Fn>('mulInt16', NumberType.Int16),
  mulInt32: generateNumericTupleFunc<t.MulInt32Fn>('mulInt32', NumberType.Int32),
  mulInt64: generateNumericTupleFunc<t.MulInt64Fn>('mulInt64', NumberType.Int64),
  mulUint8: generateNumericTupleFunc<t.MulUInt8Fn>('mulUint8', NumberType.UInt8),
  mulUint16: generateNumericTupleFunc<t.MulUInt16Fn>('mulUint16', NumberType.UInt16),
  mulUint32: generateNumericTupleFunc<t.MulUInt32Fn>('mulUint32', NumberType.UInt32),
  mulUint64: generateNumericTupleFunc<t.MulUInt64Fn>('mulUint64', NumberType.UInt64),

  ltFloat: generateNumericTupleFunc<t.LtFloatFn>('ltFloat', NumberType.Float),
  ltInt8: generateNumericTupleFunc<t.LtInt8Fn>('ltInt8', NumberType.Int8),
  ltInt16: generateNumericTupleFunc<t.LtInt16Fn>('ltInt16', NumberType.Int16),
  ltInt32: generateNumericTupleFunc<t.LtInt32Fn>('ltInt32', NumberType.Int32),
  ltInt64: generateNumericTupleFunc<t.LtInt64Fn>('ltInt64', NumberType.Int64),
  ltUint8: generateNumericTupleFunc<t.LtUInt8Fn>('ltUint8', NumberType.UInt8),
  ltUint16: generateNumericTupleFunc<t.LtUInt16Fn>('ltUint16', NumberType.UInt16),
  ltUint32: generateNumericTupleFunc<t.LtUInt32Fn>('ltUint32', NumberType.UInt32),
  ltUint64: generateNumericTupleFunc<t.LtUInt64Fn>('ltUint64', NumberType.UInt64),

  gtFloat: generateNumericTupleFunc<t.GtFloatFn>('gtFloat', NumberType.Float),
  gtInt8: generateNumericTupleFunc<t.GtInt8Fn>('gtInt8', NumberType.Int8),
  gtInt16: generateNumericTupleFunc<t.GtInt16Fn>('gtInt16', NumberType.Int16),
  gtInt32: generateNumericTupleFunc<t.GtInt32Fn>('gtInt32', NumberType.Int32),
  gtInt64: generateNumericTupleFunc<t.GtInt64Fn>('gtInt64', NumberType.Int64),
  gtUint8: generateNumericTupleFunc<t.GtUInt8Fn>('gtUint8', NumberType.UInt8),
  gtUint16: generateNumericTupleFunc<t.GtUInt16Fn>('gtUint16', NumberType.UInt16),
  gtUint32: generateNumericTupleFunc<t.GtUInt32Fn>('gtUint32', NumberType.UInt32),
  gtUint64: generateNumericTupleFunc<t.GtUInt64Fn>('gtUint64', NumberType.UInt64)
}
