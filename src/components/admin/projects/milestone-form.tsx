'use client'
import { useState, useTransition } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createMilestone } from '@/lib/actions/milestone-actions'
import type { MilestoneStatusType } from '@/types/database'

interface MilestoneFormProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const selectClass = 'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'

export function MilestoneForm({ projectId, open, onOpenChange }: MilestoneFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createMilestone(projectId, {
        title: fd.get('title') as string,
        description: (fd.get('description') as string) || null,
        deadline: (fd.get('deadline') as string) || null,
        status: (fd.get('status') as MilestoneStatusType) ?? 'pending',
      })

      if ('error' in result) { setError(result.error ?? null); return }
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Milestone</DialogTitle>
        </DialogHeader>
        <form id="milestone-form" onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ms-title">Title *</Label>
            <Input id="ms-title" name="title" required placeholder="Ship MVP" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ms-description">Description</Label>
            <Input id="ms-description" name="description" placeholder="Optional details" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ms-deadline">Deadline</Label>
              <Input id="ms-deadline" name="deadline" type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ms-status">Status</Label>
              <select id="ms-status" name="status" defaultValue="pending" className={selectClass}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </form>
        <DialogFooter showCloseButton>
          <Button type="submit" form="milestone-form" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Milestone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
