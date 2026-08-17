<script setup lang="ts">
import gsap from 'gsap'
import { gear, bySlug, categoryLabel } from '~/data/gear'

const route = useRoute()
const q = useQuote()
const root = ref<HTMLElement | null>(null)

const item = computed(() => bySlug(route.params.slug as string))

if (!item.value) {
  throw createError({ statusCode: 404, statusMessage: 'That piece of gear is not in the depot', fatal: true })
}

const current = computed(() => item.value!)

const related = computed(() =>
  gear
    .filter((g) => g.slug !== current.value.slug)
    .sort((a, b) => {
      const sa = a.category === current.value.category ? 0 : 1
      const sb = b.category === current.value.category ? 0 : 1
      return sa - sb
    })
    .slice(0, 3)
)

const qty = computed(() => q.qtyOf(current.value.slug))
const picked = computed(() => qty.value > 0)

const addNow = () => {
  if (!picked.value) q.add(current.value.slug)
  q.drawer.value = true
}

useSeoMeta({
  title: () => current.value.name,
  description: () => current.value.blurb,
  ogTitle: () => `${current.value.name} on rent from Campdawn`,
  ogDescription: () => current.value.tagline
})

useMotionScope(() => {
  const el = root.value
  if (!el) return

  const title = el.querySelector('.pd_title')
  if (title) revealLines(title, { trigger: el, start: 'top 92%' })

  if (prefersReducedMotion()) return

  gsap.from('.pd_crumbs, .pd_brand', { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.06 })
  gsap.from('.pd_stage', { autoAlpha: 0, scale: 0.94, duration: 1.3, ease: 'swift', delay: 0.1 })

  const shot = el.querySelector('.pd_photo img')
  if (shot) {
    gsap.to(shot, { y: -14, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    const stage = el.querySelector('.pd_stage') as HTMLElement
    const px = gsap.quickTo(shot, 'x', { duration: 0.9, ease: 'power3' })
    const pr = gsap.quickTo(shot, 'rotate', { duration: 1.1, ease: 'power3' })
    const track = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      const dx = (e.clientX - r.left) / r.width - 0.5
      px(dx * 26)
      pr(dx * 4)
    }
    const reset = () => { px(0); pr(0) }
    stage.addEventListener('pointermove', track)
    stage.addEventListener('pointerleave', reset)
  }
  gsap.from('.pd_side > *', { autoAlpha: 0, y: 26, duration: 0.95, stagger: 0.07, delay: 0.35 })

  gsap.from('.pd_spec', {
    autoAlpha: 0,
    y: 26,
    duration: 0.85,
    stagger: 0.06,
    ease: 'swift',
    scrollTrigger: { trigger: '.pd_specs', start: 'top 88%', once: true }
  })

  gsap.from('.pd_inc li', {
    autoAlpha: 0,
    x: -18,
    duration: 0.7,
    stagger: 0.06,
    ease: 'swift',
    scrollTrigger: { trigger: '.pd_inc', start: 'top 88%', once: true }
  })

  gsap.from('.pd_rel_cell', {
    autoAlpha: 0,
    y: 50,
    duration: 1,
    stagger: 0.08,
    ease: 'swift',
    scrollTrigger: { trigger: '.pd_rel_grid', start: 'top 88%', once: true }
  })
}, root)
</script>

<template>
  <div ref="root" class="pd" :style="{ '--tint': current.tint }">
    <div class="pd_wash" aria-hidden="true" />

    <div class="wrap-wide pd_top">
      <nav class="pd_crumbs mono" aria-label="Breadcrumb">
        <NuxtLink to="/gear">Fleet</NuxtLink>
        <span class="pd_sep">/</span>
        <NuxtLink :to="`/gear?c=${current.category}`">{{ categoryLabel(current.category) }}</NuxtLink>
        <span class="pd_sep">/</span>
        <span class="ion">{{ current.name }}</span>
      </nav>
    </div>

    <div class="wrap-wide pd_grid">
      <div class="pd_stage">
        <!-- a real photo of the unit beats a stylised model, so it wins the stage -->
        <div v-if="current.photo" class="pd_photo">
          <NuxtImg
            :src="current.photo"
            :alt="current.name"
            width="780"
            height="780"
            format="webp"
            quality="92"
            preload
          />
        </div>
        <ClientOnly v-else>
          <GearViewer :kind="current.art" :tint="current.tint" />
          <template #fallback>
            <div class="pd_fallback">
              <GearArt :kind="current.art" :tint="current.tint" />
            </div>
          </template>
        </ClientOnly>
        <span v-if="current.badge" class="pd_flag mono">{{ current.badge }}</span>
      </div>

      <div class="pd_side">
        <p class="mono pd_brand">{{ current.brand }} · {{ categoryLabel(current.category) }}</p>
        <h1 class="display pd_title">{{ current.name }}</h1>
        <p class="pd_tag serif">{{ current.tagline }}</p>
        <p class="pd_blurb dim">{{ current.blurb }}</p>

        <div class="pd_quote panel">
          <p class="mono dim pd_quote_top">No fixed rate, no fees</p>
          <p class="pd_quote_line">
            Tell us how many you want and how long for. We reply with a written quote, usually
            inside two hours.
          </p>

          <div class="pd_controls">
            <div class="pd_ctrl">
              <span class="mono dim">How many</span>
              <div class="pd_step">
                <button aria-label="Fewer units" @click="q.setQty(current.slug, qty - 1)">
                  <Icon name="lucide:minus" />
                </button>
                <span class="pd_step_n display">{{ qty }}</span>
                <button aria-label="More units" @click="q.setQty(current.slug, qty + 1)">
                  <Icon name="lucide:plus" />
                </button>
              </div>
            </div>

            <div class="pd_ctrl">
              <span class="mono dim">How many days</span>
              <div class="pd_step">
                <button aria-label="Fewer days" @click="q.setDays(q.days.value - 1)">
                  <Icon name="lucide:minus" />
                </button>
                <span class="pd_step_n display">{{ q.days.value }}</span>
                <button aria-label="More days" @click="q.setDays(q.days.value + 1)">
                  <Icon name="lucide:plus" />
                </button>
              </div>
            </div>
          </div>

          <div class="pd_actions">
            <MagneticEl :strength="0.24" class="pd_mag">
              <button class="btn btn_primary pd_cta" @click="addNow">
                <span>{{ picked ? 'Review your list' : 'Add to quote' }}</span>
                <Icon name="lucide:arrow-right" />
              </button>
            </MagneticEl>
            <NuxtLink to="/gear" class="btn btn_ghost">
              <span>Keep browsing</span>
            </NuxtLink>
          </div>

          <ul class="pd_assure">
            <li><Icon name="lucide:truck" /><span>Delivery and collection included</span></li>
            <li><Icon name="lucide:shield-check" /><span>Damage cover on every item</span></li>
            <li><Icon name="lucide:clock" /><span>Quote back within two hours</span></li>
          </ul>
        </div>
      </div>
    </div>

    <section class="wrap-wide pd_detail">
      <div class="pd_col">
        <p class="eyebrow">The numbers</p>
        <div class="pd_specs">
          <div v-for="s in current.specs" :key="s.label" class="pd_spec">
            <p class="mono pd_spec_l">{{ s.label }}</p>
            <p class="pd_spec_v display">{{ s.value }}</p>
          </div>
        </div>
      </div>

      <div class="pd_col">
        <p class="eyebrow">In the box</p>
        <ul class="pd_inc">
          <li v-for="i in current.includes" :key="i">
            <Icon name="lucide:check" />
            <span>{{ i }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="wrap-wide pd_rel">
      <div class="pd_rel_head">
        <h2 class="display pd_rel_h">Goes well with</h2>
        <NuxtLink to="/gear" class="pd_rel_all mono">
          <span>All gear</span>
          <Icon name="lucide:arrow-right" />
        </NuxtLink>
      </div>
      <div class="pd_rel_grid">
        <div v-for="r in related" :key="r.slug" class="pd_rel_cell">
          <GearCard :item="r" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pd {
  position: relative;
  padding-top: clamp(7rem, 15vh, 10rem);
  overflow: hidden;
}

.pd_wash {
  position: absolute;
  top: -10%;
  left: 50%;
  width: min(120vw, 1300px);
  height: 70vh;
  transform: translateX(-50%);
  background: radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--tint) 20%, transparent), transparent 70%);
  filter: blur(30px);
  pointer-events: none;
}

