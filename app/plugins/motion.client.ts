import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { Observer } from 'gsap/Observer'
import { Flip } from 'gsap/Flip'
import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, CustomEase, Observer, Flip)

  CustomEase.create('swift', '0.16, 1, 0.3, 1')
  CustomEase.create('glide', '0.62, 0.05, 0.01, 0.99')
  CustomEase.create('snap', '0.85, 0, 0.15, 1')

  gsap.defaults({ ease: 'swift', duration: 1 })
  gsap.ticker.lagSmoothing(0)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let lenis: Lenis | null = null

  if (!reduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.7,
      wheelMultiplier: 1,
      lerp: 0.1
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis!.raf(time * 1000)
    gsap.ticker.add(raf)

    nuxtApp.hook('app:beforeMount', () => ScrollTrigger.refresh())
  }

  // Keep triggers honest when fonts land or the viewport settles.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }

  // The preloader, the menu and the quote drawer can all want the page held
  // still, and they overlap. Counting the holds means the last one to let go is
  // the one that actually releases the scroll, rather than the first.
  let holds = 0

  const stop = () => {
    holds += 1
    if (holds > 1) return
    lenis?.stop()
    document.body.style.setProperty('--lock-pad', `${window.innerWidth - document.documentElement.clientWidth}px`)
    document.body.classList.add('is-locked')
  }

  const start = () => {
    holds = Math.max(0, holds - 1)
    if (holds > 0) return
    lenis?.start()
    document.body.classList.remove('is-locked')
    document.body.style.removeProperty('--lock-pad')
  }

  /** Drops every hold at once. Used when a route change makes them moot. */
  const release = () => {
    holds = 0
    lenis?.start()
    document.body.classList.remove('is-locked')
    document.body.style.removeProperty('--lock-pad')
  }

  const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
    if (lenis) {
      lenis.scrollTo(target as never, { offset, duration: 1.4 })
      return
    }
    gsap.to(window, { scrollTo: { y: target as never, offsetY: -offset }, duration: 0.9 })
  }

  return {
    provide: {
      lenis,
      motion: { reduced, stop, start, release, scrollTo }
    }
  }
})
