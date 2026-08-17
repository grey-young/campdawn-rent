<script setup lang="ts">
import gsap from "gsap";
import { categoryLabel } from "~/data/gear";

useSeoMeta({
  title: "Ask for a quote",
  description:
    "Pick your gear, tell us how many days you need it and leave a phone number. Campdawn sends a written quote back, usually inside two hours.",
});

const q = useQuote();
const root = ref<HTMLElement | null>(null);

const form = reactive({
  name: "",
  email: "",
  phone: "",
  area: "",
  startDate: "",
  occasion: "",
  notes: "",
});

const occasions = [
  "A weekend at home",
  "Birthday",
  "Bachelor or bachelorette",
  "Wedding or outdooring",
  "Office or team day",
  "Launch or expo",
  "Film or photo shoot",
  "Something else",
];

const errors = ref<Record<string, string>>({});
const sending = ref(false);
const sent = ref<{ reference: string; replyWindow: string } | null>(null);
const failed = ref("");

const validate = () => {
  const e: Record<string, string> = {};
  if (form.name.trim().length < 2)
    e.name = "We need a name to put on the quote";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
    e.email = "That email does not look right";
  if (!/^[+()\d\s.]{7,24}$/.test(form.phone.trim()))
    e.phone = "A phone number helps us confirm the slot";
  if (form.area.trim().length < 2) e.area = "Tell us roughly where it is going";
  if (!q.count.value && form.notes.trim().length < 8)
    e.notes = "Pick some gear, or describe what you need";
  errors.value = e;
  return Object.keys(e).length === 0;
};

const submit = async () => {
  failed.value = "";
  if (!validate()) {
    const first = document.querySelector(
      ".fld.bad input, .fld.bad textarea, .fld.bad select",
    );
    if (first instanceof HTMLElement) {
      first.focus();
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          first.closest(".fld"),
          { x: -7 },
          { x: 0, duration: 0.5, ease: "elastic.out(1, 0.35)" },
        );
      }
    }
    return;
  }

  sending.value = true;
  try {
    const res = await $fetch<{ reference: string; replyWindow: string }>(
      "/api/quote",
      {
        method: "POST",
        body: {
          ...form,
          days: q.days.value,
          items: q.lines.value,
        },
      },
    );
    sent.value = res;
    q.clear();
    await nextTick();
    if (!prefersReducedMotion()) {
      gsap
        .timeline()
        .from(".done_mark", {
          scale: 0.4,
          autoAlpha: 0,
          duration: 1,
          ease: "swift",
        })
        .from(
          ".done_line",
          { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.08 },
          "-=0.55",
        );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    const e = err as { data?: { message?: string } };
    failed.value =
      e?.data?.message ||
      "Something went wrong on our side. Call the depot on +233 247042495 and we will sort it.";
  } finally {
    sending.value = false;
  }
};

onMounted(() => q.hydrate());

useMotionScope(() => {
  const el = root.value;
  if (!el) return;
  const title = el.querySelector(".qp_title");
  if (title) revealLines(title, { trigger: el, start: "top 92%" });

  if (prefersReducedMotion()) return;
  gsap.from(".qp_lead, .qp_steps", {
    autoAlpha: 0,
    y: 22,
    duration: 0.9,
    stagger: 0.08,
    delay: 0.2,
  });
  gsap.from(".fld", {
    autoAlpha: 0,
    y: 24,
    duration: 0.8,
    stagger: 0.05,
    ease: "swift",
    scrollTrigger: { trigger: ".qp_form", start: "top 86%", once: true },
  });
  gsap.from(".qp_summary", { autoAlpha: 0, y: 30, duration: 1, delay: 0.35 });
}, root);
</script>

