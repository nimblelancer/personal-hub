// Server Component — static quick action buttons (no data fetching)
import Link from 'next/link'
import { PenLine, FolderPlus, Brain, Bookmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ACTIONS = [
  {
    label: 'New Note',
    href: '/learning/notes/new',
    icon: PenLine,
    description: 'Capture a learning',
  },
  {
    label: 'New Project',
    href: '/projects/new',
    icon: FolderPlus,
    description: 'Start tracking',
  },
  {
    label: 'Review Queue',
    href: '/learning/review',
    icon: Brain,
    description: 'Spaced repetition',
  },
  {
    label: 'Bookmarks',
    href: '/learning/bookmarks',
    icon: Bookmark,
    description: 'Saved resources',
  },
] as const

export function QuickActionsWidget() {
  return (
    <Card>
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
                className="flex flex-col items-start gap-1 rounded-lg border border-border p-3 hover:bg-muted transition-colors group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted group-hover:bg-background transition-colors">
                  <Icon className="size-3.5 text-muted-foreground" />
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
