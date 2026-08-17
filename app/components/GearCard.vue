<script setup lang="ts">
import gsap from 'gsap'
import type { GearItem } from '~/data/gear'
import { categoryLabel } from '~/data/gear'

const props = withDefaults(defineProps<{ item: GearItem; tall?: boolean }>(), { tall: false })

const q = useQuote()
const picked = computed(() => q.has(props.item.slug))
const card = ref<HTMLElement | null>(null)

const toggle = () => q.toggle(props.item.slug)

onMounted(() => {
  const el = card.value
  if (!el) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const art = el.querySelector('.gc_art') as HTMLElement | null
  const glow = el.querySelector('.gc_glow') as HTMLElement | null
  if (!art) return

  const rx = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3' })
  const ry = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3' })
  const ax = gsap.quickTo(art, 'x', { duration: 0.8, ease: 'power3' })
  const ay = gsap.quickTo(art, 'y', { duration: 0.8, ease: 'power3' })

  // Measuring on every pointer move forces a layout on every one of them. The
  // card only moves when the page scrolls or resizes, so read it then instead.
  let rect: DOMRect | null = null
  const stale = () => (rect = null)

  const move = (e: PointerEvent) => {
    if (!rect) rect = el.getBoundingClientRect()
    const r = rect
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    rx(-py * 11)
    ry(px * 13)
    ax(px * 26)
    ay(py * 20)
    if (glow) {
      glow.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
      glow.style.setProperty('--my', `${(py + 0.5) * 100}%`)
    }
  }

  const enter = () => {
    rect = el.getBoundingClientRect()
    gsap.to(el, { z: 40, duration: 0.6, ease: 'power3' })
  }

  const leave = () => {
    rx(0)
    ry(0)
    ax(0)
    ay(0)
    gsap.to(el, { z: 0, duration: 0.7, ease: 'power3' })
  }

  el.addEventListener('pointermove', move)
  el.addEventListener('pointerenter', enter)
  el.addEventListener('pointerleave', leave)
  window.addEventListener('scroll', stale, { passive: true })
  window.addEventListener('resize', stale)

  onBeforeUnmount(() => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerenter', enter)
    el.removeEventListener('pointerleave', leave)
    window.removeEventListener('scroll', stale)
    window.removeEventListener('resize', stale)
    gsap.killTweensOf([el, art])
  })
})
</script>

<template>
  <article
    ref="card"
    class="gc"
    :class="{ tall: props.tall, picked }"
    :style="{ '--tint': props.item.tint }"
  >
    <div class="gc_glow" aria-hidden="true" />

    <NuxtLink
      :to="`/gear/${props.item.slug}`"
      class="gc_face"
      data-cursor="view"
      data-cursor-label="View gear"
    >
      <span class="gc_top">
        <span class="mono gc_cat">{{ categoryLabel(props.item.category) }}</span>
        <span v-if="props.item.badge" class="gc_badge mono">{{ props.item.badge }}</span>
        <span v-else-if="props.item.hot" class="gc_badge mono">Hot</span>
      </span>

      <span class="gc_stage">
        <span class="gc_art">
          <GearVisual :item="props.item" />
        </span>
        <span class="gc_ring" aria-hidden="true" />
      </span>

      <span class="gc_body">
        <span class="mono gc_brand">{{ props.item.brand }}</span>
        <h3 class="gc_name">{{ props.item.name }}</h3>
        <span class="gc_tag dim">{{ props.item.tagline }}</span>

        <span class="gc_specs">
          <span v-for="s in props.item.specs.slice(0, 2)" :key="s.label" class="mono">
            {{ s.value }}
          </span>
        </span>
      </span>
    </NuxtLink>

    <div class="gc_foot">
      <button
        class="gc_add"
        :class="{ on: picked }"
        :aria-label="picked ? `Remove ${props.item.name} from your quote` : `Add ${props.item.name} to your quote`"
        data-cursor="link"
        @click="toggle"
      >
        <Icon :name="picked ? 'lucide:check' : 'lucide:plus'" />
        <span>{{ picked ? 'On your list' : 'Add to quote' }}</span>
      </button>
      <NuxtLink
        :to="`/gear/${props.item.slug}`"
        class="gc_go"
        :aria-label="`Open ${props.item.name}`"
        data-cursor="link"
      >
        <Icon name="lucide:arrow-up-right" />
      </NuxtLink>
    </div>
  </article>