<template>
  <div ref="root" class="qp">
    <div class="qp_wash" aria-hidden="true" />

    <!-- ============ done ============ -->
    <section v-if="sent" class="wrap-wide qp_done">
      <div class="done_mark">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="rgba(248, 201, 63,.25)"
          />
          <circle cx="60" cy="60" r="42" fill="rgba(248, 201, 63,.1)" />
          <path
            d="M40 62 L54 76 L82 46"
            fill="none"
            stroke="#f8c93f"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <p class="eyebrow done_line">Request received</p>
      <h1 class="display qp_done_h done_line">That is with the depot</h1>
      <p class="lead done_line">
        A human is putting your quote together now. Expect it by email inside
        {{ sent.replyWindow }}, and a phone call if anything needs checking.
      </p>

      <div class="done_ref done_line">
        <p class="mono dim">Your reference</p>
        <p class="display done_ref_n">{{ sent.reference }}</p>
      </div>

      <div class="done_acts done_line">
        <NuxtLink to="/gear" class="btn btn_primary">
          <span>Back to the fleet</span>
          <Icon name="lucide:arrow-right" />
        </NuxtLink>
        <a href="tel:+233247042495" class="btn btn_ghost"
          ><span>Call the depot</span></a
        >
      </div>
    </section>

    <!-- ============ form ============ -->
    <template v-else>
      <header class="wrap-wide qp_head">
        <p class="eyebrow">Step three of three</p>
        <h1 class="display qp_title">Tell us where<br />it is going</h1>
        <p class="lead qp_lead">
          Nothing is charged and nothing is committed. We read every request by
          hand and send a written quote covering the gear, the days, delivery,
          build and collection.
        </p>

        <ol class="qp_steps">
          <li><span class="mono">01</span><span>Pick the gear</span></li>
          <li><span class="mono">02</span><span>Set the days</span></li>
          <li class="on">
            <span class="mono">03</span><span>Leave your details</span>
          </li>
        </ol>
      </header>

      <div class="wrap-wide qp_grid">
        <form class="qp_form" novalidate @submit.prevent="submit">
          <fieldset class="qp_block">
            <legend class="eyebrow">Who you are</legend>

            <div class="fld" :class="{ bad: errors.name }">
              <label for="f_name">Name</label>
              <input
                id="f_name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                placeholder="Kwame Mensah"
              />
              <p v-if="errors.name" class="fld_err mono">{{ errors.name }}</p>
            </div>

            <div class="fld_row">
              <div class="fld" :class="{ bad: errors.phone }">
                <label for="f_phone">Phone</label>
                <input
                  id="f_phone"
                  v-model="form.phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="024 123 4567"
                />
                <p v-if="errors.phone" class="fld_err mono">
                  {{ errors.phone }}
                </p>
              </div>

              <div class="fld" :class="{ bad: errors.email }">
                <label for="f_email">Email</label>
                <input
                  id="f_email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@somewhere.com"
                />
                <p v-if="errors.email" class="fld_err mono">
                  {{ errors.email }}
                </p>
              </div>
            </div>
          </fieldset>

          <fieldset class="qp_block">
            <legend class="eyebrow">When and where</legend>

            <div class="fld_row">
              <div class="fld" :class="{ bad: errors.area }">
                <label for="f_area">Area or GhanaPost GPS</label>
                <input
                  id="f_area"
                  v-model="form.area"
                  type="text"
                  autocomplete="address-level2"
                  placeholder="Awoshie, or GA-394-1234"
                />
                <p v-if="errors.area" class="fld_err mono">{{ errors.area }}</p>
              </div>

              <div class="fld">
                <label for="f_date">Start date</label>
                <input id="f_date" v-model="form.startDate" type="date" />
              </div>
            </div>

            <div class="fld">
              <label for="f_occ">What is the occasion</label>
              <div class="sel">
                <select id="f_occ" v-model="form.occasion">
                  <option value="">Pick one, or leave it blank</option>
                  <option v-for="o in occasions" :key="o" :value="o">
                    {{ o }}
                  </option>
                </select>
                <Icon name="lucide:chevron-down" />
              </div>
            </div>
          </fieldset>

          <fieldset class="qp_block">
            <legend class="eyebrow">Anything else</legend>
            <div class="fld" :class="{ bad: errors.notes }">
              <label for="f_notes">Notes for the crew</label>
              <textarea
                id="f_notes"
                v-model="form.notes"
                rows="5"
                placeholder="Third floor apartment, no lift. Twelve people. We want the big screen in the hall."
                data-cursor="text"
              />
              <p v-if="errors.notes" class="fld_err mono">{{ errors.notes }}</p>
            </div>
          </fieldset>

          <p v-if="failed" class="qp_fail">{{ failed }}</p>

          <div class="qp_submit">
            <MagneticEl :strength="0.22">
              <button
                type="submit"
                class="btn btn_primary qp_send"
                :disabled="sending"
              >
                <span>{{
                  sending ? "Sending it over" : "Send this to the depot"
                }}</span>
                <Icon
                  :name="sending ? 'lucide:loader' : 'lucide:arrow-right'"
                  :class="{ spin: sending }"
                />
              </button>
            </MagneticEl>
            <p class="mono dim qp_small">
              We never pass your details on. Ever.
            </p>
          </div>
        </form>

        <!-- summary -->
        <aside class="qp_summary">
          <div class="qp_sum_in panel">
            <div class="qp_sum_head">
              <p class="eyebrow">Your list</p>
              <NuxtLink to="/gear" class="mono qp_edit">Add more</NuxtLink>
            </div>

            <div v-if="!q.detailed.value.length" class="qp_sum_empty">
              <p class="dim">
                Nothing picked yet. You can still send a note and we will work
                it out together.
              </p>
              <NuxtLink to="/gear" class="btn btn_solid btn_sm"
                ><span>Open the fleet</span></NuxtLink
              >
            </div>

            <ul v-else class="qp_sum_list">
              <li v-for="row in q.detailed.value" :key="row.item.slug">
                <span class="qp_sum_art" :style="{ '--tint': row.item.tint }">
                  <GearVisual :item="row.item" :width="96" />
                </span>
                <span class="qp_sum_info">
                  <span class="mono qp_sum_cat">{{
                    categoryLabel(row.item.category)
                  }}</span>
                  <span class="qp_sum_name">{{ row.item.name }}</span>
                </span>
                <span class="qp_sum_qty">
                  <button
                    aria-label="Fewer"
                    @click="q.setQty(row.item.slug, row.line.qty - 1)"
                  >
                    <Icon name="lucide:minus" />
                  </button>
                  <span class="mono">{{ row.line.qty }}</span>
                  <button
                    aria-label="More"
                    @click="q.setQty(row.item.slug, row.line.qty + 1)"
                  >
                    <Icon name="lucide:plus" />
                  </button>
                </span>
              </li>
            </ul>

            <div class="qp_sum_days">
              <div>
                <p class="mono dim">Length of hire</p>
                <p class="qp_sum_dayn display">
                  {{ q.days.value }} {{ q.days.value === 1 ? "day" : "days" }}
                </p>
              </div>
              <div class="qp_sum_step">
                <button
                  aria-label="Fewer days"
                  @click="q.setDays(q.days.value - 1)"
                >
                  <Icon name="lucide:minus" />
                </button>
                <button
                  aria-label="More days"
                  @click="q.setDays(q.days.value + 1)"
                >
                  <Icon name="lucide:plus" />
                </button>
              </div>
            </div>

            <ul class="qp_sum_facts">
              <li>
                <Icon name="lucide:banknote" /><span
                  >No fee to ask and no obligation</span
                >
              </li>
              <li>
                <Icon name="lucide:clock" /><span
                  >Written quote back inside two hours</span
                >
              </li>
              <li>
                <Icon name="lucide:truck" /><span
                  >Delivery, build and collection included</span
                >
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.qp {
  position: relative;
  padding-top: clamp(7rem, 15vh, 10rem);
  padding-bottom: var(--section);
  overflow: hidden;
}

