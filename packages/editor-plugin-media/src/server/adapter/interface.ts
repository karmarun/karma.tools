import {IntermediateFile} from '../helper'
import {CommitResponse, CopyResponse, DeleteResponse} from '../../common'
import {Stream} from 'stream'

export interface MediaTransformation {
  width?: string
  height?: string
}

export interface MediaAdapter {
  commit(file: IntermediateFile, overrideID?: string): Promise<CommitResponse>
  copy(id: string): Promise<CopyResponse>
  delete(id: string): Promise<DeleteResponse>
  get(id: string, transformations: MediaTransformation[]): Promise<string | Stream>
  thumbnailURL(id: string): Promise<string>
}
