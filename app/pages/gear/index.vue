<script setup lang="ts">
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gear, categories } from '~/data/gear'

useSeoMeta({
  title: 'The fleet',
  description:
    'Every console, screen, headset, wheel and cabinet Campdawn owns. Filter by shape, check the daily rate and book the ones you want.'
})

const route = useRoute()
const router = useRouter()
const root = ref<HTMLElement | null>(null)
const navHidden = useState('navHidden', () => false)

const active = ref<string>((route.query.c as string) || 'all')
const sort = ref<'featured' | 'az' | 'brand'>('featured')

const sorts = [
  { id: 'featured', label: 'Featured' },
  { id: 'az', label: 'A to Z' },
  { id: 'brand', label: 'By brand' }
] as const

const counts = computed(() => {
  const map: Record<string, number> = { all: gear.length }
  for (const g of gear) map[g.category] = (map[g.category] || 0) + 1
  return map
})

const shown = computed(() => {
  const list = active.value === 'all' ? [...gear] : gear.filter((g) => g.category === active.value)
  if (sort.value === 'az') list.sort((a, b) => a.name.localeCompare(b.name))
  if (sort.value === 'brand') list.sort((a, b) => a.brand.localeCompare(b.brand))
  return list
})

const grid = ref<HTMLElement | null>(null)
const pills = ref<HTMLElement | null>(null)
let running: gsap.core.Timeline | null = null

/** Brings the chosen category into view in the strip that scrolls sideways. */
const revealPill = (id: string) => {
  const strip = pills.value
  const btn = strip?.querySelector<HTMLElement>(`[data-cat="${id}"]`)
  if (!strip || !btn) return
  const left = btn.offsetLeft - strip.clientWidth / 2 + btn.offsetWidth / 2
  strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
}

/** Puts the grid back under its own control, whatever state it was left in. */
const settle = (box: HTMLElement) => {
  box.style.removeProperty('height')
  running = null
}

const flip = async (fn: () => void) => {
  const box = grid.value

  // A hidden tab has no animation frames, so a transition started in one never
  // finishes and would leave the grid pinned at the wrong height. Swap plainly
  // instead and let it animate again once the tab is back in front.
  if (!import.meta.client || !box || prefersReducedMotion() || document.hidden) {
    if (box) settle(box)
    fn()
    return
  }

  // A second click while the first change is still playing used to leave two
  // Flip runs fighting over the same cells. Finish the one in flight first.
  if (running) {
    running.progress(1, false).kill()
  }
  gsap.killTweensOf(box)
  settle(box)
  // The entry stagger from page load can also still be going, and Flip would
  // record those half finished transforms as the resting state.
  gsap.killTweensOf(box.querySelectorAll('.gr_cell'))
  gsap.set(box.querySelectorAll('.gr_cell'), { clearProps: 'transform,opacity,visibility' })
  // A card left tilted under the pointer would carry that tilt through the
  // move and land crooked.
  const cards = box.querySelectorAll('.gc, .gc_art')
  gsap.killTweensOf(cards)
  gsap.set(cards, { clearProps: 'transform' })

  const state = Flip.getState(box.querySelectorAll('.gr_cell'), { props: 'opacity' })

  // Flip lifts the cells out of the flow to move them, which drops the grid to
  // nothing and yanks the rest of the page up behind it. Pin the height across
  // the change and release it at the end.
  const from = box.offsetHeight
  fn()
  await nextTick()
  const to = box.offsetHeight
  box.style.height = `${from}px`

  running = Flip.from(state, {
    duration: 0.62,
    ease: 'power2.inOut',
    absolute: true,
    stagger: 0.014,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.02, ease: 'swift' }
      ),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' }),
    onComplete: () => {
      settle(box)
      ScrollTrigger.refresh()
    }
  })

  // Run the container to its new height alongside the cells rather than
  // snapping at the end. Interrupting it hands the height back too, so a rapid
  // second click cannot strand the grid at the old size.
  gsap.to(box, {
    height: to,
    duration: 0.62,
    ease: 'power2.inOut',
    onInterrupt: () => settle(box)
  })
}

