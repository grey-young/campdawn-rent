<script setup lang="ts">
import gsap from "gsap";

useSeoMeta({
  title: "Contact",
  description:
    "Call the Campdawn depot in Awoshie, Accra, send an email or ask a question. A real person answers between eight in the morning and ten at night, every day.",
});

const root = ref<HTMLElement | null>(null);

const channels = [
  {
    icon: "lucide:phone",
    label: "Call the depot",
    value: "+233 24 704 2495",
    href: "tel:+233247042495",
    note: "Eight in the morning until ten at night",
  },
  {
    icon: "lucide:mail",
    label: "Send an email",
    value: "info@campdawnesports.com",
    href: "mailto:info@campdawnesports.com",
    note: "Answered inside two hours, most days",
  },
  {
    icon: "lucide:message-circle",
    label: "Message us",
    value: "campdawn on every app",
    href: "#",
    note: "Instagram, TikTok, Discord, WhatsApp",
  },
];

const hours = [
  { d: "Monday to Thursday", h: "08:00 until 22:00" },
  { d: "Friday and Saturday", h: "08:00 until 23:30" },
  { d: "Sunday", h: "09:00 until 21:00" },
  { d: "Same day cut off", h: "14:00, every day" },
];

const faqs = [
  {
    q: "Do you take last minute bookings?",
    a: "Constantly. If you ask before two in the afternoon we can usually get a van to you the same day, as long as what you want is on the shelf. After that we aim for first thing the next morning.",
  },
  {
    q: "Can you staff an event?",
    a: "Yes. For anything above ten stations we normally send a crew member to stay for the duration, keep the queue moving and swap anything that breaks. Ask for it in your quote and we will price it in.",
  },
  {
    q: "Do you work with businesses?",
    a: "Offices, studios, film shoots, agencies and hotels across Accra. We invoice on account for repeat clients and we can hold specific gear on a standing reservation if you run something monthly.",
  },
  {
    q: "What if my building is difficult?",
    a: "Tell us in the notes. Third floor with no lift, a narrow stairwell, a rough stretch of untarred road or a gated estate that needs clearance at the barrier. We plan the crew and the kit around it rather than turning up and improvising.",
  },
];

useMotionScope(() => {
  const el = root.value;
  if (!el) return;

  const title = el.querySelector(".cn_title");
  if (title) revealLines(title, { trigger: el, start: "top 92%" });

  if (prefersReducedMotion()) return;

  gsap.from(".cn_lead", { autoAlpha: 0, y: 22, duration: 0.9, delay: 0.25 });
  gsap.from(".cn_ch", {
    autoAlpha: 0,
    y: 36,
    duration: 0.95,
    stagger: 0.08,
    delay: 0.35,
    ease: "swift",
  });

  gsap.from(".cn_hour", {
    autoAlpha: 0,
    x: -20,
    duration: 0.8,
    stagger: 0.07,
    ease: "swift",
    scrollTrigger: { trigger: ".cn_hours", start: "top 86%", once: true },
  });

  gsap.from(".cn_depot", {
    autoAlpha: 0,
    y: 40,
    duration: 1,
    ease: "swift",
    scrollTrigger: { trigger: ".cn_depot", start: "top 86%", once: true },
  });

  parallax(".cn_depot_art", 70, el);
}, root);
</script>

