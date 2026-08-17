<script setup lang="ts">
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const root = ref<HTMLElement | null>(null);
const intro = useState("introDone", () => false);

const stats = [
  { k: "1D", v: "Typical quote reply" },
  { k: "160 min", v: "Average drop time" },
  { k: "4.9", v: "Average score" },
];

useMotionScope(
  () => {
    const reduced = prefersReducedMotion();

    if (reduced) {
      gsap.set("[data-hero]", { autoAlpha: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.15 });

    SplitText.create(".h_title", {
      type: "lines",
      mask: "lines",
      linesClass: "sp_line",
      autoSplit: true,
      onSplit(self) {
        return tl.from(
          self.lines,
          {
            yPercent: 112,
            opacity: 0,
            duration: 1.35,
            stagger: 0.09,
            ease: "swift",
          },
          0,
        );
      },
    });

    tl.from(".h_eyebrow", { autoAlpha: 0, y: 16, duration: 0.9 }, 0.15)
      .from(".h_lead", { autoAlpha: 0, y: 26, duration: 1.05 }, 0.5)
      .from(
        ".h_actions > *",
        { autoAlpha: 0, y: 22, duration: 0.9, stagger: 0.09 },
        0.68,
      )
      .from(".h_stat", { autoAlpha: 0, y: 30, duration: 1, stagger: 0.08 }, 0.8)
      .from(".h_cue", { autoAlpha: 0, duration: 0.8 }, 0.95)
      .from(".h_ticker", { autoAlpha: 0, y: 20, duration: 0.9 }, 0.9);

    // scroll fade for the whole content block
    gsap.to(".h_inner", {
      yPercent: -14,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: root.value,
        start: "top top",
        end: "70% top",
        scrub: 0.5,
      },
    });

    gsap.to(".h_cue_line", {
      scaleY: 1,
      duration: 1.4,
      repeat: -1,
      ease: "power2.inOut",
      transformOrigin: "top center",
      yoyo: true,
    });
  },
  root,
  intro,
);
</script>

<template>
  <section ref="root" class="hero" data-hero-root>
    <ClientOnly>
      <HeroScene trigger="[data-hero-root]" />
      <template #fallback>
        <div class="scene_fallback" />
      </template>
    </ClientOnly>

    <div class="veil" aria-hidden="true" />

    <div class="h_inner wrap-wide">
      <p class="eyebrow h_eyebrow">Awoshie depot · crews across Accra</p>

      <h1 class="h_title display">
        Play everything.<br />
        Own <em class="serif ion">nothing</em>.
      </h1>

      <p class="lead h_lead">
        Consoles, screens, headsets and racing rigs, delivered to your door,
        built in your room and collected the moment the fun runs out. Pick what
        you want, tell us how long for, and we send a quote straight back.
      </p>

      <div class="h_actions">
        <MagneticEl :strength="0.3">
          <NuxtLink
            to="/gear"
            class="btn btn_primary"
            data-cursor="view"
            data-cursor-label="Browse"
          >
            <span>Browse the fleet</span>
            <Icon name="lucide:arrow-right" />
          </NuxtLink>
        </MagneticEl>
        <MagneticEl :strength="0.3">
          <NuxtLink to="/process" class="btn btn_ghost">
            <span>See how it runs</span>
          </NuxtLink>
        </MagneticEl>
      </div>

      <div class="h_stats">
        <div v-for="s in stats" :key="s.v" class="h_stat">
          <p class="h_stat_k display">{{ s.k }}</p>
          <p class="h_stat_v mono">{{ s.v }}</p>
        </div>
      </div>
    </div>

    <div class="h_cue" aria-hidden="true">
      <span class="mono">Scroll</span>
      <span class="h_cue_line" />
    </div>

    <div class="h_ticker">
      <MarqueeRow :speed="34">
        <span
          v-for="w in [
            'PlayStation 5 Pro',
            'OLED walls',
            'Meta Quest 3',
            'Direct drive wheels',
            'Arcade cabinets',
            'Switch parties',
            'Atmos sound',
            'Steam Deck',
          ]"
          :key="w"
          class="tick"
        >
          <span>{{ w }}</span>
          <span class="tick_dot" />
        </span>
      </MarqueeRow>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  isolation: isolate;
}

.scene_fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 40%, #131a2c 0%, #06070a 70%);
}

.veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(6, 7, 10, 0.6) 0%, rgba(6, 7, 10, 0) 26%),
    linear-gradient(
      0deg,
      rgba(6, 7, 10, 0.88) 8%,
      rgba(6, 7, 10, 0.28) 42%,
      rgba(6, 7, 10, 0) 62%
    );
  pointer-events: none;
}

.h_inner {
  position: relative;
  z-index: 2;
  padding-top: clamp(7rem, 16vh, 9.5rem);
  padding-bottom: clamp(1.2rem, 3vh, 2.2rem);
  width: 100%;
}

.h_eyebrow {
  margin-bottom: clamp(1rem, 2.2vw, 1.6rem);
}

.h_title {
  font-size: var(--t-mega);
  letter-spacing: -0.055em;
  line-height: 0.88;
  margin-bottom: clamp(1.2rem, 2.4vw, 1.8rem);
  max-width: 15ch;
}

.h_title em {
  font-size: 1.06em;
  letter-spacing: -0.02em;
}

.h_lead {
  max-width: 46ch;
  font-size: clamp(0.98rem, 1.15vw, 1.12rem);
  margin-bottom: clamp(1.4rem, 2.6vw, 2rem);
}

.h_actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-bottom: clamp(2rem, 4.5vw, 3.2rem);
}

.h_actions :deep(svg) {
  width: 1em;
  height: 1em;
}

.h_stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.4rem 1rem;
  border-top: 1px solid var(--line);
  padding-top: 1.5rem;
  max-width: 62rem;
}

@media (min-width: 760px) {
  .h_stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.h_stat_k {
  font-size: clamp(1.5rem, 2.6vw, 2.2rem);
  line-height: 1;
  margin-bottom: 0.4rem;
}

.h_stat_v {
  color: var(--muted);
}

.h_cue {
  position: absolute;
  right: var(--gutter);
  bottom: clamp(6rem, 14vh, 9rem);
  z-index: 2;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  color: var(--muted);
}

@media (min-width: 1100px) {
  .h_cue {
    display: flex;
  }
}

.h_cue .mono {
  writing-mode: vertical-rl;
  letter-spacing: 0.3em;
}

.h_cue_line {
  width: 1px;
  height: 68px;
  background: linear-gradient(180deg, var(--ion), transparent);
  transform: scaleY(0.15);
  transform-origin: top center;
}

.h_ticker {
  position: relative;
  z-index: 2;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: rgba(6, 7, 10, 0.55);
  backdrop-filter: blur(8px);
  padding: 0.85rem 0;
}

.tick {
  display: inline-flex;
  align-items: center;
  gap: 1.6rem;
  padding-right: 1.6rem;
  font-family: var(--font-display);
  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--text-dim);
  white-space: nowrap;
}

.tick_dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ion);
  flex: none;
}
</style>
