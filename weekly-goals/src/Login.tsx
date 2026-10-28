import { useState, type FormEvent } from 'react'
import { supabase } from './supabase'

// Sign in or create an account with email and password.
export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    const credentials = { email: email.trim(), password }
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword(credentials)
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp(credentials)
      if (error) setError(error.message)
      // No session means Supabase still requires email confirmation.
      else if (!data.session)
        setNotice(
          'Account created, but Supabase wants the email confirmed first. Turn off "Confirm email" in Supabase, or click the link in the email, then sign in.',
        )
    }
    setBusy(false)
    // On success the session listener in App switches to the week view.
  }

  const isSignIn = mode === 'signin'

  return (
    <div className="app">
      <main className="login">
        <h1>Weekly Goals</h1>
        <p className="sub">{isSignIn ? 'Sign in to see your goals.' : 'Create your account.'}</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="field"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="field"
            type="password"
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isSignIn && <p className="hint">At least 6 characters.</p>}
          <button className="primary" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : isSignIn ? 'Sign in' : 'Create account'}
          </button>
          <button
            className="link"
            type="button"
            onClick={() => {
              setMode(isSignIn ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
          >
            {isSignIn ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>
        </form>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
      </main>
    </div>
  )
}
