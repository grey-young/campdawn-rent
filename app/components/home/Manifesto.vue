<script setup lang="ts">
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

const root = ref<HTMLElement | null>(null)

useMotionScope(() => {
  if (prefersReducedMotion()) {
    gsap.set('.man_text', { color: 'var(--text)' })
    return
  }

  SplitText.create('.man_text', {
    type: 'words',
    autoSplit: true,
    onSplit(self) {
      gsap.set(self.words, { color: '#333c50' })
      return gsap.to(self.words, {
        color: '#eef1f6',
        ease: 'none',
        stagger: 0.6,
        scrollTrigger: {
          trigger: root.value,
          start: 'top 72%',
          end: 'bottom 78%',
          scrub: 0.4
        }
      })
    }
  })

  gsap.from('.man_side > *', {
    autoAlpha: 0,
    y: 24,
    duration: 1,
    stagger: 0.1,
    ease: 'swift',
    scrollTrigger: { trigger: root.value, start: 'top 78%', once: true }
  })

  parallax('.man_orb', 180, root.value!)
}, root)
</script>

<template>
  <section ref="root" class="man section">
    <div class="man_orb orb" aria-hidden="true" />

    <div class="wrap-wide man_grid">
      <aside class="man_side">
        <p class="eyebrow">Why we exist</p>
        <div class="man_facts">
          <div>
            <p class="man_fact display">14</p>
            <p class="mono dim">Vans on the road</p>
          </div>
          <div>
            <p class="man_fact display">72 h</p>
            <p class="mono dim">Deep clean cycle</p>
          </div>
        </div>
      </aside>

      <p class="man_text display">
        Your living room becomes an arena for one weekend, then goes back to being a living
        room. No boxes in the loft, no listings to write, no regret purchase gathering dust
        behind the sofa. We bring the good stuff, we build it, and we take it away.
      </p>
    </div>
  </section>
</template>

<style scoped>
.man {
  position: relative;
  overflow: hidden;
}

.man_orb {
  width: min(60vw, 620px);
  height: min(60vw, 620px);
  right: -14%;
  top: 8%;
  background: radial-gradient(50% 50% at 50% 50%, rgba(124, 92, 255, 0.55), transparent 70%);
}

.man_grid {
  position: relative;
  display: grid;
  gap: 2.5rem;
}

@media (min-width: 960px) {
  .man_grid {
    grid-template-columns: minmax(0, 0.3fr) minmax(0, 1fr);
    gap: 4rem;
  }
}

.man_side {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.man_facts {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
}

@media (min-width: 960px) {
  .man_facts {
    flex-direction: column;
    gap: 1.8rem;
  }
}

.man_fact {
  font-size: clamp(2rem, 3.4vw, 3rem);
  line-height: 1;
  margin-bottom: 0.35rem;
  color: var(--ion);
}

.man_text {
  font-size: clamp(1.55rem, 3.9vw, 3.3rem);
  line-height: 1.14;
  letter-spacing: -0.04em;
  text-wrap: pretty;
}
</style>
