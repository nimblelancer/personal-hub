// Server Component — 2x2 grid layout for dashboard widgets
import type { ReactNode } from 'react'

interface DashboardGridProps {
  children: ReactNode
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {children}
    </div>
  )
}
