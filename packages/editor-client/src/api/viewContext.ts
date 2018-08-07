import {Ref} from '@karma.run/sdk'

import {
  Model,
  KeyPath,
  SortConfiguration,
  StructPathSegment,
  SortType,
  ViewContextOptions,
  stringToColor,
  refToString,
  convertKeyToLabel,
  slugify,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {FieldRegistry, AnyField} from './field'
import {ErrorField} from '../fields/error'

export interface ViewContextConstructorOptions {
  readonly model: Ref
  readonly name: string
  readonly description?: string
  readonly slug: string
  readonly color: string
  readonly field: AnyField
  readonly displayKeyPaths: KeyPath[]
}

export class ViewContext {
  public readonly model: Ref
  public readonly name: string
  public readonly description?: string
  public readonly slug: string
  public readonly color: string
  public readonly field: AnyField
  public readonly displayKeyPaths: KeyPath[]

  public readonly sortConfigurations: SortConfiguration[]

  public constructor(opts: ViewContextConstructorOptions) {
    this.model = opts.model
    this.name = opts.name
    this.description = opts.description
    this.slug = opts.slug
    this.color = opts.color
    this.field = opts.field
    this.displayKeyPaths = opts.displayKeyPaths

    this.sortConfigurations = [
      {
        key: 'updatedMeta',
        label: 'Updated',
        type: SortType.Date,
        path: [StructPathSegment('updated')]
      },
      {
        key: 'createdMeta',
        label: 'Created',
        type: SortType.Date,
        path: [StructPathSegment('created')]
      },
      ...this.field.sortConfigurations.map(config => ({
        ...config,
        path: [StructPathSegment('value'), ...config.path]
      }))
    ]
  }

  public serialize() {
    return {
      model: this.model,
      color: this.color,
      name: this.name,
      slug: this.slug,
      field: this.field.fieldOptions(),
      displayKeyPaths: this.displayKeyPaths
    }
  }

  public static inferFromModel(
    id: Ref,
    model: Model,
    registry: FieldRegistry,
    tag?: string,
    ignoreTypes: string[] = [],
    options: ViewContextOptions = {}
  ): ViewContext {
    return new ViewContext({
      model: id,
      color: options.color || stringToColor(refToString(id)),
      name: options.name || (tag ? convertKeyToLabel(tag) : `Model: ${id[1]}`),
      description: options.description,
      slug: options.slug || slugify(tag || id[1]),
      field: inferFieldFromModel(model, registry, ignoreTypes, options.field),
      displayKeyPaths: options.displayKeyPaths || inferDisplayKeyPaths(model)
    })
  }
}

// TODO: Add ignoring types for inference option to config
export function inferFieldFromModel(
  model: Model,
  registry: FieldRegistry,
  ignoreTypes: string[],
  options?: TypedFieldOptions
): AnyField {
  function inferField(model: Model, opts?: TypedFieldOptions): AnyField {
    // Unwrap unique
    if (model.type === 'unique') {
      model = model.model
    }

    if (opts && opts.type) {
      const fieldClass = registry.get(opts.type)

      if (!fieldClass) {
        return new ErrorField({
          label: opts.label,
          message: `No field registed with type: ${opts.type}`
        })
      }

      return fieldClass.create(model, opts, inferField)
    } else {
      for (const fieldClass of registry.values()) {
        if (ignoreTypes.includes(fieldClass.type)) continue
        if (fieldClass.canInferFromModel && fieldClass.canInferFromModel(model)) {
          return fieldClass.create(model, opts, inferField)
        }
      }

      return new ErrorField({
        label: opts && opts.label,
        message: `Coulnd't infer field from model of type: ${model.type}`
      })
    }
  }

  const field = inferField(model, options)
  return field.initialize(new Map())
}

export const preferredFieldKeys = ['tag', 'label', 'title', 'key', 'description', 'name']

export function isPreferredFieldKey(key: string) {
  return preferredFieldKeys.some(preferredKey => key.toLowerCase().includes(preferredKey))
}

export function inferDisplayKeyPaths(model: Model) {
  if (model.type === 'struct') {
    return Object.keys(model.fields)
      .filter(key => isPreferredFieldKey(key))
      .map(key => [key])
  }

  return []
}
