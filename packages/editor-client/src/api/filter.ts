import * as xpr from '@karma.run/sdk/expression'

import {
  Condition,
  ValuePathSegmentType,
  ConditionType,
  ValuePath,
  StorageType,
  escapeRegExp
} from '@karma.run/editor-common'

export function conditionExpression(value: xpr.Expression, condition: Condition): xpr.Expression {
  switch (condition.type) {
    case ConditionType.OptionalIsPresent:
      return condition.value ? xpr.isPresent(value) : xpr.not(xpr.isPresent(value))

    case ConditionType.StringEqual:
      return xpr.equal(xpr.string(condition.value), value)

    case ConditionType.StringIncludes:
      return xpr.stringContains(value, xpr.string(condition.value))

    case ConditionType.StringStartsWith:
      return xpr.matchRegex(value, `^${escapeRegExp(condition.value)}`)

    case ConditionType.StringEndsWith:
      return xpr.matchRegex(value, `${escapeRegExp(condition.value)}$`)

    case ConditionType.StringRegExp:
      return xpr.matchRegex(value, condition.value)

    case ConditionType.DateEqual:
      if (!condition.value) return xpr.bool(true)
      return xpr.equal(xpr.data(d => d.dateTime(new Date(condition.value))), value)

    case ConditionType.DateMin:
      if (!condition.value) return xpr.bool(true)

      return xpr.or(
        xpr.equal(xpr.data(d => d.dateTime(new Date(condition.value))), value),
        xpr.before(xpr.data(d => d.dateTime(new Date(condition.value))), value)
      )

    case ConditionType.DateMax:
      if (!condition.value) return xpr.bool(true)

      return xpr.or(
        xpr.equal(xpr.data(d => d.dateTime(new Date(condition.value))), value),
        xpr.after(xpr.data(d => d.dateTime(new Date(condition.value))), value)
      )

    case ConditionType.ListLengthEqual:
      return xpr.equal(xpr.int64(condition.value), xpr.length(value))

    case ConditionType.ListLengthMin:
      return xpr.or(
        xpr.equal(xpr.int64(condition.value), xpr.length(value)),
        xpr.ltInt64(xpr.int64(condition.value), xpr.length(value))
      )

    case ConditionType.ListLengthMax:
      return xpr.or(
        xpr.equal(xpr.int64(condition.value), xpr.length(value)),
        xpr.gtInt64(xpr.int64(condition.value), xpr.length(value))
      )

    case ConditionType.BoolEqual:
      return xpr.equal(xpr.bool(condition.value), value)

    case ConditionType.EnumEqual:
      if (!condition.value) return xpr.bool(true)
      return xpr.equal(xpr.symbol(condition.value), value)

    case ConditionType.UnionCaseEqual:
      if (!condition.value) return xpr.bool(true)
      return xpr.isCase(value, xpr.string(condition.value))

    case ConditionType.RefEqual:
      if (!condition.value) return xpr.bool(true)
      return xpr.equal(xpr.data(d => d.ref(condition.value)), value)

    case ConditionType.ExtractedStringIncludes:
      return xpr.stringContains(
        xpr.joinStrings(xpr.string(' '), xpr.extractStrings(value)),
        xpr.string(condition.value)
      )

    case ConditionType.Or:
      return xpr.or(...condition.value.map(condition => filterExpression(value, condition)))

    case ConditionType.And:
      return xpr.and(...condition.value.map(condition => filterExpression(value, condition)))

    case ConditionType.NumberEqual:
      switch (condition.storageType) {
        case StorageType.Float:
          return xpr.equal(xpr.float(condition.value), value)

        case StorageType.Int8:
          return xpr.equal(xpr.int8(condition.value), value)

        case StorageType.Int16:
          return xpr.equal(xpr.int16(condition.value), value)

        case StorageType.Int32:
          return xpr.equal(xpr.int32(condition.value), value)

        case StorageType.Int64:
          return xpr.equal(xpr.int64(condition.value), value)

        case StorageType.UInt8:
          return xpr.equal(xpr.uint8(condition.value), value)

        case StorageType.UInt16:
          return xpr.equal(xpr.uint16(condition.value), value)

        case StorageType.UInt32:
          return xpr.equal(xpr.uint32(condition.value), value)

        case StorageType.UInt64:
          return xpr.equal(xpr.uint64(condition.value), value)

        default:
          throw new Error(`Unknown StorageType: ${condition.storageType}`)
      }

    case ConditionType.NumberMin:
      switch (condition.storageType) {
        case StorageType.Float:
          return xpr.or(
            xpr.equal(xpr.float(condition.value), value),
            xpr.ltFloat(xpr.float(condition.value), value)
          )

        case StorageType.Int8:
          return xpr.or(
            xpr.equal(xpr.int8(condition.value), value),
            xpr.ltInt8(xpr.int8(condition.value), value)
          )

        case StorageType.Int16:
          return xpr.or(
            xpr.equal(xpr.int16(condition.value), value),
            xpr.ltInt16(xpr.int16(condition.value), value)
          )

        case StorageType.Int32:
          return xpr.or(
            xpr.equal(xpr.int32(condition.value), value),
            xpr.ltInt32(xpr.int32(condition.value), value)
          )

        case StorageType.Int64:
          return xpr.or(
            xpr.equal(xpr.int64(condition.value), value),
            xpr.ltInt64(xpr.int64(condition.value), value)
          )

        case StorageType.UInt8:
          return xpr.or(
            xpr.equal(xpr.uint8(condition.value), value),
            xpr.ltUint8(xpr.uint8(condition.value), value)
          )

        case StorageType.UInt16:
          return xpr.or(
            xpr.equal(xpr.uint16(condition.value), value),
            xpr.ltUint16(xpr.uint16(condition.value), value)
          )

        case StorageType.UInt32:
          return xpr.or(
            xpr.equal(xpr.uint32(condition.value), value),
            xpr.ltUint32(xpr.uint32(condition.value), value)
          )

        case StorageType.UInt64:
          return xpr.or(
            xpr.equal(xpr.uint64(condition.value), value),
            xpr.ltUint64(xpr.uint64(condition.value), value)
          )

        default:
          throw new Error(`Unknown StorageType: ${condition.storageType}`)
      }

    case ConditionType.NumberMax:
      switch (condition.storageType) {
        case StorageType.Float:
          return xpr.or(
            xpr.equal(xpr.float(condition.value), value),
            xpr.gtFloat(xpr.float(condition.value), value)
          )

        case StorageType.Int8:
          return xpr.or(
            xpr.equal(xpr.int8(condition.value), value),
            xpr.gtInt8(xpr.int8(condition.value), value)
          )

        case StorageType.Int16:
          return xpr.or(
            xpr.equal(xpr.int16(condition.value), value),
            xpr.gtInt16(xpr.int16(condition.value), value)
          )

        case StorageType.Int32:
          return xpr.or(
            xpr.equal(xpr.int32(condition.value), value),
            xpr.gtInt32(xpr.int32(condition.value), value)
          )

        case StorageType.Int64:
          return xpr.or(
            xpr.equal(xpr.int64(condition.value), value),
            xpr.gtInt64(xpr.int64(condition.value), value)
          )

        case StorageType.UInt8:
          return xpr.or(
            xpr.equal(xpr.uint8(condition.value), value),
            xpr.gtUint8(xpr.uint8(condition.value), value)
          )

        case StorageType.UInt16:
          return xpr.or(
            xpr.equal(xpr.uint16(condition.value), value),
            xpr.gtUint16(xpr.uint16(condition.value), value)
          )

        case StorageType.UInt32:
          return xpr.or(
            xpr.equal(xpr.uint32(condition.value), value),
            xpr.gtUint32(xpr.uint32(condition.value), value)
          )

        case StorageType.UInt64:
          return xpr.or(
            xpr.equal(xpr.uint64(condition.value), value),
            xpr.gtUint64(xpr.uint64(condition.value), value)
          )

        default:
          throw new Error(`Unknown StorageType: ${condition.storageType}`)
      }

    default:
      return xpr.bool(false)
  }
}

