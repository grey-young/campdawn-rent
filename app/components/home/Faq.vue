<script setup lang="ts">
const items = [
  {
    q: 'How does the quote work?',
    a: 'Pick the gear you want, set how many of each and how many days you need it, then leave a phone number and an email. Nothing is charged and nothing is committed. We read every request by hand and send a written quote back, usually inside two hours.'
  },
  {
    q: 'How far do you travel?',
    a: 'Anywhere inside ninety minutes of the Awoshie depot as standard, which covers the whole of Accra, Tema, Kasoa and most of Greater Accra. Beyond the region is possible for multi day bookings, so ask and we will quote the run honestly.'
  },
  {
    q: 'What happens if something breaks?',
    a: 'Every booking includes accidental damage cover. Tell the crew, we swap the item on the next run and nobody argues about it. Deliberate damage is the only thing we charge for, and we will always show you why.'
  },
  {
    q: 'Do I need to clean anything before collection?',
    a: 'No. Leave it exactly as it is. Everything goes straight into our cleaning bay, gets stripped, wiped, tested and rebuilt before it goes anywhere near the next booking.'
  },
  {
    q: 'Can I keep the gear longer?',
    a: 'Yes. Extend from your booking page right up to the moment of collection, as long as the same item is not already promised to somebody else. Extra days are charged at the daily rate, never at a penalty rate.'
  },
  {
    q: 'Is there a deposit?',
    a: 'A small refundable deposit is taken on mobile money or card once you accept the quote, and it comes back to you when we collect. The quote is the whole number. No delivery fees, no setup fees and no fuel surcharges appearing later.'
  },
  {
    q: 'Do you cover events and offices?',
    a: 'Weddings, launches, birthdays, office parties and film shoots. Tell us the room size, the crowd and the vibe, and we will design the setup and staff it for the day if you want us there.'
  }
]
</script>

<template>
  <section class="fa section">
    <div class="wrap-wide fa_grid">
      <div class="fa_side">
        <SectionHead
          eyebrow="Before you ask"
          title="The questions we get <em>daily</em>"
        />
        <div class="fa_help panel">
          <p class="mono dim">Still stuck</p>
          <p class="fa_help_line">A human answers the phone between eight and ten, every day.</p>
          <NuxtLink to="/contact" class="fa_help_link">
            <span>Talk to the depot</span>
            <Icon name="lucide:arrow-up-right" />
          </NuxtLink>
        </div>
      </div>

      <div class="fa_main">
        <FaqList :items="items" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.fa_grid {
  display: grid;
  gap: 2.5rem;
}

@media (min-width: 960px) {
  .fa_grid {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 4rem;
    align-items: start;
  }
}

.fa_side :deep(.sh) {
  margin-bottom: 2rem;
}

.fa_help {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.fa_help_line {
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: -0.025em;
  line-height: 1.25;
}

.fa_help_link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--ion);
  font-weight: 600;
  font-size: 0.92rem;
  margin-top: 0.3rem;
}

.fa_help_link :deep(svg) {
  width: 1em;
  height: 1em;
  transition: transform 0.45s var(--e-out);
}

.fa_help_link:hover :deep(svg) {
  transform: translate(3px, -3px);
}
</style>
