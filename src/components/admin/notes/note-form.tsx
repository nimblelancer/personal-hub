'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MarkdownEditor } from '@/components/shared/markdown-editor'
import { createNote, updateNote } from '@/lib/actions/note-actions'
import type { NoteWithReview, NoteInsert } from '@/types/index'
import type { NoteTopicType, VisibilityType } from '@/types/database'

const TOPICS: NoteTopicType[] = ['ai-ml', 'coding', 'english', 'japanese', 'other']

type Props = {
  initialData?: NoteWithReview
  onSuccess?: () => void
}

export function NoteForm({ initialData, onSuccess }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [topic, setTopic] = useState<NoteTopicType>(initialData?.topic ?? 'other')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>(initialData?.visibility ?? 'private')
  const [content, setContent] = useState(initialData?.content ?? '')

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = tagInput.trim().toLowerCase()
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed])
      }
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    startTransition(async () => {
      const data: NoteInsert = {
        user_id: initialData?.user_id ?? '',
        title: title.trim(),
        topic,
        tags,
        visibility,
        content,
      }

      const result = initialData
        ? await updateNote(initialData.id, data)
        : await createNote(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(initialData ? 'Note updated' : 'Note created')
      onSuccess?.()
      if (!initialData) {
        router.push('/admin/learning/notes')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm font-medium mb-1 block">Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as NoteTopicType)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <label className="text-sm font-medium mb-1 block">Visibility</label>
          <button
            type="button"
            onClick={() => setVisibility(visibility === 'private' ? 'public' : 'private')}
            className={`h-8 px-3 rounded-lg border text-sm transition-colors ${
              visibility === 'public'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-background hover:bg-muted'
            }`}
          >
            {visibility === 'public' ? 'Public' : 'Private'}
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} <X className="size-3" />
            </Badge>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="Type a tag and press Enter"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Content</label>
        <MarkdownEditor value={content} onChange={setContent} placeholder="Write your note in markdown..." />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : initialData ? 'Update Note' : 'Create Note'}
        </Button>
      </div>
    </form>
  )
}
