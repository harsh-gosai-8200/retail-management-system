import type { ReactNode } from 'react'

type Tone = 'neutral' | 'blue' | 'amber' | 'red' | 'green'

const toneClasses: Record<Tone, string> = {
  neutral: 'border-slate-200 bg-white',
  blue: 'border-blue-200 bg-blue-50',
  amber: 'border-amber-200 bg-amber-50',
  red: 'border-red-200 bg-red-50',
  green: 'border-emerald-200 bg-emerald-50',
}

export interface MetricCardProps {
  label: string
  value: ReactNode
  helper?: string
  tone?: Tone
}

export function MetricCard({ label, value, helper, tone = 'neutral' }: MetricCardProps) {
  const toneClass = toneClasses[tone] ?? toneClasses.neutral

  return (
    <div className={`rounded-xl border ${toneClass} p-4 shadow-sm`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {helper && (
        <p className="mt-2 text-xs text-slate-600">
          {helper}
        </p>
      )}
    </div>
  )
}