</template>

<style scoped>
.gc {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012));
  overflow: hidden;
  isolation: isolate;
  transform-style: preserve-3d;
  will-change: transform;
  transition: border-color 0.5s var(--e-out), background 0.5s var(--e-out);
}

.gc:hover {
  border-color: color-mix(in srgb, var(--tint) 55%, transparent);
}

.gc.picked {
  border-color: color-mix(in srgb, var(--ion) 45%, transparent);
}

/* The link wraps the whole visual face. The action row lives outside it so the
   add button is a real sibling rather than an overlay fighting for the click. */
.gc_face {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.gc_glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  background: radial-gradient(
    28rem 28rem at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--tint) 22%, transparent),
    transparent 62%
  );
  transition: opacity 0.5s var(--e-out);
  pointer-events: none;
}

.gc:hover .gc_glow {
  opacity: 1;
}

.gc_top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.15rem 0;
}

.gc_cat {
  color: var(--faint);
}

.gc_badge {
  padding: 0.32em 0.7em;
  border-radius: 99px;
  border: 1px solid color-mix(in srgb, var(--tint) 40%, transparent);
  color: var(--tint);
  background: color-mix(in srgb, var(--tint) 10%, transparent);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
}

.gc_stage {
  position: relative;
  display: grid;
  place-items: center;
  padding: 0.5rem 1rem;
  aspect-ratio: 1.35;
}

.tall .gc_stage {
  aspect-ratio: 1;
}

.gc_art {
  display: block;
  width: 74%;
  max-width: 280px;
  will-change: transform;
  transform-style: preserve-3d;
  transition: scale 0.6s var(--e-out);
}

.gc:hover .gc_art {
  scale: 1.055;
}

.gc_ring {
  position: absolute;
  inset: 10% 14%;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--tint) 26%, transparent);
  opacity: 0;
  transform: scale(0.82);
  transition: opacity 0.6s var(--e-out), transform 0.9s var(--e-out);
  z-index: -1;
}

.gc:hover .gc_ring {
  opacity: 1;
  transform: scale(1);
}

.gc_body {
  position: relative;
  padding: 0.4rem 1.15rem 0.9rem;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.gc_brand {
  display: block;
  color: var(--faint);
}

.gc_name {
  font-size: clamp(1.12rem, 1.6vw, 1.4rem);
  line-height: 1.05;
  transition: color 0.4s var(--e-out);
}

.gc:hover .gc_name {
  color: var(--tint);
}

.gc_tag {
  display: block;
  font-size: 0.86rem;
  line-height: 1.45;
}

.gc_specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.gc_specs > span {
  padding: 0.3em 0.65em;
  border-radius: 99px;
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
}

.gc_foot {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin: 0 1.15rem 1.15rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--line);
}

.gc_add {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.95rem;
  border-radius: 99px;
  border: 1px solid var(--line-strong);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--text);
  transition: all 0.4s var(--e-out);
}

.gc_add :deep(svg) {
  width: 0.95em;
  height: 0.95em;
  transition: transform 0.4s var(--e-out);
}

.gc_add:hover {
  background: var(--ion);
  border-color: var(--ion);
  color: #06070a;
}

.gc_add.on {
  background: rgba(248, 201, 63, 0.14);
  border-color: var(--ion);
  color: var(--ion);
}

.gc_add.on:hover {
  background: rgba(255, 106, 61, 0.14);
  border-color: var(--flare);
  color: var(--flare);
}

.gc_go {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  color: var(--text);
  flex: none;
  transition: background 0.45s var(--e-out), color 0.45s var(--e-out),
    border-color 0.45s var(--e-out), transform 0.55s var(--e-out);
}

.gc_go :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.gc:hover .gc_go {
  background: var(--tint);
  border-color: var(--tint);
  color: #06070a;
  transform: rotate(45deg);
}
</style>
