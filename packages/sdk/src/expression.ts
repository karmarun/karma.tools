import * as t from './types'
import {ExpressionType as E} from './types'
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
    return {[E.Function]: [params, body]}
  }
}

export const func = new FunctionExpressionContext()

export class DataExpressionContext {
  public bool(value: boolean): t.BoolFn {
    return {[E.Bool]: value}
  }

  public dateTime(value: string | number | Date): t.DateTimeFn {
    if (typeof value === 'number' || typeof value === 'string') {
      value = new Date(value)
    }

    return {[E.DateTime]: value.toISOString()}
  }

  public string(value: string): t.StringFn {
    return {[E.String]: value}
  }

  public null(): t.NullFn {
    return {[E.Null]: null}
  }

  public symbol(value: string): t.SymbolFn {
    return {[E.Symbol]: value}
  }

  public int8(value: number): t.Int8Fn {
    return {[E.Int8]: value}
  }

  public int16(value: number): t.Int16Fn {
    return {[E.Int16]: value}
  }

  public int32(value: number): t.Int32Fn {
    return {[E.Int32]: value}
  }

  public int64(value: number): t.Int64Fn {
    return {[E.Int64]: value}
  }

  public uint8(value: number): t.UInt8Fn {
    return {[E.Uint8]: value}
  }

  public uint16(value: number): t.UInt16Fn {
    return {[E.Uint16]: value}
  }

  public uint32(value: number): t.UInt32Fn {
    return {[E.Uint32]: value}
  }

  public uint64(value: number): t.UInt64Fn {
    return {[E.Uint64]: value}
  }

  public float(value: number): t.FloatFn {
    return {[E.Float]: value}
  }

  public map(value: ObjectMap<t.DataExpression>): t.MapFn {
    return {[E.Map]: value}
  }

  public list(...value: t.DataExpression[]): t.ListFn {
    return {[E.List]: value}
  }

  public set(...value: t.DataExpression[]): t.SetFn {
    return {[E.Set]: value}
  }

  public struct(value: ObjectMap<t.DataExpression> = {}): t.StructFn {
    return {[E.Struct]: value}
  }

  public tuple(...value: t.DataExpression[]): t.TupleFn {
    return {[E.Tuple]: value}
  }

  public union(caseKey: string, value: t.DataExpression): t.UnionFn {
    return {[E.Union]: [caseKey, value]}
  }

  public ref(ref: t.Ref): t.RefFn {
    return {[E.Ref]: ref}
  }

  public expr(expr: t.Expression): t.ExprFn {
    return {[E.Expr]: expr}
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
    return {[E.Model]: id}
  }

  public modelOf(expr: t.Expression): t.ModelOfFn {
    return {[E.ModelOf]: expr}
  }

  public metarialize(record: t.Expression): t.MetarializeFn {
    return {[E.Metarialize]: record}
  }

  public zero(): t.ZeroFn {
    return {[E.Zero]: {}}
  }

  // Scope
  // -----

  public data(value: t.DataExpression): t.DataFn {
    return {[E.Data]: value}
  }

  public with(value: t.Expression, body: t.FunctionFn): t.WithFn {
    return {[E.With]: [value, body]}
  }

  public define(name: string, expr: t.Expression): t.DefineFn {
    return {[E.Define]: [name, expr]}
  }

  public scope(name: string): t.ScopeFn {
    return {[E.Scope]: name}
  }

  public signature(func: t.FunctionFn): t.SignatureFn {
    return {[E.Signature]: func}
  }

  // Date Time
  // ---------

  public after(valueA: t.DateExpression, valueB: t.DateExpression): t.AfterFn {
    return {[E.After]: [dataForDateExpression(valueA), dataForDateExpression(valueB)]}
  }

  public before(valueA: t.DateExpression, valueB: t.DateExpression): t.BeforeFn {
    return {[E.Before]: [dataForDateExpression(valueA), dataForDateExpression(valueB)]}
  }

  // String
  // ------

  public joinStrings(separator: t.Expression, strings: t.Expression): t.JoinStringsFn {
    return {[E.JoinStrings]: {separator, strings}}
  }

  public stringToLower(value: t.Expression): t.StringToLowerFn {
    return {[E.StringToLower]: value}
  }

