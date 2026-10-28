import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isConfigured, supabase, type Goal, type GoalStatus } from './supabase'
import { dayKey, useWeekGoals } from './goals'
import Login from './Login'

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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  )
}

// ---- Goals ----

function GoalRow({
  goal,
  onStatus,
}: {
  goal: Goal
  onStatus: (goal: Goal, status: GoalStatus) => void
}) {
  // Tapping the active mark again sets the goal back to open.
  const toggle = (status: GoalStatus) => onStatus(goal, goal.status === status ? 'open' : status)
  return (
    <div className={`goal is-${goal.status}`}>
      <span className="goal-title">{goal.title}</span>
      <button
        type="button"
        className="mark mark-done"
        aria-label={`Mark "${goal.title}" done`}
        aria-pressed={goal.status === 'done'}
        onClick={() => toggle('done')}
      >
        <CheckIcon />
      </button>
      <button
        type="button"
        className="mark mark-failed"
        aria-label={`Mark "${goal.title}" failed`}
        aria-pressed={goal.status === 'failed'}
        onClick={() => toggle('failed')}
      >
        <CrossIcon />
      </button>
    </div>
  )
}

function AddGoal({ label, onAdd }: { label: string; onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  if (!open) {
    return (
      <button type="button" className="add" onClick={() => setOpen(true)}>
        + Add goal
      </button>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = title.trim()
    if (text) onAdd(text)
    setTitle('') // stay open so several goals can be added in a row
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <input
        className="field"
        aria-label={`New goal for ${label}`}
        placeholder="New goal"
        autoFocus
        maxLength={200}
        enterKeyHint="done"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          const text = title.trim()
          if (text) onAdd(text)
          setTitle('')
          setOpen(false)
        }}
      />
    </form>
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
  const { goals, loading, error, addGoal, setStatus } = useWeekGoals(weekStart)
  const doneCount = goals.filter((g) => g.status === 'done').length
  const summary = loading
    ? 'Loading…'
    : goals.length === 0
      ? 'No goals yet'
      : `${doneCount} of ${goals.length} done`

  const jumpTo = (index: number) => {
    dayRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className="header">
        <div>
          <h1>{weekLabel(weekStart)}</h1>
          <p className="sub">{summary}</p>
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

      {error && (
        <p className="banner" role="alert">
          {error}
        </p>
      )}

      <main className="agenda">
        {days.map((d, i) => {
          const isToday = isSameDay(d, today)
          const key = dayKey(d)
          const dayGoals = goals.filter((g) => g.day === key)
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
                {dayGoals.map((g) => (
                  <GoalRow key={g.id} goal={g} onStatus={setStatus} />
                ))}
                {!loading && (
                  <AddGoal label={weekdayLong.format(d)} onAdd={(title) => addGoal(key, title)} />
                )}
              </div>
            </section>
          )
        })}
      </main>
    </>
  )
}

function HistoryView({ email }: { email: string | undefined }) {
  return (
    <>
      <header className="header">
        <div>
          <h1>Past weeks</h1>
          <p className="sub">Your history will show up here</p>
        </div>
      </header>
      <div className="account">
        <span className="sub">Signed in as {email}</span>
        <button type="button" className="link" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
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
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(isConfigured)

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!isConfigured) {
    return (
      <div className="app">
        <main className="login">
          <h1>Weekly Goals</h1>
          <p className="error">
            Supabase isn't set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
            (see README).
          </p>
        </main>
      </div>
    )
  }
  if (checking) return <div className="app" />
  if (!session) return <Login />

  return (
    <div className="app">
      {tab === 'week' ? (
        <WeekView key={session.user.id} />
      ) : (
        <HistoryView email={session.user.email} />
      )}
      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}
