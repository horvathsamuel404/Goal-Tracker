import { useCallback, useEffect, useState } from 'react'
import { supabase, type Goal, type GoalStatus } from './supabase'

// Local calendar date as YYYY-MM-DD (not UTC, so late-evening goals stay on the right day).
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Loads the goals for one week and saves changes. Changes show immediately
// and are undone if the save fails.
export function useWeekGoals(weekStart: Date) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const from = dayKey(weekStart)
  const toDate = new Date(weekStart)
  toDate.setDate(toDate.getDate() + 6)
  const to = dayKey(toDate)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('goals')
      .select('id, day, title, status, created_at')
      .gte('day', from)
      .lte('day', to)
      .order('created_at')
      .then(({ data, error }) => {
        if (cancelled) return
        setLoading(false)
        if (error) setError("Couldn't load goals. Check your connection.")
        else setGoals((data ?? []) as Goal[])
      })
    return () => {
      cancelled = true
    }
  }, [from, to])

  const addGoal = useCallback(async (day: string, title: string) => {
    const tempId = `temp-${crypto.randomUUID()}`
    const temp: Goal = {
      id: tempId,
      day,
      title,
      status: 'open',
      created_at: new Date().toISOString(),
    }
    setGoals((g) => [...g, temp])
    setError(null)
    const { data, error } = await supabase
      .from('goals')
      .insert({ day, title })
      .select('id, day, title, status, created_at')
      .single()
    if (error || !data) {
      setGoals((g) => g.filter((x) => x.id !== tempId))
      setError("Couldn't save that goal. Try again.")
    } else {
      setGoals((g) => g.map((x) => (x.id === tempId ? (data as Goal) : x)))
    }
  }, [])

  const setStatus = useCallback(async (goal: Goal, status: GoalStatus) => {
    if (goal.id.startsWith('temp-')) return
    setGoals((g) => g.map((x) => (x.id === goal.id ? { ...x, status } : x)))
    setError(null)
    const { error } = await supabase.from('goals').update({ status }).eq('id', goal.id)
    if (error) {
      setGoals((g) => g.map((x) => (x.id === goal.id ? { ...x, status: goal.status } : x)))
      setError("Couldn't update that goal. Try again.")
    }
  }, [])

  return { goals, loading, error, addGoal, setStatus }
}