<template>
  <div ref="root" class="cn">
    <div class="cn_wash" aria-hidden="true" />

    <header class="wrap-wide cn_head">
      <p class="eyebrow">Contact</p>
      <h1 class="display cn_title">Talk to<br />a human</h1>
      <p class="lead cn_lead">
        No phone tree, no ticket number and no bot pretending to be Chloe. The
        people who answer are the people who load the vans.
      </p>
    </header>

    <section class="wrap-wide cn_channels">
      <a v-for="c in channels" :key="c.label" :href="c.href" class="cn_ch">
        <span class="cn_ch_ico"><Icon :name="c.icon" /></span>
        <span class="mono cn_ch_l">{{ c.label }}</span>
        <span class="cn_ch_v display">{{ c.value }}</span>
        <span class="cn_ch_n dim">{{ c.note }}</span>
        <span class="cn_ch_go" aria-hidden="true"
          ><Icon name="lucide:arrow-up-right"
        /></span>
      </a>
    </section>

    <section class="wrap-wide cn_mid">
      <div class="cn_hours">
        <p class="eyebrow">When we answer</p>
        <ul>
          <li v-for="h in hours" :key="h.d" class="cn_hour">
            <span class="cn_hour_d">{{ h.d }}</span>
            <span class="cn_hour_dots" aria-hidden="true" />
            <span class="mono cn_hour_h">{{ h.h }}</span>
          </li>
        </ul>
      </div>

      <div class="cn_depot">
        <div class="cn_depot_art" aria-hidden="true">
          <svg viewBox="0 0 320 220" fill="none">
            <rect
              x="20"
              y="70"
              width="280"
              height="120"
              rx="8"
              fill="#11151d"
              stroke="rgba(255,255,255,.1)"
            />
            <path
              d="M20 70 L160 18 L300 70"
              stroke="rgba(255,255,255,.18)"
              stroke-width="2"
              fill="none"
            />
            <rect
              x="118"
              y="126"
              width="84"
              height="64"
              rx="4"
              fill="#05070c"
              stroke="rgba(255,255,255,.12)"
            />
            <rect
              x="126"
              y="134"
              width="68"
              height="48"
              rx="2"
              fill="rgba(248, 201, 63,.14)"
            />
            <g fill="rgba(248, 201, 63,.5)">
              <rect x="44" y="98" width="34" height="26" rx="3" />
              <rect x="94" y="98" width="34" height="26" rx="3" />
              <rect x="192" y="98" width="34" height="26" rx="3" />
              <rect x="242" y="98" width="34" height="26" rx="3" />
            </g>
            <rect
              x="44"
              y="150"
              width="52"
              height="40"
              rx="4"
              fill="#0b0e14"
              stroke="rgba(255,255,255,.09)"
            />
            <rect
              x="224"
              y="150"
              width="52"
              height="40"
              rx="4"
              fill="#0b0e14"
              stroke="rgba(255,255,255,.09)"
            />
            <circle cx="160" cy="52" r="5" fill="#f8c93f" />
          </svg>
        </div>
        <div class="cn_depot_text">
          <p class="eyebrow">The depot</p>
          <p class="cn_depot_addr display">
            Ablekuma Road, Awoshie Junction<br />Awoshie, Accra
          </p>
          <p class="dim cn_depot_note">
            Visitors are welcome by appointment. Come and try a wheel before you
            commit to a week of it, or bring the kids to break a cabinet in.
          </p>
        </div>
      </div>
    </section>

    <section class="cn_faq section">
      <div class="wrap-wide cn_faq_grid">
        <SectionHead
          eyebrow="Quick answers"
          title="Things people ask<br >before they call"
        />
        <FaqList :items="faqs" />
      </div>
    </section>

    <section class="wrap-wide cn_cta">
      <div class="cn_cta_in panel">
        <div>
          <p class="eyebrow">Skip the phone</p>
          <h2 class="display cn_cta_h">Build a list and let us quote it</h2>
          <p class="dim cn_cta_p">
            Faster than describing it out loud, and you get everything in
            writing.
          </p>
        </div>
        <MagneticEl :strength="0.28">
          <NuxtLink to="/gear" class="btn btn_primary">
            <span>Open the fleet</span>
            <Icon name="lucide:arrow-right" />
          </NuxtLink>
        </MagneticEl>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cn {
  position: relative;
  padding-top: clamp(7rem, 15vh, 10rem);
  overflow: hidden;
}

.cn_wash {
  position: absolute;
  top: -12%;
  left: 50%;
  width: min(120vw, 1300px);
  height: 70vh;
  transform: translateX(-50%);
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(248, 201, 63, 0.12),
    transparent 70%
  );
  filter: blur(30px);
  pointer-events: none;
}

.cn_head {
  position: relative;
  padding-bottom: clamp(2.5rem, 6vw, 4rem);
}

.cn_head .eyebrow {
  margin-bottom: 1.2rem;
}

