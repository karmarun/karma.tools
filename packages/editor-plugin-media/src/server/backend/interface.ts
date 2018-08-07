import {IntermediateFile} from '../helper'
import {CommitResponse, CopyResponse, DeleteResponse} from '../../common'

export interface MediaBackend {
  commit(file: IntermediateFile, overrideID?: string): Promise<CommitResponse>
  copy(id: string): Promise<CopyResponse>
  delete(id: string): Promise<DeleteResponse>
  thumbnailURL(id: string): Promise<string>
}
