// Control remoto (D-pad): las flechas mueven el foco al elemento más cercano en esa dirección, y OK/Enter lo activa
// (los botones y enlaces ya lo hacen solos). El elemento enfocado siempre queda a la vista: las listas y carruseles
// se desplazan solos. Dentro de una ventana o panel abierto («Sonando ahora», «A continuación», diálogos) el foco no
// se sale de ahí.
import { useEffect } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'
const KEYS: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'

/** Dónde puede moverse el foco: el panel o ventana abierta más reciente, o toda la página. */
function scope(): ParentNode {
  const panels = document.querySelectorAll<HTMLElement>('[data-nav-scope], [aria-modal="true"]')
  return panels.length ? panels[panels.length - 1] : document
}

function isVisible(el: HTMLElement): boolean {
  if (el.closest('[inert], [aria-hidden="true"]')) return false
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return false
  const style = getComputedStyle(el)
  return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0
}

const candidates = (within: ParentNode = scope()) => [...within.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isVisible)

// Zonas de la pantalla: primero se busca en la misma zona y solo si no hay nada se pasa a otra. Así, en una página
// larga, «abajo» sigue por el contenido (que se desplaza) en vez de saltar al reproductor de abajo.
const ZONES = '[data-nav-scope], [role="dialog"], main, aside, footer'

const TOLERANCE = 4 // px: el elemento enfocado está agrandado (scale 1.05) y puede rozar a sus vecinos

/**
 * El mejor candidato en esa dirección: su centro tiene que quedar más allá del borde del elemento actual (así no
 * cuentan los que están dentro o encima de él). Gana el más cercano en el eje del movimiento, castigando mucho el
 * desvío lateral (así «abajo» baja por la misma columna y «derecha» sigue por la misma fila).
 */
function nextInDirection(from: HTMLElement, direction: Direction): HTMLElement | null {
  const zone = from.closest(ZONES)
  const inZone = zone ? candidates(zone) : []
  const everywhere = candidates()
  // 1) En la misma zona y alineado (misma fila o columna) · 2) en otra zona, alineado · 3) lo más cercano aunque no
  // esté alineado: a izquierda/derecha en cualquier zona (del menú al contenido y de vuelta), arriba/abajo solo en la
  // misma (arriba del todo del contenido, «arriba» no se va al menú de la izquierda).
  const horizontal = direction === 'left' || direction === 'right'
  return bestIn(from, direction, inZone, true) ?? bestIn(from, direction, everywhere, true) ?? bestIn(from, direction, horizontal ? everywhere : inZone, false)
}

function bestIn(from: HTMLElement, direction: Direction, list: HTMLElement[], alignedOnly: boolean): HTMLElement | null {
  const a = from.getBoundingClientRect()
  const ac = { x: a.left + a.width / 2, y: a.top + a.height / 2 }
  let best: HTMLElement | null = null
  let bestScore = Infinity
  for (const el of list) {
    if (el === from || el.contains(from) || from.contains(el)) continue
    const b = el.getBoundingClientRect()
    const bc = { x: b.left + b.width / 2, y: b.top + b.height / 2 }
    let primary: number
    let lateral: number
    let offset: number
    if (direction === 'down' || direction === 'up') {
      if (direction === 'down' ? bc.y < a.bottom - TOLERANCE : bc.y > a.top + TOLERANCE) continue
      primary = direction === 'down' ? b.top - a.bottom : a.top - b.bottom
      lateral = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right)) // 0 si se solapan en horizontal
      offset = Math.abs(bc.x - ac.x)
    } else {
      if (direction === 'right' ? bc.x < a.right - TOLERANCE : bc.x > a.left + TOLERANCE) continue
      primary = direction === 'right' ? b.left - a.right : a.left - b.right
      lateral = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom))
      offset = Math.abs(bc.y - ac.y)
    }
    if (alignedOnly && lateral > 0) continue
    const score = Math.max(0, primary) + lateral * 4 + offset * 0.1
    if (score < bestScore) {
      bestScore = score
      best = el
    }
  }
  return best
}

function focusAndReveal(el: HTMLElement) {
  el.focus({ preventScroll: true })
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
}

export function useSpatialNavigation() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const direction = KEYS[e.key]
      if (!direction || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const active = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null
      // Donde las flechas ya hacen algo: los menús (se mueven solos), el texto (izquierda/derecha mueven el cursor) y
      // las barras de progreso y volumen (izquierda/derecha adelantan, atrasan o cambian el volumen).
      if (active?.closest('[role="menu"]')) return
      const horizontal = direction === 'left' || direction === 'right'
      if (active instanceof HTMLInputElement && horizontal && active.type !== 'checkbox' && active.type !== 'radio') return
      if (active instanceof HTMLTextAreaElement) return
      e.preventDefault() // sin esto las flechas también desplazarían la página
      if (!active || !scope().contains(active)) {
        const first = candidates()[0]
        if (first) focusAndReveal(first)
        return
      }
      const next = nextInDirection(active, direction)
      if (next) focusAndReveal(next)
      // Nada más hacia arriba o abajo (p. ej. el final de un texto): se desplaza el contenido para seguir leyendo.
      else if (!horizontal) document.querySelector('main')?.scrollBy({ top: (direction === 'down' ? 0.4 : -0.4) * window.innerHeight, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
