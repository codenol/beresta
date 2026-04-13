/**
 * archetype-matcher.ts
 *
 * After importing a .fig or .pen file, walk all COMPONENT nodes and attempt
 * to assign an archetypeId based on the component's name.
 *
 * Uses the alias map from BUILT_IN_ARCHETYPES for fuzzy matching:
 *   "PrimaryButton" → "button"
 *   "TextInput"     → "input"
 *   "CheckboxItem"  → "checkbox"
 *
 * Only sets archetypeId when a confident match is found; unmatched components
 * are left untouched so designers can map them manually in the UI.
 */

import type { SceneGraph } from '../scene-graph'
import { BUILT_IN_ARCHETYPES, buildAliasMap, matchArchetype } from './archetypes'

const _aliasMap = buildAliasMap(BUILT_IN_ARCHETYPES)

/**
 * Walk all COMPONENT nodes in `graph` and assign `archetypeId` where a match
 * is found. Existing `archetypeId` values are preserved (not overwritten).
 */
export function matchComponentsToArchetypes(graph: SceneGraph): void {
  for (const node of graph.getAllNodes()) {
    if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') continue
    if (node.archetypeId) continue // already mapped

    const matched = matchArchetype(node.name, _aliasMap)
    if (matched) {
      node.archetypeId = matched
    }
  }
}
