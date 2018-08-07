import {ServerPlugin} from '@karma.run/editor-server'
import {ClientPlugin} from '@karma.run/editor-client'
import {EditorContextsForRolesFn, ViewContextsForRolesFn} from '@karma.run/editor-server'

export interface ClientConfiguration {
  plugins?: ClientPlugin[]
}

export interface ServerConfiguration {
  port?: number
  karmaDataURL?: string
  plugins?: ServerPlugin[]
  editorContexts?: EditorContextsForRolesFn
  viewContexts?: ViewContextsForRolesFn
}
