<script setup lang="ts">
import gsap from 'gsap'
import { categoryLabel } from '~/data/gear'

const q = useQuote()
const { $motion } = useNuxtApp() as unknown as {
  $motion: { stop: () => void; start: () => void }
}

const sheet = ref<HTMLElement | null>(null)
const scrim = ref<HTMLElement | null>(null)

/**
 * Tracked rather than assumed. The scroll lock counts its holders, so releasing
 * one this component never took would free somebody else's, most obviously the
 * intro curtain.
 */
let held = false
const hold = () => {
  if (held) return
  held = true
  $motion?.stop()
}
const drop = () => {
  if (!held) return
  held = false
  $motion?.start()
}

const close = () => {
  q.drawer.value = false
}

const enter = (el: Element, done: () => void) => {
  hold()
  if (prefersReducedMotion()) return done()
  gsap
    .timeline({ onComplete: done })
    .fromTo(scrim.value, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
    .fromTo(sheet.value, { xPercent: 104 }, { xPercent: 0, duration: 0.8, ease: 'glide' }, 0)
    .from('.qd_row', { autoAlpha: 0, x: 34, duration: 0.6, stagger: 0.05, ease: 'swift' }, 0.28)
    .from('.qd_foot > *', { autoAlpha: 0, y: 18, duration: 0.5, stagger: 0.06 }, 0.4)
}

const leave = (el: Element, done: () => void) => {
  if (prefersReducedMotion()) {
    drop()
    return done()
  }
  gsap
    .timeline({
      onComplete: () => {
        // Released once the sheet is gone, not as it starts to leave, so the
        // page cannot scroll behind a drawer still on screen.
        drop()
        done()
      }
    })
    .to(sheet.value, { xPercent: 104, duration: 0.55, ease: 'glide' }, 0)
    .to(scrim.value, { autoAlpha: 0, duration: 0.45 }, 0)
}

onMounted(() => {
  const esc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && q.drawer.value) close()
  }
  window.addEventListener('keydown', esc)
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', esc)
    drop()
  })
})
</script>

<template>
  <Teleport to="body">
    <Transition :css="false" @enter="enter" @leave="leave">
      <div v-if="q.drawer.value" class="qd" role="dialog" aria-modal="true" aria-label="Your selection">
        <div ref="scrim" class="qd_scrim" @click="close" />

        <aside ref="sheet" class="qd_sheet allow-scroll">
          <header class="qd_head">
            <div>
              <p class="eyebrow">Your selection</p>
              <h2 class="qd_h display">Build the quote</h2>
            </div>
            <button class="qd_x" aria-label="Close" @click="close">
              <span /><span />
            </button>
          </header>

          <p class="qd_note dim">
            Nothing is charged here. Tell us what you want and for how long, then we send a written
            quote with everything included.
          </p>

          <div v-if="!q.detailed.value.length" class="qd_empty">
            <p class="dim">Nothing picked yet.</p>
            <NuxtLink to="/gear" class="btn btn_solid btn_sm" @click="close">
              <span>Open the fleet</span>
            </NuxtLink>
          </div>

          <ul v-else class="qd_list">
            <li v-for="row in q.detailed.value" :key="row.item.slug" class="qd_row">
              <span class="qd_art" :style="{ '--tint': row.item.tint }">
                <GearVisual :item="row.item" :width="96" />
              </span>

              <span class="qd_info">
                <span class="mono qd_cat">{{ categoryLabel(row.item.category) }}</span>
                <span class="qd_name">{{ row.item.name }}</span>
              </span>

              <span class="qd_qty">
                <button
                  :aria-label="`Fewer ${row.item.name}`"
                  @click="q.setQty(row.item.slug, row.line.qty - 1)"
                >
                  <Icon name="lucide:minus" />
                </button>
                <span class="qd_num mono">{{ row.line.qty }}</span>
                <button
                  :aria-label="`More ${row.item.name}`"
                  @click="q.setQty(row.item.slug, row.line.qty + 1)"
                >
                  <Icon name="lucide:plus" />
                </button>
              </span>

              <button class="qd_del" :aria-label="`Remove ${row.item.name}`" @click="q.remove(row.item.slug)">
                <Icon name="lucide:x" />
              </button>
            </li>
          </ul>

          <div class="qd_foot">
            <div class="qd_days">
              <p class="mono dim">How many days</p>
              <div class="qd_stepper">
                <button aria-label="Fewer days" @click="q.setDays(q.days.value - 1)">
                  <Icon name="lucide:minus" />
                </button>
                <span class="qd_days_n display">{{ q.days.value }}</span>
                <button aria-label="More days" @click="q.setDays(q.days.value + 1)">
                  <Icon name="lucide:plus" />
                </button>
              </div>
              <div class="qd_chips">
                <button
                  v-for="d in [1, 2, 3, 7]"
                  :key="d"
                  class="qd_chip"
                  :class="{ on: q.days.value === d }"
                  @click="q.setDays(d)"
                >
                  {{ d === 7 ? 'A week' : d === 1 ? 'One day' : `${d} days` }}
                </button>
              </div>
            </div>

            <NuxtLink to="/quote" class="btn btn_primary qd_go" @click="close">
              <span>Continue to details</span>
              <Icon name="lucide:arrow-right" />
            </NuxtLink>

            <button v-if="q.detailed.value.length" class="qd_clear mono" @click="q.clear()">
              Clear the list
            </button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.qd {
  position: fixed;
  inset: 0;
  z-index: 950;
}

