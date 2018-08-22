import * as t from './types'
import {ObjectMap} from './internal'

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

export class FunctionExpressionContext {
  public function<P extends string[] = string[]>(params: P, ...body: t.Expression[]): t.FunctionFn {
    return {function: [params, body]}
  }
}

export const func = new FunctionExpressionContext()

export class DataExpressionContext {
  public bool(value: boolean): t.BoolFn {
    return {bool: value}
  }

  public dateTime(value: string | number | Date): t.DateTimeFn {
    if (typeof value === 'number' || typeof value === 'string') {
      value = new Date(value)
    }

    return {dateTime: value.toISOString()}
  }

  public string(value: string): t.StringFn {
    return {string: value}
  }

  public null(): t.NullFn {
    return {null: null}
  }

  public symbol(value: string): t.SymbolFn {
    return {symbol: value}
  }

  public int8(value: number): t.Int8Fn {
    return {int8: value}
  }

  public int16(value: number): t.Int16Fn {
    return {int16: value}
  }

  public int32(value: number): t.Int32Fn {
    return {int32: value}
  }

  public int64(value: number): t.Int64Fn {
    return {int64: value}
  }

  public uint8(value: number): t.UInt8Fn {
    return {uint8: value}
  }

  public uint16(value: number): t.UInt16Fn {
    return {uint16: value}
  }

  public uint32(value: number): t.UInt32Fn {
    return {uint32: value}
  }

  public uint64(value: number): t.UInt64Fn {
    return {uint64: value}
  }

  public float(value: number): t.FloatFn {
    return {float: value}
  }

  public map(value: ObjectMap<t.DataExpression>): t.MapFn {
    return {map: value}
  }

  public list(...value: t.DataExpression[]): t.ListFn {
    return {list: value}
  }

  public set(...value: t.DataExpression[]): t.SetFn {
    return {set: value}
  }

  public struct(value: ObjectMap<t.DataExpression | undefined> = {}): t.StructFn {
    return {struct: value}
  }

  public tuple(...value: t.DataExpression[]): t.TupleFn {
    return {tuple: value}
  }

  public union(caseKey: string, value: t.DataExpression): t.UnionFn {
    return {union: [caseKey, value]}
  }

  public ref(ref: t.Ref): t.RefFn {
    return {ref}
  }

  public expr(expr: t.Expression): t.ExprFn {
    return {expr}
  }
}

export const data = new DataExpressionContext()

export class ExpressionContext {
  // Convinience Primitives
  // ======================

  public bool = data.bool
  public dateTime = data.dateTime
  public string = data.string
  public null = data.null
  public symbol = data.symbol
  public int8 = data.int8
  public int16 = data.int16
  public int32 = data.int32
  public int64 = data.int64
  public uint8 = data.uint8
  public uint16 = data.uint16
  public uint32 = data.uint32
  public uint64 = data.uint64
  public float = data.float

  // Expression Scope
  // ================

  // Other
  // -----

  public model(id: t.Expression): t.ModelFn {
    return {model: id}
  }

  public modelOf(expr: t.Expression): t.ModelOfFn {
    return {modelOf: expr}
  }

  public metarialize(record: t.Expression): t.MetarializeFn {
    return {metarialize: record}
  }

  public zero(): t.ZeroFn {
    return {zero: {}}
  }

  // Scope
  // -----

  public data(value: t.DataExpression): t.DataFn {
    return {data: value}
  }

  public with(value: t.Expression, body: t.FunctionFn): t.WithFn {
    return {with: [value, body]}
  }

  public define(name: string, expr: t.Expression): t.DefineFn {
    return {define: [name, expr]}
  }

  public scope(name: string): t.ScopeFn {
    return {scope: name}
  }

  public signature(func: t.FunctionFn): t.SignatureFn {
    return {signature: func}
  }

  // Date Time
  // ---------

