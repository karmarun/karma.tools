import {
  DataExpression,
  ExpressionType,
  AssertCaseFn,
  AssertModelRefFn,
  IfFn,
  SwitchModelRefFn,
  FunctionFn,
  UpdateFn,
  ReferredFn,
  ReferrersFn,
  RelocateRefFn,
  GraphFlowFn,
  InListFn,
  SliceFn,
  ReduceListFn,
  AnyExpression,
  FieldFn,
  SetFieldFn,
  IndexTupleFn,
  IsCaseFn,
  SetKeyFn,
  JoinStringsFn,
  MatchRegexFn,
  RefFn,
  MapFn,
  StructFn,
  UnionFn
} from './types'

import {data as d} from './expression'
import {mapObject, ObjectMap} from './internal'

export function createTypedExpression(expression: AnyExpression): DataExpression {
  const type = Object.keys(expression)[0] as ExpressionType
  const value = (expression as any)[type]

  switch (type) {
    case ExpressionType.Bool:
      return d.union(type, d.bool(value))

    case ExpressionType.DateTime:
      return d.union(type, d.dateTime(value))

    case ExpressionType.String:
      return d.union(type, d.string(value))

    case ExpressionType.Float:
      return d.union(type, d.float(value))

    case ExpressionType.Int8:
      return d.union(type, d.int8(value))

    case ExpressionType.Int16:
      return d.union(type, d.int16(value))

    case ExpressionType.Int32:
      return d.union(type, d.int32(value))

    case ExpressionType.Int64:
      return d.union(type, d.int64(value))

    case ExpressionType.Uint8:
      return d.union(type, d.uint8(value))

    case ExpressionType.Uint16:
      return d.union(type, d.uint16(value))

    case ExpressionType.Uint32:
      return d.union(type, d.uint32(value))

    case ExpressionType.Uint64:
      return d.union(type, d.uint64(value))

    case ExpressionType.Null:
      return d.union(type, d.null())

    case ExpressionType.Symbol:
      return d.union(type, d.string(value))

    case ExpressionType.Ref:
      const refValue = value as RefFn[ExpressionType.Ref]
      return d.union(type, d.tuple(d.string(refValue[0]), d.string(refValue[1])))

    case ExpressionType.Set:
    case ExpressionType.Tuple:
      const arrayValue = value as AnyExpression[]
      return d.union(type, d.set(...arrayValue.map(value => createTypedExpression(value))))

    case ExpressionType.Map:
      const mapValue = value as MapFn[ExpressionType.Map]
      return d.union(type, d.map(mapObject(mapValue, value => createTypedExpression(value))))

    case ExpressionType.Struct:
      const structValue = value as StructFn[ExpressionType.Struct]
      return d.union(type, d.map(mapObject(structValue, value => createTypedExpression(value))))

    case ExpressionType.Union:
      const unionValue = value as UnionFn[ExpressionType.Union]
      return d.union(type, d.tuple(d.string(unionValue[0]), createTypedExpression(unionValue[1])))

    case ExpressionType.ToFloat:
    case ExpressionType.ToInt8:
    case ExpressionType.ToInt16:
    case ExpressionType.ToInt32:
    case ExpressionType.ToInt64:
    case ExpressionType.ToUint8:
    case ExpressionType.ToUint16:
    case ExpressionType.ToUint32:
    case ExpressionType.ToUint64:
    case ExpressionType.AssertPresent:
    case ExpressionType.Not:
    case ExpressionType.All:
    case ExpressionType.Delete:
    case ExpressionType.Get:
    case ExpressionType.AllReferrers:
    case ExpressionType.RefTo:
    case ExpressionType.ResolveAllRefs:
    case ExpressionType.ResolveRefs:
    case ExpressionType.Tag:
    case ExpressionType.TagExists:
    case ExpressionType.First:
    case ExpressionType.Length:
    case ExpressionType.ReverseList:
    case ExpressionType.ExtractStrings:
    case ExpressionType.IsPresent:
    case ExpressionType.PresentOrZero:
    case ExpressionType.StringToLower:
    case ExpressionType.Data:
    case ExpressionType.Signature:
    case ExpressionType.Model:
    case ExpressionType.ModelOf:
    case ExpressionType.Metarialize:
    case ExpressionType.Expr:
      return d.union(type, createTypedExpression(value))

    case ExpressionType.AddFloat:
    case ExpressionType.AddInt8:
    case ExpressionType.AddInt16:
    case ExpressionType.AddInt32:
    case ExpressionType.AddInt64:
    case ExpressionType.AddUint8:
    case ExpressionType.AddUint16:
    case ExpressionType.AddUint32:
    case ExpressionType.AddUint64:
    case ExpressionType.SubFloat:
    case ExpressionType.SubInt8:
    case ExpressionType.SubInt16:
    case ExpressionType.SubInt32:
    case ExpressionType.SubInt64:
    case ExpressionType.SubUint8:
    case ExpressionType.SubUint16:
    case ExpressionType.SubUint32:
    case ExpressionType.SubUint64:
    case ExpressionType.DivFloat:
    case ExpressionType.DivInt8:
    case ExpressionType.DivInt16:
    case ExpressionType.DivInt32:
    case ExpressionType.DivInt64:
    case ExpressionType.DivUint8:
    case ExpressionType.DivUint16:
    case ExpressionType.DivUint32:
    case ExpressionType.DivUint64:
    case ExpressionType.MulFloat:
    case ExpressionType.MulInt8:
    case ExpressionType.MulInt16:
    case ExpressionType.MulInt32:
    case ExpressionType.MulInt64:
    case ExpressionType.MulUint8:
    case ExpressionType.MulUint16:
    case ExpressionType.MulUint32:
    case ExpressionType.MulUint64:
    case ExpressionType.LtFloat:
    case ExpressionType.LtInt8:
    case ExpressionType.LtInt16:
    case ExpressionType.LtInt32:
    case ExpressionType.LtInt64:
    case ExpressionType.LtUint8:
    case ExpressionType.LtUint16:
    case ExpressionType.LtUint32:
    case ExpressionType.LtUint64:
    case ExpressionType.GtFloat:
    case ExpressionType.GtInt8:
    case ExpressionType.GtInt16:
    case ExpressionType.GtInt32:
    case ExpressionType.GtInt64:
    case ExpressionType.GtUint8:
    case ExpressionType.GtUint16:
    case ExpressionType.GtUint32:
    case ExpressionType.GtUint64:
    case ExpressionType.Equal:
    case ExpressionType.Create:
    case ExpressionType.ConcatLists:
    case ExpressionType.FilterList:
    case ExpressionType.MapList:
    case ExpressionType.MemSort:
    case ExpressionType.MemSortFunction:
    case ExpressionType.Key:
    case ExpressionType.MapMap:
    case ExpressionType.MapSet:
    case ExpressionType.StringContains:
    case ExpressionType.SubstringIndex:
    case ExpressionType.After:
    case ExpressionType.Before:
    case ExpressionType.With:
      const valuePair = value as [AnyExpression, AnyExpression]

      return d.union(
        type,
        d.tuple(createTypedExpression(valuePair[0]), createTypedExpression(valuePair[1]))
      )

    case ExpressionType.List:
    case ExpressionType.And:
    case ExpressionType.Or:
      const listValue = value as AnyExpression[]
      return d.union(type, d.list(...listValue.map(value => createTypedExpression(value))))

    case ExpressionType.AssertCase:
      const assertCaseValue = value as AssertCaseFn[ExpressionType.AssertCase]

      return d.union(
        type,
        d.struct({
          case: d.string(assertCaseValue.case),
          value: createTypedExpression(assertCaseValue.value)
        })
      )

    case ExpressionType.AssertModelRef:
      const assertModelRefValue = value as AssertModelRefFn[ExpressionType.AssertModelRef]

      return d.union(
        type,
        d.struct({
          ref: createTypedExpression(assertModelRefValue.ref),
          value: createTypedExpression(assertModelRefValue.value)
        })
      )

    case ExpressionType.If:
      const ifValue = value as IfFn[ExpressionType.If]

      return d.union(
        type,
        d.struct({
          condition: createTypedExpression(ifValue.condition),
          then: createTypedExpression(ifValue.then),
          else: createTypedExpression(ifValue.else)
        })
      )

    case ExpressionType.SwitchCase:
    case ExpressionType.CreateMultiple:
      const tupleMapValue = value as [AnyExpression, ObjectMap<FunctionFn>]

      return d.union(
        type,
        d.tuple(
          createTypedExpression(tupleMapValue[0]),
          d.map(mapObject(tupleMapValue[1], value => createTypedExpression(value)))
        )
      )

    case ExpressionType.SwitchModelRef:
      const switchModelRefValue = value as SwitchModelRefFn[ExpressionType.SwitchModelRef]

      return d.union(
        type,
        d.struct({
          cases: d.set(
            ...switchModelRefValue.cases.map(value =>
              d.struct({
                match: createTypedExpression(value.match),
                return: createTypedExpression(value.return)
              })
            )
          ),
          value: createTypedExpression(switchModelRefValue.value),
          default: createTypedExpression(switchModelRefValue.default)
        })
      )

    case ExpressionType.Update:
      const updateValue = value as UpdateFn[ExpressionType.Update]

      return d.union(
        type,
        d.struct({
          ref: createTypedExpression(updateValue.ref),
          value: createTypedExpression(updateValue.value)
        })
      )

    case ExpressionType.Referred:
      const referredValue = value as ReferredFn[ExpressionType.Referred]

      return d.union(
        type,
        d.struct({
          from: createTypedExpression(referredValue.from),
          in: createTypedExpression(referredValue.in)
        })
      )

    case ExpressionType.Referrers:
      const referrersValue = value as ReferrersFn[ExpressionType.Referrers]

      return d.union(
        type,
        d.struct({
          of: createTypedExpression(referrersValue.of),
          in: createTypedExpression(referrersValue.in)
        })
      )

    case ExpressionType.RelocateRef:
      const relocateRefValue = value as RelocateRefFn[ExpressionType.RelocateRef]

      return d.union(
        type,
        d.struct({
          model: createTypedExpression(relocateRefValue.model),
          ref: createTypedExpression(relocateRefValue.ref)
        })
      )

    case ExpressionType.GraphFlow:
      const graphFlowValue = value as GraphFlowFn[ExpressionType.GraphFlow]

      return d.union(
        type,
        d.struct({
          flow: d.list(
            ...graphFlowValue.flow.map(value =>
              d.struct({
                backward: d.list(...value.backward.map(value => createTypedExpression(value))),
                forward: d.list(...value.forward.map(value => createTypedExpression(value))),
                from: createTypedExpression(value.from)
              })
            )
          ),
          start: createTypedExpression(graphFlowValue.start)
        })
      )

    case ExpressionType.CurrentUser:
    case ExpressionType.Zero:
      return d.union(type, d.struct())

    case ExpressionType.InList:
      const inListValue = value as InListFn[ExpressionType.InList]

      return d.union(
        type,
        d.struct({
          in: createTypedExpression(inListValue.in),
          value: createTypedExpression(inListValue.value)
        })
      )

    case ExpressionType.Slice:
      const sliceValue = value as SliceFn[ExpressionType.Slice]

      return d.union(
        type,
        d.struct({
          value: createTypedExpression(sliceValue.value),
          offset: createTypedExpression(sliceValue.offset),
          length: createTypedExpression(sliceValue.length)
        })
      )

    case ExpressionType.ReduceList:
      const reduceListValue = value as ReduceListFn[ExpressionType.ReduceList]

      return d.union(
        type,
        d.struct({
          value: createTypedExpression(reduceListValue.value),
          initial: createTypedExpression(reduceListValue.initial),
          reducer: createTypedExpression(reduceListValue.reducer)
        })
      )

    case ExpressionType.RightFoldList:
    case ExpressionType.LeftFoldList:
      const tripleValue = value as [AnyExpression, AnyExpression, AnyExpression]

      return d.union(
        type,
        d.tuple(
          createTypedExpression(tripleValue[0]),
          createTypedExpression(tripleValue[1]),
          createTypedExpression(tripleValue[2])
        )
      )

    case ExpressionType.Field:
    case ExpressionType.Define:
      const fieldValue = value as FieldFn[ExpressionType.Field]
      return d.union(type, d.tuple(d.string(fieldValue[0]), createTypedExpression(fieldValue[1])))

    case ExpressionType.SetField:
      const setFieldValue = value as SetFieldFn[ExpressionType.SetField]

      return d.union(
        type,
        d.struct({
          name: d.string(setFieldValue.name),
          in: createTypedExpression(setFieldValue.in),
          value: createTypedExpression(setFieldValue.value)
        })
      )

    case ExpressionType.IndexTuple:
      const indexTupleValue = value as IndexTupleFn[ExpressionType.IndexTuple]

      return d.union(
        type,
        d.tuple(createTypedExpression(indexTupleValue[0]), d.int64(indexTupleValue[1]))
      )

    case ExpressionType.IsCase:
      const isCaseValue = value as IsCaseFn[ExpressionType.IsCase]

      return d.union(
        type,
        d.struct({
          case: createTypedExpression(isCaseValue.case),
          value: createTypedExpression(isCaseValue.value)
        })
      )

    case ExpressionType.SetKey:
      const setKetValue = value as SetKeyFn[ExpressionType.SetKey]

      return d.union(
        type,
        d.struct({
          name: d.string(setKetValue.name),
          in: createTypedExpression(setKetValue.in),
          value: createTypedExpression(setKetValue.value)
        })
      )

    case ExpressionType.JoinStrings:
      const joinStringsValue = value as JoinStringsFn[ExpressionType.JoinStrings]

      return d.union(
        type,
        d.struct({
          separator: createTypedExpression(joinStringsValue.separator),
          strings: createTypedExpression(joinStringsValue.strings)
        })
      )

    case ExpressionType.MatchRegex:
    case ExpressionType.SearchRegex:
    case ExpressionType.SearchAllRegex:
      const regexValue = value as MatchRegexFn[ExpressionType.MatchRegex]

      return d.union(
        type,
        d.struct({
          caseInsensitive: d.bool(regexValue.caseInsensitive),
          multiLine: d.bool(regexValue.multiLine),
          regex: d.string(regexValue.regex),
          value: createTypedExpression(regexValue.value)
        })
      )

    case ExpressionType.Scope:
      return d.union(type, d.string(value))

    case ExpressionType.Function:
      const functionValue = value as FunctionFn[ExpressionType.Function]

      return d.union(
        type,
        d.tuple(
          d.list(...functionValue[0].map(value => d.string(value))),
          d.list(...functionValue[1].map(value => createTypedExpression(value)))
        )
      )
  }
}
