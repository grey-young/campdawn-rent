<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gear, type ArtKind } from '~/data/gear'

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
  cat: string
}> = [
  {
    n: '01',
    title: 'Consoles',
    art: 'tower',
    tint: '#4da6ff',
    copy: 'Current generation flagships, every one patched overnight so nobody watches a download bar on a Friday.',
    cat: 'consoles'
  },
  {
    n: '02',
    title: 'Screens',
    art: 'screen',
    tint: '#ffb648',
    copy: 'OLED walls, curved monsters and laser beams that turn a blank wall into a hundred inches of picture.',
    cat: 'screens'
  },
  {
    n: '03',
    title: 'Virtual reality',
    art: 'visor',
    tint: '#4de8ff',
    copy: 'Headsets cleaned to clinic standard with fresh liners, mapped to your room before we leave.',
    cat: 'reality'
  },
  {
    n: '04',
    title: 'Racing',
    art: 'rig',
    tint: '#ff5f6d',
    copy: 'Eleven newton metres of torque bolted into a cockpit we assemble in your sitting room and carry out after.',
    cat: 'racing'
  },
  {
    n: '05',
    title: 'Arcade',
    art: 'cabinet',
    tint: '#ff7ad9',
    copy: 'Restored uprights loaded with four hundred classics, free play switched on and a coin door that still clunks.',
    cat: 'arcade'
  }
]

/** What is actually on the shelf, so a card never promises gear we do not carry. */
const namesIn = (cat: string) =>
  gear.filter((g) => g.category === cat).map((g) => g.name).slice(0, 3)

const total = String(panels.length).padStart(2, '0')

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
        // Kept small on purpose. The stage clips at the card edge, so a wide
        // drift used to shear the illustration in half at either extreme.
        gsap.fromTo(
          art,
          { xPercent: 9, scale: 0.95 },
          {
            xPercent: -9,
            scale: 1.05,
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
          <span>{{ total }}</span>
        </p>
      </div>
    </div>

    <div ref="track" class="sc_track">
      <NuxtLink
        v-for="p in panels"
        :key="p.n"
        :to="`/gear?c=${p.cat}`"
        class="sc_panel"
        :style="{ '--tint': p.tint }"
        data-cursor="view"
        data-cursor-label="Open"
      >
        <div class="sc_stage">
          <span class="sc_glow" aria-hidden="true" />
          <span class="sc_ring" aria-hidden="true" />
          <div class="sc_art"><GearArt :kind="p.art" :tint="p.tint" /></div>
        </div>

        <div class="sc_text">
          <p class="mono sc_n">
            <span class="sc_n_now">{{ p.n }}</span>
            <span class="sc_n_of">/ {{ total }}</span>
          </p>
          <h3 class="display sc_h">{{ p.title }}</h3>
          <p class="sc_copy dim">{{ p.copy }}</p>
          <span class="sc_tags">
            <span v-for="name in namesIn(p.cat)" :key="name" class="mono">{{ name }}</span>
          </span>
          <span class="sc_link">
            <span>Open the shelf</span>
            <span class="sc_go"><Icon name="lucide:arrow-up-right" /></span>
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

/* Pinned, so everything from the heading to the progress bar has to fit one
   screen. The section used to run about 260px taller than the viewport, which
   cut the bottom off every card and hid the bar completely. */
@media (min-width: 900px) {
  .sc {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-block: clamp(3rem, 6vh, 5rem);
  }
}

.sc_head {
  margin-bottom: clamp(2rem, 5vw, 3.5rem);
}

@media (min-width: 900px) {
  .sc_head {
    margin-bottom: clamp(1.6rem, 3.4vh, 2.6rem);
  }
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

/* The art and the copy each get their own cell. They used to be stacked, which
   put the illustration behind a black scrim and the words on top of it. */
.sc_panel {
  position: relative;
  flex: none;
  width: min(84vw, 400px);
  min-height: 30rem;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background:
    radial-gradient(
      100% 62% at 50% 4%,
      color-mix(in srgb, var(--tint) 9%, transparent),
      transparent 64%
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  isolation: isolate;
  scroll-snap-align: center;
  display: grid;
  grid-template-rows: 1fr auto;
  transition:
    border-color 0.6s var(--e-out),
    transform 0.6s var(--e-out),
    box-shadow 0.6s var(--e-out);
}

@media (min-width: 900px) {
  .sc_panel {
    width: clamp(27rem, 36vw, 34rem);
    height: clamp(19rem, 46vh, 30rem);
    min-height: 0;
    grid-template-rows: none;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.04fr);
    align-items: center;
    background:
      radial-gradient(
        76% 88% at 74% 46%,
        color-mix(in srgb, var(--tint) 11%, transparent),
        transparent 62%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012));
  }
}

@media (hover: hover) and (pointer: fine) {
  .sc_panel:hover {
    border-color: color-mix(in srgb, var(--tint) 55%, transparent);
    transform: translateY(-6px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.09),
      0 28px 60px -30px color-mix(in srgb, var(--tint) 70%, transparent);
  }
}

/* ---- stage ---- */
.sc_stage {
  position: relative;
  display: grid;
  place-items: center;
  padding: 1.6rem 1.4rem 0;
  min-height: 0;
}

@media (min-width: 900px) {
  .sc_stage {
    grid-row: 1;
    grid-column: 2;
    height: 100%;
    padding: 1.8rem 1.8rem 1.8rem 0;
  }
}

.sc_glow {
  position: absolute;
  inset: -6%;
  z-index: 0;
  background: radial-gradient(
    50% 50% at 50% 50%,
    color-mix(in srgb, var(--tint) 28%, transparent),
    transparent 70%
  );
  opacity: 0.55;
  transition: opacity 0.7s var(--e-out);
  pointer-events: none;
}

.sc_panel:hover .sc_glow {
  opacity: 1;
}

.sc_ring {
  position: absolute;
  inset: 9%;
  z-index: 0;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--tint) 20%, transparent);
  opacity: 0.55;
  transform: scale(0.9);
  transition:
    opacity 0.6s var(--e-out),
    transform 0.9s var(--e-out),
    border-color 0.6s var(--e-out);
  pointer-events: none;
}

