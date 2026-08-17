<script setup lang="ts">
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)
const year = new Date().getFullYear()

const cols = [
  {
    title: 'Fleet',
    links: [
      { to: '/gear', label: 'Everything we own' },
      { to: '/gear?c=consoles', label: 'Consoles' },
      { to: '/gear?c=screens', label: 'Screens' },
      { to: '/gear?c=racing', label: 'Racing' },
      { to: '/bundles', label: 'Bundles' }
    ]
  },
  {
    title: 'Company',
    links: [
      { to: '/process', label: 'How it runs' },
      { to: '/contact', label: 'Contact' },
      { to: '/process', label: 'Coverage' },
      { to: '/process', label: 'Care standard' }
    ]
  },
  {
    title: 'Support',
    links: [
      { to: '/quote', label: 'Ask for a quote' },
      { to: '/contact', label: 'Common questions' },
      { to: '/contact', label: 'Events and offices' },
      { to: '/process', label: 'Damage cover' }
    ]
  }
]

useMotionScope(() => {
  if (prefersReducedMotion()) return

  gsap.from('.fmark span', {
    yPercent: 108,
    duration: 1.3,
    stagger: 0.045,
    ease: 'swift',
    scrollTrigger: { trigger: '.fmark', start: 'top 96%', once: true }
  })

  gsap.to('.fglow', {
    yPercent: -22,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom bottom', scrub: 1 }
  })

  gsap.from('.fcol', {
    y: 26,
    autoAlpha: 0,
    duration: 1,
    stagger: 0.08,
    ease: 'swift',
    scrollTrigger: { trigger: '.fgrid', start: 'top 90%', once: true }
  })
}, root)
</script>

<template>
  <footer ref="root" class="foot">
    <div class="fglow" aria-hidden="true" />

    <div class="wrap-wide">
      <div class="ftop">
        <div class="fintro">
          <NuxtImg class="fcrest" src="/mark.png" width="180" height="180" alt="Campdawn" format="webp" quality="92" loading="lazy" />
          <p class="eyebrow">Campdawn rentals</p>
          <p class="fline">
            Gaming gear, delivered clean, built for you and collected when the fun is over.
          </p>
          <MagneticEl :strength="0.24">
            <NuxtLink to="/quote" class="btn btn_primary">
              <span>Ask for a quote</span>
              <Icon name="lucide:arrow-right" />
            </NuxtLink>
          </MagneticEl>
        </div>

        <div class="fgrid">
          <div v-for="c in cols" :key="c.title" class="fcol">
            <p class="mono ftitle">{{ c.title }}</p>
            <ul>
              <li v-for="l in c.links" :key="l.label">
                <NuxtLink :to="l.to" class="flink">
                  <span>{{ l.label }}</span>
                  <Icon name="lucide:arrow-up-right" />
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="fcol">
            <p class="mono ftitle">Elsewhere</p>
            <ul>
              <li v-for="s in ['Instagram', 'TikTok', 'Discord', 'YouTube']" :key="s">
                <a class="flink" href="#" @click.prevent>
                  <span>{{ s }}</span>
                  <Icon name="lucide:arrow-up-right" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="fmark" aria-label="Campdawn">
        <span v-for="(ch, i) in 'CAMPDAWN'.split('')" :key="i">{{ ch }}</span>
      </div>

      <div class="fbase">
        <p class="mono dim">© {{ year }} Campdawn rentals limited · Awoshie, Accra</p>
        <div class="fbase_links">
          <a href="#" class="mono dim" @click.prevent>Terms</a>
          <a href="#" class="mono dim" @click.prevent>Privacy</a>
          <a href="#" class="mono dim" @click.prevent>Cover policy</a>
        </div>
        <p class="mono dim fbuilt">
          Built by
          <a href="https://desmondgbedemah.online" target="_blank" rel="noopener">Desmond Gbedemah</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.foot {
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--line);
  padding-top: clamp(3.5rem, 8vw, 6rem);
  background: linear-gradient(180deg, #07080c 0%, #0b0e15 100%);
}

.fglow {
  position: absolute;
  left: 50%;
  bottom: -34%;
  width: min(110vw, 1400px);
  height: 60vh;
  transform: translateX(-50%);
  background: radial-gradient(50% 50% at 50% 50%, rgba(124, 92, 255, 0.28), transparent 70%);
  filter: blur(30px);
  pointer-events: none;
}

.ftop {
  display: grid;
  gap: clamp(2.5rem, 6vw, 5rem);
  grid-template-columns: 1fr;
  position: relative;
}

@media (min-width: 940px) {
  .ftop {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  }
}

.fcrest {
  width: clamp(4rem, 7vw, 5.5rem);
  height: auto;
  margin-bottom: 1.6rem;
  filter: drop-shadow(0 0 32px rgba(248, 201, 63, 0.25));
  transition: transform 0.6s var(--e-out), filter 0.6s var(--e-out);
}

.fcrest:hover {
  transform: scale(1.05) rotate(-3deg);
  filter: drop-shadow(0 0 44px rgba(248, 201, 63, 0.45));
}

.fline {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  line-height: 1.16;
  letter-spacing: -0.035em;
  margin: 1.1rem 0 2rem;
  max-width: 20ch;
}

.fgrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem 1.5rem;
}

@media (min-width: 700px) {
  .fgrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.ftitle {
  color: var(--faint);
  margin-bottom: 1.1rem;
}

.fcol li + li {
  margin-top: 0.55rem;
}

.flink {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.92rem;
  color: var(--text-dim);
  transition: color 0.35s var(--e-out);
}

.flink svg {
  width: 0.85em;
  height: 0.85em;
  opacity: 0;
  transform: translate(-5px, 5px);
  transition: all 0.4s var(--e-out);
}

.flink:hover {
  color: var(--ion);
}

.flink:hover svg {
  opacity: 1;
  transform: translate(0, 0);
}

.fmark {
  display: flex;
  justify-content: space-between;
  margin-top: clamp(3.5rem, 9vw, 7rem);
  overflow: hidden;
  line-height: 0.78;
}

.fmark span {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.6rem, 12.4vw, 12rem);
  letter-spacing: -0.05em;
  color: transparent;
  background: linear-gradient(180deg, #333a4c 0%, rgba(51, 58, 76, 0.12) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  transition: background 0.6s var(--e-out);
}

.fmark:hover span {
  background: linear-gradient(180deg, var(--ion) 0%, rgba(248, 201, 63, 0.1) 100%);
  background-clip: text;
  -webkit-background-clip: text;
}

.fbase {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0 2rem;
  border-top: 1px solid var(--line);
  margin-top: 1rem;
}

.fbase_links {
  display: flex;
  gap: 1.5rem;
}

.fbase_links a {
  transition: color 0.35s var(--e-out);
}

.fbase_links a:hover {
  color: var(--ion);
}

.fbuilt a {
  color: var(--text-dim);
  border-bottom: 1px dotted var(--line-strong);
  transition: color 0.35s var(--e-out);
}

.fbuilt a:hover {
  color: var(--ion);
}
</style>
