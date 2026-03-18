'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createRoadmap, updateRoadmap } from '@/lib/actions/roadmap-actions'
import type { Roadmap } from '@/types/index'
import type { NoteTopicType } from '@/types/database'

const TOPICS: NoteTopicType[] = ['ai-ml', 'coding', 'english', 'japanese', 'other']

type Props = {
  initialData?: Roadmap
  onSuccess?: () => void
}

export function RoadmapForm({ initialData, onSuccess }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [topic, setTopic] = useState<NoteTopicType>(initialData?.topic ?? 'other')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    startTransition(async () => {
      const result = initialData
        ? await updateRoadmap(initialData.id, {
            name: name.trim(),
            description: description.trim() || null,
            topic,
          })
        : await createRoadmap({
            name: name.trim(),
            description: description.trim() || undefined,
            topic,
          })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(initialData ? 'Roadmap updated' : 'Roadmap created')
      onSuccess?.()
      if (!initialData) {
        const id = (result as { id?: string }).id
        router.push(id ? `/learning/roadmap/${id}` : '/learning/roadmap')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Name *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI/ML Learning Path"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will you learn in this roadmap?"
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Topic</label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as NoteTopicType)}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
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
          {isPending ? 'Saving...' : initialData ? 'Update Roadmap' : 'Create Roadmap'}
        </Button>
      </div>
    </form>
  )
}
