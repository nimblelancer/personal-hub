// Server Component — shows count of overdue reviews + top 5 preview
import Link from 'next/link'
import { Brain, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReviewDueNote } from '@/lib/actions/dashboard-actions'

interface ReviewDueWidgetProps {
  count: number
  preview: ReviewDueNote[]
}

export function ReviewDueWidget({ count, preview }: ReviewDueWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Brain className="size-4" />
            </div>
            <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
          </div>
          {count > 0 && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              {count}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {count === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <CheckCircle2 className="size-4 text-green-500 shrink-0" />
            <span>All caught up! Nothing due for review.</span>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {count} note{count !== 1 ? 's' : ''} due for review
            </p>
            <ul className="space-y-1">
              {preview.map((note) => (
                <li key={note.noteId}>
                  <Link
                    href={`/learning/notes/${note.noteId}`}
                    className="flex items-center justify-between gap-2 text-sm hover:underline text-foreground/80 hover:text-foreground"
                  >
                    <span className="truncate">{note.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {note.daysOverdue === 0
                        ? 'today'
                        : `${note.daysOverdue}d overdue`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <Link
          href="/learning/review"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Go to Review Queue →
        </Link>
      </CardContent>
    </Card>
  )
}
