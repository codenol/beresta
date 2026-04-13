/**
 * Beresta Standard design token files (W3C Design Tokens format).
 *
 * Sources:
 *   palette.tokens.json    — base color palette (warm-gray, cool-gray, nile-blue…)
 *   dimensions.tokens.json — border-radius + spacing scale (mode-invariant)
 *   light.tokens.json      — semantic component tokens, Light mode
 *   dark.tokens.json       — semantic component tokens, Dark mode
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JSON imports are valid in Vite/Bun/Node with resolveJsonModule
import palette from './palette.tokens.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dimensions from './dimensions.tokens.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import light from './light.tokens.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dark from './dark.tokens.json'

export { palette, dimensions, light, dark }
