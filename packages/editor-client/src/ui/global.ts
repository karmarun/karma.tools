import {cssRule, forceRenderStyles} from 'typestyle'
import {Color, FontFamily, FontWeight} from './style'

cssRule('html', {
  boxSizing: 'border-box',

  fontFamily: FontFamily.primary,
  fontSize: '10px',

  color: Color.neutral.light5,
  background: `radial-gradient(circle at center, ${Color.primary.light1}, ${Color.primary.base})`
})

cssRule('p', {
  lineHeight: 1.3
})

cssRule('body', {
  fontSize: '1.4rem'
})

cssRule('body, html, #EditorRoot', {
  margin: 0,

  width: '100%',
  height: '100%'
})

cssRule('*, *:before, *:after ', {
  boxSizing: 'inherit'
})

cssRule('a, a:link, a:visited', {
  color: 'inherit',
  textDecoration: 'none'
})

cssRule('p a, p a:link, p a:visited', {
  color: Color.primary.light2,
  textDecoration: 'underline'
})

cssRule('h1, h2, h3, h4, h5, h6, p', {
  margin: '0.75rem 0'
})

cssRule('strong, bold', {
  fontWeight: FontWeight.bold
})

cssRule('h1', {
  fontWeight: 500,
  fontSize: '2.6em'
})

cssRule('h2', {
  fontWeight: 500,
  fontSize: '2.3em'
})

cssRule('h3', {
  fontWeight: 500,
  fontSize: '2em'
})

cssRule('h4', {
  fontWeight: 500,
  fontSize: '1.5em'
})

cssRule('h5', {
  fontWeight: 500,
  fontSize: '1.25em'
})

cssRule('h6', {
  fontWeight: 500,
  fontSize: '1em'
})

// To prevent FOUC on initial render
forceRenderStyles()
