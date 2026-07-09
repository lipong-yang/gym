import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/nav'
import { useTheme, toggleTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'
import { classNames } from '@/lib/utils'

function ThemeButton() {
  const theme = useTheme()
  return (
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      className="rounded-lg border border-border-c bg-surface-2 px-2.5 py-1.5 text-sm text-muted transition hover:text-text"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-full lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border-c bg-surface px-3 py-5 lg:flex">
        <div className="px-2 pb-4">
          <h1 className="text-lg font-extrabold text-text">🏋️ Gym Tracker</h1>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-primary text-primary-fg'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 border-t border-border-c pt-3">
          <ThemeButton />
          <button
            onClick={signOut}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-danger"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border-c bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
          <h1 className="text-base font-extrabold text-text">🏋️ Gym Tracker</h1>
          <div className="flex items-center gap-2">
            <ThemeButton />
            <button
              onClick={signOut}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-muted"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile / tablet) — horizontally scrollable */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-border-c bg-surface/95 px-2 py-1.5 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              classNames(
                'flex min-w-[64px] shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition',
                isActive ? 'text-primary' : 'text-muted',
              )
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
