// A lightweight dropdown date picker used on the booking page so we can
// visually grey out / disable specific calendar days — something a native
// <input type="date"> can't do. Used together with /api/uni-calendar-busy to
// block days that already have a university lecture/exam on them.
//
// The customer sees a compact trigger field ("Select a date"). Clicking it
// expands a small month-plan calendar with blocked days struck through; the
// remaining days can be clicked to select. Choosing a day closes the
// dropdown automatically and shows the chosen date in the trigger, so the
// customer can then continue down to the deposit button.
//
// Renders its own hidden <input type="date"> with the given `name` so it
// keeps working with the existing FormData-based submit logic in
// BookingPage.tsx without any changes there beyond swapping the field in.

import { useEffect, useMemo, useRef, useState } from 'react'

type DateAvailabilityPickerProps = {
  name: string
  busyDates: Set<string>
  loading: boolean
  invalid?: boolean
  monthNames: string[]
  weekdayNames: string[]
  labels: {
    prevMonth: string
    nextMonth: string
    unavailable: string
    loading: string
    placeholder: string
    selectDate: string
    done: string
  }
  onChange?: (value: string) => void
}

function toKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function formatDisplay(key: string, monthNames: string[]): string {
  const [y, m, d] = key.split('-').map(Number)
  return `${d}. ${monthNames[m - 1]} ${y}`
}

export function DateAvailabilityPicker({
  name,
  busyDates,
  loading,
  invalid,
  monthNames,
  weekdayNames,
  labels,
  onChange,
}: DateAvailabilityPickerProps) {
  const today = useMemo(() => startOfToday(), [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onChange?.(selected ?? '')
  }, [selected, onChange])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // Convert JS Sunday=0 weekday into a Monday-first column index.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7

  const cells: Array<{ key: string; day: number } | null> = []
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: toKey(viewYear, viewMonth, day), day })
  }

  function goToPrevMonth() {
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1)
        return 11
      }
      return month - 1
    })
  }

  function goToNextMonth() {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1)
        return 0
      }
      return month + 1
    })
  }

  const canGoPrev =
    viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth())

  return (
    <div className="relative mt-2" ref={containerRef}>
      <input type="hidden" name={name} value={selected ?? ''} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex w-full items-center justify-between border bg-neutral-900 px-4 py-3 text-left text-sm transition-colors',
          invalid ? 'border-neutral-500' : 'border-neutral-700',
          open ? 'border-accent' : '',
        ].join(' ')}
      >
        <span className={selected ? 'text-neutral-100' : 'text-neutral-500'}>
          {selected ? formatDisplay(selected, monthNames) : labels.placeholder}
        </span>
        <span className="ml-3 text-neutral-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full border border-neutral-700 bg-neutral-900 p-4 shadow-xl">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-neutral-500">{labels.selectDate}</p>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              disabled={!canGoPrev}
              aria-label={labels.prevMonth}
              className="flex h-7 w-7 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-100 disabled:opacity-30"
            >
              &larr;
            </button>
            <p className="text-xs uppercase tracking-widest text-neutral-200">
              {monthNames[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={goToNextMonth}
              aria-label={labels.nextMonth}
              className="flex h-7 w-7 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-100"
            >
              &rarr;
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-widest text-neutral-600">
            {weekdayNames.map((wd) => (
              <span key={wd}>{wd}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((cell, index) => {
              if (!cell) return <span key={`blank-${index}`} />
              const cellDate = new Date(viewYear, viewMonth, cell.day)
              const isPast = cellDate.getTime() < today.getTime()
              const isBusy = busyDates.has(cell.key)
              const isSelected = selected === cell.key
              const disabled = isPast || isBusy

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelected(cell.key)
                    setOpen(false)
                  }}
                  title={isBusy ? labels.unavailable : undefined}
                  className={[
                    'flex h-9 w-full items-center justify-center text-xs transition-colors',
                    disabled
                      ? 'cursor-not-allowed text-neutral-700 line-through decoration-neutral-700'
                      : 'text-neutral-300 hover:border hover:border-neutral-600',
                    isSelected ? 'border border-accent text-accent' : '',
                  ].join(' ')}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {loading && <p className="mt-3 text-[10px] uppercase tracking-widest text-neutral-600">{labels.loading}</p>}

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-100"
            >
              {labels.done}
            </button>
          </div>
        </div>
      )}

      {invalid && !loading && !open && (
        <p className="mt-2 text-[10px] uppercase tracking-widest text-neutral-500">{labels.unavailable}</p>
      )}
    </div>
  )
}
