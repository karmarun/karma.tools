import React from 'react'
import {createContextHOC} from './helper'

export type LocaleMessageMap = typeof import('../locale/en-US').default
export type LocaleMessageKey = keyof LocaleMessageMap

export type Locale = 'en-US'
export const defaultLocale: Locale = 'en-US'

export async function loadLocaleMessageMap(locale: Locale): Promise<LocaleMessageMap> {
  switch (locale) {
    case 'en-US':
      return (await import('../locale/en-US')).default
  }
}

export interface LocaleContext {
  localeMap: Map<string, string>
  locale: Locale
  messageMap?: LocaleMessageMap
  get(key: LocaleMessageKey): string
  setLocale(locale: string): void
}

export const LocaleContext = React.createContext<LocaleContext>({
  localeMap: new Map(),
  locale: defaultLocale,
  get(key: LocaleMessageKey): string {
    return key.toString()
  },
  setLocale(): void {}
})

export const withLocale = createContextHOC(LocaleContext, 'localeContext', 'withLocale')
