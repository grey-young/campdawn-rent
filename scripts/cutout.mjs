/**
 * Turns a product photo shot on a plain backdrop into a transparent PNG sized
 * for the gear cards.
 *
 *   node scripts/cutout.mjs <input> <output> [--dark] [--tolerance 12]
 *
 * The fill starts from the border and only spreads through pixels that match
 * the backdrop, so white or black parts of the product itself are never eaten.
 */

import fs from 'node:fs'
import sharp from 'sharp'

const SIZE = 1000

export async function cutout(
  input,
  output,
  { dark = false, tolerance = 14, pad = 0.04, choke = 0, holes = true } = {}
) {
  const src = sharp(input).ensureAlpha()
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: ch } = info

  const idx = (x, y) => (y * w + x) * ch

  // Sample the border rather than assuming pure white. Studio shots are often
  // a warm off white or a light grey, and a fixed threshold misses those.
  const ring = []
  const step = Math.max(1, Math.floor(Math.min(w, h) / 120))
  for (let x = 0; x < w; x += step) {
    for (const y of [0, 1, h - 2, h - 1]) ring.push(idx(x, y))
  }
  for (let y = 0; y < h; y += step) {
    for (const x of [0, 1, w - 2, w - 1]) ring.push(idx(x, y))
  }
  const median = (vals) => vals.sort((a, b) => a - b)[Math.floor(vals.length / 2)]
  const ref = [0, 1, 2].map((c) => median(ring.map((o) => data[o + c])))

  const dist = (o) => {
    const dr = data[o] - ref[0]
    const dg = data[o + 1] - ref[1]
    const db = data[o + 2] - ref[2]
    return Math.sqrt(dr * dr + dg * dg + db * db)
  }

  const cut = tolerance * 2.6
  const isBackdrop = (x, y) => dist(idx(x, y)) <= cut

  // flood fill inward from every edge pixel that matches the backdrop
  const bg = new Uint8Array(w * h)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (bg[p]) return
    if (!isBackdrop(x, y)) return
    bg[p] = 1
    stack.push(p)
  }
  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }
  while (stack.length) {
    const p = stack.pop()
    const x = p % w
    const y = (p / w) | 0
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }

  // Backdrop showing through an enclosed gap, such as the middle of a steering
  // wheel, never touches the border so the first fill cannot reach it. Sweep for
  // those pockets and drop the ones big enough to be real gaps rather than a
  // highlight on the product itself.
  if (holes) {
    const minHole = Math.max(64, Math.round(w * h * 0.0004))
    const seen = new Uint8Array(w * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const start = y * w + x
        if (bg[start] || seen[start] || !isBackdrop(x, y)) continue
        const region = []
        const queue = [start]
        seen[start] = 1
        while (queue.length) {
          const p = queue.pop()
          region.push(p)
          const rx = p % w
          const ry = (p / w) | 0
          const step2 = [
            [rx + 1, ry],
            [rx - 1, ry],
            [rx, ry + 1],
            [rx, ry - 1]
          ]
          for (const [nx, ny] of step2) {
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
            const np = ny * w + nx
            if (seen[np] || bg[np] || !isBackdrop(nx, ny)) continue
            seen[np] = 1
            queue.push(np)
          }
        }
        if (region.length >= minHole) for (const p of region) bg[p] = 1
      }
    }
  }

  // A pale product on a pale backdrop leaves an opaque rim the fill could not
  // reach. Choking pulls the mask inward by a pixel or two and takes that rim
  // with it, at the cost of shaving the very edge of the subject.
  for (let pass = 0; pass < choke; pass++) {
    const grow = new Uint8Array(bg)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x
        if (bg[p]) continue
        if (
          (x > 0 && bg[p - 1]) ||
          (x < w - 1 && bg[p + 1]) ||
          (y > 0 && bg[p - w]) ||
          (y < h - 1 && bg[p + w])
        ) {
          grow[p] = 1
        }
      }
    }
    bg.set(grow)
  }

  // write alpha, feathering the pixels that sit against the backdrop
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      const o = idx(x, y)
      if (bg[p]) {
        data[o + 3] = 0
        continue
      }
      const touching =
        (x > 0 && bg[p - 1]) ||
        (x < w - 1 && bg[p + 1]) ||
        (y > 0 && bg[p - w]) ||
        (y < h - 1 && bg[p + w])
      if (touching) {
        // ramp alpha over the band just outside the keying threshold so edges
        // do not come out with a hard jagged fringe
        const over = dist(o) - cut
        data[o + 3] = Math.max(0, Math.min(255, Math.round((over / 22) * 255)))
      }
      if (data[o + 3] > 12) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX <= minX || maxY <= minY) throw new Error('nothing left after the cut')

  const cw = maxX - minX + 1
  const cwh = maxY - minY + 1
  const inner = Math.round(SIZE * (1 - pad * 2))

  await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .extract({ left: minX, top: minY, width: cw, height: cwh })
    .resize(inner, inner, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFormat(output.endsWith('.webp') ? 'webp' : 'png', 
      output.endsWith('.webp')
        ? { quality: 90, alphaQuality: 100, effort: 6 }
        : { compressionLevel: 9, palette: false })
    .toFile(output)

  const out = await sharp(output).metadata()
  return { width: out.width, height: out.height, bytes: fs.statSync(output).size }
}

/**
 * For sources that already carry a real alpha channel. Nothing gets keyed, the
 * transparent margin is just trimmed off and the subject is centred on the same
 * square canvas the keyed cutouts use, so every card lines up.
 */
export async function trimAlpha(input, output, { pad = 0.04, floor = 12 } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: ch } = info

  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * ch + 3] <= floor) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  if (maxX <= minX || maxY <= minY) throw new Error('the alpha channel is empty')

  const inner = Math.round(SIZE * (1 - pad * 2))
  await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize(inner, inner, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFormat(
      output.endsWith('.webp') ? 'webp' : 'png',
      output.endsWith('.webp')
        ? { quality: 90, alphaQuality: 100, effort: 6 }
        : { compressionLevel: 9, palette: false }
    )
    .toFile(output)

  const out = await sharp(output).metadata()
  return { width: out.width, height: out.height, bytes: fs.statSync(output).size }
}

// CLI
if (process.argv[1] && process.argv[1].endsWith('cutout.mjs')) {
  const [input, output] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  if (!input || !output) {
    console.log('usage: node scripts/cutout.mjs <input> <output> [--dark] [--tolerance 14]')
    process.exit(1)
  }
  const dark = process.argv.includes('--dark')
  const holes = !process.argv.includes('--noholes')
  const ti = process.argv.indexOf('--tolerance')
  const tolerance = ti > -1 ? Number(process.argv[ti + 1]) : 14
  const res = await cutout(input, output, { dark, tolerance, holes })
  console.log(`${output}  ${res.width}x${res.height}  ${Math.round(res.bytes / 1024)}kB`)
}
