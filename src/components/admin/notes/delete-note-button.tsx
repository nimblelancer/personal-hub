'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteNote } from '@/lib/actions/note-actions'

type Props = { noteId: string }

export function DeleteNoteButton({ noteId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this note? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteNote(noteId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Note deleted')
      router.push('/learning/notes')
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      <Trash2 className="size-3.5" />
      {isPending ? '...' : 'Delete'}
    </button>
  )
}
