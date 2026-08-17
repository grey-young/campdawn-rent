/**
 * Pulls the freely licensed product shots we chose off Wikimedia Commons and
 * writes transparent webp cutouts into public/gear.
 *
 * Two routes through the pipeline:
 *   mode 'alpha' the source already carries a real alpha channel, so it only
 *                gets trimmed and centred
 *   mode 'key'   the source is a studio shot on a plain sweep, so the backdrop
 *                is keyed out first
 *
 * Only public domain, CC0 and Creative Commons attribution files are listed
 * here on purpose. Manufacturer press renders and retailer cutouts are
 * copyrighted and are not safe to ship on a commercial site, so they are
 * deliberately absent. Every entry ends up in public/gear/credits.json with its
 * licence and author.
 */

import fs from "node:fs";
import sharp from "sharp";
import { cutout, trimAlpha } from "./cutout.mjs";

/**
 * Left on the drawn art on purpose:
 *
 *   odysseyark  nothing freely licensed looks like a large curved gaming
 *               screen. The only real monitor photo we found is a 23 inch
 *               desktop panel showing a test card, which reads worse on a card
 *               than the illustration does.
 *   soundbar    every free sound bar photo is a room or floor shot with cables
 *               in frame, so there is no backdrop to key against.
 */
const PICKS = [
  {
    slug: "playstation5pro",
    title: "File:PlayStation 5 and DualSense with transparent background.png",
    mode: "alpha",
    note: "PlayStation 5 standing with a DualSense",
    licence: "CC BY-SA 4.0",
    author: "Zoltan Kovacs",
  },
  {
    slug: "xboxseriesx",
    title: "File:Xbox Series X mit Controller (transparent background).png",
    mode: "alpha",
    note: "Xbox Series X with its controller",
    licence: "CC BY 4.0",
    author: "Wikimedia contributor",
  },
  {
    slug: "switch2",
    title: "File:Nintendo-Switch-Console-Docked-wJoyConRB.jpg",
    mode: "key",
    note: "Nintendo Switch and dock, first generation",
    licence: "Public domain",
    author: "Evan Amos",
    tolerance: 18,
  },
  {
    slug: "steamdeck",
    title: "File:Steam Deck (front).png",
    mode: "alpha",
    note: "Steam Deck, front on",
    licence: "CC BY-SA 4.0",
    author: "Wikimedia contributor",
  },
  {
    slug: "quest3",
    title: "File:Oculus-Rift-CV1-Headset-Front with transparent background.png",
    mode: "alpha",
    note: "Oculus Rift CV1 headset, earlier model",
    licence: "Public domain",
    author: "Evan Amos",
  },
  {
    slug: "psvr2",
    title: "File:Sony-PlayStation-4-PSVR-Headset-Mk1-FL.jpg",
    mode: "key",
    note: "PlayStation VR headset, first generation",
    licence: "Public domain",
    author: "Evan Amos",
    // The band and the visor trim are white on a white sweep, so the key has to
    // hug the backdrop almost exactly or it punches holes through the headset.
    tolerance: 3,
    choke: 0,
    holes: false,
  },
  {
    slug: "oled65",
    title: "File:LG OLED TV.jpg",
    mode: "key",
    note: "LG curved OLED television",
    licence: "CC BY 2.0",
    author: "LG Electronics",
    tolerance: 20,
    choke: 1,
    // drop the mirrored reflection the sweep puts under the stand
    crop: [0, 0, 1, 0.78],
  },
  {
    slug: "beamprojector",
    title:
      "File:LG전자, 작지만 화질과 편의성 강화한 미니 프로젝터 출시 (4599945883).jpg",
    mode: "key",
    note: "LG projector, smaller model",
    licence: "CC BY 2.0",
    author: "LG Electronics",
    tolerance: 22,
    choke: 1,
  },
  {
    slug: "dualsenseedge",
    title: "File:DualSense Edge Controller.jpg",
    mode: "key",
    note: "DualSense Edge controller",
    licence: "CC0",
    author: "Sony Interactive Entertainment",
    // The backdrop here is graduated rather than flat, so the key has to reach
    // wide to clear it. The shell is white too, so the hole sweep stays off or
    // it would punch straight through the controller.
    tolerance: 26,
    choke: 0,
    holes: false,
  },
  {
    slug: "elitepad",
    title: "File:Xbox-360-Wireless-Controller-White.png",
    mode: "alpha",
    note: "Xbox wireless controller, earlier model",
    licence: "Public domain",
    author: "Evan Amos",
  },
  {
    slug: "fightstick",
    title: "File:Sega-Genesis-Arcade-Stick.jpg",
    mode: "key",
    note: "Arcade stick, different make",
    licence: "Public domain",
    author: "Evan Amos",
  },
  {
    slug: "racingwheel",
    title: "File:Logitech-Driving-Force-PS3.jpg",
    mode: "key",
    note: "Logitech wheel and pedals, earlier model",
    licence: "Public domain",
    author: "Evan Amos",
    tolerance: 34,
  },
  {
    slug: "racingrig",
    title:
      "File:APEX6 Full Motion Professional Racing Simulator 6dof motion simulator.jpg",
    mode: "key",
    note: "Racing cockpit with triple screens",
    licence: "CC BY-SA 4.0",
    author: "Motion Simulation",
    tolerance: 20,
  },
  {
    slug: "arctisnovapro",
    title: "File:Sony-MDR-CD580-Headphones.jpg",
    mode: "key",
    note: "Over ear headphones, different make",
    licence: "Public domain",
    author: "Evan Amos",
    tolerance: 18,
  },
  {
    slug: "titanseat",
    title: "File:Leap-Chair.png",
    mode: "key",
    note: "Task chair, different make",
    licence: "CC BY 3.0",
    author: "Steelcase",
    tolerance: 20,
  },
  {
    slug: "arcadecabinet",
    title: "File:PlayChoice-10 Superdeluxe arcade cabinet.jpg",
    mode: "key",
    note: "Upright arcade cabinet",
    licence: "CC BY 2.0",
    author: "Rob Boudon",
    tolerance: 22,
    // A disc is propped against the cabinet and overlaps its lower left corner,
    // so the patch is laid down in two parts: sweep over everything, then the
    // cabinet's own black put back along the line its side actually follows.
    mask: [[0.0, 0.762, 0.36, 1.0]],
    shapes: [
      {
        fill: "#0d0d0d",
        points: [
          [0.094, 0.762],
          [0.36, 0.762],
          [0.36, 1.0],
          [0.312, 1.0],
          [0.094, 0.87],
        ],
      },
    ],
  },
];

