import {CSSProperties, NestedCSSProperties, NestedCSSSelectors} from 'typestyle/lib/types'

export const Spacing = {
  smallest: '0.25rem',
  small: '0.5rem',
  medium: '1rem',
  large: '1.5rem',
  larger: '2.0rem',
  largest: '2.5rem'
}

export const FontFamily = {
  primary: 'Open Sans, sans-serif'
}

export const FontSize = {
  largest: '2.8rem',
  larger: '2.4rem',
  large: '2.0rem',
  medium: '1.5rem',
  small: '1.3rem'
}

export const FontWeight = {
  light: 300,
  medium: 400,
  bold: 600
}

export const Color = {
  primary: {
    light5: '#CBD0D2',
    light3: '#6D789F',
    light2: '#3B879B',
    light1: '#314E55',
    base: '#06323D',
    dark1: '#06262D'
  },

  neutral: {
    white: '#FFFFFF',
    light5: '#F1F1F1',
    light4: '#FCFCFC',
    light3: '#F4F4F4',
    light2: '#EAEAEA',
    light1: '#E2E2E2',
    base: '#CCCCCC',
    dark1: '#AAAAAA',
    dark2: '#666666',
    black: '#222222'
  },
  error: {
    light2: '#FFDDDD',
    light1: '#FFCCCC',
    base: '#CC5555',
    dark1: '#CC0000'
  },
  success: {
    light2: '#DDFFDD',
    light1: '#CCFFCC',
    base: '#55CC55',
    dark1: '#00CC00'
  },

  rootFieldColors: ['#FFFFFF'],

  fieldColors: [['#FAFAFA', '#F2F2F2'], ['#E2E2E2', '#EEEEEE']],

  fieldColorsDark: [['#E4E4E4'], ['#D4D4D4']],

  focus: '#314E55'
}

export const MarkerWidth = '7px'
export const DefaultBorderRadius = 3
export const DefaultBorderRadiusPx = `${DefaultBorderRadius}px`

export function bottomShadow(offset: number = 0, height: number = 10): CSSProperties {
  return {
    content: '""',
    pointerEvents: 'none',
    display: 'block',
    position: 'absolute',
    bottom: `-${height + offset}px`,
    width: '100%',
    height: `${height}px`,
    background: 'linear-gradient(rgba(0, 0, 0, 0.075), rgba(0, 0, 0, 0))'
  }
}

export function innerShadow(height: number = 10): NestedCSSSelectors {
  return {
    '&::before': {
      content: '""',
      pointerEvents: 'none',
      display: 'block',
      position: 'absolute',
      width: '100%',
      top: '0',
      height: `${height}px`,
      background: 'linear-gradient(rgba(0, 0, 0, 0.075), rgba(0, 0, 0, 0))'
    },

    '&::after': {
      content: '""',
      pointerEvents: 'none',
      display: 'block',
      position: 'absolute',
      bottom: '0',
      width: '100%',
      height: `${height}px`,
      background: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.05))'
    }
  }
}

export function fieldColorForDepthAndIndex(depth: number, index: number) {
  if (depth === 0) {
    return Color.rootFieldColors[index % Color.rootFieldColors.length]
  }

  const depthArray = Color.fieldColors[(depth - 1) % Color.fieldColors.length]
  return depthArray[index % depthArray.length]
}

export function darkFieldColorForDepthAndIndex(depth: number, index: number) {
  const depthArray = Color.fieldColorsDark[depth % Color.fieldColorsDark.length]
  return depthArray[index % depthArray.length]
}

export function marginTopExceptFirst(margin: string): NestedCSSProperties {
  return {marginTop: margin, $nest: {'&:first-child': {marginTop: 0}}}
}

export function marginLeftExceptFirst(margin: string): NestedCSSProperties {
  return {marginLeft: margin, $nest: {'&:first-child': {marginLeft: 0}}}
}

export function solidBorderWithColor(color: string): string {
  return `1px solid ${color}`
}
