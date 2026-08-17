/**
 * One pointer listener for every magnetic element on the page.
 *
 * The old arrangement gave each button its own window listener and cached its
 * rectangle at mount, which is the earliest and least reliable moment to
 * measure one: fonts have not landed, the intro is still covering the page and
 * the grid has not settled. The button ended up pulling toward where it used to
 * be. Here the rectangles are re-read once per frame at most, only for elements
 * currently on screen, and never trusted for longer than MAX_AGE.
 */

type Magnet = {
  el: HTMLElement
  radius: number
  onMove: (dx: number, dy: number) => void
  onLeave: () => void
}

type Entry = Magnet & {
  /** Resting centre in viewport space, with any live transform taken back out. */
  cx: number
  cy: number
  w: number
  h: number
  stamp: number
  visible: boolean
  inside: boolean
}

/**
 * How long a measurement is trusted. Scroll and resize invalidate immediately,
 * but plenty of other things move a button without either firing — a font
 * landing, an image sizing itself, an accordion above it opening. Re-reading a
 * couple of rectangles three times a second is cheaper than the alternative,
 * which is a button that pulls toward where it used to be.
 */
const MAX_AGE = 320

/** Padding on the field so small controls still have something to reach with. */
const FIELD_PAD = 48

let entries: Entry[] = []
let listening = false
let queued = false
let pointerX = 0
let pointerY = 0
let pointerSeen = false
let lastScrollX = 0
let lastScrollY = 0
let observer: IntersectionObserver | null = null

/**
 * The translation GSAP currently has on the element. Measuring an element that
 * is already pulled toward the cursor and treating that as its centre feeds the
 * offset back into itself, so the button drifts further with every re-measure.
 * Taking the transform back out gives the resting centre, which is the only
 * stable thing to aim at.
 */
const translationOf = (el: HTMLElement): [number, number] => {
  const t = getComputedStyle(el).transform
  if (!t || t === 'none') return [0, 0]
  const m = /matrix(3d)?\(([^)]+)\)/.exec(t)
  if (!m) return [0, 0]
  const v = m[2]!.split(',')
  return m[1]
    ? [Number(v[12]) || 0, Number(v[13]) || 0]
    : [Number(v[4]) || 0, Number(v[5]) || 0]
}

const measure = (e: Entry, now: number) => {
  const r = e.el.getBoundingClientRect()
  const [tx, ty] = translationOf(e.el)
  e.cx = r.left + r.width / 2 - tx
  e.cy = r.top + r.height / 2 - ty
  e.w = r.width
  e.h = r.height
  e.stamp = now
}

const invalidate = () => {
  for (const e of entries) e.stamp = 0
}

const schedule = () => {
  if (queued) return
  queued = true
  requestAnimationFrame(run)
}

function run() {
  queued = false
  const now = performance.now()

  // Read first, write second. GSAP writes transforms on its own ticker, so a
  // measurement taken between two of our own writes costs a synchronous layout
  // every time; batching the reads keeps that to one per frame at worst.
  for (const e of entries) {
    if (e.visible && now - e.stamp > MAX_AGE) measure(e, now)
  }

  for (const e of entries) {
    if (!e.visible || !pointerSeen) {
      if (e.inside) {
        e.inside = false
        e.onLeave()
      }
      continue
    }

    const dx = pointerX - e.cx
    const dy = pointerY - e.cy

    // An ellipse around the element rather than a circle around its longest
    // side: a wide button used to claim as much room above and below it as it
    // did left and right, which is how you end up grabbing a button while
    // reading the paragraph under it.
    const rx = (e.w / 2) * e.radius + FIELD_PAD
    const ry = (e.h / 2) * e.radius + FIELD_PAD
    const nx = dx / rx
    const ny = dy / ry
    const d2 = nx * nx + ny * ny

    if (d2 <= 1) {
      // Falls to nothing at the rim, so entering and leaving the field are
      // silent. The old linear pull was strongest exactly where it switched on,
      // which made the button jump the moment the cursor came near.
      const fall = 1 - d2
      e.inside = true
      e.onMove(dx * fall, dy * fall)
    } else if (e.inside) {
      e.inside = false
      e.onLeave()
    }
  }
}

const releaseAll = () => {
  pointerSeen = false
  for (const e of entries) {
    if (!e.inside) continue
    e.inside = false
    e.onLeave()
  }
}

const onPointerMove = (ev: PointerEvent) => {
  // A touchscreen laptop satisfies `hover: hover`, so the guard in the
  // component is not enough on its own — a finger dragging the page would
  // otherwise leave every button it passed sitting off-centre.
  if (ev.pointerType && ev.pointerType !== 'mouse') {
    if (pointerSeen) releaseAll()
    return
  }
  pointerX = ev.clientX
  pointerY = ev.clientY
  pointerSeen = true
  schedule()
}

// Capture, because scrolling inside a nested container does not bubble to the
// window and the rectangles move all the same.
//
// Lenis drives the page from the GSAP ticker, so this fires every frame of a
// glide. Re-measuring each magnet that often means a synchronous layout per
// frame for no gain: a page scroll moves everything in flow by exactly the
// delta, so the cached centres are shifted instead, and the MAX_AGE refresh
// picks up anything pinned or parallaxed that did not move with the page.
const onScroll = (ev: Event) => {
  if (ev.target !== document && ev.target !== window) {
    invalidate()
    schedule()
    return
  }
  const x = window.scrollX
  const y = window.scrollY
  const dx = x - lastScrollX
  const dy = y - lastScrollY
  lastScrollX = x
  lastScrollY = y
  for (const e of entries) {
    e.cx -= dx
    e.cy -= dy
  }
  schedule()
}

const onResize = () => {
  invalidate()
  schedule()
}

const onVisibility = () => {
  if (document.hidden) releaseAll()
}

const attach = () => {
  if (listening) return
  listening = true
  lastScrollX = window.scrollX
  lastScrollY = window.scrollY
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  window.addEventListener('resize', onResize)
  // The cursor leaving for the browser chrome or another screen sends no
  // further moves, so without these the last button stays stuck where it was.
  document.documentElement.addEventListener('pointerleave', releaseAll)
  window.addEventListener('blur', releaseAll)
  document.addEventListener('visibilitychange', onVisibility)
  observer = new IntersectionObserver(
    (records) => {
      for (const r of records) {
        const entry = entries.find((e) => e.el === r.target)
        if (!entry) continue
        entry.visible = r.isIntersecting
        entry.stamp = 0
      }
      schedule()
    },
    { rootMargin: '120px' }
  )
}

const detach = () => {
  if (!listening) return
  listening = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('scroll', onScroll, { capture: true })
  window.removeEventListener('resize', onResize)
  document.documentElement.removeEventListener('pointerleave', releaseAll)
  window.removeEventListener('blur', releaseAll)
  document.removeEventListener('visibilitychange', onVisibility)
  observer?.disconnect()
  observer = null
}

/** Adds an element to the field. Returns the function that removes it again. */
export function registerMagnet(magnet: Magnet) {
  attach()
  const entry: Entry = {
    ...magnet,
    cx: 0,
    cy: 0,
    w: 0,
    h: 0,
    stamp: 0,
    visible: true,
    inside: false
  }
  entries.push(entry)
  observer?.observe(entry.el)

  return () => {
    observer?.unobserve(entry.el)
    entries = entries.filter((e) => e !== entry)
    if (!entries.length) detach()
  }
}
