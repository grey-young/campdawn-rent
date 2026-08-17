<script setup lang="ts">
import type { NuxtError } from '#app'
import gsap from 'gsap'

const props = defineProps<{ error: NuxtError }>()

const root = ref<HTMLElement | null>(null)
const code = computed(() => String(props.error?.statusCode ?? 500))

const headline = computed(() =>
  code.value === '404' ? 'That shelf is empty' : 'Something tripped a cable'
)

const blurb = computed(() =>
  code.value === '404'
    ? 'The page you went looking for is not in the depot. It may have been renamed, or it never existed and somebody sent you a bad link.'
    : 'Our side fell over. The crew has been told. Try again in a moment, or call the depot and we will sort it the old fashioned way.'
)

onMounted(() => {
  if (prefersReducedMotion()) return
  gsap
    .timeline()
    .from('.er_code span', { yPercent: 115, duration: 1.1, stagger: 0.07, ease: 'swift' })
    .from('.er_line', { autoAlpha: 0, y: 24, duration: 0.85, stagger: 0.08 }, '-=0.6')

  gsap.to('.er_orb', { rotate: 360, duration: 40, ease: 'none', repeat: -1 })
})
</script>

<template>
  <div ref="root" class="er">
    <div class="er_orb" aria-hidden="true" />

    <div class="wrap-wide er_in">
      <p class="er_code display" aria-hidden="true">
        <span v-for="(c, i) in code.split('')" :key="i">{{ c }}</span>
      </p>

      <p class="eyebrow er_line">Error {{ code }}</p>
      <h1 class="display er_h er_line">{{ headline }}</h1>
      <p class="lead er_line">{{ blurb }}</p>

      <div class="er_acts er_line">
        <MagneticEl :strength="0.28">
          <NuxtLink to="/" class="btn btn_primary" @click="clearError({ redirect: '/' })">
            <span>Back to the start</span>
            <Icon name="lucide:arrow-right" />
          </NuxtLink>
        </MagneticEl>
        <NuxtLink to="/gear" class="btn btn_ghost" @click="clearError({ redirect: '/gear' })">
          <span>Open the fleet</span>
        </NuxtLink>
      </div>
    </div>

    <div class="grain" aria-hidden="true" />
  </div>
</template>

<style scoped>
.er {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--void);
  padding-block: 6rem;
}

.er_orb {
  position: absolute;
  width: min(120vw, 1100px);
  height: min(120vw, 1100px);
  background:
    conic-gradient(from 0deg, rgba(248, 201, 63, 0.16), rgba(124, 92, 255, 0.2), rgba(248, 201, 63, 0.16));
  filter: blur(120px);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.55;
}

.er_in {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.1rem;
  width: 100%;
}

.er_code {
  display: flex;
  overflow: hidden;
  line-height: 0.78;
  margin-bottom: 0.6rem;
}

.er_code span {
  display: block;
  font-size: clamp(5rem, 22vw, 16rem);
  letter-spacing: -0.06em;
  color: transparent;
  background: linear-gradient(180deg, var(--ion) 0%, rgba(248, 201, 63, 0.08) 100%);
  background-clip: text;
  -webkit-background-clip: text;
}

.er_h {
  font-size: var(--t-h2);
}

.er_acts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1rem;
}

.er_acts :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
