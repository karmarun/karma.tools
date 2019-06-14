import React from 'react'

import {
  SortConfiguration,
  FilterConfiguration,
  Model,
  firstKeyOptional,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {
  ErrorField,
  DropAreaFileInput,
  FlexList,
  FlexFiller,
  CardLabel,
  Icon,
  IconName,
  Card,
  CardImage,
  CardDocument,
  Config,
  withConfig,
  ListComponentRenderProps,
  SessionContext,
  withSession,
  SaveContext,
  DeleteContext,
  CardSection,
  ListRenderProps,
  EditRenderProps,
  Field,
  EditComponentRenderProps,
  FieldComponent,
  FieldLabel,
  FieldValue
} from '@karma.run/editor-client'

import {DataContext as dat, DataConstructor} from '@karma.run/sdk/expression'
import {UploadResponse, MediaType} from '../common/interface'
import {Media, thumbnailURL, unserializeMedia} from '../common/editor'
import {name} from '../common/version'
import {uploadMedia, commitMedia, copyMedia, deleteMedia} from './api'
import {CloudinaryResponse} from '../common/backend'

export function mediaAPIPath(basePath: string) {
  return `${basePath}/api/plugin/${name}`
}

export function thumbnailURLForValue(basePath: string, value: MediaFieldValue) {
  const uploadedMedia = value.value.uploadedMedia
  const media = value.value.media

  if (uploadedMedia) {
    if (uploadedMedia.mediaType !== MediaType.Image) return null
    return uploadedMedia.url
  }

  if (media) {
    if (media.mediaType !== MediaType.Image && media.mediaType !== MediaType.Video) {
      return null
    }

    return thumbnailURL(mediaAPIPath(basePath), media.id)
  }

  return null
}

export function extensionForValue(value: MediaFieldValue) {
  const uploadedMedia = value.value.uploadedMedia
  const media = value.value.media

  if (uploadedMedia) return uploadedMedia.extension
  if (media) return media.extension

  return '?'
}

export interface MediaFieldEditComponentProps
  extends EditComponentRenderProps<MediaField, MediaFieldValue> {
  config: Config
  sessionContext: SessionContext
}

export interface MediaFieldEditComponentState {
  isUploading: boolean
  progress: number
}

export class MediaFieldEditComponent extends React.PureComponent<
  MediaFieldEditComponentProps,
  MediaFieldEditComponentState
> {
  public state: MediaFieldEditComponentState = {
    isUploading: false,
    progress: 0
  }

  private handleDrop = async (file: File) => {
    try {
      const response = await uploadMedia(
        mediaAPIPath(this.props.config.basePath),
        file,
        this.props.sessionContext.session!.token,
        (progress: number) => {
          this.setState({progress})
        }
      )

      this.props.onValueChange(
        {
          value: {...this.props.value.value, uploadedMedia: response},
          isValid: true,
          hasChanges: true
        },
        this.props.changeKey
      )
    } catch (err) {
      // TODO: Handle error
      console.error(err)
    }
  }

  private handlePreviewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
  }

  public render() {
    let content: React.ReactNode

    if (this.state.isUploading) {
      content = `${this.state.progress * 100}%`
    } else if (this.props.value.value.media || this.props.value.value.uploadedMedia) {
      let name: string
      let url: string

      if (this.props.value.value.uploadedMedia) {
        name = `${this.props.value.value.uploadedMedia.filename}`
        url = this.props.value.value.uploadedMedia.url
      } else {
        name = `${this.props.value.value.media!.filename}`
        url = this.props.value.value.media!.url
      }

      const labelElement = (
        <CardSection>
          <FlexList>
            {name && <CardLabel text={name} />}
            <FlexFiller />
            {url && (
              <a href={url} target="_blank" onClick={this.handlePreviewClick}>
                <Icon name={IconName.Preview} />
              </a>
            )}
          </FlexList>
        </CardSection>
      )

      const thumbnailURL = thumbnailURLForValue(this.props.config.basePath, this.props.value)
      const extension = extensionForValue(this.props.value)

      if (thumbnailURL) {
        content = (
          <Card>
            <CardImage src={thumbnailURL!} />
            {labelElement}
          </Card>
        )
      } else {
        content = (
          <Card>
            <CardDocument extension={extension} />
            {labelElement}
          </Card>
        )
      }
    }

    return (
      <FieldComponent depth={this.props.depth} index={this.props.index}>
        {!this.props.isWrapped && (
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index || 0}
          />
        )}
        <DropAreaFileInput text="Drop File Here" onFileDrop={this.handleDrop}>
          {content}
        </DropAreaFileInput>
      </FieldComponent>
    )
  }
}

export interface MediaFieldListComponentProps
  extends ListComponentRenderProps<MediaField, MediaFieldValue> {
  config: Config
}

export class MediaFieldListComponent extends React.PureComponent<MediaFieldListComponentProps> {
  public render() {
    const thumbnailURL = thumbnailURLForValue(this.props.config.basePath, this.props.value)
    const extension = extensionForValue(this.props.value)

    if (thumbnailURL) {
      return <CardImage src={thumbnailURL} />
    } else {
      return <CardDocument extension={extension} />
    }
  }
}

export const MediaFieldListContainer = withConfig(MediaFieldListComponent)
export const MediaFieldEditContainer = withSession(withConfig(MediaFieldEditComponent))

export interface MediaFieldOptions {
  readonly label?: string
  readonly description?: string
}

export type MediaFieldValue = FieldValue<
  {
    media?: Media
    uploadedMedia?: UploadResponse
  },
  string
>

