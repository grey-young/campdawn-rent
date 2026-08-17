<script setup lang="ts">
import gsap from 'gsap'

const dot = ref<HTMLDivElement | null>(null)
const ring = ref<HTMLDivElement | null>(null)
const label = ref('')
const mode = ref<'idle' | 'link' | 'view' | 'drag' | 'text'>('idle')
const active = ref(false)

onMounted(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduced || !dot.value || !ring.value) return

  document.documentElement.classList.add('has_cursor')
  active.value = true

  const dx = gsap.quickTo(dot.value, 'x', { duration: 0.09, ease: 'power3' })
  const dy = gsap.quickTo(dot.value, 'y', { duration: 0.09, ease: 'power3' })
  const rx = gsap.quickTo(ring.value, 'x', { duration: 0.55, ease: 'power3' })
  const ry = gsap.quickTo(ring.value, 'y', { duration: 0.55, ease: 'power3' })

  let shown = false

  const move = (e: PointerEvent) => {
    if (!shown) {
      shown = true
      gsap.to([dot.value, ring.value], { autoAlpha: 1, duration: 0.4 })
    }
    dx(e.clientX)
    dy(e.clientY)
    rx(e.clientX)
    ry(e.clientY)
  }

  const over = (e: PointerEvent) => {
    const t = e.target as HTMLElement | null
    if (!t?.closest) return
    const flag = t.closest('[data-cursor]') as HTMLElement | null
    if (flag) {
      mode.value = (flag.dataset.cursor as typeof mode.value) || 'link'
      label.value = flag.dataset.cursorLabel || ''
      return
    }
    if (t.closest('a, button, input, textarea, select, [role="button"]')) {
      mode.value = 'link'
      label.value = ''
      return
    }
    mode.value = 'idle'
    label.value = ''
  }

  const down = () => gsap.to(ring.value, { scale: 0.72, duration: 0.25 })
  const up = () => gsap.to(ring.value, { scale: 1, duration: 0.35 })
  const leave = () => gsap.to([dot.value, ring.value], { autoAlpha: 0, duration: 0.3 })

  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerover', over, { passive: true })
  window.addEventListener('pointerdown', down)
  window.addEventListener('pointerup', up)
  document.addEventListener('mouseleave', leave)

  onBeforeUnmount(() => {
    document.documentElement.classList.remove('has_cursor')
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerover', over)
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointerup', up)
    document.removeEventListener('mouseleave', leave)
  })
})
</script>

<template>
  <ClientOnly>
    <div v-show="active" class="cursor" aria-hidden="true">
      <div ref="ring" class="ring" :data-mode="mode">
        <span v-if="label" class="tag">{{ label }}</span>
      </div>
      <div ref="dot" class="dot" :data-mode="mode" />
    </div>
  </ClientOnly>
</template>

<style scoped>
.cursor {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.dot,
.ring {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  visibility: hidden;
  will-change: transform;
}

.dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 50%;
  background: var(--ion);
  transition: width 0.35s var(--e-out), height 0.35s var(--e-out),
    margin 0.35s var(--e-out), background 0.35s var(--e-out);
}

.dot[data-mode='view'],
.dot[data-mode='drag'] {
  width: 0;
  height: 0;
  margin: 0;
}

.dot[data-mode='text'] {
  width: 2px;
  height: 22px;
  margin: -11px 0 0 -1px;
  border-radius: 1px;
}

.ring {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin: -19px 0 0 -19px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 50%;
  backdrop-filter: invert(0.06);
  transition: width 0.45s var(--e-out), height 0.45s var(--e-out),
    margin 0.45s var(--e-out), background 0.45s var(--e-out),
    border-color 0.45s var(--e-out);
}

.ring[data-mode='link'] {
  width: 62px;
  height: 62px;
  margin: -31px 0 0 -31px;
  border-color: var(--ion);
  background: rgba(248, 201, 63, 0.09);
}

.ring[data-mode='view'] {
  width: 108px;
  height: 108px;
  margin: -54px 0 0 -54px;
  border-color: transparent;
  background: var(--ion);
}

.ring[data-mode='drag'] {
  width: 92px;
  height: 92px;
  margin: -46px 0 0 -46px;
  border-color: transparent;
  background: rgba(255, 255, 255, 0.92);
}

.ring[data-mode='text'] {
  width: 0;
  height: 0;
  margin: 0;
  border-color: transparent;
}

.tag {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #06070a;
  font-weight: 500;
  text-align: center;
  line-height: 1.15;
  max-width: 84px;
}
</style>