  public matchRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.MatchRegexFn {
    return {[E.MatchRegex]: {regex, value, caseInsensitive, multiLine}}
  }

  public searchAllRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.SearchAllRegexFn {
    return {[E.SearchAllRegex]: {regex, value, caseInsensitive, multiLine}}
  }

  public searchRegex(
    regex: string,
    value: t.Expression,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): t.SearchRegexFn {
    return {[E.SearchRegex]: {regex, value, caseInsensitive, multiLine}}
  }

  public stringContains(value: t.Expression, search: t.Expression): t.StringContainsFn {
    return {[E.StringContains]: [value, search]}
  }

  public substringIndex(value: t.Expression, search: t.Expression): t.SubstringIndexFn {
    return {[E.SubstringIndex]: [value, search]}
  }

  // Enum
  // ----

  public mapEnum(value: t.Expression, mapping: ObjectMap<string>, fallback?: string): t.MapEnumFn {
    return {[E.MapEnum]: {symbol: value, mapping, default: fallback}}
  }

  // Optional
  // --------

  public isPresent(optional: t.Expression): t.IsPresentFn {
    return {[E.IsPresent]: optional}
  }

  // Set
  // ---

  public mapSet(value: t.Expression, mapper: t.FunctionFn): t.MapSetFn {
    return {[E.MapSet]: [value, mapper]}
  }

  // Map
  // ---

  public setKey(name: string, value: t.Expression, inMap: t.Expression): t.SetKeyFn {
    return {[E.SetKey]: {name, value, in: inMap}}
  }

  public mapMap(value: t.Expression, mapper: t.FunctionFn): t.MapMapFn {
    return {[E.MapMap]: [value, mapper]}
  }

  public key(name: t.StringExpression, value: t.Expression): t.KeyFn {
    return {[E.Key]: [dataForStringExpression(name), value]}
  }

  // Union
  // -----

  public isCase(value: t.Expression, caseKey: t.Expression): t.IsCaseFn {
    return {[E.IsCase]: {value, case: caseKey}}
  }

  // Tuple
  // -----

  public indexTuple(value: t.Expression, index: number): t.IndexTupleFn {
    return {[E.IndexTuple]: [value, index]}
  }

  // Struct
  // ------

  public extractStrings(value: t.Expression): t.ExtractStringsFn {
    return {[E.ExtractStrings]: value}
  }

  public field(name: string, value: t.Expression): t.FieldFn {
    return {[E.Field]: [name, value]}
  }

  public setField(name: string, value: t.Expression, inStruct: t.Expression): t.SetFieldFn {
    return {[E.SetField]: {name, value, in: inStruct}}
  }

  // List
  // ----

  public concatLists(valueA: t.Expression, valueB: t.Expression): t.ConcatListsFn {
    return {[E.ConcatLists]: [valueA, valueB]}
  }

  public filterList(value: t.Expression, filter: t.FunctionFn): t.FilterListFn {
    return {[E.FilterList]: [value, filter]}
  }

  public first(value: t.Expression): t.FirstFn {
    return {[E.First]: value}
  }

  public inList(inList: t.Expression, value: t.Expression): t.InListFn {
    return {[E.InList]: {value, in: inList}}
  }

  public mapList(value: t.Expression, mapper: t.FunctionFn): t.MapListFn {
    return {[E.MapList]: [value, mapper]}
  }

  public length(value: t.Expression): t.LengthFn {
    return {[E.Length]: value}
  }

  public memSort(value: t.Expression, sorter: t.FunctionFn): t.MemSortFn {
    return {[E.MemSort]: [value, sorter]}
  }

  public memSortFunction(value: t.Expression, sorter: t.FunctionFn): t.MemSortFunctionFn {
    return {[E.MemSortFunction]: [value, sorter]}
  }

  public reverseList(value: t.Expression): t.ReverseListFn {
    return {[E.ReverseList]: value}
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
    return {[E.ReduceList]: {value, initial, reducer}}
  }

  public leftFoldList(
    value: t.Expression,
    initial: t.Expression,
    folderFn: t.FunctionFn
  ): t.LeftFoldListFn {
    return {[E.LeftFoldList]: [value, initial, folderFn]}
  }