.pd_top {
  position: relative;
}

.pd_crumbs {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  color: var(--muted);
}

.pd_crumbs a {
  transition: color 0.35s var(--e-out);
}

.pd_crumbs a:hover {
  color: var(--text);
}

.pd_sep {
  color: var(--faint);
}

.pd_grid {
  position: relative;
  display: grid;
  gap: 2.5rem;
  padding-top: clamp(1.5rem, 4vw, 2.5rem);
  padding-bottom: var(--section);
}

@media (min-width: 980px) {
  .pd_grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 3.5rem;
    align-items: start;
  }
}

.pd_stage {
  position: relative;
  aspect-ratio: 1.02;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background:
    radial-gradient(70% 60% at 50% 40%, color-mix(in srgb, var(--tint) 9%, transparent), transparent 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
  overflow: hidden;
}

@media (min-width: 980px) {
  .pd_stage {
    position: sticky;
    top: 100px;
  }
}

.pd_photo {
  position: absolute;
  inset: 8%;
  display: grid;
  place-items: center;
}

.pd_photo :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6));
  will-change: transform;
}

.pd_fallback {
  position: absolute;
  inset: 12%;
  display: grid;
  place-items: center;
}

.pd_flag {
  position: absolute;
  top: 1.1rem;
  left: 1.1rem;
  padding: 0.4em 0.85em;
  border-radius: 99px;
  border: 1px solid color-mix(in srgb, var(--tint) 45%, transparent);
  background: color-mix(in srgb, var(--tint) 12%, rgba(6, 7, 10, 0.7));
  color: var(--tint);
  font-size: 0.6rem;
}

