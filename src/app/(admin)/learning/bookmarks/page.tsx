import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getBookmarks } from '@/lib/actions/bookmark-actions'
import { BookmarkList } from '@/components/admin/bookmarks/bookmark-list'

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bookmarks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{bookmarks.length} saved</p>
        </div>
        <Link
          href="/learning/bookmarks/new"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-3.5" /> New Bookmark
        </Link>
      </div>
      <BookmarkList initialBookmarks={bookmarks} />
    </div>
  )
}
