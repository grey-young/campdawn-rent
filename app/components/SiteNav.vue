<script setup lang="ts">
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { $motion } = useNuxtApp() as unknown as {
  $motion: { stop: () => void; start: () => void };
};

const route = useRoute();
const open = ref(false);
const solid = ref(false);
// Shared so anything else pinned below the bar, the gear filter strip in
// particular, can close the gap the bar leaves when it slides away.
const hidden = useState("navHidden", () => false);

const links = [
  { to: "/gear", label: "Gear", note: "The full fleet" },
  { to: "/bundles", label: "Bundles", note: "Ready made nights" },
  { to: "/process", label: "How it runs", note: "Ask, play, wave goodbye" },
  { to: "/contact", label: "Contact", note: "Talk to a human" },
];

const panel = ref<HTMLElement | null>(null);
let tl: gsap.core.Timeline | null = null;
/** Tracks whether this component is currently one of the scroll holders. */
let held = false;

const buildTimeline = () => {
  const el = panel.value;
  if (!el) return null;
  const t = gsap.timeline({
    paused: true,
    onReverseComplete: () => {
      gsap.set(el, { display: "none" });
      // Hand the scroll back only once the panel has actually gone, otherwise
      // the page moves underneath a menu that is still on screen.
      if (held) {
        held = false;
        $motion?.start();
      }
    },
  });
  // Every step is a fromTo with both ends written out. A plain from records
  // whatever the element happens to be showing as its destination, so once the
  // menu has been closed, or the component rebuilt, it can end up animating
  // back to the hidden position it started from and the labels never arrive.
  t.set(el, { display: "block" })
    .fromTo(
      el,
      { clipPath: "inset(0% 0% 100% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.72, ease: "glide" },
    )
    .fromTo(
      el.querySelectorAll(".mrow .mtext"),
      { yPercent: 118 },
      { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "swift" },
      "-=0.44",
    )
    // Scoped to the rows on purpose. A bare .msub also catches the three blocks
    // in the panel footer, which then get left faded out when the menu closes.
    .fromTo(
      el.querySelectorAll(".mlink .msub"),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.05 },
      "-=0.5",
    )
    .fromTo(
      el.querySelectorAll(".mfoot .msub"),
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05 },
      "-=0.35",
    )
    .fromTo(
      el.querySelectorAll(".mrow"),
      { "--w": "0%" },
      { "--w": "100%", duration: 0.7, stagger: 0.04 },
      "-=0.75",
    );
  return t;
};

const toggle = () => {
  open.value = !open.value;
};

watch(open, (v) => {
  if (!import.meta.client) return;
  if (!tl) tl = buildTimeline();
  if (!tl) return;
  if (v) {
    // The bar hides itself on the way down the page, and a hidden bar is a
    // transformed one, which would turn the fixed panel into a child of that
    // transform. Put it back before anything opens.
    hidden.value = false;
    if (!held) {
      held = true;
      $motion?.stop();
    }
    if (panel.value) panel.value.scrollTop = 0;
    tl.timeScale(1).play(0);
  } else {
    tl.timeScale(1.7).reverse();
  }
});

watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);

onMounted(() => {
  const st = ScrollTrigger.create({
    start: "top -12",
    end: 99999,
    onUpdate: (self) => {
      solid.value = self.scroll() > 40;
      hidden.value = self.direction === 1 && self.scroll() > 320 && !open.value;
    },
  });

  const esc = (e: KeyboardEvent) => {
    if (e.key === "Escape") open.value = false;
  };
  window.addEventListener("keydown", esc);

  onBeforeUnmount(() => {
    st.kill();
    window.removeEventListener("keydown", esc);
    tl?.kill();
    if (held) {
      held = false;
      $motion?.start();
    }
  });
});
</script>

