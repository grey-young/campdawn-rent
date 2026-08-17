<script setup lang="ts">
import gsap from 'gsap'
import { bundles, bySlug } from '~/data/gear'

useSeoMeta({
  title: 'Bundles',
  description:
    'Three ready made kits from Campdawn. A weekend at home, a full house party or a racing cockpit, quoted as one job with everything included.'
})

const q = useQuote()
const root = ref<HTMLElement | null>(null)

const gearOf = (slugs: string[]) => slugs.map((s) => bySlug(s)).filter(Boolean)
const taken = (slugs: string[]) => slugs.every((s) => q.has(s))

const grab = (slugs: string[], days: number) => {
  q.addMany(slugs)
  q.setDays(days)
  q.drawer.value = true
}

useMotionScope(() => {
  const el = root.value
  if (!el) return

  const title = el.querySelector('.bp_title')
  if (title) revealLines(title, { trigger: el, start: 'top 92%' })

  if (prefersReducedMotion()) return

  gsap.from('.bp_lead', { autoAlpha: 0, y: 22, duration: 0.9, delay: 0.25 })

  gsap.utils.toArray<HTMLElement>('.bp_row').forEach((row) => {
    gsap.from(row.querySelectorAll('.bp_reveal'), {
      autoAlpha: 0,
      y: 44,
      duration: 1,
      stagger: 0.07,
      ease: 'swift',
      scrollTrigger: { trigger: row, start: 'top 82%', once: true }
    })

    const art = row.querySelector('.bp_art_in')
    if (art) {
      gsap.fromTo(
        art,
        { yPercent: 9 },
        {
          yPercent: -9,
          ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 1 }
        }
      )
    }
  })
}, root)
</script>

<template>
  <div ref="root" class="bp">
    <div class="bp_wash" aria-hidden="true" />

    <header class="wrap-wide bp_head">
      <p class="eyebrow">Ready made</p>
      <h1 class="display bp_title">Three nights,<br >already packed</h1>
      <p class="lead bp_lead">
        Each bundle is a whole evening in one van load. Add one to your list, change anything
        inside it, and we quote the lot as a single job with delivery, build and collection
        already in the number.
      </p>
    </header>

    <div class="bp_rows">
      <section v-for="(b, i) in bundles" :id="b.slug" :key="b.slug" class="bp_row" :style="{ '--tint': b.accent }">
        <div class="wrap-wide bp_row_in" :class="{ flip: i % 2 === 1 }">
          <div class="bp_art">
            <div class="bp_art_glow" aria-hidden="true" />
            <div class="bp_art_in">
              <GearArt :kind="b.art" :tint="b.accent" />
            </div>
            <span class="bp_index display" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          </div>

          <div class="bp_text">
            <p class="mono bp_span bp_reveal">{{ b.span }}</p>
            <h2 class="display bp_name bp_reveal">{{ b.name }}</h2>
            <p class="bp_tag serif bp_reveal">{{ b.tagline }}</p>
            <p class="bp_blurb dim bp_reveal">{{ b.blurb }}</p>

            <ul class="bp_kit bp_reveal">
              <li v-for="g in gearOf(b.items)" :key="g!.slug">
                <span class="bp_kit_art" :style="{ '--t': g!.tint }">
                  <GearVisual :item="g!" :width="96" />
                </span>
                <span class="bp_kit_info">
                  <span class="mono">{{ g!.brand }}</span>
                  <NuxtLink :to="`/gear/${g!.slug}`" class="bp_kit_name">{{ g!.name }}</NuxtLink>
                </span>
              </li>
            </ul>

            <ul class="bp_extras bp_reveal">
              <li v-for="e in b.extras" :key="e">
                <Icon name="lucide:plus" />
                <span>{{ e }}</span>
              </li>
            </ul>

            <div class="bp_acts bp_reveal">
              <MagneticEl :strength="0.24">
                <button class="btn btn_primary" @click="grab(b.items, b.days)">
                  <span>{{ taken(b.items) ? 'Review your list' : 'Add this bundle' }}</span>
                  <Icon name="lucide:arrow-right" />
                </button>
              </MagneticEl>
              <NuxtLink to="/gear" class="btn btn_ghost"><span>Build your own</span></NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="wrap-wide bp_foot">
      <div class="bp_foot_in panel">
        <div>
          <p class="eyebrow">Something bigger</p>
          <h2 class="display bp_foot_h">We kit out whole venues too</h2>
          <p class="dim bp_foot_p">
            Twenty stations for a conference, a tournament stage with a shoutcast desk, or a
            hundred headsets for a launch. Tell us the room and the crowd.
          </p>
        </div>
        <MagneticEl :strength="0.26">
          <NuxtLink to="/contact" class="btn btn_solid">
            <span>Talk it through</span>
            <Icon name="lucide:arrow-right" />
          </NuxtLink>
        </MagneticEl>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bp {
  position: relative;
  padding-top: clamp(7rem, 15vh, 10rem);
  overflow: hidden;
}

