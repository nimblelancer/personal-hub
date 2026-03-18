'use client'
import { useState, useTransition } from 'react'
import { ExternalLink, Trash2, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { deleteBookmark } from '@/lib/actions/bookmark-actions'
import type { Bookmark as BookmarkType } from '@/types/index'
import type { BookmarkStatusType } from '@/types/database'

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'reading', label: 'Reading' },
  { value: 'done', label: 'Done' },
  { value: 'noted', label: 'Noted' },
]

const STATUS_BADGE: Record<BookmarkStatusType, string> = {
  saved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  reading: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  noted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

type Props = { initialBookmarks: BookmarkType[] }

export function BookmarkList({ initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(initialBookmarks)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Delete this bookmark?')) return
    startTransition(async () => {
      const result = await deleteBookmark(id)
      if (result.error) { toast.error(result.error); return }
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
      toast.success('Bookmark deleted')
    })
  }

  function filterByStatus(status: string) {
    return status === 'all' ? bookmarks : bookmarks.filter((b) => b.status === status)
  }

  function BookmarkItem({ bookmark }: { bookmark: BookmarkType }) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm hover:text-primary transition-colors flex items-center gap-1 truncate"
            >
              {bookmark.title}
              <ExternalLink className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[bookmark.status]}`}>
              {bookmark.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{getDomain(bookmark.url)}</p>
          {bookmark.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bookmark.description}</p>
          )}
          {bookmark.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {bookmark.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(bookmark.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => handleDelete(bookmark.id)}
          disabled={isPending}
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          aria-label="Delete bookmark"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bookmark className="size-10 text-muted-foreground mb-3" />
        <p className="font-medium">No bookmarks yet</p>
        <p className="text-sm text-muted-foreground mt-1">Save your first one!</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="all">
      <TabsList>
        {STATUS_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
            {value !== 'all' && (
              <span className="ml-1 text-xs opacity-70">
                ({bookmarks.filter((b) => b.status === value).length})
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {STATUS_TABS.map(({ value }) => {
        const items = filterByStatus(value)
        return (
          <TabsContent key={value} value={value}>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No bookmarks in this category.</p>
            ) : (
              <div className="space-y-2 mt-2">
                {items.map((b) => <BookmarkItem key={b.id} bookmark={b} />)}
              </div>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
