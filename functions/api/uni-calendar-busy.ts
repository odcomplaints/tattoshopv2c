// GET /api/uni-calendar-busy — Cloudflare Pages Function equivalent of
// api/uni-calendar-busy.ts. See that file for full documentation of the ICS
// parsing behaviour and the UNI_CALENDAR_ICS_URL environment variable setup.

interface Env {
  UNI_CALENDAR_ICS_URL?: string
}

const DEFAULT_WINDOW_DAYS = 120

function unfoldIcs(raw: string): string[] {
  const rawLines = raw.split(/\r\n|\n|\r/)
  const lines: string[] = []
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1)
    } else {
      lines.push(line)
    }
  }
  return lines
}

type IcsDate = { date: Date; allDay: boolean }

function parseIcsDate(value: string): IcsDate | null {
  const cleaned = value.trim()
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(cleaned)
  if (dateOnly) {
    const [, y, m, d] = dateOnly
    return { date: new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))), allDay: true }
  }
  const dateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(cleaned)
  if (dateTime) {
    const [, y, m, d, hh, mm, ss] = dateTime
    return {
      date: new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss))),
      allDay: false,
    }
  }
  return null
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

type VEvent = {
  dtstart?: IcsDate
  dtend?: IcsDate
  rrule?: string
  exdates: IcsDate[]
}

function parseVEvents(lines: string[]): VEvent[] {
  const events: VEvent[] = []
  let current: VEvent | null = null

  for (const rawLine of lines) {
    if (rawLine === 'BEGIN:VEVENT') {
      current = { exdates: [] }
      continue
    }
    if (rawLine === 'END:VEVENT') {
      if (current) events.push(current)
      current = null
      continue
    }
    if (!current) continue

    const separatorIndex = rawLine.indexOf(':')
    if (separatorIndex === -1) continue
    const rawKey = rawLine.slice(0, separatorIndex)
    const value = rawLine.slice(separatorIndex + 1)
    const key = rawKey.split(';')[0]

    if (key === 'DTSTART') {
      const parsed = parseIcsDate(value)
      if (parsed) current.dtstart = parsed
    } else if (key === 'DTEND') {
      const parsed = parseIcsDate(value)
      if (parsed) current.dtend = parsed
    } else if (key === 'RRULE') {
      current.rrule = value
    } else if (key === 'EXDATE') {
      for (const part of value.split(',')) {
        const parsed = parseIcsDate(part)
        if (parsed) current.exdates.push(parsed)
      }
    }
  }

  return events
}

function parseRRule(rrule: string): {
  freq: string
  interval: number
  until?: Date
  count?: number
  byday: string[]
} {
  const parts = Object.fromEntries(
    rrule.split(';').map((pair) => {
      const [k, v] = pair.split('=')
      return [k, v]
    }),
  )
  return {
    freq: parts.FREQ || 'WEEKLY',
    interval: parts.INTERVAL ? Number(parts.INTERVAL) : 1,
    until: parts.UNTIL ? parseIcsDate(parts.UNTIL)?.date : undefined,
    count: parts.COUNT ? Number(parts.COUNT) : undefined,
    byday: parts.BYDAY ? parts.BYDAY.split(',') : [],
  }
}

