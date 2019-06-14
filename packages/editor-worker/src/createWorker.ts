import {InputMessage, MessageMap} from '@karma.run/editor-common'

export type MessageHandlerMap<T extends MessageMap> = {
  [K in keyof T]: (input: T[K]['input']) => T[K]['output']
}

export function createWorker<T extends MessageMap>(
  name: string,
  handleMessage: MessageHandlerMap<T>
) {
  addEventListener('message', e => {
    const msg: InputMessage<keyof T, T['input']> = e.data
    const handler = handleMessage[msg.type]

    if (!handler) throw new Error('Invalid message sent to worker!')

    const output = handler(msg.input)
    const outMsg = {id: msg.id, type: msg.type, output}

    postMessage(outMsg)
  })

  console.info(`${name} worker started...`)
}
