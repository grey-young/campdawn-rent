<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ArtKind } from '~/data/gear'

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const bar = ref<HTMLElement | null>(null)
const index = ref(1)

const panels: Array<{
  n: string
  title: string
  art: ArtKind
  tint: string
  copy: string
  to: string
}> = [
  {
    n: '01',
    title: 'Consoles',
    art: 'tower',
    tint: '#4da6ff',
    copy: 'Six flagships, every one current, every one patched overnight so nobody watches a download bar on a Friday.',
    to: '/gear?c=consoles'
  },
  {
    n: '02',
    title: 'Screens',
    art: 'screen',
    tint: '#ffb648',
    copy: 'OLED walls, curved monsters and laser beams that turn a blank wall into a hundred inches of picture.',
    to: '/gear?c=screens'
  },
  {
    n: '03',
    title: 'Virtual reality',
    art: 'visor',
    tint: '#4de8ff',
    copy: 'Headsets cleaned to clinic standard with fresh liners, mapped to your room before we leave.',
    to: '/gear?c=reality'
  },
  {
    n: '04',
    title: 'Racing',
    art: 'rig',
    tint: '#ff5f6d',
    copy: 'Eleven newton metres of torque bolted into a cockpit we assemble in your sitting room and carry out after.',
    to: '/gear?c=racing'
  },
  {
    n: '05',
    title: 'Arcade',
    art: 'cabinet',
    tint: '#ff7ad9',
    copy: 'Restored uprights loaded with four hundred classics, free play switched on and a coin door that still clunks.',
    to: '/gear?c=arcade'
  }
]

useMotionScope(() => {
  if (prefersReducedMotion()) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 900px)', () => {
    const el = track.value
    const sec = root.value
    if (!el || !sec) return

    const distance = () => Math.max(el.scrollWidth - window.innerWidth, 0)

    const slide = gsap.to(el, {
      x: () => -distance(),
      ease: 'none'
    })

    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: () => `+=${distance() + window.innerHeight * 0.2}`,
      pin: true,
      scrub: 0.8,
      animation: slide,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(bar.value, { scaleX: self.progress })
        index.value = Math.min(panels.length, Math.floor(self.progress * panels.length) + 1)
      }
    })

    // depth inside each panel, driven by the horizontal tween
    gsap.utils.toArray<HTMLElement>('.sc_panel').forEach((panel) => {
      const art = panel.querySelector('.sc_art')
      const text = panel.querySelector('.sc_text')
      if (art) {
        gsap.fromTo(
          art,
          { xPercent: 16, scale: 0.92 },
          {
            xPercent: -16,
            scale: 1.04,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: slide,
              start: 'left right',
              end: 'right left',
              scrub: true
            }
          }
        )
      }
      if (text) {
        gsap.from(text.children, {
          autoAlpha: 0,
          y: 34,
          duration: 0.9,
          stagger: 0.07,
          ease: 'swift',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: slide,
            start: 'left 78%',
            once: true
          }
        })
      }
    })

    return () => st.kill()
  })

  mm.add('(max-width: 899px)', () => {
    gsap.from('.sc_panel', {
      autoAlpha: 0,
      y: 46,
      duration: 1,
      stagger: 0.08,
      ease: 'swift',
      scrollTrigger: { trigger: '.sc_track', start: 'top 82%', once: true }
    })
  })
}, root)
</script>

<template>
  <section ref="root" class="sc">
    <div class="sc_head wrap-wide">
      <p class="eyebrow">The fleet by shape</p>
      <div class="sc_head_row">
        <h2 class="display sc_title">Pick a category,<br >we bring the rest</h2>
        <p class="mono sc_counter">
          <span class="ion">{{ String(index).padStart(2, '0') }}</span>
          <span class="sc_slash">/</span>
          <span>{{ String(panels.length).padStart(2, '0') }}</span>
        </p>
      </div>
    </div>

    <div ref="track" class="sc_track">
      <NuxtLink
        v-for="p in panels"
        :key="p.n"
        :to="p.to"
        class="sc_panel"
        :style="{ '--tint': p.tint }"
        data-cursor="view"
        data-cursor-label="Open"
      >
        <div class="sc_glow" aria-hidden="true" />
        <div class="sc_art"><GearArt :kind="p.art" :tint="p.tint" /></div>
        <div class="sc_text">
          <p class="mono sc_n">{{ p.n }}</p>
          <h3 class="display sc_h">{{ p.title }}</h3>
          <p class="sc_copy dim">{{ p.copy }}</p>
          <span class="sc_link">
            <span>Open the shelf</span>
            <Icon name="lucide:arrow-right" />
          </span>
        </div>
      </NuxtLink>
    </div>

    <div class="sc_bar wrap-wide">
      <div class="sc_bar_track"><span ref="bar" /></div>
    </div>
  </section>
