# Campdawn

Site for a gaming gear rental business based in Awoshie, Accra, Greater Accra
Region, Ghana. Consoles, screens, headsets, racing rigs and arcade cabinets,
delivered and built by a crew anywhere in Greater Accra.

Built by [Desmond Gbedemah](https://desmondgbedemah.online).

There are no listed prices. A visitor picks gear, sets how many of each and how
many days, leaves a phone number and an email, and the depot replies with a
written quote.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build into .output
npm run preview    # serve the production build
```

## Stack

| Piece | What it does |
| --- | --- |
| Nuxt 4 | Pages, SSR, routing |
| GSAP 3 | ScrollTrigger, SplitText, Flip, all the motion |
| Three.js | Hero scene with bloom, and the draggable product viewer |
| Lenis | Smooth scroll, wired into ScrollTrigger |
| @nuxt/image | Resizes and serves the product cutouts |
| @nuxt/icon | Lucide and brand marks, bundled locally |

## How the quote flow works

1. `useQuote()` holds the selection. It lives in `useState` and mirrors itself
   into `localStorage`, so a list survives a refresh.
2. `QuoteBar` floats once something is picked. `QuoteDrawer` edits quantities
   and the number of days.
3. `/quote` collects the contact details and posts to `server/api/quote.post.ts`.
4. That route validates everything, returns a reference and currently logs the
   payload. **Hook your inbox, CRM or database in there.** The comment marks the
   spot.

## Gear catalogue

Everything lives in `app/data/gear.ts`. Each item carries copy, specs, an
accent colour and an `art` kind.

Items are pictured one of two ways, decided by `GearVisual.vue`:

- `photo` set, so a cut out product shot from `public/gear` is used
- no `photo`, so the drawn `GearArt.vue` version is used instead

The drawn art is the default and covers every item, which is what keeps the grid
consistent. Add photos as you get them and they take over per item. Sixteen of
the eighteen currently carry a photo. The Odyssey Ark and the sound bar stay on
the drawn art because nothing freely licensed exists for them.

## Adding your own product photos

Photograph the actual unit on a plain sweep, white or a flat colour, then:

```bash
npm run cutout -- photos/ps5pro.jpg public/gear/playstation5pro.webp
```

Then point the item at it in `app/data/gear.ts`:

```ts
{ slug: 'playstation5pro', photo: '/gear/playstation5pro.webp', ... }
```

Options for `cutout`:

- `--tolerance 20` widens what counts as backdrop, useful when there is a soft
  shadow to remove
- `--dark` for a product shot on black rather than white
- `--noholes` if an enclosed pale area is genuinely part of the product

A pale product on a pale backdrop is the one case this cannot solve on its own.
Shoot those against a dark or coloured sweep.

## Where the shipped photos came from

`npm run photos` pulls them from Wikimedia Commons and cuts them out. Only
public domain, CC0 and Creative Commons attribution files are listed in that
script on purpose. Manufacturer press renders and retailer cutouts are
copyrighted and are not safe to ship on a commercial site. Every source, licence
and author is recorded in `public/gear/credits.json`.

Two things to know before this goes live.

**Read the credits file.** Half the shots are attribution licences, so a credits
line has to appear somewhere on the site. Four of them are share alike, which
also means the cut out versions in `public/gear` carry that licence onward:
`playstation5pro`, `steamdeck`, `racingrig` and `titanseat`. If you would rather
not carry that, replace those four with your own photographs.

**Some are the right category but not the exact model.** Free licensed studio
photography of current hardware barely exists. Where the real thing was not
available the nearest clean shot was used, and the `note` field in
`credits.json` says which. Photograph your own units and they take over, see
below.

Nine are the genuine article: the PlayStation 5, Xbox Series X, Steam Deck,
DualSense Edge, the LG television, the projector, the racing rig, the chair and
the arcade cabinet.

## Brand

The crest in `public/logo.png` is the source of truth. `public/icon.png`,
`public/mark.png` and `public/og.png` are generated from it, and the site gold
`#f8c93f` is sampled from the banner in the logo.

## Accessibility and motion

Every animation checks `prefers-reduced-motion` and falls back to a static
layout. The custom cursor only appears for a fine pointer. The 3D scenes stop
rendering when scrolled out of view.
