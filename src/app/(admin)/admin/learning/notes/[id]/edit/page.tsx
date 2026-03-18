import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getNote } from '@/lib/actions/note-actions'
import { NoteForm } from '@/components/admin/notes/note-form'

type Props = { params: Promise<{ id: string }> }

export default async function EditNotePage({ params }: Props) {
  const { id } = await params
  const note = await getNote(id)
  if (!note) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/learning/notes/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-3.5" /> Back to note
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Edit Note</h1>
      </div>
      <NoteForm initialData={note} />
    </div>
  )
}
