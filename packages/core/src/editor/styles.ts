import { generateId } from '../scene-graph'

import type { FillStyle, TextStyle, EffectStyle, NamedStyle, StyleType } from '../scene-graph'
import type { EditorContext } from './types'

export function createStyleActions(ctx: EditorContext) {
  function getStyles(type?: StyleType): NamedStyle[] {
    return ctx.graph.getStylesByType(type)
  }

  function getStyle(id: string): NamedStyle | undefined {
    return ctx.graph.styles.get(id)
  }

  function getStyleCount(): number {
    return ctx.graph.styles.size
  }

  function addFillStyle(name: string): FillStyle {
    const style: FillStyle = {
      id: generateId(),
      name,
      type: 'FILL',
      description: '',
      fills: [
        {
          type: 'SOLID',
          color: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
          opacity: 1,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    }
    ctx.graph.addStyle(style)
    const snapshot = JSON.stringify(style)
    ctx.undo.push({
      label: 'Create fill style',
      forward: () => {
        ctx.graph.addStyle(JSON.parse(snapshot) as FillStyle)
        ctx.requestRender()
      },
      inverse: () => {
        ctx.graph.removeStyle(style.id)
        ctx.requestRender()
      }
    })
    ctx.requestRender()
    return style
  }

  function addTextStyle(name: string): TextStyle {
    const style: TextStyle = {
      id: generateId(),
      name,
      type: 'TEXT',
      description: '',
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 400,
      italic: false,
      lineHeight: null,
      letterSpacing: 0,
      textCase: 'ORIGINAL',
      textDecoration: 'NONE',
      fills: []
    }
    ctx.graph.addStyle(style)
    const snapshot = JSON.stringify(style)
    ctx.undo.push({
      label: 'Create text style',
      forward: () => {
        ctx.graph.addStyle(JSON.parse(snapshot) as TextStyle)
        ctx.requestRender()
      },
      inverse: () => {
        ctx.graph.removeStyle(style.id)
        ctx.requestRender()
      }
    })
    ctx.requestRender()
    return style
  }

  function addEffectStyle(name: string): EffectStyle {
    const style: EffectStyle = {
      id: generateId(),
      name,
      type: 'EFFECT',
      description: '',
      effects: []
    }
    ctx.graph.addStyle(style)
    const snapshot = JSON.stringify(style)
    ctx.undo.push({
      label: 'Create effect style',
      forward: () => {
        ctx.graph.addStyle(JSON.parse(snapshot) as EffectStyle)
        ctx.requestRender()
      },
      inverse: () => {
        ctx.graph.removeStyle(style.id)
        ctx.requestRender()
      }
    })
    ctx.requestRender()
    return style
  }

  function updateStyleName(id: string, name: string): void {
    const style = ctx.graph.styles.get(id)
    if (!style) return
    const prevName = style.name
    style.name = name
    ctx.undo.push({
      label: 'Rename style',
      forward: () => {
        const s = ctx.graph.styles.get(id)
        if (s) s.name = name
        ctx.requestRender()
      },
      inverse: () => {
        const s = ctx.graph.styles.get(id)
        if (s) s.name = prevName
        ctx.requestRender()
      }
    })
    ctx.requestRender()
  }

  function removeStyle(id: string): void {
    const style = ctx.graph.styles.get(id)
    if (!style) return
    const snapshot = JSON.stringify(style)
    ctx.graph.removeStyle(id)
    ctx.undo.push({
      label: 'Delete style',
      forward: () => {
        ctx.graph.removeStyle(id)
        ctx.requestRender()
      },
      inverse: () => {
        ctx.graph.addStyle(JSON.parse(snapshot) as NamedStyle)
        ctx.requestRender()
      }
    })
    ctx.requestRender()
  }

  return {
    getStyles,
    getStyle,
    getStyleCount,
    addFillStyle,
    addTextStyle,
    addEffectStyle,
    updateStyleName,
    removeStyle
  }
}
