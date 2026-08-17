<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = withDefaults(
  defineProps<{
    speed?: number
    reverse?: boolean
    react?: boolean
  }>(),
  { speed: 26, reverse: false, react: true }
)

const track = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!track.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const tween = gsap.to(track.value, {
    xPercent: props.reverse ? 50 : -50,
    duration: props.speed,
    ease: 'none',
    repeat: -1
  })
  if (props.reverse) gsap.set(track.value, { xPercent: -50 })

  let st: ScrollTrigger | null = null

  if (props.react) {
    st = ScrollTrigger.create({
      trigger: track.value,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 900, 5)
        gsap.to(tween, { timeScale: 1 + v, duration: 0.35, overwrite: true })
        gsap.to(tween, { timeScale: 1, duration: 1.4, delay: 0.35, overwrite: false })
      }
    })
  }

  onBeforeUnmount(() => {
    tween.kill()
    st?.kill()
  })
})
</script>

<template>
  <div class="marq">
    <div ref="track" class="track">
      <div class="run"><slot /></div>
      <div class="run" aria-hidden="true"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.marq {
  width: 100%;
  overflow: hidden;
}

.track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.run {
  display: flex;
  align-items: center;
  flex: none;
}
</style>
