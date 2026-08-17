<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

useSeoMeta({
  title: 'How it runs',
  description:
    'From the first click to the empty room. How Campdawn quotes, delivers, builds, supports and collects every rental across Greater Accra.'
})

const root = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)

const stages = [
  {
    n: '01',
    icon: 'lucide:list-checks',
    title: 'You build a list',
    copy: 'Browse the fleet and add whatever catches your eye. Set how many of each and how many days. Nothing is charged and nothing is held.',
    detail: ['No account needed', 'Change it as often as you like', 'Bundles can be pulled apart']
  },
  {
    n: '02',
    icon: 'lucide:mail',
    title: 'We quote it by hand',
    copy: 'A real person reads the list, checks the diary and writes back with one number that covers everything. Usually within two hours.',
    detail: ['One number, no line item surprises', 'We flag anything already booked', 'Suggestions if something suits you better']
  },
  {
    n: '03',
    icon: 'lucide:calendar-check',
    title: 'You pick a window',
    copy: 'Say yes and choose an arrival hour. We confirm on WhatsApp the morning of, with the name of the crew turning up.',
    detail: ['One hour arrival windows', 'WhatsApp on the day', 'Move it free of charge up to noon']
  },
  {
    n: '04',
    icon: 'lucide:wrench',
    title: 'The crew builds it',
    copy: 'Mounting, cabling, calibration, sound tuning and a five minute walk through. We do not leave until you have played on it.',
    detail: ['Two people on every drop', 'Cable management included', 'Stair jobs planned in advance']
  },
  {
    n: '05',
    icon: 'lucide:gamepad-2',
    title: 'You play',
    copy: 'Everything arrives charged, patched and loaded. If anything misbehaves we swap it, we do not troubleshoot on your sofa for an hour.',
    detail: ['Support on the phone until ten', 'Swap outs the same evening', 'Extend right up to collection']
  },
  {
    n: '06',
    icon: 'lucide:package-check',
    title: 'We take it away',
    copy: 'Collection at the end of your slot. We strip it, sweep the cables and the room goes back to being a room.',
    detail: ['Leave it exactly as it is', 'No cleaning charge', 'Deposit refunded the same day']
  }
]

const care = [
  { k: 'Strip', v: 'Every item comes apart. Pads, liners, cushions and cables are separated.' },
  { k: 'Clean', v: 'Surfaces wiped, foam replaced, fabric steamed and vents cleared with air.' },
  { k: 'Test', v: 'Powered on, run through a checklist and played for at least ten minutes.' },
  { k: 'Load', v: 'Patched overnight, libraries refreshed and profiles wiped back to clean.' }
]

const zones = [
  { name: 'Awoshie, Lapaz and Achimota', ring: 0, note: 'Same day, most days' },
  { name: 'Dansoman, Osu and East Legon', ring: 1, note: 'Same day before noon' },
  { name: 'Tema, Kasoa and Adenta', ring: 2, note: 'Next day as standard' },
  { name: 'Kumasi and Takoradi', ring: 3, note: 'Two day bookings and up' }
]

useMotionScope(() => {
  const el = root.value
  if (!el) return

  const title = el.querySelector('.pc_title')
  if (title) revealLines(title, { trigger: el, start: 'top 92%' })

  if (prefersReducedMotion()) return

  gsap.from('.pc_lead', { autoAlpha: 0, y: 22, duration: 0.9, delay: 0.25 })

  gsap.utils.toArray<HTMLElement>('.pc_stage').forEach((stage) => {
    gsap.from(stage, {
      autoAlpha: 0,
      y: 54,
      duration: 1,
      ease: 'swift',
      scrollTrigger: { trigger: stage, start: 'top 86%', once: true }
    })
    ScrollTrigger.create({
      trigger: stage,
      start: 'top 62%',
      end: 'bottom 42%',
      onToggle: (self) => stage.classList.toggle('on', self.isActive)
    })
  })

  gsap.from('.pc_care_row', {
    autoAlpha: 0,
    x: -26,
    duration: 0.9,
    stagger: 0.08,
    ease: 'swift',
    scrollTrigger: { trigger: '.pc_care', start: 'top 84%', once: true }
  })

  gsap.from('.pc_zone', {
    autoAlpha: 0,
    y: 26,
    duration: 0.8,
    stagger: 0.08,
    ease: 'swift',
    scrollTrigger: { trigger: '.pc_map', start: 'top 82%', once: true }
  })

  gsap.from('.pc_ring_c', {
    scale: 0.4,
    autoAlpha: 0,
    duration: 1.4,
    stagger: 0.12,
    ease: 'swift',
    transformOrigin: 'center',
    scrollTrigger: { trigger: '.pc_map', start: 'top 82%', once: true }
  })

  gsap.to(ring.value, {
    rotate: 360,
    duration: 60,
    ease: 'none',
    repeat: -1,
    transformOrigin: 'center'
  })
}, root)
</script>

