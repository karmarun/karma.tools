import {CommitResponse, DeleteResponse} from '../../common'
import {MediaBackend} from './interface'

export class LocalBackend implements MediaBackend {
  public async commit(): Promise<CommitResponse> {
    throw new Error('Not implemented!')
  }

  public async copy(): Promise<CommitResponse> {
    throw new Error('Not implemented!')
  }

  public async delete(): Promise<DeleteResponse> {
    throw new Error('Not implemented!')
  }

  public async thumbnailURL(): Promise<string> {
    throw new Error('Not implemented!')
  }
}