.pd_side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pd_brand {
  color: var(--faint);
}

.pd_title {
  font-size: clamp(2.3rem, 5.4vw, 4rem);
  letter-spacing: -0.05em;
}

.pd_tag {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  color: var(--ion);
  line-height: 1.2;
}

.pd_blurb {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 52ch;
}

.pd_quote {
  padding: clamp(1.2rem, 2.4vw, 1.7rem);
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pd_quote_top {
  letter-spacing: 0.18em;
}

.pd_quote_line {
  font-family: var(--font-display);
  font-size: 1.05rem;
  line-height: 1.35;
  letter-spacing: -0.025em;
  max-width: 40ch;
}

.pd_controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem 2.2rem;
  padding: 1rem 0;
  border-block: 1px solid var(--line);
}

.pd_ctrl {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pd_step {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.pd_step button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  display: grid;
  place-items: center;
  transition: all 0.4s var(--e-out);
}

.pd_step button:hover {
  background: var(--ion);
  border-color: var(--ion);
  color: #06070a;
}

.pd_step :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
}

.pd_step_n {
  font-size: 1.6rem;
  min-width: 2rem;
  text-align: center;
  line-height: 1;
}

.pd_actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.pd_actions :deep(svg) {
  width: 1em;
  height: 1em;
}

.pd_assure {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-top: 0.4rem;
}

.pd_assure li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.86rem;
  color: var(--muted);
}

.pd_assure :deep(svg) {
  width: 0.95rem;
  height: 0.95rem;
  color: var(--ion);
  flex: none;
}

/* detail */
.pd_detail {
  display: grid;
  gap: 2.5rem;
  padding-bottom: var(--section);
  border-top: 1px solid var(--line);
  padding-top: clamp(2.5rem, 6vw, 4rem);
}

@media (min-width: 860px) {
  .pd_detail {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 4rem;
  }
}

.pd_col .eyebrow {
  margin-bottom: 1.6rem;
}

.pd_specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
}

.pd_spec {
  background: var(--ink);
  padding: 1.2rem;
}

.pd_spec_l {
  color: var(--faint);
  margin-bottom: 0.5rem;
}

.pd_spec_v {
  font-size: clamp(1.05rem, 1.7vw, 1.35rem);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.pd_inc {
  display: flex;
  flex-direction: column;
}

.pd_inc li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--line-soft);
  font-size: 0.95rem;
  color: var(--text-dim);
}

.pd_inc :deep(svg) {
  width: 1rem;
  height: 1rem;
  color: var(--tint);
  flex: none;
}

/* related */
.pd_rel {
  padding-bottom: var(--section);
}

.pd_rel_head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pd_rel_h {
  font-size: var(--t-h3);
}

.pd_rel_all {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--muted);
  transition: color 0.35s var(--e-out);
}

.pd_rel_all:hover {
  color: var(--ion);
}

.pd_rel_all :deep(svg) {
  width: 1em;
  height: 1em;
}

.pd_rel_grid {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr;
  perspective: 1400px;
}

@media (min-width: 700px) {
  .pd_rel_grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.pd_rel_cell {
  display: flex;
}

.pd_rel_cell > * {
  width: 100%;
}
</style>
