// Studio availability configuration for the booking system.
// Edit these settings and redeploy to update availability in the UI.
//
// Shared by the client (date picker) and the server (api/checkout.ts), so
// keep this file dependency-free.

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type TimeSlot = {
  open: string // e.g., "10:00"
  close: string // e.g., "18:00"
}

export type BookingConfig = {
  // Studio hours by weekday. Set to null to close a day.
  weekdaySchedule: Record<Weekday, TimeSlot | null>
  // Minimum days in advance customers must book (e.g., 3 = earliest is 3 days from now)
  bookingLeadTimeDays: number
  // How far ahead customers may book.
  maxAdvanceDays: number
  // Deposit charged via Stripe Checkout, in cents.
  depositCents: number
}

export const bookingConfig: BookingConfig = {
  weekdaySchedule: {
    monday: { open: '10:00', close: '18:00' },
    tuesday: { open: '10:00', close: '18:00' },
    wednesday: { open: '10:00', close: '18:00' },
    thursday: { open: '10:00', close: '18:00' },
    friday: { open: '10:00', close: '18:00' },
    saturday: { open: '11:00', close: '16:00' },
    sunday: null, // Closed
  },
  bookingLeadTimeDays: 3,
  maxAdvanceDays: 365,
  depositCents: 5000,
}

const WEEKDAYS: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_MS = 1000 * 60 * 60 * 24

// Check if a specific calendar day is bookable. Only the year/month/day of
// `date` are used; the passed object is not mutated.
export function isDateAvailable(date: Date, now: Date = new Date()): boolean {
  // Compare calendar days via UTC to stay immune to DST shifts.
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const daysFromNow = Math.round((day - today) / DAY_MS)

  if (daysFromNow < bookingConfig.bookingLeadTimeDays) return false
  if (daysFromNow > bookingConfig.maxAdvanceDays) return false

  return bookingConfig.weekdaySchedule[WEEKDAYS[date.getDay()]] !== null
}

// Same check for a "YYYY-MM-DD" key as submitted by the booking form.
// `toleranceDays` lets the server accept dates that were valid in the
// customer's timezone a few hours earlier/later.
export function isDateKeyAvailable(key: string, now: Date = new Date(), toleranceDays = 0): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const date = new Date(y, m - 1, d)
  // Reject overflowing dates like 2026-02-31.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false
  const reference = new Date(now.getTime() - toleranceDays * DAY_MS)
  return isDateAvailable(date, reference)
}
