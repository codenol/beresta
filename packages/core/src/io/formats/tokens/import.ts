/**
 * W3C Design Tokens JSON → SceneGraph Variables
 *
 * Parses the W3C Design Tokens Community Group format (with optional Figma extensions)
 * and creates VariableCollection + Variable entries in the target SceneGraph.
 *
 * Supported token types:
 *   $type: "color"     → VariableType COLOR  ({ r, g, b, a })
 *   $type: "number"    → VariableType FLOAT  (raw number)
 *   $type: "dimension" → VariableType FLOAT  (strip "px" suffix)
 *
 * Multi-mode support: pass `modes` array to create separate modes from multiple
 * JSON sources within the same collection (e.g. Light + Dark).
 */

import type { SceneGraph, Variable, VariableCollection, VariableType, VariableValue, Color } from '../../../scene-graph'
import { generateId } from '../../../scene-graph'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TokenLeaf {
  $type: string
  $value: unknown
  $description?: string
  $extensions?: Record<string, unknown>
}


interface ParsedToken {
  /** Full path joined with '/': e.g. 'button/filled/accent/background/default' */
  name: string
  type: VariableType
  value: VariableValue
}

export interface ImportTokensOptions {
  /** Name of the VariableCollection to create */
  collectionName: string
  /**
   * Optional multi-mode import. Each entry provides a mode name and its JSON source.
   * The first entry's mode becomes the defaultMode.
   * When omitted, a single mode "Default" is created from the main `json` argument.
   */
  modes?: Array<{ name: string; json: unknown }>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isTokenLeaf(obj: unknown): obj is TokenLeaf {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '$value' in obj &&
    '$type' in obj
  )
}

/**
 * Walk the token tree depth-first, yielding leaf tokens with their full path.
 * Skips keys starting with '$' (metadata).
 */
function walkTokenTree(node: unknown, path: string[], out: ParsedToken[]): void {
  if (!node || typeof node !== 'object') return

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key.startsWith('$')) continue

    const childPath = [...path, key]

    if (isTokenLeaf(value)) {
      const parsed = parseTokenLeaf(childPath, value)
      if (parsed) out.push(parsed)
    } else if (typeof value === 'object' && value !== null) {
      walkTokenTree(value, childPath, out)
    }
  }
}

function parseTokenLeaf(path: string[], leaf: TokenLeaf): ParsedToken | null {
  const name = path.join('/')
  const { $type, $value } = leaf

  if ($type === 'color') {
    const color = parseColorValue($value)
    if (!color) return null
    return { name, type: 'COLOR', value: color }
  }

  if ($type === 'number' || $type === 'dimension') {
    const num = parseNumberValue($value)
    if (num === null) return null
    return { name, type: 'FLOAT', value: num }
  }

  if ($type === 'string') {
    return { name, type: 'STRING', value: String($value) }
  }

  if ($type === 'boolean') {
    return { name, type: 'BOOLEAN', value: Boolean($value) }
  }

  // Unknown type — skip
  return null
}

function parseColorValue(value: unknown): Color | null {
  if (!value || typeof value !== 'object') {
    // Plain hex string
    if (typeof value === 'string') return hexToColor(value, 1)
    return null
  }

  const v = value as Record<string, unknown>

  // Figma extension format: { colorSpace, components: [r,g,b], alpha, hex }
  if ('components' in v && Array.isArray(v.components)) {
    const [r = 0, g = 0, b = 0] = v.components as number[]
    const a = typeof v.alpha === 'number' ? v.alpha : 1
    return { r, g, b, a }
  }

  // Hex string in value object
  if ('hex' in v && typeof v.hex === 'string') {
    const a = typeof v.alpha === 'number' ? v.alpha : 1
    return hexToColor(v.hex, a)
  }

  // Plain string color
  if (typeof value === 'string') return hexToColor(value, 1)

  return null
}

function parseNumberValue(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value.replace('px', ''))
    return isNaN(num) ? null : num
  }
  return null
}

function hexToColor(hex: string, alpha: number): Color | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 8) return null
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : alpha
  return { r, g, b, a }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parse a W3C Design Tokens JSON object and import it into a SceneGraph
 * as a VariableCollection with Variables.
 *
 * @param json    The parsed token JSON object (one file or mode)
 * @param graph   Target SceneGraph
 * @param options Collection name + optional multi-mode config
 * @returns       The created VariableCollection
 */
export function importTokensJSON(
  json: unknown,
  graph: SceneGraph,
  options: ImportTokensOptions
): VariableCollection {
  const { collectionName, modes } = options

  // Build modes list
  const modeList = modes && modes.length > 0
    ? modes.map((m) => ({ modeId: generateId(), name: m.name }))
    : [{ modeId: generateId(), name: 'Default' }]

  const collectionId = generateId()
  const collection: VariableCollection = {
    id: collectionId,
    name: collectionName,
    modes: modeList,
    defaultModeId: modeList[0].modeId,
    variableIds: [],
  }
  graph.addCollection(collection)

  // Parse tokens per mode
  // For single-mode: parse `json` into modeList[0]
  // For multi-mode: parse each modes[i].json into modeList[i]
  const modeTokenMaps: Map<string, ParsedToken>[] = modeList.map((_mode, i) => {
    const src = modes ? modes[i]?.json : json
    const tokens: ParsedToken[] = []
    walkTokenTree(src, [], tokens)
    const map = new Map<string, ParsedToken>()
    for (const t of tokens) map.set(t.name, t)
    return map
  })

  // Collect all unique token names across all modes
  const allNames = new Set<string>()
  for (const map of modeTokenMaps) {
    for (const name of map.keys()) allNames.add(name)
  }

  // Create one Variable per token name
  for (const name of allNames) {
    // Determine type from first mode that has this token
    let type: VariableType = 'STRING'
    for (const map of modeTokenMaps) {
      const t = map.get(name)
      if (t) { type = t.type; break }
    }

    const valuesByMode: Record<string, VariableValue> = {}
    for (let i = 0; i < modeList.length; i++) {
      const t = modeTokenMaps[i].get(name)
      if (t) {
        valuesByMode[modeList[i].modeId] = t.value
      } else {
        // Fall back to first mode's value
        const fallback = modeTokenMaps[0].get(name)
        if (fallback) valuesByMode[modeList[i].modeId] = fallback.value
      }
    }

    const variable: Variable = {
      id: generateId(),
      name,
      type,
      collectionId,
      valuesByMode,
      description: '',
      hiddenFromPublishing: false,
    }

    graph.addVariable(variable)
  }

  return collection
}
