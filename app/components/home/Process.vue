<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const root = ref<HTMLElement | null>(null)
const fill = ref<HTMLElement | null>(null)
const live = ref(0)

const steps = [
  {
    n: '01',
    icon: 'lucide:mouse-pointer-click',
    title: 'Pick your night',
    copy: 'Browse the fleet, grab a ready made bundle or build a list of your own. Same day slots close at two in the afternoon.'
  },
  {
    n: '02',
    icon: 'lucide:truck',
    title: 'We roll up',
    copy: 'A two person crew arrives inside the hour you picked, in a van packed with gear that was cleaned this morning.'
  },
  {
    n: '03',
    icon: 'lucide:wrench',
    title: 'We build it',
    copy: 'Mounting, cabling, calibration and a five minute walk through, so nobody has to open a settings menu all weekend.'
  },
  {
    n: '04',
    icon: 'lucide:gamepad-2',
    title: 'You play',
    copy: 'Charged, updated and loaded before we hand it over. Message the crew any time and a real person answers in minutes.'
  },
  {
    n: '05',
    icon: 'lucide:package-check',
    title: 'We vanish',
    copy: 'Collection at the end of your slot. We carry everything out, sweep the cables and the room goes back to normal.'
  }
]

useMotionScope(() => {
  if (prefersReducedMotion()) {
    gsap.set('.pr_step', { autoAlpha: 1 })
    live.value = steps.length
    return
  }

  ScrollTrigger.create({
    trigger: '.pr_steps',
    start: 'top 62%',
    end: 'bottom 78%',
    scrub: 0.5,
    onUpdate: (self) => gsap.set(fill.value, { scaleY: self.progress })
  })

  gsap.utils.toArray<HTMLElement>('.pr_step').forEach((step, i) => {
    gsap.from(step, {
      autoAlpha: 0,
      y: 56,
      duration: 1.1,
      ease: 'swift',
      scrollTrigger: { trigger: step, start: 'top 88%', once: true }
    })

    ScrollTrigger.create({
      trigger: step,
      start: 'top 64%',
      end: 'bottom 44%',
      onToggle: (self) => {
        step.classList.toggle('on', self.isActive)
        if (self.isActive) live.value = i + 1
      }
    })
  })
}, root)
</script>

<template>
  <section ref="root" class="pr section">
    <div class="wrap-wide pr_grid">
      <aside class="pr_side">
        <div class="pr_sticky">
          <p class="eyebrow">The routine</p>
          <h2 class="display pr_title">Five moves<br >and you are<br ><em class="serif ion">playing</em></h2>
          <p class="pr_lead dim">
            The whole thing is designed so you never lift a screwdriver or read a manual.
          </p>
          <p class="mono pr_count">
            <span class="ion">{{ String(live).padStart(2, '0') }}</span>
            <span class="pr_slash">/</span>
            <span>{{ String(steps.length).padStart(2, '0') }}</span>
          </p>
        </div>
      </aside>

      <div class="pr_steps">
        <div class="pr_rail" aria-hidden="true">
          <span ref="fill" class="pr_rail_fill" />
        </div>

        <article v-for="s in steps" :key="s.n" class="pr_step">
          <div class="pr_node" aria-hidden="true">
            <Icon :name="s.icon" />
          </div>
          <div class="pr_body">
            <p class="mono pr_n">Step {{ s.n }}</p>
            <h3 class="pr_h">{{ s.title }}</h3>
            <p class="pr_copy dim">{{ s.copy }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pr {
  position: relative;
  border-top: 1px solid var(--line);
}

.pr_grid {
  display: grid;
  gap: 3rem;
}

@media (min-width: 960px) {
  .pr_grid {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: 4.5rem;
  }
}

.pr_sticky {
  position: sticky;
  top: calc(76px + 3rem);
}

.pr_title {
  font-size: var(--t-h2);
  margin: 1.1rem 0 1.4rem;
}

.pr_title em {
  font-size: 1.06em;
}

.pr_lead {
  max-width: 32ch;
  font-size: 1rem;
}

.pr_count {
  display: none;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  margin-top: 2.5rem;
}

@media (min-width: 960px) {
  .pr_count {
    display: block;
  }
}

.pr_slash {
  color: var(--faint);
  margin: 0 0.4em;
}

.pr_steps {
  position: relative;
  padding-left: 3.4rem;
}

@media (min-width: 620px) {
  .pr_steps {
    padding-left: 4.6rem;
  }
}

.pr_rail {
  position: absolute;
  left: 1.35rem;
  top: 1.2rem;
  bottom: 1.2rem;
  width: 1px;
  background: var(--line);
  overflow: hidden;
}

@media (min-width: 620px) {
  .pr_rail {
    left: 1.85rem;
  }
}

.pr_rail_fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--ion), var(--volt));
  transform: scaleY(0);
  transform-origin: top center;
}

.pr_step {
  position: relative;
  padding: clamp(1.4rem, 3vw, 2.2rem) 0;
  border-bottom: 1px solid var(--line-soft);
}

.pr_step:last-child {
  border-bottom: none;
}

.pr_node {
  position: absolute;
  left: -3.4rem;
  top: clamp(1.4rem, 3vw, 2.2rem);
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--ink);
  border: 1px solid var(--line);
  color: var(--faint);
  transition: color 0.55s var(--e-out), border-color 0.55s var(--e-out),
    background 0.55s var(--e-out), transform 0.6s var(--e-out);
}

@media (min-width: 620px) {
  .pr_node {
    left: -4.6rem;
    width: 3.7rem;
    height: 3.7rem;
  }
}

.pr_node :deep(svg),
.pr_node svg {
  width: 1.15rem;
  height: 1.15rem;
}

.pr_step.on .pr_node {
  color: #06070a;
  background: var(--ion);
  border-color: var(--ion);
  transform: scale(1.08);
  box-shadow: 0 0 42px -8px rgba(248, 201, 63, 0.7);
}

.pr_n {
  color: var(--faint);
  margin-bottom: 0.55rem;
  transition: color 0.5s var(--e-out);
}

.pr_step.on .pr_n {
  color: var(--ion);
}

.pr_h {
  font-size: var(--t-h3);
  margin-bottom: 0.7rem;
}

.pr_copy {
  font-size: 0.98rem;
  max-width: 52ch;
}
</style>
