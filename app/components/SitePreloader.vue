<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const intro = useState('introDone', () => false)
const root = ref<HTMLElement | null>(null)
const showing = ref(true)

const { $motion } = useNuxtApp() as unknown as {
  $motion: { stop: () => void; start: () => void; release: () => void }
}

/** Shutter blades. An odd count so the middle one leads the stagger. */
const BLADES = 7

const WORD = [...'Campdawn']

const STEPS = [
  'Opening the depot',
  'Counting the fleet',
  'Charging every pad',
  'Briefing the crew',
  'Ready to play'
]

/**
 * One counter wheel: nought to nine, then a second nought on the end. That
 * repeat is the whole trick. A wheel sitting at 9.9 is showing the trailing
 * nought, so when the value wraps and the wheel jumps back to the leading one
 * nothing moves on screen and the roll looks continuous.
 */
const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

/* Beat sheet, in seconds along the timeline. Kept together so the whole thing
   can be retimed from one place rather than by hunting through the tweens. */
const T_WORD = 0.26
const T_METER = 0.4
const T_SURGE = 1.96
const T_EXIT = 2.18
const T_OPEN = 2.34

let held = false
let ctx: gsap.Context | undefined
let tl: gsap.core.Timeline | undefined
let failsafe: ReturnType<typeof setTimeout> | undefined

/** Any input hurries the intro along rather than cutting it dead. */
const hurry = () => tl?.timeScale(3.4)

const dropSkip = () => {
  window.removeEventListener('pointerdown', hurry)
  window.removeEventListener('keydown', hurry)
}

/**
 * Hands the page back. Fires while the blades are still opening, so the page
 * underneath is already animating in by the time it is uncovered rather than
 * sitting there finished and static.
 */
const reveal = () => {
  if (intro.value) return
  intro.value = true
  dropSkip()
  if (held) {
    held = false
    $motion?.start()
  }
  ScrollTrigger.refresh()
}

/** The one exit path. Safe to call twice, and it always frees the scroll. */
const finish = () => {
  if (!showing.value) return
  clearTimeout(failsafe)
  reveal()
  showing.value = false
  ScrollTrigger.refresh()
}

/**
 * Higher wheels sit still and then flick over at the last moment. A real
 * odometer does this, and without it the tens and hundreds look like they are
 * drifting upward the whole way rather than counting.
 */
const flick = (x: number) => {
  const whole = Math.floor(x)
  const part = x - whole
  if (part < 0.86) return whole
  const t = (part - 0.86) / 0.14
  return whole + t * t * (3 - 2 * t)
}

const roll = (strips: HTMLElement[], v: number) => {
  const n = strips.length
  strips.forEach((strip, i) => {
    const raw = v / 10 ** (n - 1 - i)
    // The units wheel spins freely, everything above it flicks.
    const pos = (i === n - 1 ? raw : flick(raw)) % 10
    gsap.set(strip, { yPercent: (-pos * 100) / CELLS.length })
  })
}

/**
 * Real signals worth waiting on: the webfont, so the wordmark does not reflow
 * mid rise, and the crest, so it never animates an empty box. Capped, because a
 * slow font server is not a reason to stare at nothing.
 */
const settle = () => {
  const waits: Promise<unknown>[] = []
  if (document.fonts?.ready) waits.push(document.fonts.ready)

  const img = root.value?.querySelector('img')
  if (img && !img.complete) {
    waits.push(
      new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true })
      })
    )
  }

  if (!waits.length) return Promise.resolve()
  return Promise.race([
    Promise.all(waits),
    new Promise<void>((resolve) => setTimeout(resolve, 1200))
  ])
}

/**
 * The corner marks, brought up the instant the component mounts rather than
 * with the rest of the choreography. That has to wait to be measured, and the
 * wait would otherwise be spent looking at an all but empty stage. The backdrop
 * behind them is on CSS keyframes and is already running by this point.
 */
