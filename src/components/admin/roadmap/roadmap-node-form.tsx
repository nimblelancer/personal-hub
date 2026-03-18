'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createNode, updateNode } from '@/lib/actions/roadmap-actions'
import type { RoadmapNode } from '@/types/index'
import type { RoadmapNodeStatusType } from '@/types/database'

const STATUS_OPTIONS: { value: RoadmapNodeStatusType; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'learned', label: 'Learned' },
  { value: 'mastered', label: 'Mastered' },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roadmapId: string
  /** Parent nodes available for selection (root-level nodes only) */
  parentNodes: RoadmapNode[]
  /** If provided, edit mode; otherwise create mode */
  initialData?: RoadmapNode
  /** Pre-set parent_id when clicking "Add child" */
  defaultParentId?: string | null
  onSuccess?: () => void
}

export function RoadmapNodeForm({
  open,
  onOpenChange,
  roadmapId,
  parentNodes,
  initialData,
  defaultParentId,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [parentId, setParentId] = useState<string | null>(
    initialData?.parent_id ?? defaultParentId ?? null
  )
  const [status, setStatus] = useState<RoadmapNodeStatusType>(
    initialData?.status ?? 'not_started'
  )

  // Reset state when dialog opens/closes
  function handleOpenChange(val: boolean) {
    if (!val) {
      setTitle(initialData?.title ?? '')
      setDescription(initialData?.description ?? '')
      setParentId(initialData?.parent_id ?? defaultParentId ?? null)
      setStatus(initialData?.status ?? 'not_started')
    }
    onOpenChange(val)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    startTransition(async () => {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        parent_id: parentId,
        status,
      }

      const result = initialData
        ? await updateNode(initialData.id, data)
        : await createNode(roadmapId, data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(initialData ? 'Node updated' : 'Node added')
      handleOpenChange(false)
      onSuccess?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Node' : 'Add Node'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Python Fundamentals"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Parent</label>
              <select
                value={parentId ?? ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">None (top-level)</option>
                {parentNodes
                  .filter((n) => n.id !== initialData?.id)
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RoadmapNodeStatusType)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : initialData ? 'Update' : 'Add Node'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
