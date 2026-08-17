<script setup lang="ts">
const rowA = [
  {
    q: 'They built the whole thing in twenty minutes and the picture was better than my own TV. My guys still talk about it.',
    who: 'Ama',
    where: 'East Legon'
  },
  {
    q: 'Hired the cockpit for a bachelor weekend and nobody left the apartment. I have never seen grown men argue about tyre pressure before.',
    who: 'Kwabena',
    where: 'Spintex'
  },
  {
    q: 'We ran a Switch tournament for the office and the crew handled everything, right down to hiding the cables.',
    who: 'Efua',
    where: 'Airport Residential'
  }
]

const rowB = [
  {
    q: 'The headsets showed up spotless with new liners on them. The kids went wild in the best possible way.',
    who: 'Kojo',
    where: 'Dansoman'
  },
  {
    q: 'Booked at eleven in the morning, playing by two in the afternoon. That is the whole review.',
    who: 'Akosua',
    where: 'Tema Community 25'
  },
  {
    q: 'The arcade cabinet came up three flights of stairs and they never once complained about it.',
    who: 'Yaw',
    where: 'Awoshie'
  }
]
</script>

<template>
  <section class="vo section">
    <div class="wrap-wide">
      <SectionHead
        eyebrow="Word of mouth"
        title="The bit where other <em>people</em> talk"
        align="center"
      />
    </div>

    <div class="vo_rows">
      <MarqueeRow :speed="52">
        <blockquote v-for="t in rowA" :key="t.who" class="vo_card">
          <div class="vo_stars">
            <Icon v-for="i in 5" :key="i" name="lucide:star" />
          </div>
          <p class="vo_q">{{ t.q }}</p>
          <footer class="vo_by">
            <span class="vo_who">{{ t.who }}</span>
            <span class="mono dim">{{ t.where }}</span>
          </footer>
        </blockquote>
      </MarqueeRow>

      <MarqueeRow :speed="58" reverse>
        <blockquote v-for="t in rowB" :key="t.who" class="vo_card">
          <div class="vo_stars">
            <Icon v-for="i in 5" :key="i" name="lucide:star" />
          </div>
          <p class="vo_q">{{ t.q }}</p>
          <footer class="vo_by">
            <span class="vo_who">{{ t.who }}</span>
            <span class="mono dim">{{ t.where }}</span>
          </footer>
        </blockquote>
      </MarqueeRow>
    </div>
  </section>
</template>

<style scoped>
.vo {
  position: relative;
  overflow: hidden;
}

.vo_rows {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.vo_card {
  flex: none;
  width: min(80vw, 26rem);
  margin-right: 1.1rem;
  padding: 1.6rem;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: border-color 0.5s var(--e-out), background 0.5s var(--e-out);
}

.vo_card:hover {
  border-color: var(--line-strong);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
}

.vo_stars {
  display: flex;
  gap: 0.2rem;
  color: var(--ion);
}

.vo_stars :deep(svg) {
  width: 0.85rem;
  height: 0.85rem;
  fill: currentColor;
}

.vo_q {
  font-family: var(--font-display);
  font-size: clamp(1rem, 1.35vw, 1.15rem);
  line-height: 1.42;
  letter-spacing: -0.02em;
  white-space: normal;
}

.vo_by {
  margin-top: auto;
  display: flex;
  align-items: baseline;
  gap: 0.7rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--line);
}

.vo_who {
  font-weight: 600;
  font-size: 0.92rem;
}
</style>