  public after(valueA: t.DateExpression, valueB: t.DateExpression): t.AfterFn {
    return {after: [dataForDateExpression(valueA), dataForDateExpression(valueB)]}
  }

  public before(valueA: t.DateExpression, valueB: t.DateExpression): t.BeforeFn {
    return {before: [dataForDateExpression(valueA), dataForDateExpression(valueB)]}
  }

  // String
  // ------

  public joinStrings(separator: t.Expression, strings: t.Expression): t.JoinStringsFn {
    return {joinStrings: {separator, strings}}
  }

  public stringToLower(value: t.Expression): t.StringToLowerFn {
    return {stringToLower: value}
  }

  public matchRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.MatchRegexFn {
    return {matchRegex: {regex, value, caseInsensitive, multiLine}}
  }

  public searchAllRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.SearchAllRegexFn {
    return {searchAllRegex: {regex, value, caseInsensitive, multiLine}}
  }

  public searchRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.SearchRegexFn {
    return {searchRegex: {regex, value, caseInsensitive, multiLine}}
  }

  public stringContains(value: t.Expression, search: t.Expression): t.StringContainsFn {
    return {stringContains: [value, search]}
  }

  public substringIndex(value: t.Expression, search: t.Expression): t.SubstringIndexFn {
    return {substringIndex: [value, search]}
  }

  // Optional
  // --------

  public isPresent(optional: t.Expression): t.IsPresentFn {
    return {isPresent: optional}
  }

  // Set
  // ---

  public mapSet(value: t.Expression, mapper: t.FunctionFn): t.MapSetFn {
    return {mapSet: [value, mapper]}
  }

  // Map
  // ---

  public setKey(name: string, value: t.Expression, inMap: t.Expression): t.SetKeyFn {
    return {setKey: {name, value, in: inMap}}
  }

  public mapMap(value: t.Expression, mapper: t.FunctionFn): t.MapMapFn {
    return {mapMap: [value, mapper]}
  }

  public key(name: t.StringExpression, value: t.Expression): t.KeyFn {
    return {key: [dataForStringExpression(name), value]}
  }

  // Union
  // -----

  public isCase(value: t.Expression, caseKey: t.Expression): t.IsCaseFn {
    return {isCase: {value, case: caseKey}}
  }

  // Tuple
  // -----

  public indexTuple(value: t.Expression, index: number): t.IndexTupleFn {
    return {indexTuple: [value, index]}
  }

  // Struct
  // ------

  public extractStrings(value: t.Expression): t.ExtractStringsFn {
    return {extractStrings: value}
  }

  public field(name: string, value: t.Expression): t.FieldFn {
    return {field: [name, value]}
  }

  public setField(name: string, value: t.Expression, inStruct: t.Expression): t.SetFieldFn {
    return {setField: {name, value, in: inStruct}}
  }

  // List
  // ----

  public concatLists(valueA: t.Expression, valueB: t.Expression): t.ConcatListsFn {
    return {concatLists: [valueA, valueB]}
  }

  public filterList(value: t.Expression, filter: t.FunctionFn): t.FilterListFn {
    return {filterList: [value, filter]}
  }

  public first(value: t.Expression): t.FirstFn {
    return {first: value}
  }

  public inList(inList: t.Expression, value: t.Expression): t.InListFn {
    return {inList: {value, in: inList}}
  }

  public mapList(value: t.Expression, mapper: t.FunctionFn): t.MapListFn {
    return {mapList: [value, mapper]}
  }

  public length(value: t.Expression): t.LengthFn {
    return {length: value}
  }

  public memSort(value: t.Expression, sorter: t.FunctionFn): t.MemSortFn {
    return {memSort: [value, sorter]}
  }

  public memSortFunction(value: t.Expression, sorter: t.FunctionFn): t.MemSortFunctionFn {
    return {memSortFunction: [value, sorter]}
  }

  public reverseList(value: t.Expression): t.ReverseListFn {
    return {reverseList: value}
  }

