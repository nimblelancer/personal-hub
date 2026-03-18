import { NoteForm } from '@/components/admin/notes/note-form'

export default function NewNotePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Create Note</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Write a new note with markdown support</p>
      </div>
      <NoteForm />
    </div>
  )
}