  public rightFoldList(
    value: t.Expression,
    initial: t.Expression,
    folderFn: t.FunctionFn
  ): t.RightFoldListFn {
    return {[E.RightFoldList]: [value, initial, folderFn]}
  }

  // User / Permission
  // -----------------

  public currentUser(): t.CurrentUserFn {
    return {[E.CurrentUser]: {}}
  }

  // Graph / Referential
  // -------------------

  public allReferrers(ref: t.Expression): t.AllReferrersFn {
    return {[E.AllReferrers]: ref}
  }

  public refTo(value: t.Expression): t.RefToFn {
    return {[E.RefTo]: value}
  }

  public referred(from: t.Expression, inRef: t.Expression): t.ReferredFn {
    return {[E.Referred]: {from, in: inRef}}
  }

  public referrers(of: t.Expression, inRef: t.Expression): t.ReferrersFn {
    return {[E.Referrers]: {of, in: inRef}}
  }

  public relocateRef(model: t.Expression, ref: t.Expression): t.RelocateRefFn {
    return {[E.RelocateRef]: {model, ref}}
  }

  public resolveRefs(value: t.Expression, models: t.Expression[]): t.ResolveRefsFn {
    return {[E.ResolveRefs]: [value, models]}
  }

  public resolveAllRefs(ref: t.Expression): t.ResolveAllRefsFn {
    return {[E.ResolveAllRefs]: ref}
  }

  public tag(value: t.StringExpression): t.TagFn {
    return {[E.Tag]: dataForStringExpression(value)}
  }

  public tagExists(value: t.StringExpression): t.TagExistsFn {
    return {[E.TagExists]: dataForStringExpression(value)}
  }

  public graphFlow(
    start: t.Expression,
    flow: {backward: t.Expression[]; forward: t.Expression[]; from: t.Expression}[]
  ): t.GraphFlowFn {
    return {[E.GraphFlow]: {start, flow}}
  }

  // CRUD
  // ----

  public all(ref: t.Expression): t.AllFn {
    return {[E.All]: ref}
  }

  public create(modelRef: t.Expression, func: t.FunctionFn): t.CreateFn {
    return {[E.Create]: [modelRef, func]}
  }

  public createMultiple(
    modelRef: t.Expression,
    funcs: ObjectMap<t.FunctionFn>
  ): t.CreateMultipleFn {
    return {[E.CreateMultiple]: [modelRef, funcs]}
  }

  public delete(ref: t.Expression): t.DeleteFn {
    return {[E.Delete]: ref}
  }

  public get(ref: t.Expression): t.GetFn {
    return {[E.Get]: ref}
  }

  public update(ref: t.Expression, value: t.Expression): t.UpdateFn {
    return {[E.Update]: {ref, value}}
  }

  // Logic
  // -----

  public and(...values: t.Expression[]): t.AndFn {
    return {[E.And]: values}
  }

  public or(...values: t.Expression[]): t.OrFn {
    return {[E.Or]: values}
  }

  public assertCase(caseKey: string, value: t.Expression): t.AssertCaseFn {
    return {[E.AssertCase]: {case: caseKey, value}}
  }

  public assertModelRef(ref: t.Expression, value: t.Expression): t.AssertModelRefFn {
    return {[E.AssertModelRef]: {ref, value}}
  }

  public assertPresent(value: t.Expression): t.AssertPresentFn {
    return {[E.AssertPresent]: value}
  }

  public equal(valueA: t.Expression, valueB: t.Expression): t.EqualFn {
    return {[E.Equal]: [valueA, valueB]}
  }

  public if(condition: t.Expression, then: t.Expression, els: t.Expression): t.IfFn {
    return {[E.If]: {condition, then, else: els}}
  }

  public not(value: t.Expression): t.NotFn {
    return {[E.Not]: value}
  }

  public presentOrZero(value: t.Expression): t.PresentOrZeroFn {
    return {[E.PresentOrZero]: value}
  }

  public switchCase(value: t.Expression, cases: ObjectMap<t.FunctionFn>): t.SwitchCaseFn {
    return {[E.SwitchCase]: [value, cases]}
  }

