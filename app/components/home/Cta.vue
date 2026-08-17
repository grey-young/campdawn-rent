<script setup lang="ts">
import gsap from "gsap";

const root = ref<HTMLElement | null>(null);

useMotionScope(() => {
  const el = root.value;
  if (!el) return;

  const title = el.querySelector(".ct_title");
  if (title) revealLines(title, { trigger: el, start: "top 78%" });

  if (prefersReducedMotion()) return;

  gsap.from(".ct_disc", {
    scale: 0.6,
    autoAlpha: 0,
    duration: 1.4,
    ease: "swift",
    scrollTrigger: { trigger: el, start: "top 78%", once: true },
  });

  gsap.to(".ct_ring", { rotate: 360, duration: 22, ease: "none", repeat: -1 });

  gsap.from(".ct_meta > *", {
    autoAlpha: 0,
    y: 22,
    duration: 0.9,
    stagger: 0.08,
    ease: "swift",
    scrollTrigger: { trigger: ".ct_meta", start: "top 90%", once: true },
  });

  gsap.to(".ct_aura", {
    yPercent: -18,
    ease: "none",
    scrollTrigger: {
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
}, root);
</script>

<template>
  <section ref="root" class="ct">
    <div class="ct_aura" aria-hidden="true" />

    <div class="wrap-wide ct_in">
      <p class="eyebrow ct_eyebrow">Last thing</p>

      <div class="ct_row">
        <h2 class="display ct_title">Ready when<br />you are.</h2>

        <MagneticEl :strength="0.38" :radius="2" class="ct_mag">
          <NuxtLink
            to="/quote"
            class="ct_disc"
            data-cursor="drag"
            data-cursor-label="Let us go"
          >
            <svg class="ct_ring" viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <path
                  id="ctpath"
                  d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"
                />
              </defs>
              <text>
                <textPath href="#ctpath" startOffset="0">
                  Ask for a quote · Play tonight · Ask for a quote · Play
                  tonight ·
                </textPath>
              </text>
            </svg>
            <span class="ct_core">
              <Icon name="lucide:arrow-up-right" />
            </span>
          </NuxtLink>
        </MagneticEl>
      </div>

      <div class="ct_meta">
        <div class="ct_meta_item">
          <p class="mono dim">Call the depot</p>
          <a href="tel:+233247042495" class="ct_big">+233 24 704 2495</a>
        </div>
        <div class="ct_meta_item">
          <p class="mono dim">Send a list</p>
          <a href="mailto:info@campdawnesports.com" class="ct_big"
            >info@campdawnesports.com</a
          >
        </div>
        <div class="ct_meta_item">
          <p class="mono dim">Cut off for today</p>
          <p class="ct_big">14:00, every day</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ct {
  position: relative;
  padding-block: clamp(6rem, 14vw, 11rem);
  overflow: hidden;
  border-top: 1px solid var(--line);
}

.ct_aura {
  position: absolute;
  left: 50%;
  top: 10%;
  width: min(120vw, 1200px);
  height: min(120vw, 1200px);
  transform: translateX(-50%);
  background:
    radial-gradient(
      38% 38% at 50% 50%,
      rgba(248, 201, 63, 0.16),
      transparent 70%
    ),
    radial-gradient(
      52% 52% at 62% 58%,
      rgba(124, 92, 255, 0.24),
      transparent 70%
    );
  filter: blur(20px);
  pointer-events: none;
}

.ct_in {
  position: relative;
}

.ct_eyebrow {
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.ct_row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
  margin-bottom: clamp(3rem, 8vw, 5.5rem);
}

.ct_title {
  font-size: clamp(2.8rem, 9vw, 8rem);
  line-height: 0.86;
  letter-spacing: -0.055em;
}

.ct_mag {
  flex: none;
}

.ct_disc {
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(9rem, 17vw, 13.5rem);
  height: clamp(9rem, 17vw, 13.5rem);
  border-radius: 50%;
  background: radial-gradient(60% 60% at 50% 40%, #1a1f2b, #0b0e14);
  border: 1px solid var(--line-strong);
  transition:
    background 0.6s var(--e-out),
    border-color 0.6s var(--e-out);
}

.ct_disc:hover {
  border-color: var(--ion);
  background: radial-gradient(60% 60% at 50% 40%, #22301a, #0b0e14);
}

.ct_ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  transition: fill 0.5s var(--e-out);
}

.ct_disc:hover .ct_ring {
  fill: var(--ion);
}

.ct_core {
  display: grid;
  place-items: center;
  width: 42%;
  height: 42%;
  border-radius: 50%;
  background: var(--ion);
  color: #06070a;
  transition: transform 0.55s var(--e-out);
}

.ct_core :deep(svg) {
  width: 40%;
  height: 40%;
}

.ct_disc:hover .ct_core {
  transform: scale(1.09) rotate(45deg);
}

.ct_meta {
  display: grid;
  gap: 1.6rem;
  padding-top: clamp(2rem, 4vw, 3rem);
  border-top: 1px solid var(--line);
}

@media (min-width: 760px) {
  .ct_meta {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
  }
}

.ct_meta_item .mono {
  margin-bottom: 0.5rem;
}

.ct_big {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2vw, 1.6rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  transition: color 0.4s var(--e-out);
}

a.ct_big:hover {
  color: var(--ion);
}
</style>
