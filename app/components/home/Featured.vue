<script setup lang="ts">
import gsap from 'gsap'
import { gear } from '~/data/gear'

const root = ref<HTMLElement | null>(null)
const picks = computed(() => gear.filter((g) => g.hot || g.badge).slice(0, 6))

useMotionScope(() => {
  const cards = gsap.utils.toArray<HTMLElement>('.fe_cell')

  if (prefersReducedMotion()) {
    gsap.set(cards, { autoAlpha: 1 })
    return
  }

  gsap.from(cards, {
    y: 70,
    autoAlpha: 0,
    duration: 1.15,
    stagger: 0.09,
    ease: 'swift',
    scrollTrigger: { trigger: '.fe_grid', start: 'top 84%', once: true }
  })

  const mm = gsap.matchMedia()
  mm.add('(min-width: 1000px)', () => {
    cards.forEach((cell, i) => {
      const lane = i % 3
      const shift = lane === 1 ? -84 : lane === 2 ? -40 : 0
      if (!shift) return
      gsap.to(cell, {
        y: shift,
        ease: 'none',
        scrollTrigger: {
          trigger: '.fe_grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      })
    })
  })
}, root)
</script>

<template>
  <section ref="root" class="fe section">
    <div class="wrap-wide">
      <SectionHead
        eyebrow="The short list"
        title="What everyone <em>books</em> first"
        text="Six pieces that go out the door faster than we can clean them. Every one arrives tested, charged and loaded."
        align="split"
      />

      <div class="fe_grid">
        <div v-for="item in picks" :key="item.slug" class="fe_cell">
          <GearCard :item="item" />
        </div>
      </div>

      <div class="fe_more">
        <div class="rule" />
        <MagneticEl :strength="0.26">
          <NuxtLink to="/gear" class="btn btn_solid">
            <span>See all {{ gear.length }} pieces</span>
            <Icon name="lucide:arrow-right" />
          </NuxtLink>
        </MagneticEl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fe {
  position: relative;
}

.fe_grid {
  display: grid;
  gap: 1.1rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  perspective: 1400px;
}

@media (min-width: 640px) {
  .fe_grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1000px) {
  .fe_grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.4rem;
  }
}

.fe_cell {
  display: flex;
  will-change: transform;
}

.fe_cell > * {
  width: 100%;
}

.fe_more {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: clamp(3rem, 8vw, 6rem);
}

.fe_more .rule {
  flex: 1;
}

.fe_more :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
