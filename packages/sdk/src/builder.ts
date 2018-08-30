import * as t from './types'

import {model as m, ModelExpressionContext} from './model'

import {mapObject, ObjectMap} from './internal'
import {func as f, ExpressionContext, DataExpressionContext} from './expression'
import {DefaultTags, isRef} from './api'
import {createTypedExpression} from './typedExpression'

export type MigrationContextFn = (value: t.ScopeFn) => t.Expression

export interface MigrationRecord {
  from: t.Expression
  to: t.Expression
  manualExpression?: t.Ref | MigrationContextFn
}

export type DataScopeFn = (d: BuilderDataContext, m: ModelExpressionContext) => t.DataExpression
export type ExpressionContextFn = (e: BuilderExpressionContext) => t.Expression
export type ExpressionsContextFn = (e: BuilderExpressionContext) => t.Expression[]
export type FunctionBodyFn = (...params: t.ScopeFn[]) => t.Expression | t.Expression[]
export type FunctionBodyContextFn = (e: BuilderExpressionContext) => FunctionBodyFn

export class BuilderDataContext extends DataExpressionContext {
  private expressionContext: BuilderExpressionContext

  public constructor(expressionContext: BuilderExpressionContext) {
    super()
    this.expressionContext = expressionContext
  }

  public expr(func: t.Expression | ExpressionContextFn): t.ExprFn {
    if (typeof func === 'function') return super.expr(func(this.expressionContext))
    return super.expr(func)
  }
}

export type FilterCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type SortCallbackFn = (value: t.ScopeFn) => t.Expression
export type MapCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type ReduceCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression

