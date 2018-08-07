import React from 'react'
import ReactDOM from 'react-dom'

import {deleteNullValues} from '@karma.run/editor-common'

import {ThemeProvider} from './provider/theme'
import {ConfigProvider} from './provider/config'

import {WorkerProviderContainer} from './provider/worker'
import {SessionProviderContainer} from './provider/session'
import {LocaleProvider} from './provider/locale'
import {LocationProviderContainer} from './provider/location'
import {NotificationProvider} from './provider/notification'
import {ProviderExposerContainer} from './provider/exposer'

import {RootViewContainer} from './view/rootView'
import {ErrorBoundary} from './error/boundary'

import {Config} from './context/config'
import {Theme} from './context/theme'
import {ClientPlugin} from './plugin'

export interface EditorProps {
  config?: Partial<Config>
  theme?: Partial<Theme>
}

export class EditorComponent extends React.Component<EditorProps> {
  public async componentDidMount() {
    await import('./ui/global')

    // Prevent dropping files on window.
    window.addEventListener(
      'dragover',
      (e: DragEvent) => {
        e.preventDefault()
      },
      false
    )

    window.addEventListener(
      'drop',
      (e: DragEvent) => {
        e.preventDefault()
      },
      false
    )
  }

  public render() {
    const config = deleteNullValues(this.props.config) || {}
    const theme = deleteNullValues(this.props.theme) || {}

    return (
      <React.StrictMode>
        <ErrorBoundary>
          <ConfigProvider config={config}>
            <WorkerProviderContainer>
              <LocaleProvider>
                <SessionProviderContainer>
                  <LocationProviderContainer>
                    <ThemeProvider theme={theme}>
                      <NotificationProvider>
                        <ProviderExposerContainer />
                        <RootViewContainer />
                      </NotificationProvider>
                    </ThemeProvider>
                  </LocationProviderContainer>
                </SessionProviderContainer>
              </LocaleProvider>
            </WorkerProviderContainer>
          </ConfigProvider>
        </ErrorBoundary>
      </React.StrictMode>
    )
  }
}

export interface EditorOptions {
  theme?: Partial<Theme>
  plugins?: ClientPlugin[]
}

export interface EditorEventMap {
  configLoaded: Config
}

export class Editor {
  private opts: EditorOptions

  constructor(opts: EditorOptions = {}) {
    this.opts = opts
  }

  public attach(element?: HTMLElement) {
    if (!element) {
      element = document.getElementById('EditorRoot')!
      if (!element) throw new Error('Default element #EditorRoot could not be found!')
    }

    const serverConfigElement = document.getElementById('Config')
    const serverConfig: Config =
      serverConfigElement && serverConfigElement.textContent
        ? JSON.parse(serverConfigElement.textContent)
        : {}

    ReactDOM.render(
      <EditorComponent
        {...this.opts}
        config={{...serverConfig, plugins: this.opts.plugins || []}}
      />,
      element
    )
  }
}