const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function expandEventDays(event: VEvent, windowStart: Date, windowEnd: Date): Set<string> {
  const busyDays = new Set<string>()
  if (!event.dtstart) return busyDays

  const durationMs = event.dtend ? event.dtend.date.getTime() - event.dtstart.date.getTime() : 0
  const exdateKeys = new Set(event.exdates.map((ex) => toDayKey(ex.date)))

  const markSpan = (occurrenceStart: Date) => {
    const startKey = toDayKey(occurrenceStart)
    if (exdateKeys.has(startKey)) return
    const occurrenceEnd = durationMs > 0 ? new Date(occurrenceStart.getTime() + durationMs) : occurrenceStart
    let cursor = new Date(Date.UTC(occurrenceStart.getUTCFullYear(), occurrenceStart.getUTCMonth(), occurrenceStart.getUTCDate()))
    const endDay = new Date(Date.UTC(occurrenceEnd.getUTCFullYear(), occurrenceEnd.getUTCMonth(), occurrenceEnd.getUTCDate()))
    let safety = 0
    while (cursor.getTime() <= endDay.getTime() && safety < 400) {
      if (cursor.getTime() >= windowStart.getTime() && cursor.getTime() <= windowEnd.getTime()) {
        busyDays.add(toDayKey(cursor))
      }
      cursor = addDays(cursor, 1)
      safety += 1
    }
  }

  if (!event.rrule) {
    if (event.dtstart.date.getTime() <= windowEnd.getTime() && (event.dtend?.date.getTime() ?? event.dtstart.date.getTime()) >= windowStart.getTime()) {
      markSpan(event.dtstart.date)
    }
    return busyDays
  }

  const rule = parseRRule(event.rrule)
  if (rule.freq !== 'WEEKLY' && rule.freq !== 'DAILY') {
    return busyDays
  }

  const stepDays = rule.freq === 'WEEKLY' ? 7 * rule.interval : rule.interval
  const targetWeekdays = rule.byday.length > 0 ? rule.byday : [WEEKDAY_CODES[event.dtstart.date.getUTCDay()]]

  let occurrence = 0
  let cursorWeekStart = new Date(event.dtstart.date)
  const hardStop = rule.until ?? windowEnd
  let safety = 0

  while (cursorWeekStart.getTime() <= hardStop.getTime() && cursorWeekStart.getTime() <= windowEnd.getTime() && safety < 260) {
    if (rule.freq === 'WEEKLY') {
      for (const code of targetWeekdays) {
        const weekdayIndex = WEEKDAY_CODES.indexOf(code)
        if (weekdayIndex === -1) continue
        const dayDiff = (weekdayIndex - cursorWeekStart.getUTCDay() + 7) % 7
        const occurrenceStart = new Date(cursorWeekStart)
        occurrenceStart.setUTCDate(occurrenceStart.getUTCDate() + dayDiff)
        occurrenceStart.setUTCHours(event.dtstart.date.getUTCHours(), event.dtstart.date.getUTCMinutes(), 0, 0)

        if (occurrenceStart.getTime() < event.dtstart.date.getTime()) continue
        if (rule.until && occurrenceStart.getTime() > rule.until.getTime()) continue
        if (occurrenceStart.getTime() > windowEnd.getTime()) continue
        if (rule.count !== undefined && occurrence >= rule.count) continue

        markSpan(occurrenceStart)
        occurrence += 1
      }
      cursorWeekStart = addDays(cursorWeekStart, stepDays)
    } else {
      if (rule.count === undefined || occurrence < rule.count) {
        markSpan(cursorWeekStart)
        occurrence += 1
      }
      cursorWeekStart = addDays(cursorWeekStart, stepDays)
    }
    safety += 1
  }

  return busyDays
}

export const onRequestGet = async (context: { env: Env; request: Request }): Promise<Response> => {
  // Prefer a configured live feed; otherwise fall back to a static copy of
  // the calendar hosted alongside the site at /uni-calendar.ics (see
  // public/uni-calendar.ics) so the feature works out of the box without any
  // dashboard configuration.
  const configuredUrl = context.env.UNI_CALENDAR_ICS_URL
  const fallbackUrl = new URL('/uni-calendar.ics', context.request.url).toString()
  const icsUrl = configuredUrl || fallbackUrl

  try {
    const normalizedUrl = icsUrl.replace(/^webcal:\/\//i, 'https://')
    const response = await fetch(normalizedUrl, { headers: { Accept: 'text/calendar' } })
    if (!response.ok) throw new Error(`Calendar fetch failed: ${response.status}`)
    const raw = await response.text()

    const windowStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()))
    const windowEnd = addDays(windowStart, DEFAULT_WINDOW_DAYS)

    const lines = unfoldIcs(raw)
    const events = parseVEvents(lines)

    const busyDays = new Set<string>()
    for (const event of events) {
      const days = expandEventDays(event, windowStart, windowEnd)
      for (const day of days) busyDays.add(day)
    }

    const busyDates = Array.from(busyDays).sort()

    return new Response(JSON.stringify({ busyDates, configured: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('uni-calendar-busy: failed to fetch/parse ICS feed', error)
    return new Response(JSON.stringify({ busyDates: [], configured: true, error: 'fetch_failed' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  }
}
