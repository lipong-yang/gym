import { useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Button, Card, Field, Input } from './ui'

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}

function SetupScreen() {
  return (
    <Centered>
      <Card title="⚙️ Setup required">
        <p className="text-sm text-muted">
          Supabase isn&apos;t configured yet. Create a project, then copy{' '}
          <code className="text-text">.env.example</code> to{' '}
          <code className="text-text">.env.local</code> and set{' '}
          <code className="text-text">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-text">VITE_SUPABASE_ANON_KEY</code>. Run the SQL
          in <code className="text-text">supabase/schema.sql</code>, then restart
          the dev server.
        </p>
      </Card>
    </Centered>
  )
}

function SignIn() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signInWithEmail(email.trim())
    setBusy(false)
    if (error) setError(error)
    else setSent(true)
  }

  return (
    <Centered>
      <Card title="🏋️ Gym Tracker">
        {sent ? (
          <p className="text-sm text-muted">
            Check <span className="text-text">{email}</span> for a magic sign-in
            link. Open it on this device to continue.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Sign in with a one-time magic link — no password needed.
            </p>
            <Field label="Email">
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send magic link'}
            </Button>
          </form>
        )}
      </Card>
    </Centered>
  )
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) return <SetupScreen />
  if (loading)
    return (
      <Centered>
        <p className="text-center text-sm text-muted">Loading…</p>
      </Centered>
    )
  if (!session) return <SignIn />
  return <>{children}</>
}
