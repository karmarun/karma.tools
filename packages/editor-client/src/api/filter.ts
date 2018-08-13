import {expression as e, func as f, Expression} from '@karma.run/sdk'
import {Condition, ValuePathSegmentType, ConditionType} from '@karma.run/editor-common'

export function conditionExpression(value: Expression, condition: Condition): Expression {
  switch (condition.type) {
    case ConditionType.StringEqual:
      return e.equal(e.string(condition.value), value)

    default:
      return e.bool(false)
  }
}

export function filterExpression(expression: Expression, condition: Condition): Expression {
  return condition.path.reduce((expression, pathSegment, index) => {
    const isLast = index === condition.path.length - 1

    switch (pathSegment.type) {
      case ValuePathSegmentType.Struct:
        return isLast
          ? conditionExpression(e.field(pathSegment.key, expression), condition)
          : e.field(pathSegment.key, expression)

      case ValuePathSegmentType.List:
        return e.reduceList(
          expression,
          e.bool(false),
          f.function(
            ['value', 'nextValue'],
            e.or(
              e.scope('value'),
              isLast ? conditionExpression(e.scope('nextValue'), condition) : expression
            )
          )
        )

      case ValuePathSegmentType.Optional:
        return isLast
          ? conditionExpression(expression, condition)
          : e.if(e.isPresent(expression), expression, e.bool(false))

      default:
        return e.bool(false)
    }
  }, expression)
}
