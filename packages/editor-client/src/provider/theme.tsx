import React from 'react'
import {Theme, ThemeContext, defaultTheme} from '../context/theme'

export interface ThemeProviderProps {
  theme: Partial<Theme>
}

export class ThemeProvider extends React.Component<ThemeProviderProps, Theme> {
  public constructor(props: ThemeProviderProps) {
    super(props)

    this.state = {
      ...defaultTheme,
      ...props.theme
    }
  }

  public render() {
    return <ThemeContext.Provider value={this.state}>{this.props.children}</ThemeContext.Provider>
  }
}
