import axios from 'axios'
import {SignatureHeader} from '@karma.run/sdk'
import {UploadResponse, CommitResponse, CopyResponse, DeleteResponse} from '../common'

const httpClient = axios.create()

export type ProgressCallbackFn = (progress: number) => void

export async function uploadMedia(
  baseURL: string,
  file: File,
  signature: string,
  onProgress?: ProgressCallbackFn
): Promise<UploadResponse> {
  const data = new FormData()
  data.append('file', file)

  const response = await httpClient.post(`${baseURL}/upload`, data, {
    headers: {[SignatureHeader]: signature},
    onUploadProgress: (e: ProgressEvent) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.loaded / e.total)
      }
    }
  })

  return response.data
}

export async function commitMedia(
  baseURL: string,
  id: string,
  overrideID: string | undefined,
  signature: string
): Promise<CommitResponse> {
  encodeURIComponent
  const response = await httpClient.post(
    `${baseURL}/commit`,
    {id, overrideID},
    {headers: {[SignatureHeader]: signature}}
  )
  return response.data
}

export async function copyMedia(
  baseURL: string,
  id: string,
  signature: string
): Promise<CopyResponse> {
  const response = await httpClient.post(
    `${baseURL}/copy`,
    {id},
    {headers: {[SignatureHeader]: signature}}
  )
  return response.data
}

export async function deleteMedia(
  baseURL: string,
  id: string,
  signature: string
): Promise<DeleteResponse> {
  const response = await httpClient.delete(`${baseURL}/${id}`, {
    headers: {[SignatureHeader]: signature}
  })
  return response.data
}

export interface ClientOptions {
  baseURL: string
  signature: string
}

export class MediaClient {
  private baseURL: string
  private signature: string

  public constructor(opts: ClientOptions) {
    this.baseURL = opts.baseURL
    this.signature = opts.signature
  }

  public upload(file: File, onProgress?: ProgressCallbackFn) {
    return uploadMedia(this.baseURL, file, this.signature, onProgress)
  }

  public commit(id: string, overrideID?: string) {
    return commitMedia(this.baseURL, id, overrideID, this.signature)
  }

  public copy(id: string) {
    return copyMedia(this.baseURL, this.signature, id)
  }

  public delete(id: string) {
    return deleteMedia(this.baseURL, this.signature, id)
  }
}