<template>
  <div ref="root" class="pc">
    <div class="pc_wash" aria-hidden="true" />

    <header class="wrap-wide pc_head">
      <p class="eyebrow">The whole routine</p>
      <h1 class="display pc_title">From a list<br >to an empty room</h1>
      <p class="lead pc_lead">
        Six stages, no paperwork and nobody asking you to sign anything before you know the
        number. This is exactly what happens after you hit send.
      </p>
    </header>

    <section class="wrap-wide pc_stages">
      <article v-for="s in stages" :key="s.n" class="pc_stage">
        <div class="pc_stage_bar" aria-hidden="true" />
        <p class="mono pc_stage_n">{{ s.n }}</p>
        <div class="pc_stage_ico"><Icon :name="s.icon" /></div>
        <div class="pc_stage_body">
          <h2 class="pc_stage_h">{{ s.title }}</h2>
          <p class="pc_stage_c dim">{{ s.copy }}</p>
        </div>
        <ul class="pc_stage_list">
          <li v-for="d in s.detail" :key="d">
            <Icon name="lucide:check" />
            <span>{{ d }}</span>
          </li>
        </ul>
      </article>
    </section>

    <section class="pc_care section">
      <div class="wrap-wide">
        <SectionHead
          eyebrow="Care standard"
          title="What happens between <em>every</em> booking"
          text="Nothing goes back on the shelf until it has been through all four. It is the reason gear arrives feeling new instead of borrowed."
          align="split"
        />

        <div class="pc_care_list">
          <div v-for="(c, i) in care" :key="c.k" class="pc_care_row">
            <span class="mono pc_care_n">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3 class="pc_care_k display">{{ c.k }}</h3>
            <p class="pc_care_v dim">{{ c.v }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pc_map section">
      <div class="wrap-wide pc_map_grid">
        <div>
          <SectionHead eyebrow="Coverage" title="How far the vans <em>go</em>" />
          <ul class="pc_zones">
            <li v-for="z in zones" :key="z.name" class="pc_zone">
              <span class="pc_zone_dot" :data-ring="z.ring" />
              <span class="pc_zone_name">{{ z.name }}</span>
              <span class="mono dim pc_zone_note">{{ z.note }}</span>
            </li>
          </ul>
          <p class="pc_zone_foot dim">
            Outside all of that we still say yes more often than no. Multi day bookings travel
            further, so drop your GhanaPost GPS address or the nearest landmark and we will work
            it out.
          </p>
        </div>

        <div class="pc_radar">
          <svg viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <radialGradient id="radarfill" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stop-color="#f8c93f" stop-opacity="0.22" />
                <stop offset="1" stop-color="#f8c93f" stop-opacity="0" />
              </radialGradient>
              <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#f8c93f" stop-opacity="0.45" />
                <stop offset="1" stop-color="#f8c93f" stop-opacity="0" />
              </linearGradient>
            </defs>

            <circle cx="200" cy="200" r="190" fill="url(#radarfill)" />
            <g fill="none" stroke="rgba(255,255,255,.12)">
              <circle class="pc_ring_c" cx="200" cy="200" r="60" />
              <circle class="pc_ring_c" cx="200" cy="200" r="110" />
              <circle class="pc_ring_c" cx="200" cy="200" r="158" />
              <circle class="pc_ring_c" cx="200" cy="200" r="192" stroke-dasharray="4 8" />
            </g>

            <g ref="ring" style="transform-origin: 200px 200px">
              <path d="M200 200 L200 12 A188 188 0 0 1 340 78 Z" fill="url(#sweep)" />
            </g>

            <g>
              <circle cx="200" cy="200" r="7" fill="#f8c93f" />
              <circle cx="200" cy="200" r="14" fill="none" stroke="#f8c93f" stroke-opacity=".5" />
              <text x="200" y="232" text-anchor="middle" fill="#f8c93f" font-size="11" font-family="monospace" letter-spacing="2">DEPOT</text>
            </g>

            <g fill="rgba(255,255,255,.55)" font-size="10" font-family="monospace" letter-spacing="1.5">
              <circle cx="256" cy="146" r="4" fill="#7c5cff" />
              <text x="266" y="150">LAPAZ</text>
              <circle cx="122" cy="238" r="4" fill="#7c5cff" />
              <text x="52" y="242">DANSOMAN</text>
              <circle cx="238" cy="292" r="4" fill="#4de8ff" />
              <text x="248" y="296">TEMA</text>
              <circle cx="108" cy="128" r="4" fill="#4de8ff" />
              <text x="42" y="120">ACHIMOTA</text>
            </g>
          </svg>
        </div>
      </div>
    </section>

    <section class="wrap-wide pc_cta">
      <div class="pc_cta_in panel">
        <div>
          <p class="eyebrow">Next move</p>
          <h2 class="display pc_cta_h">Start with a list, end with a quote</h2>
          <p class="dim pc_cta_p">
            It takes about ninety seconds and costs nothing. Worst case, you learn what a good
            night in your own sitting room would actually cost.
          </p>
        </div>
        <MagneticEl :strength="0.28">
          <NuxtLink to="/gear" class="btn btn_primary">
            <span>Open the fleet</span>
            <Icon name="lucide:arrow-right" />
          </NuxtLink>
        </MagneticEl>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pc {
  position: relative;
  padding-top: clamp(7rem, 15vh, 10rem);
  overflow: hidden;
}

.pc_wash {
  position: absolute;
  top: -12%;
  left: 50%;
  width: min(120vw, 1300px);
  height: 70vh;
  transform: translateX(-50%);
  background: radial-gradient(50% 50% at 50% 50%, rgba(77, 232, 255, 0.14), transparent 70%);
  filter: blur(30px);
  pointer-events: none;
}

.pc_head {
  position: relative;
  padding-bottom: clamp(3rem, 8vw, 5rem);
}

.pc_head .eyebrow {
  margin-bottom: 1.2rem;
}

.pc_title {
  font-size: var(--t-h1);
  margin-bottom: 1.8rem;
}

.pc_lead {
  max-width: 54ch;
}

/* stages */
.pc_stages {
  position: relative;
  padding-bottom: var(--section);
}

.pc_stage {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem 1.2rem;
  padding: clamp(1.5rem, 3.4vw, 2.4rem) 0;
  border-top: 1px solid var(--line);
}

@media (min-width: 900px) {
  .pc_stage {
    grid-template-columns: 4rem auto minmax(0, 1.2fr) minmax(0, 0.9fr);
    align-items: start;
    gap: 2rem;
  }
}

.pc_stage_bar {
  position: absolute;
  top: -1px;
  left: 0;
  height: 1px;
  width: 0;
  background: var(--ion);
  transition: width 1s var(--e-out);
}

.pc_stage.on .pc_stage_bar {
  width: 100%;
}

.pc_stage_n {
  color: var(--faint);
  padding-top: 0.5rem;
  transition: color 0.5s var(--e-out);
}

.pc_stage.on .pc_stage_n {
  color: var(--ion);
}

.pc_stage_ico {
  width: 3rem;
  height: 3rem;
  border-radius: 14px;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  color: var(--muted);
  transition: all 0.55s var(--e-out);
}

.pc_stage.on .pc_stage_ico {
  color: #06070a;
  background: var(--ion);
  border-color: var(--ion);
  transform: rotate(-6deg);
}

.pc_stage_ico :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

.pc_stage_h {
  font-size: var(--t-h3);
  margin-bottom: 0.65rem;
}

.pc_stage_c {
  font-size: 0.98rem;
  max-width: 48ch;
}

.pc_stage_list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  grid-column: 1 / -1;
}