  public slice(
    value: t.Expression,
    offset: t.NumberExpression,
    length: t.NumberExpression
  ): t.SliceFn {
    return {
      slice: {
        value,
        offset: dataForNumberExpression(offset, NumberType.Int64),
        length: dataForNumberExpression(length, NumberType.Int64)
      }
    }
  }

  public reduceList(
    value: t.Expression,
    initial: t.Expression,
    reducer: t.FunctionFn
  ): t.ReduceListFn {
    return {reduceList: {value, initial, reducer}}
  }

  public leftFoldList(
    value: t.Expression,
    initial: t.Expression,
    folderFn: t.FunctionFn
  ): t.LeftFoldListFn {
    return {leftFoldList: [value, initial, folderFn]}
  }

  public rightFoldList(
    value: t.Expression,
    initial: t.Expression,
    folderFn: t.FunctionFn
  ): t.RightFoldListFn {
    return {rightFoldList: [value, initial, folderFn]}
  }

  // User / Permission
  // -----------------

  public currentUser(): t.CurrentUserFn {
    return {currentUser: {}}
  }

  // Graph / Referential
  // -------------------

  public allReferrers(ref: t.Expression): t.AllReferrersFn {
    return {allReferrers: ref}
  }

  public refTo(value: t.Expression): t.RefToFn {
    return {refTo: value}
  }

  public referred(from: t.Expression, inRef: t.Expression): t.ReferredFn {
    return {referred: {from, in: inRef}}
  }

  public referrers(of: t.Expression, inRef: t.Expression): t.ReferrersFn {
    return {referrers: {of, in: inRef}}
  }

  public relocateRef(model: t.Expression, ref: t.Expression): t.RelocateRefFn {
    return {relocateRef: {model, ref}}
  }

  public resolveRefs(value: t.Expression, models: t.Expression[]): t.ResolveRefsFn {
    return {resolveRefs: [value, models]}
  }

  public resolveAllRefs(ref: t.Expression): t.ResolveAllRefsFn {
    return {resolveAllRefs: ref}
  }

  public tag(value: t.StringExpression): t.TagFn {
    return {tag: dataForStringExpression(value)}
  }

  public tagExists(value: t.StringExpression): t.TagExistsFn {
    return {tagExists: dataForStringExpression(value)}
  }

  public graphFlow(
    start: t.Expression,
    flow: {backward: t.Expression[]; forward: t.Expression[]; from: t.Expression}[]
  ): t.GraphFlowFn {
    return {graphFlow: {start, flow}}
  }

  // CRUD
  // ----

  public all(ref: t.Expression): t.AllFn {
    return {all: ref}
  }

  public create(modelRef: t.Expression, func: t.FunctionFn): t.CreateFn {
    return {create: [modelRef, func]}
  }

  public createMultiple(
    modelRef: t.Expression,
    funcs: ObjectMap<t.FunctionFn>
  ): t.CreateMultipleFn {
    return {createMultiple: [modelRef, funcs]}
  }

  public delete(ref: t.Expression): t.DeleteFn {
    return {delete: ref}
  }

  public get(ref: t.Expression): t.GetFn {
    return {get: ref}
  }

  public update(ref: t.Expression, value: t.Expression): t.UpdateFn {
    return {update: {ref, value}}
  }

  // Logic
  // -----

  public and(...values: t.Expression[]): t.AndFn {
    return {and: values}
  }

  public or(...values: t.Expression[]): t.OrFn {
    return {or: values}
  }

  public assertCase(caseKey: string, value: t.Expression): t.AssertCaseFn {
    return {assertCase: {case: caseKey, value}}
  }

  public assertModelRef(ref: t.Expression, value: t.Expression): t.AssertModelRefFn {
    return {assertModelRef: {ref, value}}
  }

  public assertPresent(value: t.Expression): t.AssertPresentFn {
    return {assertPresent: value}
  }

  public equal(valueA: t.Expression, valueB: t.Expression): t.EqualFn {
    return {equal: [valueA, valueB]}
  }