.bp_wash {
  position: absolute;
  top: -12%;
  left: 50%;
  width: min(120vw, 1300px);
  height: 70vh;
  transform: translateX(-50%);
  background: radial-gradient(50% 50% at 50% 50%, rgba(255, 122, 217, 0.16), transparent 70%);
  filter: blur(30px);
  pointer-events: none;
}

.bp_head {
  position: relative;
  padding-bottom: clamp(3rem, 8vw, 5rem);
}

.bp_head .eyebrow {
  margin-bottom: 1.2rem;
}

.bp_title {
  font-size: var(--t-h1);
  margin-bottom: 1.8rem;
}

.bp_lead {
  max-width: 54ch;
}

.bp_row {
  position: relative;
  padding-block: clamp(3rem, 8vw, 6rem);
  border-top: 1px solid var(--line);
}

.bp_row_in {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}

@media (min-width: 940px) {
  .bp_row_in {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    gap: 4rem;
  }

  .bp_row_in.flip .bp_art {
    order: 2;
  }
}

.bp_art {
  position: relative;
  aspect-ratio: 1.1;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.01));
  display: grid;
  place-items: center;
  overflow: hidden;
}

.bp_art_glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(40% 40% at 50% 50%, color-mix(in srgb, var(--tint) 30%, transparent), transparent 70%);
  pointer-events: none;
}

.bp_art_in {
  position: relative;
  width: 62%;
  will-change: transform;
}

.bp_index {
  position: absolute;
  right: 1.2rem;
  bottom: 0.4rem;
  font-size: clamp(3.5rem, 9vw, 7rem);
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--tint) 40%, transparent);
  line-height: 1;
  pointer-events: none;
}

.bp_span {
  color: var(--tint);
  margin-bottom: 1rem;
}

.bp_name {
  font-size: clamp(2rem, 4.4vw, 3.4rem);
  margin-bottom: 0.7rem;
}

.bp_tag {
  font-size: clamp(1.15rem, 1.9vw, 1.5rem);
  color: var(--text-dim);
  margin-bottom: 1rem;
}

.bp_blurb {
  font-size: 0.98rem;
  line-height: 1.6;
  max-width: 52ch;
  margin-bottom: 1.8rem;
}

.bp_kit {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding-top: 1.4rem;
  border-top: 1px solid var(--line);
}

.bp_kit li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.bp_kit_art {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--t) 9%, #0b0e14);
  display: grid;
  place-items: center;
  padding: 3px;
  flex: none;
}

.bp_kit_info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.bp_kit_info .mono {
  color: var(--faint);
  font-size: 0.54rem;
}

.bp_kit_name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: -0.025em;
  transition: color 0.35s var(--e-out);
}

.bp_kit_name:hover {
  color: var(--tint);
}

.bp_extras {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.4rem;
  margin-top: 1.2rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--line-soft);
}

.bp_extras li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.86rem;
  color: var(--muted);
}

.bp_extras :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
  color: var(--tint);
}

.bp_acts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.8rem;
}

.bp_acts :deep(svg) {
  width: 1em;
  height: 1em;
}

.bp_foot {
  padding-block: var(--section);
}

.bp_foot_in {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.8rem, 4vw, 3rem);
}

.bp_foot_h {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  margin: 1rem 0 0.8rem;
  max-width: 20ch;
}

.bp_foot_p {
  max-width: 54ch;
  font-size: 0.95rem;
}

.bp_foot_in :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