.cn_title {
  font-size: var(--t-h1);
  margin-bottom: 1.8rem;
}

.cn_lead {
  max-width: 48ch;
}

/* channels */
.cn_channels {
  position: relative;
  display: grid;
  gap: 1rem;
  padding-bottom: var(--section);
}

@media (min-width: 800px) {
  .cn_channels {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.2rem;
  }
}

.cn_ch {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.6rem;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.045),
    rgba(255, 255, 255, 0.01)
  );
  overflow: hidden;
  transition:
    border-color 0.5s var(--e-out),
    background 0.5s var(--e-out),
    transform 0.6s var(--e-out);
}

.cn_ch:hover {
  border-color: var(--ion);
  background: linear-gradient(
    180deg,
    rgba(248, 201, 63, 0.07),
    rgba(255, 255, 255, 0.01)
  );
  transform: translateY(-4px);
}

.cn_ch_ico {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 12px;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  color: var(--ion);
  margin-bottom: 0.8rem;
  transition: transform 0.6s var(--e-out);
}

.cn_ch:hover .cn_ch_ico {
  transform: rotate(-8deg) scale(1.06);
}

.cn_ch_ico :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.cn_ch_l {
  color: var(--faint);
}

.cn_ch_v {
  font-size: clamp(1.15rem, 1.9vw, 1.45rem);
  letter-spacing: -0.035em;
  line-height: 1.15;
}

.cn_ch_n {
  font-size: 0.86rem;
}

.cn_ch_go {
  position: absolute;
  top: 1.4rem;
  right: 1.4rem;
  color: var(--faint);
  transition:
    transform 0.5s var(--e-out),
    color 0.4s var(--e-out);
}

.cn_ch_go :deep(svg) {
  width: 1.1rem;
  height: 1.1rem;
}

.cn_ch:hover .cn_ch_go {
  color: var(--ion);
  transform: translate(4px, -4px);
}

/* mid */
.cn_mid {
  display: grid;
  gap: 3rem;
  padding-bottom: var(--section);
}

@media (min-width: 940px) {
  .cn_mid {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 4rem;
    align-items: start;
  }
}

.cn_hours .eyebrow {
  margin-bottom: 1.6rem;
}

.cn_hour {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line-soft);
}

.cn_hour_d {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.98rem;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.cn_hour_dots {
  flex: 1;
  border-bottom: 1px dotted var(--line-strong);
  transform: translateY(-3px);
}

.cn_hour_h {
  color: var(--ion);
  white-space: nowrap;
}

.cn_depot {
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.045),
    rgba(255, 255, 255, 0.01)
  );
  overflow: hidden;
}

.cn_depot_art {
  padding: 2rem 2rem 0;
  display: grid;
  place-items: center;
  background: radial-gradient(
    60% 60% at 50% 40%,
    rgba(248, 201, 63, 0.07),
    transparent 70%
  );
}

.cn_depot_art svg {
  width: 100%;
  max-width: 26rem;
}

.cn_depot_text {
  padding: 1.8rem;
  border-top: 1px solid var(--line);
}

.cn_depot_text .eyebrow {
  margin-bottom: 1rem;
}

.cn_depot_addr {
  font-size: clamp(1.3rem, 2.2vw, 1.8rem);
  line-height: 1.15;
  margin-bottom: 0.9rem;
}

.cn_depot_note {
  font-size: 0.94rem;
  max-width: 46ch;
}

/* faq */
.cn_faq {
  border-top: 1px solid var(--line);
}

.cn_faq_grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 960px) {
  .cn_faq_grid {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 4rem;
    align-items: start;
  }

  .cn_faq_grid :deep(.sh) {
    margin-bottom: 0;
  }
}

/* cta */
.cn_cta {
  padding-bottom: var(--section);
}

.cn_cta_in {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.8rem, 4vw, 3rem);
}

.cn_cta_h {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  margin: 1rem 0 0.8rem;
  max-width: 22ch;
}

.cn_cta_p {
  max-width: 46ch;
  font-size: 0.95rem;
}

.cn_cta_in :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
