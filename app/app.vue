<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

useHead({
  titleTemplate: (t) => (t ? `${t} · Campdawn` : 'Campdawn · Gaming gear on rent'),
  bodyAttrs: { class: 'cd' }
})

useSeoMeta({
  ogSiteName: 'Campdawn',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  ogImage: '/og.png',
  twitterImage: '/og.png'
})

const curtain = ref<HTMLElement | null>(null)
const nuxtApp = useNuxtApp() as unknown as {
  $motion?: { reduced: boolean; scrollTo: (t: never, o?: number) => void }
  $lenis?: { scrollTo: (t: number, o: Record<string, unknown>) => void }
}

const cols = () => curtain.value?.querySelectorAll('.cur_col') ?? []

const onLeave = (el: Element, done: () => void) => {
  if (!curtain.value || nuxtApp.$motion?.reduced) {
    done()
    return
  }
  gsap
    .timeline({ onComplete: done })
    .set(curtain.value, { display: 'flex', pointerEvents: 'auto' })
    .set(cols(), { transformOrigin: 'bottom center' })
    .to(cols(), { scaleY: 1, duration: 0.62, stagger: 0.055, ease: 'glide' })
    .to(el, { autoAlpha: 0, duration: 0.25 }, 0.35)
}

const onEnter = (el: Element, done: () => void) => {
  if (!curtain.value || nuxtApp.$motion?.reduced) {
    done()
    return
  }
  nuxtApp.$lenis?.scrollTo(0, { immediate: true })
  window.scrollTo(0, 0)

  gsap
    .timeline({
      onComplete: () => {
        gsap.set(curtain.value, { display: 'none', pointerEvents: 'none' })
        ScrollTrigger.refresh()
        done()
      }
    })
    .set(cols(), { transformOrigin: 'top center' })
    .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, 0.15)
    .to(cols(), { scaleY: 0, duration: 0.72, stagger: 0.05, ease: 'glide' }, 0)
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage :transition="{ mode: 'out-in', css: false, onLeave, onEnter }" />
    </NuxtLayout>

    <div ref="curtain" class="curtain" aria-hidden="true">
      <div v-for="i in 6" :key="i" class="cur_col" />
    </div>
  </div>
</template>

<style scoped>
.curtain {
  position: fixed;
  inset: 0;
  z-index: 9990;
  display: none;
  pointer-events: none;
}

.cur_col {
  flex: 1;
  background: #06070a;
  transform: scaleY(0);
  will-change: transform;
}

.cur_col:nth-child(odd) {
  background: #080a0f;
}
</style>
