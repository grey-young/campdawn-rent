import { gear } from '../../app/data/gear'

interface Incoming {
  name?: string
  email?: string
  phone?: string
  area?: string
  startDate?: string
  days?: number
  occasion?: string
  notes?: string
  items?: Array<{ slug?: string; qty?: number }>
}

const trim = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const emailish = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phoneish = /^[+()\d\s.]{7,24}$/

export default defineEventHandler(async (event) => {
  const body = (await readBody<Incoming>(event)) || {}

  const name = trim(body.name, 80)
  const email = trim(body.email, 140)
  const phone = trim(body.phone, 30)
  const area = trim(body.area, 120)
  const startDate = trim(body.startDate, 20)
  const occasion = trim(body.occasion, 60)
  const notes = trim(body.notes, 1500)
  const days = Math.max(1, Math.min(90, Math.round(Number(body.days) || 1)))

  const problems: string[] = []
  if (name.length < 2) problems.push('name')
  if (!emailish.test(email)) problems.push('email')
  if (!phoneish.test(phone)) problems.push('phone')
  if (area.length < 2) problems.push('area')

  const items = (Array.isArray(body.items) ? body.items : [])
    .map((i) => ({
      slug: trim(i?.slug, 60),
      qty: Math.max(1, Math.min(20, Math.round(Number(i?.qty) || 1)))
    }))
    .filter((i) => gear.some((g) => g.slug === i.slug))
    .slice(0, 40)

  if (!items.length && notes.length < 8) problems.push('items')

  if (problems.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Some details are missing',
      data: { problems }
    })
  }

  const reference = `CD${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`

  // Hook your inbox, CRM or database in here. The payload below is everything the
  // visitor gave us, already trimmed and validated.
  console.info('[quote request]', {
    reference,
    name,
    email,
    phone,
    area,
    startDate,
    days,
    occasion,
    notes,
    items
  })

  return {
    ok: true,
    reference,
    received: items.length,
    replyWindow: 'two hours'
  }
})
