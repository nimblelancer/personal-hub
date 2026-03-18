'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createBookmark } from '@/lib/actions/bookmark-actions'
import type { BookmarkStatusType } from '@/types/database'

const STATUSES: BookmarkStatusType[] = ['saved', 'reading', 'done', 'noted']

export function BookmarkForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<BookmarkStatusType>('saved')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = tagInput.trim().toLowerCase()
      if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !title.trim()) return

    startTransition(async () => {
      const result = await createBookmark({
        user_id: '',
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || null,
        tags,
        status,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Bookmark saved')
      router.push('/admin/learning/bookmarks')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="text-sm font-medium mb-1 block">URL *</label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." type="url" required />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bookmark title" required />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookmarkStatusType)}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
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

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Bookmark'}
        </Button>
      </div>
    </form>
  )
}
