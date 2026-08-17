<script setup lang="ts">
import gsap from 'gsap'
import { bundles, bySlug } from '~/data/gear'

const root = ref<HTMLElement | null>(null)
const q = useQuote()

const taken = (slugs: string[]) => slugs.every((s) => q.has(s))

const grab = (slugs: string[], days: number) => {
  q.addMany(slugs)
  q.setDays(days)
  q.drawer.value = true
}

const names = (slugs: string[]) => slugs.map((s) => bySlug(s)?.name ?? s)

useMotionScope(() => {
  if (prefersReducedMotion()) {
    gsap.set('.bu_card', { autoAlpha: 1 })
    return
  }

  gsap.from('.bu_card', {
    y: 74,
    autoAlpha: 0,
    duration: 1.2,
    stagger: 0.11,
    ease: 'swift',
    scrollTrigger: { trigger: '.bu_grid', start: 'top 84%', once: true }
  })

  gsap.utils.toArray<HTMLElement>('.bu_card').forEach((card, i) => {
    const shift = i === 1 ? -46 : i === 2 ? -18 : 0
    if (!shift) return
    gsap.to(card, {
      y: shift,
      ease: 'none',
      scrollTrigger: { trigger: '.bu_grid', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    })
  })
}, root)
</script>

<template>
  <section ref="root" class="bu section">
    <div class="wrap-wide">
      <SectionHead
        eyebrow="Ready made"
        title="Nights we have <em>already</em> planned"
        text="Three kits that cover most of what people ask for. Add one to your list, swap anything inside it, and we quote the whole thing as one."
        align="split"
      />

      <div class="bu_grid">
        <article
          v-for="(b, i) in bundles"
          :key="b.slug"
          class="bu_card"
          :class="{ star: i === 1 }"
          :style="{ '--tint': b.accent }"
        >
          <div class="bu_glow" aria-hidden="true" />
          <div class="bu_top">
            <p class="mono bu_span">{{ b.span }}</p>
            <span v-if="i === 1" class="bu_flag mono">Most asked for</span>
          </div>

          <h3 class="bu_name display">{{ b.name }}</h3>
          <p class="bu_tag dim">{{ b.tagline }}</p>

          <ul class="bu_list">
            <li v-for="it in names(b.items)" :key="it">
              <Icon name="lucide:check" />
              <span>{{ it }}</span>
            </li>
            <li v-for="e in b.extras" :key="e" class="soft">
              <Icon name="lucide:plus" />
              <span>{{ e }}</span>
            </li>
          </ul>

          <div class="bu_foot">
            <button class="bu_btn" :class="{ on: taken(b.items) }" @click="grab(b.items, b.days)">
              <Icon :name="taken(b.items) ? 'lucide:check' : 'lucide:plus'" />
              <span>{{ taken(b.items) ? 'On your list' : 'Add this bundle' }}</span>
            </button>
            <NuxtLink :to="`/bundles#${b.slug}`" class="bu_more mono">
              <span>Details</span>
              <Icon name="lucide:arrow-up-right" />
            </NuxtLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bu {
  position: relative;
}

.bu_grid {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr;
  align-items: start;
}

@media (min-width: 860px) {
  .bu_grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.4rem;
  }
}

.bu_card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012));
  overflow: hidden;
  isolation: isolate;
  min-height: 29rem;
  transition: border-color 0.55s var(--e-out);
  will-change: transform;
}

@media (min-width: 860px) {
  .bu_card {
    padding: 2rem 1.9rem;
  }
}

.bu_card:hover {
  border-color: color-mix(in srgb, var(--tint) 60%, transparent);
}

.bu_glow {
  position: absolute;
  inset: -50% -20% 40%;
  z-index: -1;
  background: radial-gradient(50% 50% at 50% 60%, color-mix(in srgb, var(--tint) 26%, transparent), transparent 70%);
  opacity: 0.35;
  transition: opacity 0.7s var(--e-out);
  pointer-events: none;
}

.bu_card:hover .bu_glow {
  opacity: 0.9;
}

.star {
  border-color: color-mix(in srgb, var(--tint) 34%, transparent);
}

.bu_top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.6rem;
}

.bu_span {
  color: var(--faint);
}

.bu_flag {
  padding: 0.34em 0.75em;
  border-radius: 99px;
  background: color-mix(in srgb, var(--tint) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tint) 42%, transparent);
  color: var(--tint);
  font-size: 0.6rem;
}

.bu_name {
  font-size: clamp(1.7rem, 2.6vw, 2.3rem);
  margin-bottom: 0.6rem;
}

.bu_tag {
  font-size: 0.92rem;
  margin-bottom: 1.7rem;
  max-width: 34ch;
}

.bu_list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding-top: 1.4rem;
  border-top: 1px solid var(--line);
}

.bu_list li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.92rem;
  color: var(--text-dim);
}

.bu_list li.soft {
  color: var(--faint);
}

.bu_list :deep(svg) {
  width: 1rem;
  height: 1rem;
  color: var(--tint);
  flex: none;
  margin-top: 0.22rem;
}

.bu_list li.soft :deep(svg) {
  color: var(--faint);
}

.bu_foot {
  margin-top: auto;
  padding-top: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.bu_btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.15rem;
  border-radius: 99px;
  border: 1px solid var(--line-strong);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.86rem;
  transition: all 0.42s var(--e-out);
}

.bu_btn :deep(svg) {
  width: 0.95em;
  height: 0.95em;
}

.bu_btn:hover {
  background: var(--tint);
  border-color: var(--tint);
  color: #06070a;
}

.bu_btn.on {
  border-color: var(--tint);
  color: var(--tint);
  background: color-mix(in srgb, var(--tint) 14%, transparent);
}

.bu_more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--muted);
  transition: color 0.4s var(--e-out);
}

.bu_more:hover {
  color: var(--tint);
}

.bu_more :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
