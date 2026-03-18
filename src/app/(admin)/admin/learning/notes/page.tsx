import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getNotes } from '@/lib/actions/note-actions'
import { NoteList } from '@/components/admin/notes/note-list'

export default async function NotesPage() {
  const { notes, total } = await getNotes({ page: 1, pageSize: 20 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
        </div>
        <Link
          href="/admin/learning/notes/new"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-3.5" /> New Note
        </Link>
      </div>
      <NoteList initialNotes={notes} initialTotal={total} />
    </div>
  )
}
