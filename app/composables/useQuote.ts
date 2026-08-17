import { gear, bySlug } from '~/data/gear'

export interface QuoteLine {
  slug: string
  qty: number
}

const STORE = 'campdawn_quote_v1'
const MAX = 20

export const useQuote = () => {
  const lines = useState<QuoteLine[]>('quote_lines', () => [])
  const days = useState<number>('quote_days', () => 2)
  const startDate = useState<string>('quote_start', () => '')
  const drawer = useState<boolean>('quote_drawer', () => false)
  const hydrated = useState<boolean>('quote_hydrated', () => false)
  const pulse = useState<number>('quote_pulse', () => 0)

  const count = computed(() => lines.value.reduce((n, l) => n + l.qty, 0))
  const kinds = computed(() => lines.value.length)

  const detailed = computed(() =>
    lines.value
      .map((l) => ({ line: l, item: bySlug(l.slug) }))
      .filter((r): r is { line: QuoteLine; item: NonNullable<ReturnType<typeof bySlug>> } => !!r.item)
  )

  const qtyOf = (slug: string) => lines.value.find((l) => l.slug === slug)?.qty ?? 0
  const has = (slug: string) => qtyOf(slug) > 0

  const save = () => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify({ lines: lines.value, days: days.value, startDate: startDate.value })
      )
    } catch {
      /* storage blocked, selection stays in memory */
    }
  }

  const add = (slug: string, qty = 1) => {
    if (!gear.some((g) => g.slug === slug)) return
    const found = lines.value.find((l) => l.slug === slug)
    if (found) found.qty = Math.min(MAX, found.qty + qty)
    else lines.value.push({ slug, qty: Math.min(MAX, Math.max(1, qty)) })
    pulse.value++
    save()
  }

  const setQty = (slug: string, qty: number) => {
    const next = Math.max(0, Math.min(MAX, Math.round(qty)))
    if (next === 0) return remove(slug)
    const found = lines.value.find((l) => l.slug === slug)
    if (found) found.qty = next
    else lines.value.push({ slug, qty: next })
    save()
  }

  const remove = (slug: string) => {
    lines.value = lines.value.filter((l) => l.slug !== slug)
    save()
  }

  const toggle = (slug: string) => (has(slug) ? remove(slug) : add(slug))

  const clear = () => {
    lines.value = []
    save()
  }

  const setDays = (n: number) => {
    days.value = Math.max(1, Math.min(90, Math.round(n)))
    save()
  }

  const setStart = (v: string) => {
    startDate.value = v
    save()
  }

  const addMany = (slugs: string[]) => {
    slugs.forEach((s) => {
      if (!has(s)) add(s)
    })
  }

  const hydrate = () => {
    if (!import.meta.client || hydrated.value) return
    hydrated.value = true
    try {
      const raw = localStorage.getItem(STORE)
      if (!raw) return
      const parsed = JSON.parse(raw) as {
        lines?: QuoteLine[]
        days?: number
        startDate?: string
      }
      if (Array.isArray(parsed.lines)) {
        lines.value = parsed.lines
          .filter((l) => l && typeof l.slug === 'string' && gear.some((g) => g.slug === l.slug))
          .map((l) => ({ slug: l.slug, qty: Math.max(1, Math.min(MAX, Number(l.qty) || 1)) }))
      }
      if (parsed.days) days.value = Math.max(1, Math.min(90, Number(parsed.days) || 2))
      if (typeof parsed.startDate === 'string') startDate.value = parsed.startDate
    } catch {
      /* corrupt payload, start fresh */
    }
  }

  return {
    lines,
    days,
    startDate,
    drawer,
    pulse,
    count,
    kinds,
    detailed,
    qtyOf,
    has,
    add,
    setQty,
    remove,
    toggle,
    clear,
    setDays,
    setStart,
    addMany,
    hydrate,
    MAX
  }
}
