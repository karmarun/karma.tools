import {expression as e, func as f, Expression} from '@karma.run/sdk'
import {Condition, ValuePathSegmentType, ConditionType, ValuePath} from '@karma.run/editor-common'

export function conditionExpression(value: Expression, condition: Condition): Expression {
  switch (condition.type) {
    case ConditionType.StringEqual:
      return e.equal(e.string(condition.value), value)

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
      return e.if(e.isPresent(value), pathExpression(value, nextPath, condition), e.bool(false))

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
