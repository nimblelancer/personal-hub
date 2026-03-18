'use client'
import { useState, useTransition } from 'react'
import { MilestoneForm } from './milestone-form'
import { toggleMilestoneStatus, deleteMilestone } from '@/lib/actions/milestone-actions'
import { Button } from '@/components/ui/button'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import type { Milestone } from '@/types'
import type { MilestoneStatusType } from '@/types/database'

const STATUS_STYLES: Record<MilestoneStatusType, string> = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const STATUS_LABELS: Record<MilestoneStatusType, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface MilestoneListProps {
  projectId: string
  milestones: Milestone[]
}

export function MilestoneList({ projectId, milestones }: MilestoneListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleToggle(milestone: Milestone) {
    setPendingId(milestone.id)
    startTransition(async () => {
      await toggleMilestoneStatus(milestone.id, milestone.status)
      setPendingId(null)
    })
  }

  function handleDelete(id: string) {
    setPendingId(id)
    startTransition(async () => {
      await deleteMilestone(id)
      setPendingId(null)
    })
  }

  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="flex flex-col gap-3">
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No milestones yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {sorted.map((m) => (
            <li
              key={m.id}
              className="flex items-start gap-3 rounded-xl p-3 ring-1 ring-foreground/10 bg-card"
            >
              {/* Status toggle */}
              <button
                type="button"
                title="Toggle status"
                disabled={pendingId === m.id}
                onClick={() => handleToggle(m)}
                className={`mt-0.5 shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-opacity ${STATUS_STYLES[m.status]} ${pendingId === m.id ? 'opacity-50' : 'hover:opacity-80 cursor-pointer'}`}
              >
                {STATUS_LABELS[m.status]}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${m.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {m.title}
                </p>
                {m.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                )}
                {m.deadline && (
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {formatDate(m.deadline)}</p>
                )}
              </div>

              {/* Delete */}
              <button
                type="button"
                title="Delete milestone"
                disabled={pendingId === m.id}
                onClick={() => handleDelete(m.id)}
                className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash2Icon className="size-3.5" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setFormOpen(true)}
        className="self-start"
      >
        <PlusIcon />
        Add Milestone
      </Button>

      <MilestoneForm projectId={projectId} open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