  public switchModelRef(
    value: t.Expression,
    defaultValue: t.Expression,
    cases: {match: t.Expression; return: t.FunctionExpression}[]
  ): t.SwitchModelRefFn {
    return {[E.SwitchModelRef]: {value, default: defaultValue, cases}}
  }

  // Numeric
  // -------

  public toFloat(value: t.Expression): t.ToFloatFn {
    return {[E.ToFloat]: value}
  }

  public toInt8(value: t.Expression): t.ToInt8Fn {
    return {[E.ToInt8]: value}
  }

  public toInt16(value: t.Expression): t.ToInt16Fn {
    return {[E.ToInt16]: value}
  }

  public toInt32(value: t.Expression): t.ToInt32Fn {
    return {[E.ToInt32]: value}
  }

  public toInt64(value: t.Expression): t.ToInt64Fn {
    return {[E.ToInt64]: value}
  }

  public toUint8(value: t.Expression): t.ToUint8Fn {
    return {[E.ToUint8]: value}
  }

  public toUint16(value: t.Expression): t.ToUint16Fn {
    return {[E.ToUint16]: value}
  }

  public toUint32(value: t.Expression): t.ToUint32Fn {
    return {[E.ToUint32]: value}
  }

  public toUint64(value: t.Expression): t.ToUint64Fn {
    return {[E.ToUint64]: value}
  }

  public addFloat = generateNumericTupleFunc<t.AddFloatFn>(E.AddFloat, NumberType.Float)
  public addInt8 = generateNumericTupleFunc<t.AddInt8Fn>(E.AddInt8, NumberType.Int8)
  public addInt16 = generateNumericTupleFunc<t.AddInt16Fn>(E.AddInt16, NumberType.Int16)
  public addInt32 = generateNumericTupleFunc<t.AddInt32Fn>(E.AddInt32, NumberType.Int32)
  public addInt64 = generateNumericTupleFunc<t.AddInt64Fn>(E.AddInt64, NumberType.Int64)
  public addUint8 = generateNumericTupleFunc<t.AddUInt8Fn>(E.AddUint8, NumberType.UInt8)
  public addUint16 = generateNumericTupleFunc<t.AddUInt16Fn>(E.AddUint16, NumberType.UInt16)
  public addUint32 = generateNumericTupleFunc<t.AddUInt32Fn>(E.AddUint32, NumberType.UInt32)
  public addUint64 = generateNumericTupleFunc<t.AddUInt64Fn>(E.AddUint64, NumberType.UInt64)

  public subFloat = generateNumericTupleFunc<t.SubFloatFn>(E.SubFloat, NumberType.Float)
  public subInt8 = generateNumericTupleFunc<t.SubInt8Fn>(E.SubInt8, NumberType.Int8)
  public subInt16 = generateNumericTupleFunc<t.SubInt16Fn>(E.SubInt16, NumberType.Int16)
  public subInt32 = generateNumericTupleFunc<t.SubInt32Fn>(E.SubInt32, NumberType.Int32)
  public subInt64 = generateNumericTupleFunc<t.SubInt64Fn>(E.SubInt64, NumberType.Int64)
  public subUint8 = generateNumericTupleFunc<t.SubUInt8Fn>(E.SubUint8, NumberType.UInt8)
  public subUint16 = generateNumericTupleFunc<t.SubUInt16Fn>(E.SubUint16, NumberType.UInt16)
  public subUint32 = generateNumericTupleFunc<t.SubUInt32Fn>(E.SubUint32, NumberType.UInt32)
  public subUint64 = generateNumericTupleFunc<t.SubUInt64Fn>(E.SubUint64, NumberType.UInt64)