@media (min-width: 900px) {
  .pc_stage_list {
    grid-column: auto;
    padding-top: 0.25rem;
  }
}

.pc_stage_list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--faint);
}

.pc_stage_list :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
  color: var(--ion);
  flex: none;
}

/* care */
.pc_care {
  border-top: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(124, 92, 255, 0.05), transparent 60%);
}

.pc_care_list {
  display: flex;
  flex-direction: column;
}

.pc_care_row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1.5rem;
  padding: clamp(1.2rem, 3vw, 2rem) 0;
  border-top: 1px solid var(--line);
  align-items: baseline;
}

@media (min-width: 800px) {
  .pc_care_row {
    grid-template-columns: 4rem minmax(0, 0.5fr) minmax(0, 1fr);
    gap: 2rem;
  }
}

.pc_care_n {
  color: var(--faint);
}

.pc_care_k {
  font-size: clamp(1.4rem, 2.6vw, 2rem);
}

.pc_care_v {
  font-size: 0.96rem;
  max-width: 52ch;
}

/* map */
.pc_map_grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 940px) {
  .pc_map_grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
    gap: 4rem;
  }
}

.pc_zones {
  display: flex;
  flex-direction: column;
  margin-top: -1rem;
}

.pc_zone {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.9rem;
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--line-soft);
}

.pc_zone_dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
}

.pc_zone_dot[data-ring='0'] {
  background: var(--ion);
  box-shadow: 0 0 12px var(--ion);
}

.pc_zone_dot[data-ring='1'] {
  background: var(--volt);
}

.pc_zone_dot[data-ring='2'] {
  background: var(--aqua);
}

.pc_zone_dot[data-ring='3'] {
  background: var(--faint);
}

.pc_zone_name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(0.98rem, 1.4vw, 1.15rem);
  letter-spacing: -0.02em;
}

.pc_zone_note {
  text-align: right;
}

.pc_zone_foot {
  margin-top: 1.6rem;
  font-size: 0.92rem;
  max-width: 46ch;
}

.pc_radar {
  position: relative;
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.pc_radar svg {
  width: 100%;
  height: 100%;
}

/* cta */
.pc_cta {
  padding-bottom: var(--section);
}

.pc_cta_in {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.8rem, 4vw, 3rem);
}

.pc_cta_h {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  margin: 1rem 0 0.8rem;
  max-width: 22ch;
}

.pc_cta_p {
  max-width: 52ch;
  font-size: 0.95rem;
}

.pc_cta_in :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
