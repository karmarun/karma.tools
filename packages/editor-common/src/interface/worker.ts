export interface InputMessage<T, I> {
  id: string
  type: T
  input: I
}

export interface OutputMessage<T, O> {
  id: string
  type: T
  output: O
}

export interface MessageMap {
  [key: string]: {input: any; output: any}
}

export interface WorkerTypeMap extends MessageMap {
  hash: {input: {costFactor: number; value: string}; output: string}
  salt: {input: {costFactor: number}; output: string}
}
