import * as t from './types'

import {
  buildExpression as build,
  ModelContext,
  BuilderExpressionContext,
  BuilderDataContext
} from './builder'
import {mapObject, ObjectMap} from './util'

export const enum DefaultTags {
  Model = '_model',
  Tag = '_tag',
  Role = '_role',
  Migration = '_migration',
  User = '_user',
  Expression = '_expression'
}

export interface MetarializedRecord<T = any> {
  id: t.Ref
  model: t.Ref
  created: string
  updated: string
  value: T
}

export interface MigrationRecord {
  from: t.Expression
  to: t.Expression
  manualExpression?: t.Expression
}

export function isRef(ref: any): ref is t.Ref {
  return Array.isArray(ref) && typeof ref[0] === 'string' && typeof ref[1] === 'string'
}

export function createRef(model: string, id: string): t.Ref {
  return [model, id]
}

export function createModel(
  creator: (m: ModelContext, d: BuilderDataContext, ref: t.ScopeFn) => t.DataExpression,
  context: BuilderExpressionContext = new BuilderExpressionContext()
) {
  return build(
    e => e.create(e.tag(DefaultTags.Model), ref => context.data((d, m) => creator(m, d, ref))),
    context
  )
}

export function createTag(
  tag: string,
  model: t.Expression,
  context: BuilderExpressionContext = new BuilderExpressionContext()
) {
  return build(
    e =>
      e.create(e.tag(DefaultTags.Tag), () =>
        context.data(d =>
          d.struct({
            tag: d.string(tag),
            model: d.expr(() => model)
          })
        )
      ),
    context
  )
}

export function getTags() {
  return build(e => e.all(e.tag(DefaultTags.Tag)))
}

export function getModels() {
  return build(e => e.all(e.tag(DefaultTags.Model)))
}

export function createModels(
  creators: ObjectMap<
    (m: ModelContext, d: BuilderDataContext, refs: t.ScopeFn) => t.DataExpression
  >,
  context: BuilderExpressionContext = new BuilderExpressionContext()
) {
  const functions = mapObject(creators, creator => (refs: t.ScopeFn) =>
    context.data((d, m) => creator(m, d, refs))
  )

  return build(e => e.createMultiple(e.tag(DefaultTags.Model), functions), context)
}

export function createMigration(...migrations: MigrationRecord[]): t.Expression {
  return build(e =>
    e.create(e.tag(DefaultTags.Migration), () =>
      e.data(d =>
        d.list(
          ...migrations.map(migration =>
            d.struct({
              source: d.expr(() => migration.from),
              target: d.expr(() => migration.to),
              expression: migration.manualExpression
                ? d.union('auto', d.struct())
                : d.union('auto', d.struct())
            })
          )
        )
      )
    )
  )
}