const lights = () => {
  gsap.fromTo(
    '.pl_corner',
    { autoAlpha: 0, y: -10 },
    { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'swift', delay: 0.1 }
  )
}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showing.value = false
    intro.value = true
    return
  }

  // Note there is no "already seen" check. The intro plays on every hard load
  // on purpose, because it is meant to be worth watching twice.

  held = true
  $motion?.stop()
  window.scrollTo(0, 0)

  // However badly this goes, the page gets handed back. A stuck curtain is far
  // worse than a missing animation.
  failsafe = setTimeout(finish, 9000)

  const el = root.value
  if (!el) {
    finish()
    return
  }

  // Scoped, so the selectors below can only ever reach this component's own
  // markup and everything unwinds together if it is torn down mid flight.
  ctx = gsap.context(lights, el)

  await settle()
  if (!showing.value) return

  ctx.add(() => {
    const strips = [...el.querySelectorAll<HTMLElement>('.pl_dg_strip')]
    const crest = el.querySelector<HTMLElement>('.pl_crest')
    const mark = document.querySelector<HTMLElement>('.nav .mark')

    /*
     * The crest does not fade out at the end, it flies into the header and
     * becomes the site logo. Measured on the frame the flight starts rather
     * than up front, since the header only sits where it finally sits once the
     * page underneath has settled. Whatever transform the crest is already
     * carrying is folded in, so the landing is exact.
     */
    let flight: { x: number; y: number; s: number } | null = null
    const home = () => {
      if (flight) return flight
      const a = crest!.getBoundingClientRect()
      const b = mark!.getBoundingClientRect()
      const scale = Number(gsap.getProperty(crest!, 'scaleX')) || 1
      flight = {
        x: (Number(gsap.getProperty(crest!, 'x')) || 0) + (b.left + b.width / 2 - (a.left + a.width / 2)),
        y: (Number(gsap.getProperty(crest!, 'y')) || 0) + (b.top + b.height / 2 - (a.top + a.height / 2)),
        s: (b.width / a.width) * scale
      }
      return flight
    }

    const tick = { v: 0 }
    tl = gsap.timeline({ onComplete: finish })

    /* ---------- the crest arrives on the lit stage ---------- */
    tl.fromTo(
      '.pl_crest',
      { autoAlpha: 0, scale: 0.72, filter: 'blur(16px)' },
      { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'swift' },
      0
    )

      /* ---------- wordmark, tracking in from both edges ---------- */
      .fromTo(
        '.pl_ch',
        {
          yPercent: 120,
          autoAlpha: 0,
          x: (i: number) => (i - (WORD.length - 1) / 2) * 34
        },
        { yPercent: 0, autoAlpha: 1, x: 0, duration: 1.2, stagger: 0.045, ease: 'swift' },
        T_WORD
      )

      /* ---------- meter and readout ---------- */
      .fromTo('.pl_bar_track', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'swift' }, T_METER)
      .fromTo('.pl_steps_row', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.75 }, T_METER + 0.18)
      .fromTo('.pl_readout', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'swift' }, T_METER - 0.08)
      .to(
        tick,
        {
          v: 100,
          duration: T_SURGE - T_METER,
          ease: 'power2.inOut',
          onUpdate: () => roll(strips, tick.v)
        },
        T_METER
      )
      .fromTo(
        '.pl_bar_fill',
        { scaleX: 0 },
        { scaleX: 1, duration: T_SURGE - T_METER, ease: 'power2.inOut' },
        T_METER
      )
      // x is pinned at both ends on purpose. The stylesheet parks this strip
      // with a percentage translate, GSAP reads that back as a pixel offset in
      // x, and without clearing it the head would ride a full bar width adrift
      // of the fill it is supposed to be leading.
      .fromTo(
        '.pl_bar_run',
        { xPercent: -100, x: 0 },
        { xPercent: 0, x: 0, duration: T_SURGE - T_METER, ease: 'power2.inOut' },
        T_METER
      )
      .to('.pl_bar_head', { autoAlpha: 1, duration: 0.35 }, T_METER)

    /* ---------- the depot reports in ---------- */
    STEPS.forEach((_, i) => {
      if (!i) return
      tl!.to(
        '.pl_steps_track',
        { yPercent: (-100 / STEPS.length) * i, duration: 0.42, ease: 'expo.out' },
        0.62 + (i - 1) * 0.31
      )
    })

    /* ---------- power on ---------- */
    tl.to('.pl_flash', { opacity: 0.85, duration: 0.1, ease: 'power2.out' }, T_SURGE)
      .to('.pl_flash', { opacity: 0, duration: 0.66, ease: 'power2.in' }, T_SURGE + 0.1)
      .to('.pl_crest', { scale: 1.15, duration: 0.15, ease: 'power3.out' }, T_SURGE - 0.04)
      .to('.pl_crest', { scale: 1, duration: 0.22, ease: 'power2.out' }, T_SURGE + 0.11)
      .fromTo(
        '.pl_ring',
        { autoAlpha: 0.9, scale: 0.5 },
        { autoAlpha: 0, scale: 2.7, duration: 1, ease: 'expo.out' },
        T_SURGE
      )
      .to('.pl_aura', { scale: 1.22, duration: 0.9, ease: 'expo.out' }, T_SURGE)
      .to('.pl_readout', { scale: 1.07, duration: 0.14, ease: 'power3.out' }, T_SURGE - 0.02)
      .to('.pl_readout', { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.6)' }, T_SURGE + 0.12)

      /* ---------- everything clears out ---------- */
      .call(() => gsap.set(root.value, { pointerEvents: 'none' }), undefined, T_EXIT)
      .to('.pl_ch', { yPercent: -120, autoAlpha: 0, duration: 0.6, stagger: 0.028, ease: 'glide' }, T_EXIT)
      .to('.pl_steps_row', { autoAlpha: 0, y: -16, duration: 0.4 }, T_EXIT)
      .to('.pl_bar', { autoAlpha: 0, scaleX: 0.25, duration: 0.5, ease: 'glide' }, T_EXIT)
      .to('.pl_corner', { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.04 }, T_EXIT)
      // Gone before the blades are far enough up to matter. The backdrop sits
      // over the shutter rather than under it, so anything still lit here would
      // be washing over the page as it comes through.
      .to('.pl_amb', { opacity: 0, duration: 0.42 }, T_EXIT)
      .to(
        '.pl_dg',
        { yPercent: 135, autoAlpha: 0, duration: 0.55, stagger: { each: 0.05, from: 'end' }, ease: 'glide' },
        T_EXIT + 0.08
      )
      .to('.pl_pct', { autoAlpha: 0, duration: 0.3 }, T_EXIT + 0.08)

      /* ---------- the shutter opens ---------- */
      .to('.pl_bleed', { opacity: 1, duration: 0.16 }, T_OPEN)
      .to(
        '.pl_blade',
        { yPercent: -101, duration: 0.92, stagger: { each: 0.05, from: 'center' }, ease: 'glide' },
        T_OPEN
      )
      .to('.pl_bleed', { opacity: 0, duration: 0.34 }, T_OPEN + 0.62)
      .call(reveal, undefined, T_OPEN + 0.1)

    /* ---------- and the crest goes home ---------- */
    if (crest && mark) {
      tl.to(
        '.pl_crest',
        {
          x: () => home().x,
          y: () => home().y,
          scale: () => home().s,
          duration: 0.9,
          ease: 'glide'
        },
        T_OPEN
      )
        .to('.pl_crest', { autoAlpha: 0, duration: 0.22 }, T_OPEN + 0.86)
        .call(
          () => {
            const glow = mark.querySelector<HTMLElement>('.mark_glow')
            gsap.fromTo(mark, { scale: 1.32 }, { scale: 1, duration: 0.75, ease: 'elastic.out(1, 0.5)' })
            if (!glow) return
            // The glow carries a CSS transition of its own, which would drag
            // against a tween writing the same property every frame.
            gsap.set(glow, { transition: 'none' })
            gsap.fromTo(glow, { opacity: 1 }, {
              opacity: 0,
              duration: 0.9,
              ease: 'power2.out',
              onComplete: () => gsap.set(glow, { clearProps: 'transition,opacity' })
            })
          },
          undefined,
          T_OPEN + 0.88
        )
    } else {
      tl.to('.pl_crest', { autoAlpha: 0, scale: 0.7, duration: 0.5, ease: 'glide' }, T_OPEN)
    }

    window.addEventListener('pointerdown', hurry)
    window.addEventListener('keydown', hurry)
  })
})