.sc_panel:hover .sc_ring {
  opacity: 1;
  transform: scale(1);
  border-color: color-mix(in srgb, var(--tint) 38%, transparent);
}

.sc_art {
  position: relative;
  z-index: 1;
  width: min(74%, 300px);
  will-change: transform;
}

.sc_art :deep(.art) {
  width: 100%;
  height: auto;
}

/* ---- copy ---- */
.sc_text {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0 1.5rem 1.6rem;
}

@media (min-width: 900px) {
  .sc_text {
    grid-row: 1;
    grid-column: 1;
    justify-content: center;
    padding: 2.2rem 0.5rem 2.2rem 2.2rem;
  }
}

.sc_n {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4em;
}

.sc_n_now {
  color: var(--tint);
}

.sc_n_of {
  color: var(--faint);
}

.sc_h {
  font-size: clamp(1.75rem, 2.9vw, 2.5rem);
  transition: color 0.4s var(--e-out);
}

.sc_panel:hover .sc_h {
  color: var(--tint);
}

.sc_copy {
  font-size: 0.92rem;
  line-height: 1.55;
  max-width: 34ch;
}

.sc_tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.15rem;
}

.sc_tags > span {
  padding: 0.32em 0.7em;
  border-radius: 99px;
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
}

.sc_link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.5rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--tint);
}

.sc_go {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  color: var(--text);
  flex: none;
  transition:
    background 0.45s var(--e-out),
    color 0.45s var(--e-out),
    border-color 0.45s var(--e-out),
    transform 0.55s var(--e-out);
}

.sc_go :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.sc_panel:hover .sc_go {
  background: var(--tint);
  border-color: var(--tint);
  color: #06070a;
  transform: rotate(45deg);
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
