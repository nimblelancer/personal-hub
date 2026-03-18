import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BookmarkForm } from '@/components/admin/bookmarks/bookmark-form'

export default function NewBookmarkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/learning/bookmarks"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-3.5" /> Bookmarks
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Save Bookmark</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Add a new link to your collection</p>
      </div>
      <BookmarkForm />
    </div>
  )
}
