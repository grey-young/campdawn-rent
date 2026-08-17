<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps<{ items: Array<{ q: string; a: string }> }>()

const openIndex = ref<number | null>(0)
const panels = ref<HTMLElement[]>([])
const uid = useId()

const setPanel = (el: Element | ComponentPublicInstance | null, i: number) => {
  if (el instanceof HTMLElement) panels.value[i] = el
}

const toggle = (i: number) => {
  openIndex.value = openIndex.value === i ? null : i
}

watch(openIndex, (now, before) => {
  if (!import.meta.client) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (before !== null && before !== undefined) {
    const el = panels.value[before]
    if (el) gsap.to(el, { height: 0, autoAlpha: 0, duration: reduced ? 0 : 0.45, ease: 'glide' })
  }
  if (now !== null) {
    const el = panels.value[now]
    if (el) {
      gsap.to(el, {
        height: 'auto',
        autoAlpha: 1,
        duration: reduced ? 0 : 0.6,
        ease: 'glide',
        onComplete: () => ScrollTrigger.refresh()
      })
    }
  }
})

onMounted(() => {
  panels.value.forEach((el, i) => {
    if (!el) return
    gsap.set(el, i === openIndex.value ? { height: 'auto', autoAlpha: 1 } : { height: 0, autoAlpha: 0 })
  })

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.from('.fq_row', {
    autoAlpha: 0,
    y: 26,
    duration: 0.9,
    stagger: 0.06,
    ease: 'swift',
    scrollTrigger: { trigger: '.fq', start: 'top 86%', once: true }
  })
})
</script>

<template>
  <ul class="fq">
    <li v-for="(item, i) in props.items" :key="item.q" class="fq_row" :class="{ open: openIndex === i }">
      <h3 class="fq_h">
        <button
          class="fq_btn"
          :aria-expanded="openIndex === i"
          :aria-controls="`fq${uid}${i}`"
          @click="toggle(i)"
        >
          <span class="mono fq_n">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="fq_q">{{ item.q }}</span>
          <span class="fq_ico" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </h3>
      <div :id="`fq${uid}${i}`" :ref="(el) => setPanel(el, i)" class="fq_panel" role="region">
        <p class="fq_a">{{ item.a }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.fq {
  border-top: 1px solid var(--line);
}

.fq_row {
  border-bottom: 1px solid var(--line);
  transition: background 0.5s var(--e-out);
}

.fq_row:hover {
  background: rgba(255, 255, 255, 0.018);
}

.fq_h {
  font-size: inherit;
  letter-spacing: inherit;
  line-height: inherit;
}

.fq_btn {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: clamp(1.1rem, 2.4vw, 1.7rem) 0;
  text-align: left;
}

@media (min-width: 620px) {
  .fq_btn {
    gap: 1.8rem;
  }
}

.fq_n {
  color: var(--faint);
  transition: color 0.45s var(--e-out);
}

.open .fq_n {
  color: var(--ion);
}

.fq_q {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.05rem, 1.85vw, 1.45rem);
  letter-spacing: -0.03em;
  line-height: 1.2;
  transition: color 0.45s var(--e-out);
}

.fq_btn:hover .fq_q {
  color: var(--ion);
}

.fq_ico {
  position: relative;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  display: grid;
  place-items: center;
  flex: none;
  transition: background 0.5s var(--e-out), border-color 0.5s var(--e-out),
    transform 0.6s var(--e-out);
}

.fq_ico span {
  position: absolute;
  background: var(--text);
  transition: transform 0.5s var(--e-out), background 0.5s var(--e-out);
}

.fq_ico span:first-child {
  width: 12px;
  height: 1.5px;
}

.fq_ico span:last-child {
  width: 1.5px;
  height: 12px;
}

.open .fq_ico {
  background: var(--ion);
  border-color: var(--ion);
  transform: rotate(180deg);
}

.open .fq_ico span {
  background: #06070a;
}

.open .fq_ico span:last-child {
  transform: scaleY(0);
}

.fq_panel {
  overflow: hidden;
}

.fq_a {
  padding: 0 0 clamp(1.2rem, 2.4vw, 1.8rem);
  max-width: 62ch;
  color: var(--muted);
  font-size: 0.98rem;
  line-height: 1.62;
}

@media (min-width: 620px) {
  .fq_a {
    padding-left: 4.3rem;
  }
}
</style>