const pick = (id: string) => {
  if (id === active.value) return
  revealPill(id)
  flip(() => {
    active.value = id
    router.replace({ query: id === 'all' ? {} : { c: id } })
  })
}

const setSort = (id: (typeof sorts)[number]['id']) => {
  if (id === sort.value) return
  flip(() => (sort.value = id))
}

onMounted(() => {
  // Leaving the tab mid change parks the animation frames. Snap whatever is in
  // flight to its end so nothing is left pinned when the tab comes back.
  const onHide = () => {
    if (!document.hidden || !running || !grid.value) return
    running.progress(1, false).kill()
    gsap.killTweensOf(grid.value)
    settle(grid.value)
  }
  document.addEventListener('visibilitychange', onHide)
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onHide)
    if (grid.value) {
      gsap.killTweensOf(grid.value)
      settle(grid.value)
    }
  })
})

watch(
  () => route.query.c,
  (c) => {
    const next = (c as string) || 'all'
    if (next !== active.value) flip(() => (active.value = next))
  }
)

useMotionScope(() => {
  const el = root.value
  if (!el) return

  // Landing straight on a filtered link should show which one is on, even when
  // it sits off the end of the strip.
  if (active.value !== 'all') revealPill(active.value)

  const title = el.querySelector('.gr_title')
  if (title) revealLines(title, { trigger: el, start: 'top 92%' })

  if (prefersReducedMotion()) return

  gsap.from('.gr_meta > *', { autoAlpha: 0, y: 22, duration: 0.9, stagger: 0.08, delay: 0.15 })
  gsap.from('.gr_filter', { autoAlpha: 0, y: 22, duration: 0.9, delay: 0.3 })
  gsap.from('.gr_cell', {
    autoAlpha: 0,
    y: 60,
    duration: 1,
    stagger: 0.05,
    ease: 'swift',
    delay: 0.35
  })
}, root)
</script>

<template>
  <div ref="root" class="gr">
    <header class="gr_head wrap-wide">
      <p class="eyebrow gr_meta_top">Catalogue</p>
      <h1 class="display gr_title">The fleet,<br >all of it</h1>
      <div class="gr_meta">
        <p class="lead">
          Everything below lives in the Awoshie depot right now. Pick what you want, tell us how many
          days you need it and we send a written quote with delivery, build and collection included.
        </p>
        <p class="mono gr_count">
          <span class="ion">{{ String(shown.length).padStart(2, '0') }}</span>
          <span class="gr_slash">/</span>
          <span>{{ gear.length }} pieces</span>
        </p>
      </div>
    </header>

    <div class="gr_filter" :class="{ raised: navHidden }">
      <div class="wrap-wide gr_filter_in">
        <div ref="pills" class="gr_pills" role="tablist" aria-label="Filter by category">
          <button
            v-for="c in categories"
            :key="c.id"
            role="tab"
            :data-cat="c.id"
            :aria-selected="active === c.id"
            class="pill"
            :class="{ on: active === c.id }"
            @click="pick(c.id)"
          >
            <span>{{ c.label }}</span>
            <span class="pill_n mono">{{ counts[c.id] ?? 0 }}</span>
          </button>
        </div>

        <div class="gr_sort">
          <span class="mono dim gr_sort_lbl">Sort</span>
          <div class="seg">
            <button
              v-for="s in sorts"
              :key="s.id"
              class="seg_btn"
              :class="{ on: sort === s.id }"
              @click="setSort(s.id)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="wrap-wide gr_body">
      <div ref="grid" class="gr_grid">
        <div v-for="item in shown" :key="item.slug" class="gr_cell">
          <GearCard :item="item" />
        </div>
      </div>

      <p v-if="!shown.length" class="gr_empty dim">
        Nothing in this shelf yet. Try another category.
      </p>
    </div>

    <section class="gr_foot wrap-wide">
      <div class="gr_foot_in panel">
        <div>
          <p class="eyebrow">Cannot see it</p>
          <h2 class="display gr_foot_h">We source odd requests every week</h2>
          <p class="dim gr_foot_p">
            Light guns, four player cabinets, a projector for a barn, a hundred controllers for a
            conference. Tell us the plan and we will find the kit.
          </p>
        </div>
        <MagneticEl :strength="0.28">
          <NuxtLink to="/contact" class="btn btn_primary">
            <span>Ask for something</span>
            <Icon name="lucide:arrow-right" />
          </NuxtLink>
        </MagneticEl>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gr_head {
  padding-top: clamp(8rem, 18vh, 12rem);
  padding-bottom: clamp(2rem, 5vw, 3.5rem);
}

