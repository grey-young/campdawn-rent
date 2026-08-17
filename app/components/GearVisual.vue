<script setup lang="ts">
import type { GearItem } from '~/data/gear'

/**
 * One place that decides how a piece of gear is pictured. A real cut out photo
 * wins when we have one, otherwise the drawn version keeps the grid consistent.
 */
const props = withDefaults(
  defineProps<{
    item: GearItem
    width?: number
    eager?: boolean
  }>(),
  { width: 420, eager: false }
)
</script>

<template>
  <NuxtImg
    v-if="props.item.photo"
    class="gv gv_photo"
    :src="props.item.photo"
    :alt="props.item.name"
    :loading="props.eager ? 'eager' : 'lazy'"
    :width="props.width"
    :height="props.width"
    format="webp"
    quality="88"
  />
  <GearArt v-else class="gv" :kind="props.item.art" :tint="props.item.tint" />
</template>

<style scoped>
.gv {
  display: block;
  width: 100%;
  height: auto;
}

.gv_photo {
  aspect-ratio: 1;
  object-fit: contain;
  filter: drop-shadow(0 22px 40px rgba(0, 0, 0, 0.55));
}
</style>
