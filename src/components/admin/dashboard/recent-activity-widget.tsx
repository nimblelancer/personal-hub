// Server Component — timeline of recent activity log entries
import type { ReactNode } from 'react'
import Link from 'next/link'
import { BookOpen, FolderOpen, Bookmark, Link2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActivityEntry } from '@/lib/actions/dashboard-actions'

const ENTITY_ICON: Record<string, ReactNode> = {
  note: <BookOpen className="size-3.5" />,
  project: <FolderOpen className="size-3.5" />,
  bookmark: <Bookmark className="size-3.5" />,
}

function entityHref(type: string, id: string): string {
  if (type === 'note') return `/admin/learning/notes/${id}`
  if (type === 'project') return `/admin/projects/${id}`
  if (type === 'bookmark') return `/admin/learning/bookmarks`
  return '#'
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface RecentActivityWidgetProps {
  activities: ActivityEntry[]
}

export function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  return (
    <Card className="sm:col-span-2 bg-card/60 backdrop-blur-sm border-border dark:border-white/10 hover:border-[oklch(0.65_0.16_200_/_0.3)] hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: 'oklch(0.65 0.16 200 / 0.15)', color: 'oklch(0.65 0.16 200)' }}
          >
            <Clock className="size-4" />
          </div>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No recent activity.</p>
        ) : (
          <ul className="space-y-2">
            {activities.map((entry) => (
              <li key={entry.id} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {ENTITY_ICON[entry.entityType] ?? <Link2 className="size-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="capitalize text-muted-foreground">{entry.action} </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {entry.entityType}
                  </span>
                  {entry.entityTitle && (
                    <>
                      <span className="text-muted-foreground"> · </span>
                      <Link
                        href={entityHref(entry.entityType, entry.entityId)}
                        className="font-medium text-foreground hover:text-primary hover:underline truncate"
                      >
                        {entry.entityTitle}
                      </Link>
                    </>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {relativeTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