.qd_scrim {
  position: absolute;
  inset: 0;
  background: rgba(3, 4, 6, 0.72);
  backdrop-filter: blur(6px);
}

.qd_sheet {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(100%, 30rem);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #0c0f16 0%, #080a10 100%);
  border-left: 1px solid var(--line);
  padding: clamp(1.2rem, 3vw, 1.8rem);
  overflow-y: auto;
  will-change: transform;
}

.qd_head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.qd_h {
  font-size: 1.6rem;
  margin-top: 0.7rem;
}

.qd_x {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  display: grid;
  place-items: center;
  flex: none;
  transition: background 0.4s var(--e-out), border-color 0.4s var(--e-out);
}

.qd_x:hover {
  background: var(--ion);
  border-color: var(--ion);
}

.qd_x span {
  position: absolute;
  width: 14px;
  height: 1.5px;
  background: var(--text);
  transition: background 0.4s var(--e-out);
}

.qd_x:hover span {
  background: #06070a;
}

.qd_x span:first-child {
  transform: rotate(45deg);
}

.qd_x span:last-child {
  transform: rotate(-45deg);
}

.qd_note {
  font-size: 0.86rem;
  line-height: 1.5;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 0.4rem;
}

.qd_empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 3rem 0;
}

.qd_list {
  display: flex;
  flex-direction: column;
}

.qd_row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line-soft);
}

.qd_art {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--tint) 8%, #0b0e14);
  display: grid;
  place-items: center;
  padding: 4px;
  flex: none;
}

.qd_info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.qd_cat {
  color: var(--faint);
  font-size: 0.56rem;
}

.qd_name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.025em;
  line-height: 1.15;
}

.qd_qty {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 2px;
}

.qd_qty button {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--muted);
  transition: background 0.35s var(--e-out), color 0.35s var(--e-out);
}

.qd_qty button:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}

.qd_qty :deep(svg) {
  width: 0.82rem;
  height: 0.82rem;
}

.qd_num {
  min-width: 1.4rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text);
}

.qd_del {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  color: var(--faint);
  border-radius: 50%;
  transition: color 0.35s var(--e-out), background 0.35s var(--e-out);
}

.qd_del:hover {
  color: var(--flare);
  background: rgba(255, 106, 61, 0.1);
}

.qd_del :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
}

.qd_foot {
  margin-top: auto;
  padding-top: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qd_days {
  padding: 1.1rem;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.022);
}

.qd_days .mono {
  margin-bottom: 0.8rem;
}

.qd_stepper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.qd_stepper button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  display: grid;
  place-items: center;
  transition: background 0.4s var(--e-out), color 0.4s var(--e-out), border-color 0.4s;
}

.qd_stepper button:hover {
  background: var(--ion);
  border-color: var(--ion);
  color: #06070a;
}

.qd_stepper :deep(svg) {
  width: 0.95rem;
  height: 0.95rem;
}

.qd_days_n {
  font-size: 1.9rem;
  min-width: 2.4rem;
  text-align: center;
  line-height: 1;
}

.qd_chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.qd_chip {
  padding: 0.35rem 0.7rem;
  border-radius: 99px;
  border: 1px solid var(--line);
  font-size: 0.76rem;
  color: var(--muted);
  transition: all 0.35s var(--e-out);
}

.qd_chip:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.qd_chip.on {
  background: rgba(248, 201, 63, 0.14);
  border-color: var(--ion);
  color: var(--ion);
}

.qd_go {
  width: 100%;
}

.qd_go :deep(svg) {
  width: 1em;
  height: 1em;
}

.qd_clear {
  align-self: center;
  color: var(--faint);
  transition: color 0.35s var(--e-out);
}

.qd_clear:hover {
  color: var(--flare);
}
</style>