<template>
  <header class="nav" :class="{ solid, hidden, open }">
    <div class="bar wrap-wide">
      <NuxtLink to="/" class="brand" aria-label="Campdawn home">
        <span class="mark">
          <NuxtImg
            src="/mark.png"
            width="96"
            height="96"
            alt=""
            format="webp"
            quality="92"
            preload
          />
          <span class="mark_glow" aria-hidden="true" />
        </span>
        <span class="word">
          <span class="w1">Camp</span><span class="w2">dawn</span>
        </span>
      </NuxtLink>

      <nav class="links" aria-label="Primary">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="lnk">
          <span class="swap">
            <span class="a">{{ l.label }}</span>
            <span class="b" aria-hidden="true">{{ l.label }}</span>
          </span>
        </NuxtLink>
      </nav>

      <div class="right">
        <MagneticEl :strength="0.28" class="cta_wrap">
          <NuxtLink to="/quote" class="btn btn_primary btn_sm cta">
            <span>Ask for a quote</span>
            <Icon name="lucide:arrow-up-right" />
          </NuxtLink>
        </MagneticEl>

        <button
          class="burger"
          :aria-expanded="open"
          aria-label="Toggle menu"
          @click="toggle"
        >
          <span />
          <span />
        </button>
      </div>
    </div>

    <!--
      Teleported because the bar transforms itself out of view on the way down
      the page, and a transformed ancestor makes position fixed resolve against
      that ancestor instead of the viewport. Out here the panel always covers
      the screen, whatever the bar is doing.
    -->
    <Teleport to="body">
      <div ref="panel" class="panel allow-scroll" :inert="!open">
        <div class="panel_in wrap-wide">
          <p class="eyebrow menu_eyebrow">Menu</p>
          <ul class="mlist">
            <li v-for="(l, i) in links" :key="l.to" class="mrow">
              <NuxtLink :to="l.to" class="mlink">
                <span class="mnum mono">{{
                  String(i + 1).padStart(2, "0")
                }}</span>
                <span class="mmask"
                  ><span class="mtext">{{ l.label }}</span></span
                >
                <span class="msub dim">{{ l.note }}</span>
                <Icon class="marrow" name="lucide:arrow-right" />
              </NuxtLink>
            </li>
          </ul>

          <div class="mfoot">
            <div class="msub">
              <p class="mono dim">Drop line</p>
              <a href="tel:+233247042495" class="mbig">+233 24 704 2495</a>
            </div>
            <div class="msub">
              <p class="mono dim">Say hello</p>
              <a href="mailto:info@campdawnesports.com" class="mbig"
                >info@campdawnesports.com</a
              >
            </div>
            <div class="msub">
              <p class="mono dim">Depot</p>
              <p class="mbig">Awoshie, Accra and everywhere within ninety minutes</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900;
  transition:
    transform 0.65s var(--e-out),
    background 0.5s var(--e-out),
    border-color 0.5s var(--e-out),
    backdrop-filter 0.5s var(--e-out);
  border-bottom: 1px solid transparent;
}

.nav.solid {
  background: rgba(6, 7, 10, 0.62);
  backdrop-filter: blur(18px) saturate(150%);
  border-bottom-color: var(--line);
}

.nav.hidden {
  transform: translate3d(0, -110%, 0);
}

.nav.open {
  background: transparent;
  backdrop-filter: none;
  border-bottom-color: transparent;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  height: 76px;
  position: relative;
  z-index: 2;
}

/* brand */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.12rem;
  letter-spacing: -0.035em;
}

.mark {
  position: relative;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex: none;
}

.mark :deep(img) {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.6s var(--e-out);
}

.mark_glow {
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(248, 201, 63, 0.42),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.55s var(--e-out);
}

.brand:hover .mark :deep(img) {
  transform: scale(1.09) rotate(-4deg);
}

.brand:hover .mark_glow {
  opacity: 1;
}

.word .w2 {
  color: var(--muted);
  transition: color 0.45s var(--e-out);
}

.brand:hover .word .w2 {
  color: var(--text);
}

/* links */
.links {
  display: none;
  gap: 2.1rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

@media (min-width: 900px) {
  .links {
    display: flex;
  }
}

.lnk {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dim);
  padding: 0.3rem 0;
}

.swap {
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
}

.swap .a,
.swap .b {
  display: block;
  transition:
    transform 0.55s var(--e-out),
    color 0.55s var(--e-out);
}

.swap .b {
  position: absolute;
  inset: 0;
  transform: translateY(105%);
  color: var(--ion);
}

.lnk:hover .swap .a {
  transform: translateY(-105%);
}

.lnk:hover .swap .b {
  transform: translateY(0);
}

.lnk.router-link-active {
  color: var(--text);
}

