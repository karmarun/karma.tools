import * as React from 'react'

import {style} from 'typestyle'
import {KarmaAPIError, PermissionDeniedError} from '@karma.run/sdk'

import {
  TextInputType,
  ButtonType,
  Color,
  Spacing,
  FontWeight,
  Button,
  TextInput,
  CenteredLoadingIndicator,
  MessageBar,
  MessageBarType,
  ButtonStyle
} from '../ui'

import {NotificationContext, withNotification} from '../context/notification'
import {SessionContext, withSession, EditorSession} from '../context/session'
import {LocaleContext, withLocale} from '../context/locale'
import {Theme, withTheme} from '../context/theme'

export interface LoginFormState {
  username: string
  password: string
  isSubmitting: boolean
  isRestoringSession: boolean
  error?: string
}

export interface LoginFormProps {
  session?: EditorSession
  theme: Theme
  sessionContext: SessionContext
  localeContext: LocaleContext
  notificationContext: NotificationContext
}

export const LoginFormStyle = style({
  $debugName: 'LoginForm',

  background: `radial-gradient(circle at center, ${Color.primary.light1}, ${Color.primary.base})`,
  width: '100%',
  height: '100%',

  $nest: {
    '> .wrapper': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      width: '100%',
      height: '100%',

      $nest: {
        '> .content': {
          display: 'flex',
          flexDirection: 'column',
          width: '30rem',

          $nest: {
            '> .header': {
              display: 'flex',
              flexDirection: 'column',
              marginBottom: Spacing.largest,

              $nest: {
                '> .logo': {
                  justifySelf: 'center',
                  height: '15rem',
                  marginBottom: Spacing.large,
                  textAlign: 'center',

                  $nest: {
                    '> svg': {
                      fill: Color.neutral.white,
                      height: '100%'
                    }
                  }
                },

                '> .title': {
                  fontSize: '3rem',
                  fontWeight: FontWeight.light
                },

                '> .subtitle': {
                  fontSize: '1.8rem',
                  fontWeight: FontWeight.light
                }
              }
            },

            '> .form': {
              $nest: {
                '> .fieldWrapper': {
                  marginBottom: Spacing.largest,

                  $nest: {
                    '> .label': {
                      fontWeight: FontWeight.bold,
                      marginBottom: Spacing.medium
                    },

                    '> .field': {
                      marginBottom: Spacing.large
                    }
                  }
                },

                [`.${ButtonStyle}`]: {
                  width: '100%'
                }
              }
            }
          }
        }
      }
    }
  }
})

export class Login extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props)

    this.state = {
      username: '',
      password: '',
      isSubmitting: false,
      isRestoringSession: false
    }
  }

  private handleUsernameChange = (username: string) => {
    this.setState({username})
  }

  private handlePasswordChange = (password: string) => {
    this.setState({password})
  }

  private handleSubmitClick = async () => {
    this.setState({isSubmitting: true, error: undefined})

    try {
      await this.props.sessionContext.authenticate(this.state.username, this.state.password)
    } catch (err) {
      console.error(err)
      const karmaError: KarmaAPIError = err

      if (karmaError instanceof PermissionDeniedError) {
        this.setState({
          isSubmitting: false,
          error: 'Invalid login'
        })
      } else {
        this.setState({
          isSubmitting: false,
          error: karmaError.message
        })
      }
    }
  }

  public async componentDidMount() {
    if (this.props.session) {
      this.setState({isRestoringSession: true})

      try {
        await this.props.sessionContext.restoreSession(this.props.session)
      } catch (err) {
        console.error(err)
        this.setState({
          isRestoringSession: false,
          error: 'Session expired'
        })
      }
    } else if (this.props.sessionContext.canRestoreSessionFromStorage) {
      this.setState({isRestoringSession: true})

      try {
        await this.props.sessionContext.restoreSessionFromLocalStorage()
      } catch (err) {
        console.error(err)
        this.setState({
          isRestoringSession: false,
          error: 'Session expired'
        })
      }
    }
  }

  public render() {
    return (
      <div className={LoginFormStyle}>
        <div className="wrapper">
          <div className="content">
            <div className="header">
              <div className="logo">
                <this.props.theme.logo />
              </div>
            </div>
            {this.state.isRestoringSession ? (
              <CenteredLoadingIndicator />
            ) : (
              <form className="form">
                <div className="fieldWrapper">
                  <div className="field">
                    <TextInput
                      onChange={this.handleUsernameChange}
                      name="username"
                      placeholder={this.props.localeContext.get('username')}
                      disabled={this.state.isSubmitting}
                      value={this.state.username}
                      type={TextInputType.Lighter}
                    />
                  </div>
                  <div className="field">
                    <TextInput
                      onChange={this.handlePasswordChange}
                      name="password"
                      placeholder={this.props.localeContext.get('password')}
                      isPassword={true}
                      disabled={this.state.isSubmitting}
                      value={this.state.password}
                      type={TextInputType.Lighter}
                    />
                  </div>
                  {this.state.error && (
                    <MessageBar type={MessageBarType.Error} message={this.state.error} />
                  )}
                </div>
                <Button
                  type={ButtonType.Primary}
                  onTrigger={this.handleSubmitClick}
                  label={this.props.localeContext.get('login')}
                  disabled={this.state.isSubmitting}
                  loading={this.state.isSubmitting}
                />
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export const LoginContainer = withLocale(withSession(withTheme(withNotification(Login))))