.qp_wash {
  position: absolute;
  top: -14%;
  left: 50%;
  width: min(120vw, 1300px);
  height: 70vh;
  transform: translateX(-50%);
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(124, 92, 255, 0.24),
    transparent 70%
  );
  filter: blur(30px);
  pointer-events: none;
}

.qp_head {
  position: relative;
  padding-bottom: clamp(2rem, 5vw, 3.5rem);
}

.qp_head .eyebrow {
  margin-bottom: 1.2rem;
}

.qp_title {
  font-size: var(--t-h1);
  margin-bottom: 1.6rem;
}

.qp_lead {
  max-width: 52ch;
}

.qp_steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 2rem;
}

.qp_steps li {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.95rem;
  border-radius: 99px;
  border: 1px solid var(--line);
  font-size: 0.85rem;
  color: var(--muted);
}

.qp_steps li .mono {
  color: var(--faint);
  font-size: 0.6rem;
}

.qp_steps li.on {
  border-color: var(--ion);
  color: var(--ion);
  background: rgba(248, 201, 63, 0.08);
}

.qp_steps li.on .mono {
  color: var(--ion);
}

.qp_grid {
  position: relative;
  display: grid;
  gap: 2.5rem;
}

@media (min-width: 980px) {
  .qp_grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 3.5rem;
    align-items: start;
  }
}

/* form */
.qp_block {
  border: none;
  padding: 0 0 clamp(1.8rem, 4vw, 2.6rem);
  margin-bottom: clamp(1.8rem, 4vw, 2.6rem);
  border-bottom: 1px solid var(--line);
}

.qp_block legend {
  margin-bottom: 1.6rem;
}

.fld {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.2rem;
}

.fld_row {
  display: grid;
  gap: 1.2rem;
}