const API = "https://commons.wikimedia.org/w/api.php";
const UA =
  "CampdawnSiteBuild/1.0 (asset fetch; contact info@campdawnesports.com)";

fs.mkdirSync("public/gear", { recursive: true });
fs.mkdirSync("scripts/raw", { recursive: true });

const grab = async (url, tries = 5) => {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 4000) return buf;
    }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error(`could not fetch ${url}`);
};

/**
 * Trims a source down and paints over anything that is in shot but is not the
 * product, a reflection under a television or a stray object on the floor next
 * to a cabinet. Rectangles are given as fractions of the frame so they survive
 * whatever size Commons hands back. Painting uses the corner colour, which is
 * the backdrop, so the key removes the patch along with everything else.
 */
const prepare = async (file, { crop, mask, shapes }) => {
  if (!crop && !mask && !shapes) return file;
  let img = sharp(file);
  const meta = await img.metadata();
  let { width: w, height: h } = meta;

  if (crop) {
    const [x0, y0, x1, y1] = crop;
    const box = {
      left: Math.round(x0 * w),
      top: Math.round(y0 * h),
      width: Math.round((x1 - x0) * w),
      height: Math.round((y1 - y0) * h),
    };
    img = sharp(await img.extract(box).png().toBuffer());
    w = box.width;
    h = box.height;
  }

  if (mask) {
    // Read the border pixels directly. sharp's stats() reports on the whole
    // input regardless of an extract in front of it, so it cannot be used here.
    const { data, info } = await img
      .clone()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    const ring = [];
    for (let x = 0; x < info.width; x += 4)
      ring.push(x * ch, ((info.height - 1) * info.width + x) * ch);
    for (let y = 0; y < info.height; y += 4)
      ring.push(y * info.width * ch, (y * info.width + info.width - 1) * ch);
    const median = (vals) =>
      vals.sort((a, b) => a - b)[Math.floor(vals.length / 2)];
    const [r, g, b] = [0, 1, 2].map((c) =>
      median(ring.map((o) => data[o + c])),
    );
    const patches = await Promise.all(
      mask.map(async ([x0, y0, x1, y1]) => ({
        input: await sharp({
          create: {
            width: Math.max(1, Math.round((x1 - x0) * w)),
            height: Math.max(1, Math.round((y1 - y0) * h)),
            channels: 3,
            background: { r, g, b },
          },
        })
          .png()
          .toBuffer(),
        left: Math.round(x0 * w),
        top: Math.round(y0 * h),
      })),
    );
    img = sharp(await img.composite(patches).png().toBuffer());
  }

  // A box is not always enough. Where the thing being removed overlaps the
  // product, the patch has to follow the product outline instead, so a pick can
  // supply its own shapes in fractions of the frame.
  if (shapes) {
    const paths = shapes
      .map(
        (s) =>
          `<polygon points="${s.points
            .map(([x, y]) => `${(x * w).toFixed(1)},${(y * h).toFixed(1)}`)
            .join(" ")}" fill="${s.fill}"/>`,
      )
      .join("");
    img = sharp(
      await img
        .composite([
          {
            input: Buffer.from(
              `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${paths}</svg>`,
            ),
          },
        ])
        .png()
        .toBuffer(),
    );
  }

  const prepped = file.replace(/\.png$/, "-prep.png");
  await img.png().toFile(prepped);
  return prepped;
};