  public if(condition: t.Expression, then: t.Expression, els: t.Expression): t.IfFn {
    return {if: {condition, then, else: els}}
  }

  public not(value: t.Expression): t.NotFn {
    return {not: value}
  }

  public presentOrZero(value: t.Expression): t.PresentOrZeroFn {
    return {presentOrZero: value}
  }

  public switchCase(value: t.Expression, cases: ObjectMap<t.FunctionFn>): t.SwitchCaseFn {
    return {switchCase: [value, cases]}
  }

  public switchModelRef(
    value: t.Expression,
    defaultValue: t.Expression,
    cases: {match: t.Expression; return: t.Expression}[]
  ): t.SwitchModelRefFn {
    return {switchModelRef: {value, default: defaultValue, cases}}
  }

  // Numeric
  // -------

  public floatToInt(value: t.NumberExpression): t.FloatToIntFn {
    return {floatToInt: dataForNumberExpression(value, NumberType.Float)}
  }

  public intToFloat(value: t.NumberExpression): t.IntToFloatFn {
    return {intToFloat: dataForNumberExpression(value, NumberType.Int64)}
  }

  public addFloat = generateNumericTupleFunc<t.AddFloatFn>('addFloat', NumberType.Float)
  public addInt8 = generateNumericTupleFunc<t.AddInt8Fn>('addInt8', NumberType.Int8)
  public addInt16 = generateNumericTupleFunc<t.AddInt16Fn>('addInt16', NumberType.Int16)
  public addInt32 = generateNumericTupleFunc<t.AddInt32Fn>('addInt32', NumberType.Int32)
  public addInt64 = generateNumericTupleFunc<t.AddInt64Fn>('addInt64', NumberType.Int64)
  public addUint8 = generateNumericTupleFunc<t.AddUInt8Fn>('addUint8', NumberType.UInt8)
  public addUint16 = generateNumericTupleFunc<t.AddUInt16Fn>('addUint16', NumberType.UInt16)
  public addUint32 = generateNumericTupleFunc<t.AddUInt32Fn>('addUint32', NumberType.UInt32)
  public addUint64 = generateNumericTupleFunc<t.AddUInt64Fn>('addUint64', NumberType.UInt64)
  public subFloat = generateNumericTupleFunc<t.SubFloatFn>('subFloat', NumberType.Float)
  public subInt8 = generateNumericTupleFunc<t.SubInt8Fn>('subInt8', NumberType.Int8)
  public subInt16 = generateNumericTupleFunc<t.SubInt16Fn>('subInt16', NumberType.Int16)
  public subInt32 = generateNumericTupleFunc<t.SubInt32Fn>('subInt32', NumberType.Int32)
  public subInt64 = generateNumericTupleFunc<t.SubInt64Fn>('subInt64', NumberType.Int64)
  public subUint8 = generateNumericTupleFunc<t.SubUInt8Fn>('subUint8', NumberType.UInt8)
  public subUint16 = generateNumericTupleFunc<t.SubUInt16Fn>('subUint16', NumberType.UInt16)
  public subUint32 = generateNumericTupleFunc<t.SubUInt32Fn>('subUint32', NumberType.UInt32)
  public subUint64 = generateNumericTupleFunc<t.SubUInt64Fn>('subUint64', NumberType.UInt64)
  public divFloat = generateNumericTupleFunc<t.DivFloatFn>('divFloat', NumberType.Float)
  public divInt8 = generateNumericTupleFunc<t.DivInt8Fn>('divInt8', NumberType.Int8)
  public divInt16 = generateNumericTupleFunc<t.DivInt16Fn>('divInt16', NumberType.Int16)
  public divInt32 = generateNumericTupleFunc<t.DivInt32Fn>('divInt32', NumberType.Int32)
  public divInt64 = generateNumericTupleFunc<t.DivInt64Fn>('divInt64', NumberType.Int64)
  public divUint8 = generateNumericTupleFunc<t.DivUInt8Fn>('divUint8', NumberType.UInt8)
  public divUint16 = generateNumericTupleFunc<t.DivUInt16Fn>('divUint16', NumberType.UInt16)
  public divUint32 = generateNumericTupleFunc<t.DivUInt32Fn>('divUint32', NumberType.UInt32)
  public divUint64 = generateNumericTupleFunc<t.DivUInt64Fn>('divUint64', NumberType.UInt64)
  public mulFloat = generateNumericTupleFunc<t.MulFloatFn>('mulFloat', NumberType.Float)
  public mulInt8 = generateNumericTupleFunc<t.MulInt8Fn>('mulInt8', NumberType.Int8)
  public mulInt16 = generateNumericTupleFunc<t.MulInt16Fn>('mulInt16', NumberType.Int16)
  public mulInt32 = generateNumericTupleFunc<t.MulInt32Fn>('mulInt32', NumberType.Int32)
  public mulInt64 = generateNumericTupleFunc<t.MulInt64Fn>('mulInt64', NumberType.Int64)
  public mulUint8 = generateNumericTupleFunc<t.MulUInt8Fn>('mulUint8', NumberType.UInt8)
  public mulUint16 = generateNumericTupleFunc<t.MulUInt16Fn>('mulUint16', NumberType.UInt16)
  public mulUint32 = generateNumericTupleFunc<t.MulUInt32Fn>('mulUint32', NumberType.UInt32)
  public mulUint64 = generateNumericTupleFunc<t.MulUInt64Fn>('mulUint64', NumberType.UInt64)
  public ltFloat = generateNumericTupleFunc<t.LtFloatFn>('ltFloat', NumberType.Float)
  public ltInt8 = generateNumericTupleFunc<t.LtInt8Fn>('ltInt8', NumberType.Int8)
  public ltInt16 = generateNumericTupleFunc<t.LtInt16Fn>('ltInt16', NumberType.Int16)
  public ltInt32 = generateNumericTupleFunc<t.LtInt32Fn>('ltInt32', NumberType.Int32)
  public ltInt64 = generateNumericTupleFunc<t.LtInt64Fn>('ltInt64', NumberType.Int64)
  public ltUint8 = generateNumericTupleFunc<t.LtUInt8Fn>('ltUint8', NumberType.UInt8)
  public ltUint16 = generateNumericTupleFunc<t.LtUInt16Fn>('ltUint16', NumberType.UInt16)
  public ltUint32 = generateNumericTupleFunc<t.LtUInt32Fn>('ltUint32', NumberType.UInt32)
  public ltUint64 = generateNumericTupleFunc<t.LtUInt64Fn>('ltUint64', NumberType.UInt64)
  public gtFloat = generateNumericTupleFunc<t.GtFloatFn>('gtFloat', NumberType.Float)
  public gtInt8 = generateNumericTupleFunc<t.GtInt8Fn>('gtInt8', NumberType.Int8)
  public gtInt16 = generateNumericTupleFunc<t.GtInt16Fn>('gtInt16', NumberType.Int16)
  public gtInt32 = generateNumericTupleFunc<t.GtInt32Fn>('gtInt32', NumberType.Int32)
  public gtInt64 = generateNumericTupleFunc<t.GtInt64Fn>('gtInt64', NumberType.Int64)
  public gtUint8 = generateNumericTupleFunc<t.GtUInt8Fn>('gtUint8', NumberType.UInt8)
  public gtUint16 = generateNumericTupleFunc<t.GtUInt16Fn>('gtUint16', NumberType.UInt16)
  public gtUint32 = generateNumericTupleFunc<t.GtUInt32Fn>('gtUint32', NumberType.UInt32)
  public gtUint64 = generateNumericTupleFunc<t.GtUInt64Fn>('gtUint64', NumberType.UInt64)
}

export const expression = new ExpressionContext()
