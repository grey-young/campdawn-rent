<script setup lang="ts">
import gsap from 'gsap'
import { registerMagnet } from '~/composables/useMagnetField'

const props = withDefaults(
  defineProps<{
    strength?: number
    radius?: number
    as?: string
  }>(),
  { strength: 0.34, radius: 1.5, as: 'div' }
)

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  const el = root.value
  if (!el) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  // Checked on every move rather than once here, so turning the preference on
  // or off settles the buttons straight away instead of on the next reload.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Tracking wants an ease that settles, not one that overshoots. Elastic on a
  // value being rewritten every frame reads as a wobble the pointer never asked
  // for, so the spring lives on the release instead.
  const track = { duration: 0.42, ease: 'power3.out' }
  let xTo = gsap.quickTo(el, 'x', track)
  let yTo = gsap.quickTo(el, 'y', track)

  let engaged = false
  let releasing: gsap.core.Tween | null = null

  const rest = () => {
    releasing = null
    el.style.removeProperty('will-change')
  }

  const release = () => {
    if (!engaged) return
    engaged = false
    releasing = gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.45)',
      onComplete: rest,
      onInterrupt: rest
    })
  }

  const stop = registerMagnet({
    el,
    radius: props.radius,
    onMove: (dx, dy) => {
      if (motion.matches) return
      if (!engaged) {
        engaged = true
        // The elastic return and the tracking tween both write x and y. Left
        // running, the spring keeps pulling toward zero underneath the cursor
        // and the button shivers instead of following. Killed before the
        // will-change goes on, because the kill runs its own tidy-up.
        releasing?.kill()
        releasing = null
        el.style.willChange = 'transform'
      }
      xTo(dx * props.strength)
      yTo(dy * props.strength)
    },
    onLeave: release
  })

  const onMotionChange = () => {
    if (!motion.matches) return
    engaged = false
    releasing?.kill()
    releasing = null
    gsap.killTweensOf(el)
    gsap.set(el, { x: 0, y: 0 })
    rest()
    // killTweensOf takes the quickTo tweens with it, and a killed one silently
    // stops writing. Rebuilt here so the field still works if the preference
    // goes back off without a reload.
    xTo = gsap.quickTo(el, 'x', track)
    yTo = gsap.quickTo(el, 'y', track)
  }
  motion.addEventListener('change', onMotionChange)

  onBeforeUnmount(() => {
    stop()
    motion.removeEventListener('change', onMotionChange)
    gsap.killTweensOf(el)
    gsap.set(el, { x: 0, y: 0 })
    el.style.removeProperty('will-change')
  })
})
</script>

<template>
  <component :is="as" ref="root" class="mag">
    <slot />
  </component>
</template>

<style scoped>
/*
 * :where() so a class passed in from the outside always wins the display —
 * the nav CTA hides itself below 620px and should not have to fight a wrapper
 * of the same specificity to do it.
 */
:where(.mag) {
  display: inline-flex;
}
</style>