</template>

<style scoped>
.sc {
  position: relative;
  padding-block: var(--section);
  overflow: hidden;
  background: linear-gradient(180deg, transparent, rgba(124, 92, 255, 0.045), transparent);
}

.sc_head {
  margin-bottom: clamp(2rem, 5vw, 3.5rem);
}

.sc_head .eyebrow {
  margin-bottom: 1.1rem;
}

.sc_head_row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
}

.sc_title {
  font-size: var(--t-h2);
}

.sc_counter {
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  display: none;
}

@media (min-width: 900px) {
  .sc_counter {
    display: block;
  }
}

.sc_slash {
  color: var(--faint);
  margin: 0 0.4em;
}

.sc_track {
  display: flex;
  gap: 1.1rem;
  padding-inline: var(--gutter);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.sc_track::-webkit-scrollbar {
  display: none;
}

@media (min-width: 900px) {
  .sc_track {
    overflow: visible;
    gap: 1.4rem;
    will-change: transform;
  }
}

.sc_panel {
  position: relative;
  flex: none;
  width: min(84vw, 420px);
  aspect-ratio: 0.82;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012));
  overflow: hidden;
  isolation: isolate;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: border-color 0.6s var(--e-out);
}

@media (min-width: 900px) {
  .sc_panel {
    width: clamp(30rem, 42vw, 40rem);
    aspect-ratio: 1.18;
  }
}

.sc_panel:hover {
  border-color: color-mix(in srgb, var(--tint) 55%, transparent);
}

.sc_glow {
  position: absolute;
  inset: -30% -10% 20%;
  z-index: 0;
  background: radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--tint) 26%, transparent), transparent 70%);
  opacity: 0.5;
  transition: opacity 0.7s var(--e-out);
  pointer-events: none;
}

.sc_panel:hover .sc_glow {
  opacity: 1;
}

.sc_art {
  position: absolute;
  inset: 0 0 22% 0;
  display: grid;
  place-items: center;
  z-index: 1;
  will-change: transform;
}

.sc_art :deep(.art) {
  width: min(62%, 320px);
  height: auto;
}

.sc_text {
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  background: linear-gradient(0deg, rgba(6, 7, 10, 0.9) 30%, transparent);
}

@media (min-width: 900px) {
  .sc_text {
    padding: 2rem 2.2rem;
    max-width: 30rem;
  }
}

.sc_n {
  color: var(--tint);
  margin-bottom: 0.7rem;
}

.sc_h {
  font-size: clamp(1.8rem, 3.2vw, 2.7rem);
  margin-bottom: 0.7rem;
}

.sc_copy {
  font-size: 0.92rem;
  line-height: 1.55;
  margin-bottom: 1.1rem;
  max-width: 40ch;
}

.sc_link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--tint);
}

.sc_link :deep(svg) {
  width: 1em;
  height: 1em;
  transition: transform 0.5s var(--e-out);
}

.sc_panel:hover .sc_link :deep(svg) {
  transform: translateX(6px);
}

.sc_bar {
  margin-top: clamp(2rem, 5vw, 3rem);
}

.sc_bar_track {
  height: 1px;
  background: var(--line);
  position: relative;
  overflow: hidden;
}

.sc_bar_track span {
  display: block;
  height: 100%;
  background: var(--ion);
  transform: scaleX(0);
  transform-origin: left center;
}
</style>
