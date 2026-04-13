/**
 * buildStandardLibrary — creates the "Beresta Standard" built-in library.
 *
 * Imports design tokens (palette, dimensions, Light/Dark semantic) into a fresh
 * SceneGraph, renders JSX templates for all 37 archetypes as COMPONENT nodes,
 * populates ArchetypeTokenBindings from the Semantic collection, and returns the
 * ready-to-register { manifest, graph } pair.
 *
 * Usage:
 *   const { manifest, graph } = await buildStandardLibrary()
 *   libraryRegistry.register(manifest, graph)
 */

import { SceneGraph } from '../../scene-graph'
import type { ArchetypeTokenBinding } from '../../scene-graph'
import { LibraryRegistry } from '../../library'
import { importTokensJSON } from '../../io/formats/tokens/import'
import { renderJSX } from '../../design-jsx/render'
import { COMPONENT_TEMPLATES } from './templates'
import { BUILT_IN_ARCHETYPES } from '../archetypes'
import { palette, dimensions, light, dark } from './tokens'

export const BERESTA_STANDARD_LIBRARY_ID = 'beresta:standard'
export const BERESTA_STANDARD_LIBRARY_NAME = 'Beresta Standard'

// ---------------------------------------------------------------------------
// Token population helper
// ---------------------------------------------------------------------------

/**
 * Walk the Semantic variable collection and build ArchetypeTokenBinding entries
 * for each archetype based on the variable naming convention:
 *
 *   {archetypeId}/{variantSegments...}/{cssProperty}/{cssState}
 *
 * e.g. "button/filled/accent/background/default"
 *   → archetypeId: "button", variant: "filled/accent", property: "background-default"
 *
 * Variables with only two path segments (e.g. "input/background/default") are
 * treated as global (non-variant) tokens for the archetype.
 */
function populateArchetypeTokenBindings(graph: SceneGraph): void {
  // Find the Semantic collection
  let semanticCol = null
  for (const col of graph.variableCollections.values()) {
    if (col.name === 'Semantic') {
      semanticCol = col
      break
    }
  }
  if (!semanticCol) return

  const archetypeIds = new Set(BUILT_IN_ARCHETYPES.map((a) => a.id))
  // Map: archetypeId → binding (mutable accumulator)
  const bindingMap = new Map<string, ArchetypeTokenBinding>()

  for (const varId of semanticCol.variableIds) {
    const variable = graph.variables.get(varId)
    if (!variable) continue

    // Split name: "button/filled/accent/background/default" → ["button", "filled", "accent", "background", "default"]
    const segments = variable.name.split('/').filter(Boolean)
    if (segments.length < 2) continue

    const archetypeId = segments[0]
    if (!archetypeIds.has(archetypeId)) continue

    // Ensure binding entry exists
    if (!bindingMap.has(archetypeId)) {
      bindingMap.set(archetypeId, { archetypeId, variantTokens: {}, globalTokens: {} })
    }
    const binding = bindingMap.get(archetypeId)!

    if (segments.length === 2) {
      // e.g. "sidebar/background" — top-level global
      const cssProp = segments[1]
      binding.globalTokens![cssProp] = varId
    } else if (segments.length === 3) {
      // e.g. "input/background/default" — global token with state
      const cssProp = `${segments[1]}-${segments[2]}`
      binding.globalTokens![cssProp] = varId
    } else {
      // segments.length >= 4
      // Last two segments = css-property + css-state
      // Everything between archetypeId and those = variant path
      const cssState = segments[segments.length - 1]
      const cssPropName = segments[segments.length - 2]
      const variantSegments = segments.slice(1, segments.length - 2)
      const variantKey = variantSegments.join('/')
      const cssProp = `${cssPropName}-${cssState}`

      if (!binding.variantTokens![variantKey]) {
        binding.variantTokens![variantKey] = {}
      }
      binding.variantTokens![variantKey][cssProp] = varId
    }
  }

  // Push into graph
  for (const binding of bindingMap.values()) {
    graph.archetypeTokenBindings.push(binding)
  }
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export async function buildStandardLibrary(): Promise<{
  manifest: ReturnType<typeof LibraryRegistry.buildManifest>
  graph: SceneGraph
}> {
  const graph = new SceneGraph()

  // ── 1. Import design tokens ──────────────────────────────────────────────

  importTokensJSON(palette, graph, { collectionName: 'Palette' })

  importTokensJSON(dimensions, graph, {
    collectionName: 'Dimensions',
    modes: [{ name: 'Mode 1', json: dimensions }],
  })

  importTokensJSON(light, graph, {
    collectionName: 'Semantic',
    modes: [
      { name: 'Light', json: light },
      { name: 'Dark', json: dark },
    ],
  })

  // ── 2. Populate ArchetypeTokenBindings ───────────────────────────────────

  populateArchetypeTokenBindings(graph)

  // ── 3. Create internal library page ─────────────────────────────────────

  const page = graph.createNode('CANVAS', graph.rootId, {
    name: '__library_components__',
    internalOnly: true,
  })

  // ── 4. Render each archetype template as a COMPONENT node ───────────────

  let x = 0
  for (const archetype of BUILT_IN_ARCHETYPES) {
    const template = COMPONENT_TEMPLATES[archetype.id]
    if (!template) continue

    try {
      const result = await renderJSX(graph, template, {
        parentId: page.id,
        x,
        y: 0,
      })

      // Upgrade the rendered FRAME to a COMPONENT and tag with archetypeId
      graph.updateNode(result.id, {
        type: 'COMPONENT',
        name: archetype.name,
        archetypeId: archetype.id,
      })

      // Space out components on the page (approximate 400px per slot)
      x += 400
    } catch (err) {
      // Skip templates that fail to render (e.g. unsupported JSX feature)
      console.warn('[buildStandardLibrary] Failed to render', archetype.id, ':', err)
    }
  }

  // ── 5. Build and return manifest ─────────────────────────────────────────

  const manifest = LibraryRegistry.buildManifest(
    BERESTA_STANDARD_LIBRARY_ID,
    BERESTA_STANDARD_LIBRARY_NAME,
    graph
  )

  console.log(
    '[buildStandardLibrary] done:',
    manifest.componentCount, 'components,',
    manifest.variableCount, 'variables,',
    graph.variableCollections.size, 'collections,',
    x, 'px rendered'
  )

  return { manifest, graph }
}