export type ValueCallbackFn = (value: t.ScopeFn) => t.Expression
export type ValueCompareCallbackFn = (valueA: t.ScopeFn, valueB: t.ScopeFn) => t.Expression
export type IndexValueCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type KeyValueCallbackFn = (key: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type AggregatorCallbackFn = (aggregator: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type RefCallbackFn = (ref: t.ScopeFn) => t.Expression
export type RefsCallbackFn = (refs: t.ScopeFn) => t.Expression

export class BuilderExpressionContext extends ExpressionContext {
  private paramIndex = 0

  private readonly dataContext = new BuilderDataContext(this)
  public readonly util = new UtilityContext(this)

  public data(scopeFnOrData: t.DataExpression | DataScopeFn): t.DataFn {
    if (typeof scopeFnOrData === 'function') {
      return super.data(scopeFnOrData(this.dataContext, m))
    }

    return super.data(scopeFnOrData)
  }

  public filterList(
    value: t.Expression,
    filter: t.FunctionFn | IndexValueCallbackFn
  ): t.FilterListFn {
    if (typeof filter === 'function') {
      return super.filterList(
        value,
        this.function(filter, this.getUniqueParamNames('index', 'value'))
      )
    }

    return super.filterList(value, filter)
  }

  public memSort(value: t.Expression, sorter: t.FunctionFn | ValueCallbackFn): t.MemSortFn {
    if (typeof sorter === 'function') {
      return super.memSort(value, this.function(sorter, this.getUniqueParamNames('value')))
    }

    return super.memSort(value, sorter)
  }

  public memSortFunction(
    value: t.Expression,
    sorter: t.FunctionFn | ValueCompareCallbackFn
  ): t.MemSortFunctionFn {
    if (typeof sorter === 'function') {
      return super.memSortFunction(
        value,
        this.function(sorter, this.getUniqueParamNames('valueA', 'valueB'))
      )
    }

    return super.memSortFunction(value, sorter)
  }

  public mapList(value: t.Expression, mapper: t.FunctionFn | IndexValueCallbackFn): t.MapListFn {
    if (typeof mapper === 'function') {
      return super.mapList(value, this.function(mapper, this.getUniqueParamNames('index', 'value')))
    }

    return super.mapList(value, mapper)
  }

  public reduceList(
    value: t.Expression,
    initial: t.Expression,
    reducer: t.FunctionFn | AggregatorCallbackFn
  ): t.ReduceListFn {
    if (typeof reducer === 'function') {
      return super.reduceList(
        value,
        initial,
        this.function(reducer, this.getUniqueParamNames('aggregator', 'value'))
      )
    }

    return super.reduceList(value, initial, reducer)
  }

  public leftFoldList(
    value: t.Expression,
    initial: t.Expression,
    folder: t.FunctionFn | AggregatorCallbackFn
  ): t.LeftFoldListFn {
    if (typeof folder === 'function') {
      return super.leftFoldList(
        value,
        initial,
        this.function(folder, this.getUniqueParamNames('aggregator', 'value'))
      )
    }

    return super.leftFoldList(value, initial, folder)
  }

  public rightFoldList(
    value: t.Expression,
    initial: t.Expression,
    folder: t.FunctionFn | AggregatorCallbackFn
  ): t.RightFoldListFn {
    if (typeof folder === 'function') {
      return super.rightFoldList(
        value,
        initial,
        this.function(folder, this.getUniqueParamNames('aggregator', 'value'))
      )
    }

    return super.rightFoldList(value, initial, folder)
  }

  public mapMap(value: t.Expression, mapper: t.FunctionFn | KeyValueCallbackFn): t.MapMapFn {
    if (typeof mapper === 'function') {
      return super.mapMap(value, this.function(mapper, this.getUniqueParamNames('key', 'value')))
    }

    return super.mapMap(value, mapper)
  }

  public mapSet(value: t.Expression, mapper: t.FunctionFn | IndexValueCallbackFn): t.MapSetFn {
    if (typeof mapper === 'function') {
      return super.mapSet(value, this.function(mapper, this.getUniqueParamNames('value')))
    }

    return super.mapSet(value, mapper)
  }

  public signature(func: t.FunctionFn | FunctionBodyFn): t.SignatureFn {
    if (typeof func === 'function') {
      return super.signature(this.function(func, []))
    }

    return super.signature(func)
  }

  public create(modelRef: t.Expression, func: t.FunctionFn | RefCallbackFn): t.CreateFn {
    if (typeof func === 'function') {
      return super.create(modelRef, this.function(func, this.getUniqueParamNames('ref')))
    }

    return super.create(modelRef, func)
  }

  public createMultiple(
    modelRef: t.Expression,
    creators: ObjectMap<t.FunctionFn | RefsCallbackFn>
  ): t.CreateMultipleFn {
    return super.createMultiple(
      modelRef,
      mapObject(creators, creator => {
        if (typeof creator === 'function') {
          return this.function(creator, this.getUniqueParamNames('refs'))
        }

        return creator
      })
    )
  }

  public switchCase(
    value: t.Expression,
    cases: ObjectMap<t.FunctionFn | ValueCallbackFn>
  ): t.SwitchCaseFn {
    return super.switchCase(
      value,
      mapObject(cases, caseFn => {
        if (typeof caseFn === 'function') {
          return this.function(caseFn, this.getUniqueParamNames('value'))
        }

        return caseFn
      })
    )
  }

  public with(value: t.Expression, body: t.FunctionFn | ValueCallbackFn): t.WithFn {
    if (typeof body === 'function') {
      return super.with(value, this.function(body, this.getUniqueParamNames('value')))
    }

    return super.with(value, body)
  }

  public getUniqueParamNames<P extends string[] = string[]>(...prefixes: P): P {
    const currentParamIndex = this.paramIndex++
    return prefixes.map(prefix => `_${prefix}_${currentParamIndex}`) as P
  }

  public function(body: FunctionBodyFn, paramNames: string[]): t.FunctionFn {
    if (body.length > 0) {
      for (let i = paramNames.length; i < body.length - paramNames.length; i++) {
        paramNames[i] = this.getUniqueParamNames(`param${i}`)[0]
      }
    }

    const scopes = paramNames.map(paramName => this.scope(paramName))
    const expressions = body(...scopes)

    return f.function(paramNames, ...(Array.isArray(expressions) ? expressions : [expressions]))
  }
}

export type ModelCreatorFn = (
  m: ModelExpressionContext,
  d: BuilderDataContext,
  refs: t.ScopeFn
) => t.DataExpression

export class UtilityContext {
  private expressionContext?: BuilderExpressionContext

  public constructor(expressionContext?: BuilderExpressionContext) {
    this.expressionContext = expressionContext
  }

  public createModel(creator: ModelCreatorFn): t.Expression {
    return buildExpression(
      e => e.create(e.tag(DefaultTags.Model), ref => e.data((d, m) => creator(m, d, ref))),
      this.expressionContext
    )
  }

  public createTag(tag: string, model: t.Expression): t.Expression {
    return buildExpression(
      e =>
        e.create(e.tag(DefaultTags.Tag), () =>
          e.data(d =>
            d.struct({
              tag: d.string(tag),
              model: d.expr(() => model)
            })
          )
        ),
      this.expressionContext
    )
  }

  public createModels(creators: ObjectMap<ModelCreatorFn>): t.Expression {
    return buildExpression(
      e =>
        e.createMultiple(
          e.tag(DefaultTags.Model),
          mapObject(creators, creator => (refs: t.ScopeFn) => e.data((d, m) => creator(m, d, refs)))
        ),
      this.expressionContext
    )
  }

  public createMigration(...migrations: MigrationRecord[]): t.Expression {
    return buildExpression(
      e =>
        e.create(e.tag(DefaultTags.Migration), () =>
          e.data(d =>
            d.list(
              ...migrations.map(migration =>
                d.struct({
                  source: d.expr(() => migration.from),
                  target: d.expr(() => migration.to),
                  expression: migration.manualExpression
                    ? d.union(
                        'manual',
                        isRef(migration.manualExpression)
                          ? d.ref(migration.manualExpression)
                          : d.expr(
                              e.create(e.tag(DefaultTags.Expression), () =>
                                e.data(
                                  createTypedExpression(
                                    e.function(
                                      value =>
                                        (migration.manualExpression as MigrationContextFn)(value),
                                      e.getUniqueParamNames('value')
                                    )
                                  )
                                )
                              )
                            )
                      )
                    : d.union('auto', d.struct())
                })
              )
            )
          )
        ),
      this.expressionContext
    )
  }

  public getTags(): t.Expression {
    return buildExpression(e => e.all(e.tag(DefaultTags.Tag)), this.expressionContext)
  }

  public getModels(): t.Expression {
    return buildExpression(e => e.all(e.tag(DefaultTags.Model)), this.expressionContext)
  }
}

export const utility = new UtilityContext()

export function buildExpression(
  contextFn: ExpressionContextFn,
  context: BuilderExpressionContext = new BuilderExpressionContext()
): t.Expression {
  return contextFn(context)
}

export function buildExpressions(
  contextFn: ExpressionsContextFn,
  context: BuilderExpressionContext = new BuilderExpressionContext()
): t.Expression[] {
  return contextFn(context)
}

export function buildFunction(
  contextFn: FunctionBodyContextFn,
  paramNames: string[] = [],
  context: BuilderExpressionContext = new BuilderExpressionContext()
): t.FunctionFn {
  const body = contextFn(context)
  return context.function(body, paramNames)
}

/** @deprecated */
export function createTag(
  tag: string,
  model: t.Expression,
  context: BuilderExpressionContext = new BuilderExpressionContext()
): t.Expression {
  return context.util.createTag(tag, model)
}

/** @deprecated */
export function createModel(
  creator: ModelCreatorFn,
  context: BuilderExpressionContext = new BuilderExpressionContext()
): t.Expression {
  return context.util.createModel(creator)
}

/** @deprecated */
export function createModels(
  creators: ObjectMap<ModelCreatorFn>,
  context: BuilderExpressionContext = new BuilderExpressionContext()
): t.Expression {
  return context.util.createModels(creators)
}

/** @deprecated */
export function createMigration(...migrations: MigrationRecord[]): t.Expression {
  return utility.createMigration(...migrations)
}

/** @deprecated */
export function getTags(): t.Expression {
  return utility.getTags()
}

/** @deprecated */
export function getModels(): t.Expression {
  return utility.getModels()
}
