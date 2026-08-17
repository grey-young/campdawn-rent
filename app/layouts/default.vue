<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const progress = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!progress.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      gsap.set(progress.value, { scaleX: self.progress })
    }
  })

  onBeforeUnmount(() => st.kill())
})
</script>

<template>
  <div class="shell">
    <a href="#main" class="skip">Skip to content</a>

    <SitePreloader />
    <SiteCursor />
    <SiteNav />

    <div class="progress"><span ref="progress" /></div>

    <main id="main">
      <slot />
    </main>

    <SiteFooter />

    <QuoteBar />
    <QuoteDrawer />

    <div class="grain" aria-hidden="true" />
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 901;
  pointer-events: none;
}

.progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--ion), var(--volt));
  transform: scaleX(0);
  transform-origin: left center;
  box-shadow: 0 0 12px rgba(248, 201, 63, 0.55);
}
</style>
