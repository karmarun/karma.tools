import {expression as e, data as d, func as f, Expression} from '@karma.run/sdk'

import {
  Condition,
  ValuePathSegmentType,
  ConditionType,
  ValuePath,
  ValuePathSegment,
  ListPathSegment
} from '@karma.run/editor-common'

export function conditionExpression(value: Expression, condition: Condition): Expression {
  switch (condition.type) {
    case ConditionType.StringEqual:
      return e.equal(e.string(condition.value), value)

    default:
      return e.bool(false)
  }
}

export function pathExpression(expression: Expression, pathSegment: ValuePathSegment): Expression {
  switch (pathSegment.type) {
    case ValuePathSegmentType.Struct:
      return e.field(pathSegment.key, expression)

    case ValuePathSegmentType.List:
      return e.rightFoldList(
        expression,
        e.bool(false),
        f.function(['aggregator', 'value'], e.or(e.scope('aggregator'), expression))
      )

    case ValuePathSegmentType.Optional:
      return e.if(e.isPresent(expression), expression, e.bool(false))

    default:
      return e.bool(false)
  }
}

export function filterExpression(expression: Expression, condition: Condition): Expression {
  function recurse(expression: Expression, path: ValuePath): Expression {
    if (path.length === 0) return expression
    return recurse(pathExpression(expression, path[path.length - 1]), path.slice(0, -1))
  }

  return recurse(conditionExpression(expression, condition), condition.path)
}

console.log(
  JSON.stringify(
    filterExpression(e.data(d.list(d.string('1234'), d.string('4321'))), {
      path: [ListPathSegment()],
      type: ConditionType.StringEqual,
      value: '1234'
    }),
    undefined,
    2
  )
)