  public divFloat = generateNumericTupleFunc<t.DivFloatFn>(E.DivFloat, NumberType.Float)
  public divInt8 = generateNumericTupleFunc<t.DivInt8Fn>(E.DivInt8, NumberType.Int8)
  public divInt16 = generateNumericTupleFunc<t.DivInt16Fn>(E.DivInt16, NumberType.Int16)
  public divInt32 = generateNumericTupleFunc<t.DivInt32Fn>(E.DivInt32, NumberType.Int32)
  public divInt64 = generateNumericTupleFunc<t.DivInt64Fn>(E.DivInt64, NumberType.Int64)
  public divUint8 = generateNumericTupleFunc<t.DivUInt8Fn>(E.DivUint8, NumberType.UInt8)
  public divUint16 = generateNumericTupleFunc<t.DivUInt16Fn>(E.DivUint16, NumberType.UInt16)
  public divUint32 = generateNumericTupleFunc<t.DivUInt32Fn>(E.DivUint32, NumberType.UInt32)
  public divUint64 = generateNumericTupleFunc<t.DivUInt64Fn>(E.DivUint64, NumberType.UInt64)

  public mulFloat = generateNumericTupleFunc<t.MulFloatFn>(E.MulFloat, NumberType.Float)
  public mulInt8 = generateNumericTupleFunc<t.MulInt8Fn>(E.MulInt8, NumberType.Int8)
  public mulInt16 = generateNumericTupleFunc<t.MulInt16Fn>(E.MulInt16, NumberType.Int16)
  public mulInt32 = generateNumericTupleFunc<t.MulInt32Fn>(E.MulInt32, NumberType.Int32)
  public mulInt64 = generateNumericTupleFunc<t.MulInt64Fn>(E.MulInt64, NumberType.Int64)
  public mulUint8 = generateNumericTupleFunc<t.MulUInt8Fn>(E.MulUint8, NumberType.UInt8)
  public mulUint16 = generateNumericTupleFunc<t.MulUInt16Fn>(E.MulUint16, NumberType.UInt16)
  public mulUint32 = generateNumericTupleFunc<t.MulUInt32Fn>(E.MulUint32, NumberType.UInt32)
  public mulUint64 = generateNumericTupleFunc<t.MulUInt64Fn>(E.MulUint64, NumberType.UInt64)

  public ltFloat = generateNumericTupleFunc<t.LtFloatFn>(E.LtFloat, NumberType.Float)
  public ltInt8 = generateNumericTupleFunc<t.LtInt8Fn>(E.LtInt8, NumberType.Int8)
  public ltInt16 = generateNumericTupleFunc<t.LtInt16Fn>(E.LtInt16, NumberType.Int16)
  public ltInt32 = generateNumericTupleFunc<t.LtInt32Fn>(E.LtInt32, NumberType.Int32)
  public ltInt64 = generateNumericTupleFunc<t.LtInt64Fn>(E.LtInt64, NumberType.Int64)
  public ltUint8 = generateNumericTupleFunc<t.LtUInt8Fn>(E.LtUint8, NumberType.UInt8)
  public ltUint16 = generateNumericTupleFunc<t.LtUInt16Fn>(E.LtUint16, NumberType.UInt16)
  public ltUint32 = generateNumericTupleFunc<t.LtUInt32Fn>(E.LtUint32, NumberType.UInt32)
  public ltUint64 = generateNumericTupleFunc<t.LtUInt64Fn>(E.LtUint64, NumberType.UInt64)

  public gtFloat = generateNumericTupleFunc<t.GtFloatFn>(E.GtFloat, NumberType.Float)
  public gtInt8 = generateNumericTupleFunc<t.GtInt8Fn>(E.GtInt8, NumberType.Int8)
  public gtInt16 = generateNumericTupleFunc<t.GtInt16Fn>(E.GtInt16, NumberType.Int16)
  public gtInt32 = generateNumericTupleFunc<t.GtInt32Fn>(E.GtInt32, NumberType.Int32)
  public gtInt64 = generateNumericTupleFunc<t.GtInt64Fn>(E.GtInt64, NumberType.Int64)
  public gtUint8 = generateNumericTupleFunc<t.GtUInt8Fn>(E.GtUint8, NumberType.UInt8)
  public gtUint16 = generateNumericTupleFunc<t.GtUInt16Fn>(E.GtUint16, NumberType.UInt16)
  public gtUint32 = generateNumericTupleFunc<t.GtUInt32Fn>(E.GtUint32, NumberType.UInt32)
  public gtUint64 = generateNumericTupleFunc<t.GtUInt64Fn>(E.GtUint64, NumberType.UInt64)
}

export const expression = new ExpressionContext()