export function pathExpression(
  value: xpr.Expression,
  path: ValuePath,
  condition: Condition
): xpr.Expression {
  if (path.length === 0) return conditionExpression(value, condition)

  const pathSegment = path[0]
  const nextPath = path.slice(1)

  switch (pathSegment.type) {
    case ValuePathSegmentType.Struct:
      return pathExpression(xpr.field(pathSegment.key, value), nextPath, condition)

    case ValuePathSegmentType.Tuple:
      return xpr.indexTuple(pathSegment.index, value)

    case ValuePathSegmentType.Union:
      return xpr.if_(
        xpr.isCase(value, xpr.string(pathSegment.key)),
        pathExpression(xpr.assertCase(pathSegment.key, value), nextPath, condition),
        xpr.bool(false)
      )

    case ValuePathSegmentType.List:
      return xpr.rightFoldList(value, xpr.bool(false), (aggregator, listValue) =>
        xpr.or(aggregator, pathExpression(listValue, nextPath, condition))
      )

    case ValuePathSegmentType.Optional:
      return xpr.if_(
        xpr.isPresent(value),
        pathExpression(xpr.assertPresent(value), nextPath, condition),
        xpr.bool(false)
      )

    default:
      return xpr.bool(false)
  }
}

export function filterExpression(value: xpr.Expression, condition: Condition): xpr.Expression {
  return xpr.with_(value, value => pathExpression(value, condition.path, condition))
}