.right {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.cta_wrap {
  display: none;
}

@media (min-width: 620px) {
  .cta_wrap {
    display: inline-flex;
  }
}

.cta :deep(svg),
.cta svg {
  width: 1em;
  height: 1em;
}

/* burger */
.burger {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  display: grid;
  place-content: center;
  gap: 6px;
  transition:
    background 0.4s var(--e-out),
    border-color 0.4s var(--e-out);
}

.burger:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--ion);
}

.burger span {
  display: block;
  width: 17px;
  height: 1.5px;
  background: var(--text);
  transition:
    transform 0.5s var(--e-out),
    width 0.5s var(--e-out);
}

.nav.open .burger span:first-child {
  transform: translateY(3.75px) rotate(45deg);
}

.nav.open .burger span:last-child {
  transform: translateY(-3.75px) rotate(-45deg);
}

@media (min-width: 900px) {
  .burger {
    display: none;
  }
}

/* panel */
.panel {
  display: none;
  position: fixed;
  inset: 0;
  /* Above the page and the floating quote bar at 880, under the bar itself at
     900 so the burger stays reachable while the menu is open. */
  z-index: 890;
  background: linear-gradient(180deg, #0a0c12 0%, #06070a 100%);
  overflow-y: auto;
  overscroll-behavior: contain;
  will-change: clip-path;
}

.panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      80% 55% at 82% 6%,
      rgba(124, 92, 255, 0.24),
      transparent 62%
    ),
    radial-gradient(
      60% 45% at 8% 92%,
      rgba(248, 201, 63, 0.16),
      transparent 65%
    );
  pointer-events: none;
}

.panel_in {
  position: relative;
  padding-top: clamp(6rem, 14vh, 9rem);
  padding-bottom: 3rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.menu_eyebrow {
  margin-bottom: 1.6rem;
}

.mlist {
  display: flex;
  flex-direction: column;
}

.mrow {
  --w: 100%;
  position: relative;
  border-top: 1px solid var(--line);
}

.mrow::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  height: 1px;
  width: var(--w);
  background: var(--line-strong);
}

.mrow:last-child {
  border-bottom: 1px solid var(--line);
}

.mlink {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: clamp(0.85rem, 2.4vw, 1.5rem) 0;
  position: relative;
}

.mnum {
  color: var(--faint);
  transition: color 0.5s var(--e-out);
  align-self: start;
  padding-top: 0.9em;
}

/*
 * The open animation writes an inline transform on .mtext every frame. An
 * inline transform beats any stylesheet rule, so a hover slide declared on the
 * same element would simply stop working after the menu had been opened once.
 * The hover therefore moves the mask and the animation moves the text inside
 * it, and the two never write the same property.
 */
.mmask {
  display: block;
  overflow: hidden;
  transition: transform 0.55s var(--e-out);
}

.mtext {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.4rem, 8vw, 5.2rem);
  line-height: 1;
  letter-spacing: -0.045em;
  transition: color 0.5s var(--e-out);
}

.mlink .msub {
  display: none;
  font-size: 0.86rem;
  justify-self: end;
  text-align: right;
}

@media (min-width: 760px) {
  .mlink {
    grid-template-columns: auto 1fr auto auto;
  }

  .mlink .msub {
    display: block;
  }
}

.marrow {
  width: 1.6rem;
  height: 1.6rem;
  color: var(--faint);
  transform: translateX(-14px);
  opacity: 0;
  transition:
    transform 0.55s var(--e-out),
    opacity 0.4s var(--e-out),
    color 0.4s;
}

.mlink:hover .mmask {
  transform: translateX(clamp(8px, 1.6vw, 22px));
}

.mlink:hover .mtext {
  color: var(--ion);
}

.mlink:hover .mnum {
  color: var(--ion);
}

.mlink:hover .marrow {
  transform: translateX(0);
  opacity: 1;
  color: var(--ion);
}

.mfoot {
  margin-top: auto;
  padding-top: clamp(2.5rem, 6vw, 4rem);
  display: grid;
  gap: 1.6rem;
  grid-template-columns: 1fr;
}

@media (min-width: 760px) {
  .mfoot {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

.mfoot .mono {
  margin-bottom: 0.45rem;
}

.mbig {
  font-family: var(--font-display);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.35;
  transition: color 0.4s var(--e-out);
}

a.mbig:hover {
  color: var(--ion);
}
</style>