onBeforeUnmount(() => {
  clearTimeout(failsafe)
  dropSkip()
  ctx?.revert()
  if (held) {
    held = false
    $motion?.start()
  }
})
</script>

<template>
  <div v-if="showing" ref="root" class="pl" aria-hidden="true">
    <div class="pl_blades">
      <div v-for="i in BLADES" :key="i" class="pl_blade"><i class="pl_bleed" /></div>
    </div>

    <!--
      Driven by CSS keyframes rather than by the timeline, so the stage is lit
      from the first paint of the server rendered markup instead of waiting for
      the app to hydrate. GSAP only ever fades the wrapper out at the end, which
      is why the two never write the same property on the same element.
    -->
    <div class="pl_amb">
      <div class="pl_grid" />
      <div class="pl_aura"><i /></div>
      <div class="pl_scan" />
    </div>

    <p class="pl_corner mono tl">Campdawn</p>
    <p class="pl_corner mono tr">Awoshie depot</p>
    <p class="pl_corner mono bl">Gaming gear on rent</p>

    <div class="pl_stage">
      <div class="pl_crest">
        <span class="pl_ring" />
        <NuxtImg src="/mark.png" width="256" height="256" alt="" format="webp" quality="94" preload />
      </div>

      <div class="pl_word">
        <span v-for="(c, i) in WORD" :key="i" class="pl_ch">{{ c }}</span>
      </div>

      <div class="pl_bar">
        <span class="pl_bar_track" />
        <span class="pl_bar_fill" />
        <span class="pl_bar_run"><i class="pl_bar_head" /></span>
      </div>

      <div class="pl_steps_row">
        <span class="pl_dot" />
        <div class="pl_steps">
          <div class="pl_steps_track">
            <p v-for="s in STEPS" :key="s" class="mono">{{ s }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="pl_readout">
      <div class="pl_num">
        <span v-for="p in 3" :key="p" class="pl_dg">
          <span class="pl_dg_strip"><b v-for="(d, i) in CELLS" :key="i">{{ d }}</b></span>
        </span>
      </div>
      <span class="pl_pct">%</span>
    </div>

    <div class="pl_flash" />
  </div>
</template>

<style scoped>
.pl {
  position: fixed;
  inset: 0;
  z-index: 9997;
  overflow: hidden;
}

/* ---------- shutter ---------- */
.pl_blades {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
}

.pl_blade {
  position: relative;
  flex: 1;
  background: #06070a;
  /* Flex can leave a hairline between blades on fractional widths, and any gap
     shows the page straight through the curtain. A shadow either side in the
     same black closes it and travels with the blade. */
  box-shadow:
    1px 0 0 #06070a,
    -1px 0 0 #06070a;
  will-change: transform;
}

/* The lit bottom edge, so each blade drags a seam of light up the screen as it
   lifts rather than simply disappearing. */
.pl_bleed {
  position: absolute;
  left: -1px;
  right: -1px;
  bottom: 0;
  height: 1px;
  background: var(--ion);
  box-shadow: 0 0 20px 2px rgba(248, 201, 63, 0.6);
  opacity: 0;
}

/* ---------- atmosphere ---------- */
.pl_amb {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/*
 * These keyframes start at first paint, before there is any script to check
 * what the visitor asked for. Reduced motion tears the whole curtain down on
 * mount, so the only thing left to do here is make sure the backdrop does not
 * flash up in the moment before that happens.
 */
@media (prefers-reduced-motion: reduce) {
  .pl_amb {
    opacity: 0;
  }
}

.pl_grid {
  position: absolute;
  inset: -8%;
  opacity: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
  background-size: 68px 68px;
  -webkit-mask-image: radial-gradient(56% 52% at 50% 46%, #000, rgba(0, 0, 0, 0.3) 58%, transparent 84%);
  mask-image: radial-gradient(56% 52% at 50% 46%, #000, rgba(0, 0, 0, 0.3) 58%, transparent 84%);
  animation:
    pl_up 1.5s var(--e-out) forwards,
    pl_drift 9s linear infinite;
}

@keyframes pl_up {
  to {
    opacity: 1;
  }
}

@keyframes pl_drift {
  to {
    background-position:
      68px 68px,
      68px 68px;
  }
}

/* The glow is split in two: the outer box is left free for the timeline to
   swell at the surge, the inner one carries its own arrival. */
.pl_aura {
  position: absolute;
  inset: 0;
  transform-origin: 50% 46%;
}

.pl_aura i {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(0.55);
  transform-origin: 50% 46%;
  background:
    radial-gradient(32% 28% at 50% 46%, rgba(248, 201, 63, 0.22), transparent 70%),
    radial-gradient(54% 46% at 50% 54%, rgba(124, 92, 255, 0.14), transparent 72%);
  animation: pl_bloom 1.8s var(--e-out) forwards;
}

@keyframes pl_bloom {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.pl_scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 24%;
  opacity: 0;
  background: linear-gradient(180deg, transparent, rgba(248, 201, 63, 0.09), transparent);
  animation:
    pl_up 1s var(--e-out) 0.3s forwards,
    pl_sweep 3.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pl_sweep {
  from {
    transform: translate3d(0, -110%, 0);
  }
  to {
    transform: translate3d(0, 460%, 0);
  }
}

/* ---------- corner marks ---------- */
.pl_corner {
  position: absolute;
  z-index: 3;
  color: var(--faint);
  opacity: 0;
}

.pl_corner.tl {
  left: var(--gutter);
  top: calc(var(--gutter) * 0.85);
}

.pl_corner.tr {
  right: var(--gutter);
  top: calc(var(--gutter) * 0.85);
}

.pl_corner.bl {
  left: var(--gutter);
  bottom: calc(var(--gutter) * 0.95);
}

/* ---------- centre stage ---------- */
.pl_stage {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: clamp(1rem, 2.3vw, 1.6rem);
  padding: var(--gutter);
  text-align: center;
}

.pl_crest {
  position: relative;
  width: clamp(4.8rem, 11.5vw, 8rem);
  opacity: 0;
}

.pl_crest :deep(img) {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 42px rgba(248, 201, 63, 0.42));
}

.pl_ring {
  position: absolute;
  inset: -14%;
  border-radius: 50%;
  border: 1px solid rgba(248, 201, 63, 0.75);
  box-shadow:
    0 0 26px rgba(248, 201, 63, 0.35),
    inset 0 0 26px rgba(248, 201, 63, 0.16);
  opacity: 0;
}

/*
 * One clip for the whole word, opened out sideways with padding and pulled
 * back with a matching negative margin. The letters need that horizontal room
 * because they slide in from beyond their own column, and a clip tight to the
 * text would shave the outer ones off mid flight.
 */
.pl_word {
  display: flex;
  overflow: hidden;
  padding: 0.12em 3.4rem 0.26em;
  margin: -0.12em -3.4rem -0.26em;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.9rem, 5.6vw, 3.6rem);
  letter-spacing: -0.055em;
  line-height: 0.92;
}

.pl_ch {
  display: block;
  opacity: 0;
  will-change: transform;
}

/* ---------- meter ---------- */
.pl_bar {
  position: relative;
  width: min(54vw, 300px);
  height: 2px;
}

.pl_bar_track,
.pl_bar_fill,
.pl_bar_run {
  position: absolute;
  inset: 0;
  display: block;
}

.pl_bar_track {
  background: rgba(255, 255, 255, 0.13);
  transform: scaleX(0);
}

.pl_bar_fill {
  background: linear-gradient(90deg, rgba(217, 165, 22, 0.55), var(--ion));
  box-shadow: 0 0 10px rgba(248, 201, 63, 0.45);
  transform: scaleX(0);
  transform-origin: left center;
}

/* Rides the tip of the fill. A full width strip translated in from the left,
   rather than a dot positioned by percentage, so nothing has to be measured. */
.pl_bar_run {
  transform: translate3d(-100%, 0, 0);
}

.pl_bar_head {
  position: absolute;
  right: -2px;
  top: 50%;
  width: 5px;
  height: 5px;
  margin-top: -2.5px;
  border-radius: 50%;
  background: #fff6dc;
  box-shadow:
    0 0 4px 1px rgba(255, 255, 255, 0.8),
    0 0 20px 5px rgba(248, 201, 63, 0.7);
  opacity: 0;
}

/* ---------- status ---------- */
.pl_steps_row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  opacity: 0;
}

.pl_dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ion);
  box-shadow: 0 0 10px var(--ion);
  flex: none;
  animation: pl_pulse 1.15s ease-in-out infinite;
}