const credits = [];
const failed = [];

for (const pick of PICKS) {
  try {
    const meta = await (
      await fetch(
        `${API}?${new URLSearchParams({
          action: "query",
          titles: pick.title,
          prop: "imageinfo",
          iiprop: "url|extmetadata",
          iiurlwidth: "1800",
          format: "json",
        })}`,
        { headers: { "User-Agent": UA } },
      )
    ).json();
    const ii = Object.values(meta.query?.pages || {})[0]?.imageinfo?.[0];
    if (!ii) throw new Error("not found on Commons");

    // alpha sources must come through as png or the channel is lost
    const bin = await grab(ii.thumburl || ii.url);
    const raw = `scripts/raw/${pick.slug}.png`;
    await sharp(bin).png().toFile(raw);

    const out = `public/gear/${pick.slug}.webp`;
    const res =
      pick.mode === "alpha"
        ? await trimAlpha(raw, out)
        : await cutout(await prepare(raw, pick), out, {
            tolerance: pick.tolerance ?? 14,
            choke: pick.choke ?? 1,
            holes: pick.holes ?? true,
          });

    console.log(
      `${pick.slug.padEnd(16)} ${pick.mode.padEnd(5)} ${res.width}x${res.height}  ${String(
        Math.round(res.bytes / 1024),
      ).padStart(3)}kB  ${pick.note}`,
    );

    credits.push({
      slug: pick.slug,
      file: `public/gear/${pick.slug}.webp`,
      source: ii.descriptionurl,
      licence: pick.licence,
      author: pick.author,
      note: pick.note,
    });
  } catch (err) {
    console.log(`${pick.slug.padEnd(16)} FAILED  ${err.message}`);
    failed.push(pick.slug);
  }
}

fs.writeFileSync("public/gear/credits.json", JSON.stringify(credits, null, 2));
console.log(`\n${credits.length} written, credits in public/gear/credits.json`);
if (failed.length) console.log(`failed: ${failed.join(", ")}`);