@media (min-width: 640px) {
  .fld_row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.fld label {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.fld input,
.fld textarea,
.sel select {
  width: 100%;
  padding: 0.95rem 1.05rem;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.025);
  color: var(--text);
  font-size: 0.98rem;
  transition:
    border-color 0.4s var(--e-out),
    background 0.4s var(--e-out),
    box-shadow 0.4s var(--e-out);
}

.fld textarea {
  resize: vertical;
  min-height: 8rem;
  line-height: 1.55;
}

.fld input::placeholder,
.fld textarea::placeholder {
  color: var(--faint);
}

.fld input:focus,
.fld textarea:focus,
.sel select:focus {
  outline: none;
  border-color: var(--ion);
  background: rgba(248, 201, 63, 0.045);
  box-shadow: 0 0 0 4px rgba(248, 201, 63, 0.09);
}

.fld.bad input,
.fld.bad textarea {
  border-color: var(--flare);
  background: rgba(255, 106, 61, 0.05);
}

.fld_err {
  color: var(--flare);
  letter-spacing: 0.1em;
}

.sel {
  position: relative;
}

.sel select {
  appearance: none;
  cursor: pointer;
}

.sel select option {
  background: #0d1017;
  color: var(--text);
}

.sel :deep(svg) {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.05rem;
  height: 1.05rem;
  color: var(--muted);
  pointer-events: none;
}

.qp_fail {
  padding: 1rem 1.1rem;
  border-radius: var(--r-md);
  border: 1px solid rgba(255, 106, 61, 0.4);
  background: rgba(255, 106, 61, 0.08);
  color: #ffb69c;
  font-size: 0.92rem;
  margin-bottom: 1.4rem;
}

.qp_submit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2rem;
}

.qp_send :deep(svg) {
  width: 1em;
  height: 1em;
}

.qp_send :deep(svg.spin) {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.qp_send:disabled {
  opacity: 0.65;
  pointer-events: none;
}

.qp_small {
  color: var(--faint);
}

/* summary */
.qp_summary {
  position: relative;
}

@media (min-width: 980px) {
  .qp_summary {
    position: sticky;
    top: 100px;
  }
}

.qp_sum_in {
  padding: clamp(1.2rem, 2.4vw, 1.7rem);
}

.qp_sum_head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid var(--line);
}

.qp_edit {
  color: var(--ion);
  transition: opacity 0.35s var(--e-out);
}

.qp_edit:hover {
  opacity: 0.7;
}

.qp_sum_empty {
  padding: 1.6rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  font-size: 0.9rem;
}

.qp_sum_list li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--line-soft);
}

.qp_sum_art {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--tint) 8%, #0b0e14);
  display: grid;
  place-items: center;
  padding: 3px;
  flex: none;
}

.qp_sum_info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.qp_sum_cat {
  color: var(--faint);
  font-size: 0.54rem;
}

.qp_sum_name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: -0.02em;
}

.qp_sum_qty {
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
}

.qp_sum_qty button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--faint);
  transition: all 0.35s var(--e-out);
}

.qp_sum_qty button:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}

.qp_sum_qty :deep(svg) {
  width: 0.75rem;
  height: 0.75rem;
}

.qp_sum_qty .mono {
  min-width: 1.2rem;
  text-align: center;
  font-size: 0.72rem;
  color: var(--text);
}

.qp_sum_days {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--line);
}

.qp_sum_days .mono {
  margin-bottom: 0.35rem;
}

.qp_sum_dayn {
  font-size: 1.5rem;
  line-height: 1;
}

.qp_sum_step {
  display: flex;
  gap: 0.35rem;
}

.qp_sum_step button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  display: grid;
  place-items: center;
  transition: all 0.4s var(--e-out);
}

.qp_sum_step button:hover {
  background: var(--ion);
  border-color: var(--ion);
  color: #06070a;
}

.qp_sum_step :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
}

.qp_sum_facts {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 1.2rem;
}

.qp_sum_facts li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.86rem;
  color: var(--muted);
}

.qp_sum_facts :deep(svg) {
  width: 0.95rem;
  height: 0.95rem;
  color: var(--ion);
  flex: none;
}

/* done */
.qp_done {
  position: relative;
  min-height: 62svh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 1.2rem;
  padding-block: clamp(2rem, 6vw, 4rem);
}

.done_mark {
  width: clamp(5rem, 10vw, 7rem);
  margin-bottom: 0.5rem;
}

.qp_done_h {
  font-size: var(--t-h1);
}

.done_ref {
  margin-top: 1rem;
  padding: 1.1rem 1.4rem;
  border: 1px dashed var(--line-strong);
  border-radius: var(--r-md);
}

.done_ref .mono {
  margin-bottom: 0.4rem;
}

.done_ref_n {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  letter-spacing: 0.02em;
  color: var(--ion);
}

.done_acts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1rem;
}

.done_acts :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