@keyframes pl_pulse {
  50% {
    opacity: 0.2;
    transform: scale(0.65);
  }
}

/* The window has to carry the type size itself, not just the rows inside it,
   or its em resolves against the body text and the box ends up taller than the
   row it is meant to be showing one of. */
.pl_steps {
  height: 1.7em;
  overflow: hidden;
  font-size: 0.74rem;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent);
}

.pl_steps_track p {
  display: flex;
  align-items: center;
  height: 1.7em;
  font-size: inherit;
  color: var(--text-dim);
  white-space: nowrap;
}

/* ---------- counter ---------- */
.pl_readout {
  --num: clamp(2.6rem, 8.5vw, 5.6rem);
  position: absolute;
  z-index: 3;
  right: var(--gutter);
  bottom: calc(var(--gutter) * 0.7);
  display: flex;
  align-items: flex-end;
  gap: 0.06em;
  font-size: var(--num);
  transform-origin: 100% 100%;
  opacity: 0;
}

.pl_num {
  display: flex;
  font-family: var(--font-mono);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ion);
}

/*
 * Only just taller than the glyph. The numbers on the wheel have to sit close
 * together, because a roomy cell means a mid roll shows the tail of one digit
 * and the head of the next with a hole between them, and that reads as two
 * broken numbers rather than one turning wheel. The little headroom left over
 * carries a feather top and bottom, which is what keeps a fast spin looking
 * smooth instead of like a stack of jittering glyphs.
 */
.pl_dg {
  display: block;
  height: 1.06em;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 9%, #000 91%, transparent);
  mask-image: linear-gradient(180deg, transparent, #000 9%, #000 91%, transparent);
}

.pl_dg_strip {
  display: block;
}

.pl_dg_strip b {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.06em;
  font-weight: inherit;
  font-variant-numeric: tabular-nums;
}

/* Lifted to the digits' baseline. In absolute units, since an em here would
   resolve against this element's own much smaller type size. */
.pl_pct {
  font-family: var(--font-mono);
  font-size: 0.2em;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--ion-deep);
  margin-bottom: calc(var(--num) * 0.12);
}

/* ---------- power on ---------- */
.pl_flash {
  position: absolute;
  inset: 0;
  z-index: 4;
  opacity: 0;
  mix-blend-mode: screen;
  background: radial-gradient(
    58% 52% at 50% 46%,
    rgba(255, 246, 214, 0.92),
    rgba(248, 201, 63, 0.4) 40%,
    rgba(248, 201, 63, 0) 74%
  );
}
</style>
