/**
 * React (.tsx) component export for a single archetype.
 *
 * Generates a self-contained, shadcn/ui-compatible React component that:
 *   - Imports its companion SCSS token file
 *   - Types its props from the archetype schema
 *   - Renders a semantic HTML element with BEM-style class names
 *
 * The output is intentionally zero-dependency (no Radix, no shadcn runtime)
 * so frontend developers can drop it into any React project.
 *
 * Usage:
 *   const tsx = exportComponentReact(archetype)
 *   // → save as button.tsx
 */

import type { ComponentArchetype, ComponentPropSchema } from '../../../components/archetypes'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPascalCase(id: string): string {
  return id
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

function toCamelCase(id: string): string {
  const pascal = toPascalCase(id)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function propTypeToTS(prop: ComponentPropSchema): string {
  if (prop.type === 'enum' && prop.options) {
    return prop.options.map((o) => `'${o}'`).join(' | ')
  }
  if (prop.type === 'boolean') return 'boolean'
  if (prop.type === 'number') return 'number'
  return 'string'
}

function propDefaultToTS(prop: ComponentPropSchema): string | null {
  if (prop.default === undefined) return null
  if (typeof prop.default === 'string') return `'${prop.default}'`
  return String(prop.default)
}

/**
 * Determine the root HTML element for an archetype.
 */
function rootElement(archetypeId: string): string {
  switch (archetypeId) {
    case 'button':
    case 'icon-button':
      return 'button'
    case 'input':
    case 'search-input':
    case 'date-input':
    case 'color-input':
      return 'input'
    case 'textarea':
      return 'textarea'
    case 'select':
      return 'select'
    case 'navbar':
      return 'nav'
    case 'sidebar':
      return 'aside'
    case 'modal':
    case 'drawer':
      return 'dialog'
    case 'table':
      return 'table'
    default:
      return 'div'
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generate a React TSX component for an archetype.
 *
 * @param archetype   ComponentArchetype definition
 * @returns           TSX source string
 */
export function exportComponentReact(archetype: ComponentArchetype): string {
  const componentName = toPascalCase(archetype.id)
  const cssClass = archetype.id  // BEM block name
  const element = rootElement(archetype.id)

  // Build Props interface
  const propLines: string[] = []
  const paramLines: string[] = []
  const defaultLines: string[] = []

  // Standard React children for container-like components
  const hasChildren = ['button', 'icon-button', 'card', 'modal', 'drawer', 'popover',
    'alert', 'toast', 'tabs', 'accordion', 'sidebar', 'navbar'].includes(archetype.id)

  for (const prop of archetype.props) {
    const tsType = propTypeToTS(prop)
    const optional = !prop.required ? '?' : ''
    propLines.push(`  /** ${prop.description} */`)
    propLines.push(`  ${toCamelCase(prop.name)}${optional}: ${tsType}`)

    const defaultVal = propDefaultToTS(prop)
    if (defaultVal !== null) {
      defaultLines.push(`${toCamelCase(prop.name)} = ${defaultVal}`)
    } else {
      paramLines.push(toCamelCase(prop.name))
    }
  }

  if (hasChildren) {
    propLines.push(`  children?: React.ReactNode`)
    paramLines.push('children')
  }

  // Add common event handlers for interactive components
  const isClickable = ['button', 'icon-button', 'checkbox', 'radio', 'switch'].includes(archetype.id)
  if (isClickable) {
    propLines.push(`  onClick?: (event: React.MouseEvent) => void`)
    paramLines.push('onClick')
  }

  // Build destructured params
  const allParams = [...defaultLines, ...paramLines]
  const paramsStr = allParams.length > 0
    ? `{\n  ${allParams.join(',\n  ')}\n}: ${componentName}Props`
    : `_props: ${componentName}Props`

  // Build className expression
  const variantProp = archetype.props.find((p) => p.name === 'variant')
  const sizeProp = archetype.props.find((p) => p.name === 'size')
  const disabledProp = archetype.props.find((p) => p.name === 'disabled')

  const classNameParts: string[] = [`'${cssClass}'`]
  if (variantProp) classNameParts.push(`\`${cssClass}--\${variant}\``)
  if (sizeProp) classNameParts.push(`\`${cssClass}--\${size}\``)
  if (disabledProp) classNameParts.push(`disabled ? '${cssClass}--disabled' : ''`)

  const classNameExpr = classNameParts.length === 1
    ? classNameParts[0]
    : `[${classNameParts.join(', ')}].filter(Boolean).join(' ')`

  // Input-like elements are self-closing
  const isSelfClosing = ['input'].includes(element)
  const childContent = hasChildren
    ? '\n    {children}\n  '
    : element === 'textarea'
    ? '\n    {value}\n  '
    : ''

  const elementContent = isSelfClosing
    ? `<${element}\n    className={${classNameExpr}}\n    ${disabledProp ? 'disabled={disabled}' : ''}\n    ${isClickable ? 'onClick={onClick}' : ''}\n  />`
    : `<${element}\n    className={${classNameExpr}}\n    ${disabledProp ? 'disabled={disabled}' : ''}\n    ${isClickable ? 'onClick={onClick}' : ''}\n  >${childContent}</${element}>`

  return `// ${componentName}.tsx — generated by Beresta
// Import the companion SCSS file that provides CSS custom properties for all token variants.
import './${cssClass}.scss'
import * as React from 'react'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ${componentName}Props {
${propLines.join('\n')}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ${componentName}(
  ${paramsStr}
) {
  return (
    ${elementContent}
  )
}

${componentName}.displayName = '${componentName}'
`
}

// ---------------------------------------------------------------------------
// Batch export (all archetypes)
// ---------------------------------------------------------------------------

/**
 * Generate TSX source for multiple archetypes at once.
 * Returns a map of archetypeId → tsx string.
 */
export function exportAllComponentsReact(
  archetypes: ComponentArchetype[]
): Map<string, string> {
  const result = new Map<string, string>()
  for (const archetype of archetypes) {
    result.set(archetype.id, exportComponentReact(archetype))
  }
  return result
}
