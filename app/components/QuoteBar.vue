<script setup lang="ts">
import gsap from 'gsap'

const q = useQuote()
const route = useRoute()
const bar = ref<HTMLElement | null>(null)
const shown = computed(() => q.count.value > 0 && !route.path.startsWith('/quote'))

onMounted(() => {
  q.hydrate()

  watch(
    () => q.pulse.value,
    () => {
      if (!bar.value) return
      if (prefersReducedMotion()) return
      gsap.fromTo(
        bar.value,
        { scale: 1 },
        { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }
      )
      gsap.fromTo(
        '.qb_count',
        { yPercent: 60, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'swift' }
      )
    }
  )
})

const enter = (el: Element, done: () => void) => {
  if (prefersReducedMotion()) return done()
  gsap.fromTo(
    el,
    { y: 90, autoAlpha: 0, scale: 0.9 },
    { y: 0, autoAlpha: 1, scale: 1, duration: 0.8, ease: 'swift', onComplete: done }
  )
}

const leave = (el: Element, done: () => void) => {
  if (prefersReducedMotion()) return done()
  gsap.to(el, { y: 70, autoAlpha: 0, scale: 0.92, duration: 0.45, ease: 'power2.in', onComplete: done })
}
</script>

<template>
  <Transition :css="false" @enter="enter" @leave="leave">
    <div v-show="shown" class="qb_wrap">
      <button ref="bar" class="qb" @click="q.drawer.value = true">
        <span class="qb_dots" aria-hidden="true">
          <span v-for="d in Math.min(q.kinds.value, 4)" :key="d" class="qb_dot" />
        </span>
        <span class="qb_text">
          <span class="qb_count">{{ q.count.value }}</span>
          <span>{{ q.count.value === 1 ? 'item picked' : 'items picked' }}</span>
        </span>
        <span class="qb_go">
          <span>Get a quote</span>
          <Icon name="lucide:arrow-right" />
        </span>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.qb_wrap {
  position: fixed;
  left: 50%;
  bottom: clamp(1rem, 3vw, 1.8rem);
  transform: translateX(-50%);
  z-index: 880;
  width: calc(100% - 2 * var(--gutter));
  max-width: 30rem;
  display: flex;
  justify-content: center;
}

.qb {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.55rem 0.6rem 0.55rem 1.1rem;
  border-radius: 99px;
  background: rgba(14, 17, 24, 0.86);
  border: 1px solid var(--line-strong);
  backdrop-filter: blur(20px) saturate(160%);
  box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.9);
  transition: border-color 0.45s var(--e-out), background 0.45s var(--e-out);
  will-change: transform;
}

.qb:hover {
  border-color: var(--ion);
  background: rgba(18, 22, 30, 0.94);
}

.qb_dots {
  display: flex;
  gap: 3px;
  flex: none;
}

.qb_dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ion);
  box-shadow: 0 0 10px rgba(248, 201, 63, 0.7);
}

.qb_text {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
}

.qb_count {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
}

.qb_go {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1rem;
  border-radius: 99px;
  background: var(--ion);
  color: #06070a;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  flex: none;
}

.qb_go :deep(svg) {
  width: 0.95em;
  height: 0.95em;
  transition: transform 0.45s var(--e-out);
}

.qb:hover .qb_go :deep(svg) {
  transform: translateX(3px);
}

@media (max-width: 460px) {
  .qb_text span:last-child {
    display: none;
  }
}
</style>