.gr_meta_top {
  margin-bottom: 1.2rem;
}

.gr_title {
  font-size: var(--t-h1);
  margin-bottom: 2rem;
}

.gr_meta {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
}

.gr_count {
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

.gr_slash {
  color: var(--faint);
  margin: 0 0.5em;
}

/* filter bar */
.gr_filter {
  position: sticky;
  top: 76px;
  z-index: 500;
  background: rgba(6, 7, 10, 0.78);
  backdrop-filter: blur(16px) saturate(150%);
  border-block: 1px solid var(--line);
  padding: 0.85rem 0;
  transition: top 0.5s var(--e-out);
}

/* The bar above slides away on the way down the page. Follow it up rather than
   sitting under an empty strip. */
.gr_filter.raised {
  top: 0;
}

.gr_filter_in {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: space-between;
}

.gr_pills {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
  /* Keep a sideways swipe on the strip from turning into a page scroll once it
     reaches either end. */
  overscroll-behavior-x: contain;
}

.gr_pills::-webkit-scrollbar {
  display: none;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.9rem;
  border-radius: 99px;
  border: 1px solid var(--line);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-dim);
  white-space: nowrap;
  flex: none;
  /* Named rather than all. An all transition here also eases width and padding,
     so the strip visibly reflows every time a pill changes state. */
  transition: background 0.26s var(--e-out), border-color 0.26s var(--e-out),
    color 0.26s var(--e-out);
}

.pill:active {
  transform: scale(0.96);
}

.pill:hover {
  border-color: var(--line-strong);
  color: var(--text);
}

.pill.on {
  background: var(--ion);
  border-color: var(--ion);
  color: #06070a;
}

.pill_n {
  font-size: 0.58rem;
  opacity: 0.55;
}

.gr_sort {
  display: none;
  align-items: center;
  gap: 0.75rem;
  flex: none;
}

@media (min-width: 1080px) {
  .gr_sort {
    display: flex;
  }
}

.seg {
  display: flex;
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 3px;
  gap: 2px;
}

.seg_btn {
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;
  transition: background 0.26s var(--e-out), color 0.26s var(--e-out);
}

.seg_btn:hover {
  color: var(--text);
}

.seg_btn.on {
  background: rgba(255, 255, 255, 0.09);
  color: var(--text);
}

/* grid */
.gr_body {
  padding-top: clamp(2rem, 5vw, 3.5rem);
  padding-bottom: var(--section);
}

.gr_grid {
  display: grid;
  gap: 1.1rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  perspective: 1400px;
  /* Flip positions the cells absolutely while it moves them, so they need this
     as their offset parent. Without it they resolve against the page and land
     hundreds of pixels away from where they belong. */
  position: relative;
}

@media (min-width: 560px) {
  .gr_grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .gr_grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.3rem;
  }
}

@media (min-width: 1400px) {
  .gr_grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.gr_cell {
  display: flex;
}

.gr_cell > * {
  width: 100%;
}

.gr_empty {
  padding: 4rem 0;
  text-align: center;
}

/* foot */
.gr_foot {
  padding-bottom: var(--section);
}

.gr_foot_in {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.8rem, 4vw, 3rem);
}

.gr_foot_h {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  margin: 1rem 0 0.8rem;
  max-width: 20ch;
}

.gr_foot_p {
  max-width: 52ch;
  font-size: 0.95rem;
}

.gr_foot_in :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
