import {expression as e, func as f, Expression} from '@karma.run/sdk'
import {
  Condition,
  ValuePathSegmentType,
  ConditionType,
  ValuePath,
  StorageType
} from '@karma.run/editor-common'

export function conditionExpression(value: Expression, condition: Condition): Expression {
  switch (condition.type) {
    case ConditionType.OptionalIsPresent:
      return condition.value ? e.isPresent(value) : e.not(e.isPresent(value))

    case ConditionType.StringEqual:
      return e.equal(e.string(condition.value), value)

    case ConditionType.StringIncludes:
      return e.stringContains(value, e.string(condition.value))

    case ConditionType.StringRegExp:
      return e.matchRegex(condition.value, value)

    case ConditionType.NumberEqual:
      switch (condition.storageType) {
        case StorageType.Float:
          return e.equal(e.float(condition.value), value)

        case StorageType.Int8:
          return e.equal(e.int8(condition.value), value)

        case StorageType.Int16:
          return e.equal(e.int16(condition.value), value)

        case StorageType.Int32:
          return e.equal(e.int32(condition.value), value)

        case StorageType.Int64:
          return e.equal(e.int64(condition.value), value)

        case StorageType.UInt8:
          return e.equal(e.uint8(condition.value), value)

        case StorageType.UInt16:
          return e.equal(e.uint16(condition.value), value)

        case StorageType.UInt32:
          return e.equal(e.uint32(condition.value), value)

        case StorageType.UInt64:
          return e.equal(e.uint64(condition.value), value)

        default:
          throw new Error(`Unknown StorageType: ${condition.storageType}`)
      }

    case ConditionType.NumberMin:
      switch (condition.storageType) {
        case StorageType.Float:
          return e.ltFloat(e.float(condition.value), value)

        case StorageType.Int8:
          return e.ltInt8(e.int8(condition.value), value)

        case StorageType.Int16:
          return e.ltInt16(e.int16(condition.value), value)

        case StorageType.Int32:
          return e.ltInt32(e.int32(condition.value), value)

        case StorageType.Int64:
          return e.ltInt64(e.int64(condition.value), value)

        case StorageType.UInt8:
          return e.ltUint8(e.uint8(condition.value), value)

        case StorageType.UInt16:
          return e.ltUint16(e.uint16(condition.value), value)

        case StorageType.UInt32:
          return e.ltUint32(e.uint32(condition.value), value)

        case StorageType.UInt64:
          return e.ltUint64(e.uint64(condition.value), value)

        default:
          throw new Error(`Unknown StorageType: ${condition.storageType}`)
      }

    case ConditionType.NumberMax:
      switch (condition.storageType) {
        case StorageType.Float:
          return e.gtFloat(e.float(condition.value), value)

        case StorageType.Int8:
          return e.gtInt8(e.int8(condition.value), value)

        case StorageType.Int16:
          return e.gtInt16(e.int16(condition.value), value)

        case StorageType.Int32:
          return e.gtInt32(e.int32(condition.value), value)

        case StorageType.Int64:
          return e.gtInt64(e.int64(condition.value), value)

        case StorageType.UInt8:
          return e.gtUint8(e.uint8(condition.value), value)

        case StorageType.UInt16:
          return e.gtUint16(e.uint16(condition.value), value)

        case StorageType.UInt32:
          return e.gtUint32(e.uint32(condition.value), value)

        case StorageType.UInt64:
          return e.gtUint64(e.uint64(condition.value), value)

        default:
          throw new Error(`Unknown StorageType: ${condition.storageType}`)
      }

    default:
      return e.bool(false)
  }
}

export function pathExpression(
  value: Expression,
  path: ValuePath,
  condition: Condition
): Expression {
  if (path.length === 0) return conditionExpression(value, condition)

  const pathSegment = path[0]
  const nextPath = path.slice(1)

  switch (pathSegment.type) {
    case ValuePathSegmentType.Struct:
      return pathExpression(e.field(pathSegment.key, value), nextPath, condition)

    case ValuePathSegmentType.Tuple:
      return e.indexTuple(value, pathSegment.index)

    case ValuePathSegmentType.Union:
      return e.if(
        e.isCase(value, e.string(pathSegment.key)),
        pathExpression(e.assertCase(pathSegment.key, value), nextPath, condition),
        e.bool(false)
      )

    case ValuePathSegmentType.List:
      return e.rightFoldList(
        value,
        e.bool(false),
        f.function(
          ['aggregator', 'listValue'],
          e.or(e.scope('aggregator'), pathExpression(e.scope('listValue'), nextPath, condition))
        )
      )

    case ValuePathSegmentType.Optional:
      return e.if(
        e.isPresent(value),
        pathExpression(e.assertPresent(value), nextPath, condition),
        e.bool(false)
      )

    default:
      return e.bool(false)
  }
}

export function filterExpression(value: Expression, condition: Condition): Expression {
  return e.with(
    value,
    f.function(['value'], pathExpression(e.scope('value'), condition.path, condition))
  )
}
