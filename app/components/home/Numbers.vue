<script setup lang="ts">
import gsap from 'gsap'
import { gear } from '~/data/gear'

const root = ref<HTMLElement | null>(null)

const figures = [
  { to: gear.length, suffix: '', label: 'Pieces in the fleet', note: 'and growing every month', decimals: 0 },
  { to: 1400, suffix: '', label: 'Nights kitted out', note: 'since we opened the depot', decimals: 0 },
  { to: 97, suffix: '%', label: 'Book us again', note: 'measured over twelve months', decimals: 0 },
  { to: 4.9, suffix: '', label: 'Average score', note: 'across 612 reviews', decimals: 1 }
]

useMotionScope(() => {
  const els = gsap.utils.toArray<HTMLElement>('.nm_item')

  if (prefersReducedMotion()) {
    els.forEach((el, i) => {
      const target = el.querySelector('.nm_num_val')
      const f = figures[i]!
      if (target) target.textContent = f.decimals ? f.to.toFixed(f.decimals) : String(f.to)
    })
    return
  }

  els.forEach((el, i) => {
    const f = figures[i]!
    const target = el.querySelector('.nm_num_val') as HTMLElement | null
    const obj = { v: 0 }

    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
      .from(el, { autoAlpha: 0, y: 44, duration: 1, ease: 'swift' })
      .to(
        obj,
        {
          v: f.to,
          duration: 2.1,
          ease: 'power3.out',
          onUpdate: () => {
            if (!target) return
            target.textContent = f.decimals
              ? obj.v.toFixed(f.decimals)
              : Math.round(obj.v).toLocaleString('en-GB')
          }
        },
        0.1
      )
      .from(el.querySelector('.nm_line'), { scaleX: 0, duration: 1.3, ease: 'swift' }, 0.2)
  })

  parallax('.nm_wash', 90, root.value!)
}, root)
</script>

<template>
  <section ref="root" class="nm">
    <div class="nm_wash" aria-hidden="true" />

    <div class="wrap-wide nm_grid">
      <div v-for="f in figures" :key="f.label" class="nm_item">
        <p class="nm_num display">
          <span class="nm_num_val">0</span><span class="nm_suf">{{ f.suffix }}</span>
        </p>
        <span class="nm_line" aria-hidden="true" />
        <p class="nm_label">{{ f.label }}</p>
        <p class="mono nm_note">{{ f.note }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nm {
  position: relative;
  padding-block: clamp(4rem, 9vw, 7rem);
  border-block: 1px solid var(--line);
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.022), transparent),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.028) 0 1px, transparent 1px 88px);
}

.nm_wash {
  position: absolute;
  inset: -40% -10%;
  background: radial-gradient(40% 40% at 22% 30%, rgba(248, 201, 63, 0.14), transparent 70%),
    radial-gradient(40% 40% at 78% 70%, rgba(124, 92, 255, 0.18), transparent 70%);
  pointer-events: none;
  filter: blur(10px);
}

.nm_grid {
  position: relative;
  display: grid;
  gap: 2.4rem 1.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 900px) {
  .nm_grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
  }
}

.nm_num {
  font-size: clamp(2.6rem, 6.2vw, 5.2rem);
  line-height: 0.9;
  letter-spacing: -0.05em;
  margin-bottom: 1rem;
  background: linear-gradient(170deg, #ffffff 0%, #98a2b8 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.nm_suf {
  color: var(--ion);
  -webkit-text-fill-color: var(--ion);
}

.nm_line {
  display: block;
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, var(--ion), transparent);
  transform-origin: left center;
  margin-bottom: 0.9rem;
}

.nm_label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(0.98rem, 1.3vw, 1.1rem);
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
}

.nm_note {
  color: var(--faint);
  letter-spacing: 0.1em;
}
</style>
