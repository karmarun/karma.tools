import * as shortid from 'shortid'

import {
  mapObject,
  ObjectMap,
  InputMessage,
  OutputMessage,
  MessageMap
} from '@karma.run/editor-common'

export type MessageTypeMap<T extends MessageMap> = {[K in keyof T]: undefined}

export type MessageFunctionMap<T extends MessageMap> = {
  [K in keyof T]: (input: T[K]['input']) => Promise<T[K]['output']>
}

export function createWorkerInterface<T extends MessageMap>(
  worker: Worker,
  messageTypeMap: MessageTypeMap<T>
): MessageFunctionMap<T> {
  const callbacks: ObjectMap<(output: any) => void> = {}

  worker.addEventListener('message', e => {
    const msg: OutputMessage<any, any> = e.data
    callbacks[msg.id](msg.output)
  })

  return mapObject(messageTypeMap, (_value, type) => (input: any) =>
    new Promise<any>(resolve => {
      const id = shortid.generate()
      const msg: InputMessage<any, any> = {id, type, input}

      callbacks[id] = output => {
        delete callbacks[id]
        resolve(output)
      }

      worker.postMessage(msg)
    })
  ) as MessageFunctionMap<T>
}
