<script setup lang="ts">
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)

const brands = [
  'simple-icons:playstation',
  'simple-icons:xbox',
  'simple-icons:nintendoswitch',
  'simple-icons:steam',
  'simple-icons:meta',
  'simple-icons:razer',
  'simple-icons:logitechg',
  'simple-icons:samsung',
  'simple-icons:sonos',
  'simple-icons:lg',
  'simple-icons:nvidia',
  'simple-icons:valve'
]

const perks = [
  {
    icon: 'lucide:truck',
    title: 'Delivery and collection',
    copy: 'Both ways, always free inside the standard radius.'
  },
  {
    icon: 'lucide:shield-check',
    title: 'Damage cover',
    copy: 'Accidents are already priced in. Tell us and we swap it.'
  },
  {
    icon: 'lucide:sparkles',
    title: 'Cleaned and tested',
    copy: 'Every item is stripped, wiped and run before it leaves.'
  },
  {
    icon: 'lucide:settings-2',
    title: 'Built and calibrated',
    copy: 'Mounted, cabled and tuned by the crew who deliver it.'
  },
  {
    icon: 'lucide:download',
    title: 'Loaded and updated',
    copy: 'Patches and libraries are done overnight, not on your time.'
  },
  {
    icon: 'lucide:headset',
    title: 'Support until ten',
    copy: 'A real person on the phone, every night of the week.'
  }
]

useMotionScope(() => {
  if (prefersReducedMotion()) return

  gsap.from('.in_cell', {
    autoAlpha: 0,
    y: 40,
    duration: 1,
    stagger: 0.06,
    ease: 'swift',
    scrollTrigger: { trigger: '.in_grid', start: 'top 86%', once: true }
  })
}, root)
</script>

<template>
  <section ref="root" class="in">
    <div class="in_brands">
      <MarqueeRow :speed="40" :react="false">
        <span v-for="b in brands" :key="b" class="in_brand">
          <Icon :name="b" />
        </span>
      </MarqueeRow>
    </div>

    <div class="wrap-wide in_body">
      <SectionHead
        eyebrow="Always included"
        title="No extras, no <em>asterisks</em>"
        text="The price you see covers the whole thing. These six are never a paid upgrade and never will be."
        align="split"
      />

      <div class="in_grid">
        <article v-for="p in perks" :key="p.title" class="in_cell">
          <span class="in_ico">
            <Icon :name="p.icon" />
          </span>
          <h3 class="in_h">{{ p.title }}</h3>
          <p class="in_c dim">{{ p.copy }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.in {
  position: relative;
  padding-bottom: var(--section);
}

.in_brands {
  border-block: 1px solid var(--line);
  padding: 1.6rem 0;
  background: rgba(255, 255, 255, 0.015);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  margin-bottom: var(--section);
}

.in_brand {
  display: grid;
  place-items: center;
  padding-inline: clamp(1.6rem, 4vw, 3.2rem);
  color: var(--faint);
  transition: color 0.5s var(--e-out);
}

.in_brand:hover {
  color: var(--text);
}

.in_brand :deep(svg) {
  width: clamp(1.4rem, 2.2vw, 1.9rem);
  height: clamp(1.4rem, 2.2vw, 1.9rem);
}

.in_grid {
  display: grid;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
}

@media (min-width: 640px) {
  .in_grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 980px) {
  .in_grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.in_cell {
  position: relative;
  background: var(--ink);
  padding: clamp(1.4rem, 2.6vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: background 0.5s var(--e-out);
  overflow: hidden;
}

.in_cell::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 1px;
  background: linear-gradient(90deg, var(--ion), transparent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.7s var(--e-out);
}

.in_cell:hover {
  background: #12161f;
}

.in_cell:hover::after {
  transform: scaleX(1);
}

.in_ico {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 12px;
  border: 1px solid var(--line);
  color: var(--ion);
  margin-bottom: 0.5rem;
  transition: transform 0.6s var(--e-out), background 0.5s var(--e-out);
}

.in_ico :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.in_cell:hover .in_ico {
  transform: rotate(-8deg) scale(1.06);
  background: rgba(248, 201, 63, 0.09);
}

.in_h {
  font-size: 1.08rem;
  letter-spacing: -0.025em;
}

.in_c {
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
