import {hsl} from 'csx'

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function convertSnakeCaseToCamelCase(str: string) {
  return str.replace(/^_/, '').replace(/(.+?)(?:(?:-|_)+|$)/g, (_, match) => {
    return capitalize(match)
  })
}

export function splitCamelCase(str: string) {
  return str.split(/(?=[A-Z])/)
}

export function convertKeyToLabel(key: string) {
  return splitCamelCase(convertSnakeCaseToCamelCase(key))
    .map(capitalize)
    .join(' ')
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-/g, '')
    .replace(/-$/g, '')
}

export function hashString(str: string) {
  let hash = 0
  let char: number

  if (str.length === 0) return hash

  for (let i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }

  return hash
}

export function stringToColor(str: string, saturation: number = 0.5, lightness: number = 0.8) {
  const hue = ((Math.abs(hashString(str)) % 0xffffff) / 0xffffff) * 360
  return hsl(hue, saturation, lightness).toHexString()
}

const escapeRegExpRegExp = /[-\/\\^$*+?.()|[\]{}]/g

export function escapeRegExp(str: string) {
  return str.replace(escapeRegExpRegExp, '\\$&')
}

declare const window: any
declare const Buffer: any

export function base64Encode(str: string) {
  const escapedStr = unescape(encodeURIComponent(str))

  if (typeof window === 'object') {
    return window.btoa(escapedStr)
  } else {
    return Buffer.from(escapedStr, 'binary').toString('base64')
  }
}

export function base64Decode(base64Str: string) {
  let encodedStr: string

  if (typeof window === 'object') {
    encodedStr = window.atob(base64Str)
  } else {
    encodedStr = Buffer.from(base64Str, 'base64').toString('binary')
  }

  return unescape(encodeURIComponent(encodedStr))
}
