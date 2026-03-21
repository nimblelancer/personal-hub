'use client'
import Link from 'next/link'
import { PenLine, FolderPlus, Brain, Bookmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ACTIONS = [
  {
    label: 'New Note',
    href: '/admin/learning/notes/new',
    icon: PenLine,
    description: 'Capture a learning',
  },
  {
    label: 'New Project',
    href: '/admin/projects/new',
    icon: FolderPlus,
    description: 'Start tracking',
  },
  {
    label: 'Review Queue',
    href: '/admin/learning/review',
    icon: Brain,
    description: 'Spaced repetition',
  },
  {
    label: 'Bookmarks',
    href: '/admin/learning/bookmarks',
    icon: Bookmark,
    description: 'Saved resources',
  },
] as const

export function QuickActionsWidget() {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border dark:border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-start gap-1 rounded-lg border border-border p-3 transition-all group"
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'oklch(0.60 0.18 165 / 0.4)'
                  el.style.background = 'oklch(0.60 0.18 165 / 0.06)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = ''
                  el.style.background = ''
                }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  style={{ background: 'oklch(0.60 0.18 165 / 0.1)', color: 'oklch(0.60 0.18 165)' }}
                >
                  <Icon className="size-3.5" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
