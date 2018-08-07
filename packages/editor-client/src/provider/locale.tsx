import React from 'react'

import {CenteredLoadingIndicator} from '../ui'

import {
  Locale,
  defaultLocale,
  LocaleContext,
  loadLocaleMessageMap,
  LocaleMessageKey
} from '../context/locale'

export const localeMap = new Map<Locale, string>([['en-US', 'English']])

export function getNavigatorLocale(): Locale {
  const languageCodes = window.navigator.languages || [window.navigator.language]

  for (const langCode of languageCodes) {
    // Find exact match
    for (const [locale] of localeMap) {
      const lowerCaseLangCode = langCode.toLowerCase()
      const lowerCaseLocale = locale.toLowerCase()

      if (lowerCaseLangCode === lowerCaseLocale) return locale
    }

    // Find fuzzy match
    for (const [locale] of localeMap) {
      const lowerCaseLangCode = langCode.toLowerCase()
      const lowerCaseLocale = locale.toLowerCase()

      if (lowerCaseLocale.includes(lowerCaseLangCode)) return locale
    }
  }

  return defaultLocale
}

export class LocaleProvider extends React.Component<{}, LocaleContext> {
  constructor(props: {}) {
    super(props)

    this.state = {
      localeMap: localeMap,
      locale: getNavigatorLocale(),
      get: this.get,
      setLocale: this.setLocale
    }
  }

  private setLocale = async (locale: Locale) => {
    if (!this.state.localeMap.has(locale)) throw new Error('Invalid locale!')

    this.setState({
      locale: locale,
      messageMap: await loadLocaleMessageMap(locale)
    })
  }

  private get = (key: LocaleMessageKey) => {
    if (!this.state.messageMap) return key
    return this.state.messageMap[key] || key
  }

  public async componentDidMount() {
    if (this.state.messageMap) return

    this.setState({
      messageMap: await loadLocaleMessageMap(this.state.locale)
    })
  }

  public render() {
    if (!this.state.messageMap) return <CenteredLoadingIndicator />
    return <LocaleContext.Provider value={this.state}>{this.props.children}</LocaleContext.Provider>
  }
}