export class MediaField implements Field<MediaFieldValue> {
  public readonly label?: string
  public readonly description?: string

  public readonly defaultValue: MediaFieldValue = {
    value: {},
    isValid: true,
    hasChanges: false
  }

  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(opts?: MediaFieldOptions) {
    this.label = opts && opts.label
    this.description = opts && opts.description
    this.sortConfigurations = []
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<MediaFieldValue>) {
    return <MediaFieldListContainer field={this} {...props} />
  }

  public renderEditComponent(props: EditRenderProps<MediaFieldValue>) {
    return (
      <MediaFieldEditContainer
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any): MediaFieldValue {
    return {
      value: {media: unserializeMedia(value)},
      isValid: true,
      hasChanges: false
    }
  }

  private mediaTypeExpressionForMedia(media: Media): DataConstructor {
    switch (media.mediaType) {
      case MediaType.Image:
        return dat.union(
          media.mediaType,
          dat.struct({
            width: dat.int32(media.width),
            height: dat.int32(media.height)
          })
        )

      default:
        return dat.union(media.mediaType, dat.struct({}))
    }
  }

  private backendExpressionForMedia(media: Media): DataConstructor | undefined {
    const backendKey = media.backend && firstKeyOptional(media.backend)

    // TODO: Find pluggable way to expressionify backend specific data
    switch (backendKey) {
      case 'cloudinary': {
        const value: CloudinaryResponse = media.backend[backendKey]
        return dat.struct({
          public_id: dat.string(value.public_id),
          version: dat.int32(value.version),
          signature: dat.string(value.signature),
          width: value.width ? dat.int32(value.width) : dat.null(),
          height: value.height ? dat.int32(value.height) : dat.null(),
          format: dat.string(value.format),
          resource_type: dat.string(value.resource_type),
          created_at: dat.string(value.created_at),
          tags: dat.list(value.tags.map(tag => dat.string(tag))),
          bytes: dat.int32(value.bytes),
          type: dat.string(value.type),
          etag: dat.string(value.etag),
          placeholder: dat.bool(value.placeholder),
          url: dat.string(value.url),
          secure_url: dat.string(value.secure_url),
          access_mode: dat.string(value.access_mode),
          original_filename: dat.string(value.original_filename),
          pages: value.pages ? dat.int32(value.pages) : dat.null(),
          frame_rate: value.frame_rate ? dat.int32(value.frame_rate) : dat.null(),
          bit_rate: value.frame_rate ? dat.int32(value.frame_rate) : dat.null(),
          duration: value.duration ? dat.float(value.duration) : dat.null(),
          is_audio: value.is_audio ? dat.bool(value.is_audio) : dat.null(),
          rotation: value.rotation ? dat.int32(value.rotation) : dat.null()
        })
      }

      default:
        return undefined
    }
  }

  public transformValueToExpression(value: MediaFieldValue): DataConstructor {
    const media = value.value.media
    if (!media) return dat.null()

    const backendExpression = this.backendExpressionForMedia(media)

    return dat.struct({
      mediaType: this.mediaTypeExpressionForMedia(media),
      id: dat.string(media.id),
      url: dat.string(media.url),
      mimeType: dat.string(media.mimeType),
      filename: dat.string(media.filename),
      fileSize: dat.int32(media.fileSize),
      extension: media.extension ? dat.string(media.extension) : dat.null(),
      focusPoint: media.focusPoint
        ? dat.struct({x: dat.float(media.focusPoint.x), y: dat.float(media.focusPoint.y)})
        : dat.null(),
      focusScale: media.focusScale ? dat.float(media.focusScale) : dat.null(),
      backend: backendExpression ? backendExpression : dat.null()
    })
  }

  public fieldOptions(): MediaFieldOptions & TypedFieldOptions {
    return {
      type: MediaField.type,
      label: this.label,
      description: this.description
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath(value: MediaFieldValue) {
    return [value]
  }

  public async onSave(value: MediaFieldValue, context: SaveContext): Promise<MediaFieldValue> {
    const {media, uploadedMedia} = value.value
    const apiPath = mediaAPIPath(context.config.basePath)
    const signature = context.sessionContext.session!.token
    const isNew = context.id == undefined

    if (uploadedMedia) {
      const response = await commitMedia(
        apiPath,
        uploadedMedia.id,
        !isNew && media ? media.id : undefined,
        signature
      )

      return {
        value: {
          media: {
            ...response,
            focusPoint: {x: 0.5, y: 0.5},
            focusScale: 1
          }
        },
        isValid: true,
        hasChanges: true
      }
    } else if (isNew && media) {
      const response = await copyMedia(apiPath, media.id, signature)
      return {value: {media: {...media, ...response}}, isValid: true, hasChanges: true}
    }

    return {value: {media}, isValid: true, hasChanges: true}
  }

  public async onDelete(value: MediaFieldValue, context: DeleteContext): Promise<MediaFieldValue> {
    const {media} = value.value
    const apiPath = mediaAPIPath(context.config.basePath)
    const signature = context.sessionContext.session!.token

    if (media) await deleteMedia(apiPath, media.id, signature)

    return this.defaultValue
  }

  public static type = 'media'

  static canInferFromModel(model: Model) {
    if (model.type === 'annotation' && model.value === 'field:media') {
      return true
    }

    // TODO: Infer from struct structure
    return false
  }

  static create(model: Model, opts?: MediaFieldOptions) {
    if (model.type === 'annotation') {
      model = model.model
    }

    if (model.type !== 'struct') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "struct" received: "${model.type}"`
      })
    }

    return new this(opts)
  }
}
