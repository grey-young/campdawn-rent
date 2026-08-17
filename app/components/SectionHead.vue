<script setup lang="ts">
import gsap from 'gsap'

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    text?: string
    align?: 'left' | 'center' | 'split'
  }>(),
  { align: 'left' }
)

const root = ref<HTMLElement | null>(null)

useMotionScope(() => {
  const el = root.value
  if (!el) return
  const heading = el.querySelector('.sh_title')
  if (heading) revealLines(heading, { trigger: el, start: 'top 85%' })

  const rest = el.querySelectorAll('.sh_eyebrow, .sh_text, .sh_slot')
  if (rest.length) {
    if (prefersReducedMotion()) {
      gsap.set(rest, { autoAlpha: 1 })
    } else {
      gsap.from(rest, {
        autoAlpha: 0,
        y: 20,
        duration: 0.95,
        stagger: 0.08,
        ease: 'swift',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      })
    }
  }
}, root)
</script>

<template>
  <div ref="root" class="sh" :class="props.align">
    <div class="sh_lead">
      <p v-if="props.eyebrow" class="eyebrow sh_eyebrow">{{ props.eyebrow }}</p>
      <h2 class="sh_title display" v-html="props.title" />
    </div>
    <div v-if="props.text || $slots.default" class="sh_side">
      <p v-if="props.text" class="sh_text lead">{{ props.text }}</p>
      <div v-if="$slots.default" class="sh_slot"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.sh {
  display: grid;
  gap: 1.6rem;
  margin-bottom: clamp(2.5rem, 6vw, 4.5rem);
}

.sh_title {
  font-size: var(--t-h2);
  max-width: 18ch;
}

.sh_title :deep(em) {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  color: var(--ion);
  font-size: 1.05em;
  letter-spacing: -0.015em;
}

.sh_eyebrow {
  margin-bottom: 1.1rem;
}

.center {
  justify-items: center;
  text-align: center;
}

.center .sh_title {
  max-width: 20ch;
}

.center .sh_text {
  margin-inline: auto;
  text-align: center;
}

@media (min-width: 900px) {
  .split {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    align-items: end;
    gap: 3rem;
  }

  .split .sh_side {
    padding-bottom: 0.4rem;
  }
}
</style>
