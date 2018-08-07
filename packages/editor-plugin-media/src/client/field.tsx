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

import {data as d, DataExpression} from '@karma.run/sdk'
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
        this.props.sessionContext.session!.signature,
        (progress: number) => {
          this.setState({progress})
        }
      )

      this.props.onValueChange(
        {value: {...this.props.value.value, uploadedMedia: response}, isValid: true},
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

  public readonly defaultValue: MediaFieldValue = {value: {}, isValid: true}
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
    return {value: {media: unserializeMedia(value)}, isValid: true}
  }

  private mediaTypeExpressionForMedia(media: Media): DataExpression {
    switch (media.mediaType) {
      case MediaType.Image:
        return d.union(
          media.mediaType,
          d.struct({
            width: d.int32(media.width),
            height: d.int32(media.height)
          })
        )

      default:
        return d.union(media.mediaType, d.struct())
    }
  }

  private backendExpressionForMedia(media: Media): DataExpression | undefined {
    const backendKey = media.backend && firstKeyOptional(media.backend)

    // TODO: Find pluggable way to expressionify backend specific data
    switch (backendKey) {
      case 'cloudinary': {
        const value: CloudinaryResponse = media.backend[backendKey]
        return d.struct({
          public_id: d.string(value.public_id),
          version: d.int32(value.version),
          signature: d.string(value.signature),
          width: value.width ? d.int32(value.width) : d.null(),
          height: value.height ? d.int32(value.height) : d.null(),
          format: d.string(value.format),
          resource_type: d.string(value.resource_type),
          created_at: d.string(value.created_at),
          tags: d.list(...value.tags.map(tag => d.string(tag))),
          bytes: d.int32(value.bytes),
          type: d.string(value.type),
          etag: d.string(value.etag),
          placeholder: d.bool(value.placeholder),
          url: d.string(value.url),
          secure_url: d.string(value.secure_url),
          access_mode: d.string(value.access_mode),
          original_filename: d.string(value.original_filename),
          pages: value.pages ? d.int32(value.pages) : d.null(),
          frame_rate: value.frame_rate ? d.int32(value.frame_rate) : d.null(),
          bit_rate: value.frame_rate ? d.int32(value.frame_rate) : d.null(),
          duration: value.duration ? d.float(value.duration) : d.null(),
          is_audio: value.is_audio ? d.bool(value.is_audio) : d.null(),
          rotation: value.rotation ? d.int32(value.rotation) : d.null()
        })
      }

      default:
        return undefined
    }
  }

  public transformValueToExpression(value: MediaFieldValue): DataExpression {
    const media = value.value.media
    if (!media) return d.null()

    return d.struct({
      mediaType: this.mediaTypeExpressionForMedia(media),
      id: d.string(media.id),
      url: d.string(media.url),
      mimeType: d.string(media.mimeType),
      filename: d.string(media.filename),
      fileSize: d.int32(media.fileSize),
      extension: media.extension ? d.string(media.extension) : d.null(),
      focusPoint: media.focusPoint
        ? d.struct({x: d.float(media.focusPoint.x), y: d.float(media.focusPoint.y)})
        : d.null(),
      focusScale: media.focusScale ? d.float(media.focusScale) : d.null(),
      backend: this.backendExpressionForMedia(media)
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
    const signature = context.sessionContext.session!.signature
    const isNew = context.id == undefined

    if (uploadedMedia) {
      const response = await commitMedia(
        apiPath,
        uploadedMedia.id,
        !isNew && media ? media.id : undefined,
        signature
      )

      return {value: {media: response}, isValid: true}
    } else if (isNew && media) {
      const response = await copyMedia(apiPath, media.id, signature)
      return {value: {media: {...media, ...response}}, isValid: true}
    }

    return {value: {media}, isValid: true}
  }

  public async onDelete(value: MediaFieldValue, context: DeleteContext): Promise<MediaFieldValue> {
    const {media} = value.value
    const apiPath = mediaAPIPath(context.config.basePath)
    const signature = context.sessionContext.session!.signature

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
