import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getNote } from '@/lib/actions/note-actions'
import { NoteDetail } from '@/components/admin/notes/note-detail'

type Props = { params: Promise<{ id: string }> }

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params
  const note = await getNote(id)
  if (!note) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/learning/notes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-3.5" /> Notes
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{note.title}</h1>
      </div>
      <NoteDetail note={note} />
    </div>
  )
}
