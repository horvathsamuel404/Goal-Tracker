import { useEffect, useMemo, useRef, useState } from 'react'

type Tab = 'week' | 'history'

// ---- Date helpers (weeks run Sunday to Saturday, in the phone's local time) ----

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - d.getDay())
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const weekdayLong = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function weekLabel(start: Date): string {
  const end = addDays(start, 6)
  const startText = monthDay.format(start)
  const endText =
    start.getMonth() === end.getMonth() ? String(end.getDate()) : monthDay.format(end)
  return `${startText} – ${endText}`
}

// Re-check today's date when the app comes back to the foreground.
function useToday(): Date {
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === 'visible') setToday(new Date())
    }
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return today
}

// ---- Icons ----

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

// ---- Screens ----

function WeekView() {
  const today = useToday()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const dayRefs = useRef<Array<HTMLElement | null>>([])

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const jumpTo = (index: number) => {
    dayRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className="header">
        <div>
          <h1>{weekLabel(weekStart)}</h1>
          <p className="sub">No goals yet</p>
        </div>
        <div className="nav">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous week"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next week"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
          >
            <Chevron direction="right" />
          </button>
        </div>
      </header>

      <nav className="strip" aria-label="Days of the week">
        {days.map((d, i) => {
          const isToday = isSameDay(d, today)
          return (
            <button
              key={d.toISOString()}
              type="button"
              className={isToday ? 'is-today' : undefined}
              aria-current={isToday ? 'date' : undefined}
              aria-label={weekdayLong.format(d) + (isToday ? ', today' : '')}
              onClick={() => jumpTo(i)}
            >
              <span className="strip-letter">{weekdayShort.format(d).charAt(0)}</span>
              <span className="strip-date">{d.getDate()}</span>
            </button>
          )
        })}
      </nav>

      <main className="agenda">
        {days.map((d, i) => {
          const isToday = isSameDay(d, today)
          return (
            <section
              key={d.toISOString()}
              ref={(el) => {
                dayRefs.current[i] = el
              }}
              className={isToday ? 'day is-today' : 'day'}
              aria-label={weekdayLong.format(d) + (isToday ? ', today' : '')}
            >
              <div className="day-head">
                <p className="day-name">{weekdayShort.format(d)}</p>
                <p className="day-num">{d.getDate()}</p>
              </div>
              <div className="day-goals">
                <p className="empty">Nothing planned</p>
              </div>
            </section>
          )
        })}
      </main>
    </>
  )
}

function HistoryView() {
  return (
    <>
      <header className="header">
        <div>
          <h1>Past weeks</h1>
          <p className="sub">Your history will show up here</p>
        </div>
      </header>
      <main className="agenda">
        <p className="empty">Nothing to show yet.</p>
      </main>
    </>
  )
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <button
        type="button"
        className="tab"
        aria-current={tab === 'week' ? 'page' : undefined}
        onClick={() => onChange('week')}
      >
        <CalendarIcon />
        This week
      </button>
      <button
        type="button"
        className="tab"
        aria-current={tab === 'history' ? 'page' : undefined}
        onClick={() => onChange('history')}
      >
        <ClockIcon />
        History
      </button>
    </nav>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('week')

  return (
    <div className="app">
      {tab === 'week' ? <WeekView /> : <HistoryView />}
      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}
