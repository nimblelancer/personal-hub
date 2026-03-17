import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PenLine, FolderPlus, Brain } from 'lucide-react'

const quickActions = [
  {
    title: 'New Note',
    description: 'Capture an idea or learning',
    href: '/learning/notes/new',
    icon: PenLine,
  },
  {
    title: 'New Project',
    description: 'Start tracking a project',
    href: '/projects/new',
    icon: FolderPlus,
  },
  {
    title: 'Review Queue',
    description: 'Start a spaced repetition session',
    href: '/learning/review',
    icon: Brain,
  },
]

export default function DashboardPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back. Here&apos;s what you can do today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.href} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-2">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription className="text-xs">{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={action.href} className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                  {action.title}
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
