import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { classNames } from '@/lib/utils'

export function Card({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode
  className?: string
  title?: ReactNode
  action?: ReactNode
}) {
  return (
    <section
      className={classNames(
        'rounded-[14px] border border-border-c bg-surface p-4 sm:p-5',
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
              {title}
            </h2>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:opacity-90',
  secondary: 'bg-primary-soft text-primary hover:opacity-90',
  ghost: 'bg-transparent text-muted border border-border-c hover:text-text',
  danger: 'bg-danger-soft text-danger hover:opacity-90',
}

export function Button({
  variant = 'primary',
  className,
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'sm' | 'md'
}) {
  return (
    <button
      {...props}
      className={classNames(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-[13px]',
        variants[variant],
        className,
      )}
    />
  )
}

const fieldCls =
  'w-full rounded-lg border border-border-c bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={classNames(fieldCls, props.className)} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={classNames(fieldCls, props.className)} />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={classNames(fieldCls, props.className)} />
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">
        {label}
      </span>
      {children}
    </label>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold text-text">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="py-8 text-center text-sm text-muted">{children}</p>
  )
}

export function StatTile({
  label,
  value,
  accent,
}: {
  label: string
  value: ReactNode
  accent?: 'primary' | 'success' | 'warning' | 'danger'
}) {
  const color = accent
    ? { primary: 'text-primary', success: 'text-success', warning: 'text-warning', danger: 'text-danger' }[accent]
    : 'text-text'
  return (
    <div className="rounded-xl border border-border-c bg-surface-2 px-3 py-2.5">
      <div className={classNames('text-lg font-bold tabular-nums', color)}>
        {value}
      </div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  )
}
