import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

export { gsap, ScrollTrigger, SplitText }

export const prefersReducedMotion = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Every scoped animation wants a refresh once it has built its triggers, but a
 * page full of them would fire a dozen layout passes in a row. Coalesce them.
 */
let refreshQueued = false
export function queueRefresh() {
  if (!import.meta.client || refreshQueued) return
  refreshQueued = true
  requestAnimationFrame(() => {
    refreshQueued = false
    ScrollTrigger.refresh()
  })
}

/**
 * Runs a GSAP context scoped to a component and reverts everything on unmount.
 * The callback fires after fonts settle so SplitText measures real glyphs.
 */
export function useMotionScope(
  setup: (self: gsap.Context) => void,
  scope?: Ref<HTMLElement | null | undefined>,
  gate?: Ref<boolean>
) {
  if (!import.meta.client) return

  let ctx: gsap.Context | undefined
  let dead = false

  // Nothing should reveal itself while the intro curtain is still up. Without
  // this the entry animations play out of sight and the page is already sitting
  // there, finished and static, by the time the curtain lifts.
  const intro = useState('introDone', () => false)

  /**
   * Waits for a flag, but never forever. A page rendered without the preloader,
   * an error screen for instance, would otherwise sit there with every
   * animation still queued behind a signal that is not coming.
   */
  const waitFor = (flag: Ref<boolean>, bail = 0) =>
    new Promise<void>((resolve) => {
      if (flag.value) return resolve()
      let timer: ReturnType<typeof setTimeout> | undefined
      const stop = watch(flag, (v) => {
        if (!v) return
        clearTimeout(timer)
        stop()
        resolve()
      })
      if (bail) {
        timer = setTimeout(() => {
          stop()
          resolve()
        }, bail)
      }
    })

  onMounted(async () => {
    try {
      await document.fonts?.ready
    } catch {
      /* font api missing, carry on */
    }
    await waitFor(intro, 7500)
    if (gate) await waitFor(gate, 7500)
    await nextTick()
    if (dead) return
    ctx = gsap.context(setup, scope?.value ?? undefined)
    queueRefresh()
  })

  onBeforeUnmount(() => {
    dead = true
    ctx?.revert()
  })
}

type RevealOpts = {
  y?: number
  stagger?: number
  duration?: number
  delay?: number
  trigger?: Element | null
  start?: string
  once?: boolean
}

/** Masked line by line reveal for a headline or paragraph. */
export function revealLines(el: Element, opts: RevealOpts = {}) {
  const {
    y = 108,
    stagger = 0.085,
    duration = 1.15,
    delay = 0,
    trigger = el,
    start = 'top 88%',
    once = true
  } = opts

  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1 })
    return
  }

  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'sp_line',
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: y,
        opacity: 0,
        duration,
        delay,
        stagger,
        ease: 'swift',
        scrollTrigger: trigger
          ? { trigger, start, once }
          : undefined
      })
    }
  })
}

/** Character cascade, best on short display words. */
export function revealChars(el: Element, opts: RevealOpts = {}) {
  const { stagger = 0.022, duration = 0.9, delay = 0, trigger = el, start = 'top 88%' } = opts

  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1 })
    return
  }

  return SplitText.create(el, {
    type: 'chars,words',
    mask: 'chars',
    charsClass: 'sp_char',
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.chars, {
        yPercent: 118,
        opacity: 0,
        duration,
        delay,
        stagger: { each: stagger, from: 'start' },
        ease: 'swift',
        scrollTrigger: trigger ? { trigger, start, once: true } : undefined
      })
    }
  })
}

/** Simple staggered rise used for cards, list rows and small blocks. */
export function riseIn(targets: gsap.TweenTarget, opts: RevealOpts = {}) {
  const {
    y = 46,
    stagger = 0.07,
    duration = 1.05,
    delay = 0,
    trigger,
    start = 'top 86%'
  } = opts

  if (prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0 })
    return
  }

  return gsap.from(targets, {
    y,
    autoAlpha: 0,
    duration,
    delay,
    stagger,
    ease: 'swift',
    scrollTrigger: {
      trigger: trigger ?? (Array.isArray(targets) ? (targets[0] as Element) : (targets as Element)),
      start,
      once: true
    }
  })
}

/** Continuous vertical parallax tied to scroll progress. */
export function parallax(target: gsap.TweenTarget, amount = 120, trigger?: Element) {
  if (prefersReducedMotion()) return

  return gsap.fromTo(
    target,
    { yPercent: -amount / 10 },
    {
      yPercent: amount / 10,
      ease: 'none',
      scrollTrigger: {
        trigger: trigger ?? (target as Element),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    }
  )
}
