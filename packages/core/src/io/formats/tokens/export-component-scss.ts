/**
 * SCSS export for a single component archetype.
 *
 * Generates a CSS custom-properties file scoped to Light and Dark modes,
 * covering all tokens whose name starts with `{archetypeId}/`.
 *
 * Output format:
 *
 *   :root,
 *   [data-theme="light"] {
 *     --button-filled-accent-background-default: #2D98B4;
 *     --button-filled-accent-text-default: #FFFFFF;
 *   }
 *
 *   [data-theme="dark"] {
 *     --button-filled-accent-background-default: #1A6A7E;
 *     --button-filled-accent-text-default: #FFFFFF;
 *   }
 *
 * Usage:
 *   const scss = exportComponentSCSS('button', graph)
 *   // → save as button.scss
 */

import { colorToHex, colorToHex8 } from '../../../color'
import type { SceneGraph, Color, VariableValue } from '../../../scene-graph'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isColor(v: VariableValue): v is Color {
  return typeof v === 'object' && v !== null && 'r' in v
}

function colorToCSSValue(c: Color): string {
  return c.a >= 1 ? colorToHex(c) : colorToHex8(c)
}

/**
 * Resolve a variable value, following alias chains within the graph.
 * Returns null on circular reference or missing variable.
 */
function resolveValue(
  val: VariableValue,
  graph: SceneGraph,
  seen: Set<string> = new Set()
): VariableValue | null {
  if (typeof val === 'object' && val !== null && 'aliasId' in val) {
    if (seen.has(val.aliasId)) return null
    seen.add(val.aliasId)
    const target = graph.variables.get(val.aliasId)
    if (!target) return null
    const col = graph.variableCollections.get(target.collectionId)
    const modeId = col?.defaultModeId ?? Object.keys(target.valuesByMode)[0]
    if (!modeId) return null
    return resolveValue(target.valuesByMode[modeId], graph, seen)
  }
  return val
}

/**
 * Resolve a variable value for a specific mode, falling back to alias
 * resolution using the target variable's own collection default mode.
 */
function resolveForMode(
  val: VariableValue,
  graph: SceneGraph
): VariableValue | null {
  return resolveValue(val, graph)
}

function valueToCSS(resolved: VariableValue | null): string | null {
  if (resolved === null) return null
  if (isColor(resolved)) return colorToCSSValue(resolved)
  if (typeof resolved === 'number') return `${resolved}px`
  if (typeof resolved === 'string') return resolved
  return null
}

/** Convert "button/filled/accent/background/default" → "--button-filled-accent-background-default" */
function varNameToCSSProp(name: string): string {
  return '--' + name.replace(/\//g, '-')
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generate a SCSS/CSS file for a single archetype.
 *
 * @param archetypeId  e.g. "button"
 * @param graph        SceneGraph that includes the "Semantic" variable collection
 *                     with Light and Dark modes.
 * @returns            SCSS string ready to save as `{archetypeId}.scss`
 */
export function exportComponentSCSS(archetypeId: string, graph: SceneGraph): string {
  // Find the Semantic collection
  let semanticCol = null
  for (const col of graph.variableCollections.values()) {
    if (col.name === 'Semantic') {
      semanticCol = col
      break
    }
  }

  if (!semanticCol) {
    return `/* No Semantic token collection found in this graph */\n`
  }

  // Identify Light and Dark mode IDs
  const lightMode = semanticCol.modes.find(
    (m) => m.name.toLowerCase() === 'light' || m.modeId === semanticCol!.defaultModeId
  )
  const darkMode = semanticCol.modes.find(
    (m) => m.name.toLowerCase() === 'dark' && m.modeId !== semanticCol!.defaultModeId
  )

  const lightModeId = lightMode?.modeId ?? semanticCol.defaultModeId

  // Collect variables for this archetype
  const prefix = archetypeId + '/'
  const lightLines: string[] = []
  const darkLines: string[] = []

  for (const varId of semanticCol.variableIds) {
    const variable = graph.variables.get(varId)
    if (!variable) continue
    if (!variable.name.startsWith(prefix)) continue

    const cssProp = varNameToCSSProp(variable.name)

    // Light value
    const lightRaw = variable.valuesByMode[lightModeId]
    if (lightRaw !== undefined) {
      const lightResolved = resolveForMode(lightRaw, graph)
      const lightCSS = valueToCSS(lightResolved)
      if (lightCSS !== null) {
        lightLines.push(`  ${cssProp}: ${lightCSS};`)
      }
    }

    // Dark value (only if there is a Dark mode)
    if (darkMode) {
      const darkRaw = variable.valuesByMode[darkMode.modeId]
      if (darkRaw !== undefined) {
        const darkResolved = resolveForMode(darkRaw, graph)
        const darkCSS = valueToCSS(darkResolved)
        if (darkCSS !== null) {
          darkLines.push(`  ${cssProp}: ${darkCSS};`)
        }
      }
    }
  }

  if (lightLines.length === 0) {
    return `/* No tokens found for archetype "${archetypeId}" */\n`
  }

  const blocks: string[] = []

  // Light block
  blocks.push(`:root,\n[data-theme="light"] {`)
  blocks.push(...lightLines)
  blocks.push(`}`)

  // Dark block
  if (darkLines.length > 0) {
    blocks.push(``)
    blocks.push(`[data-theme="dark"] {`)
    blocks.push(...darkLines)
    blocks.push(`}`)
  }

  return blocks.join('\n') + '\n'
}
