'use client'
import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateNodeStatus, deleteNode, reorderNodes } from '@/lib/actions/roadmap-node-actions'
import { RoadmapNodeForm } from './roadmap-node-form'
import { RoadmapNodeStatusIcon } from './roadmap-node-status-icon'
import type { RoadmapNode } from '@/types/index'
import type { RoadmapNodeStatusType } from '@/types/database'

// Status cycle: not_started → in_progress → learned → mastered → not_started
const STATUS_CYCLE: RoadmapNodeStatusType[] = ['not_started', 'in_progress', 'learned', 'mastered']

type ChildNodeItemProps = {
  node: RoadmapNode
  roadmapId: string
  rootNodes: RoadmapNode[]
  isFirst: boolean
  isLast: boolean
  onStatusChange: (nodeId: string, status: RoadmapNodeStatusType) => void
  onMutated: () => void
}

export function RoadmapChildNodeItem({
  node,
  roadmapId,
  rootNodes,
  isFirst,
  isLast,
  onStatusChange,
  onMutated,
}: ChildNodeItemProps) {
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(node.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    onStatusChange(node.id, next)
    startTransition(async () => {
      const result = await updateNodeStatus(node.id, next)
      if (result.error) {
        toast.error(result.error)
        onStatusChange(node.id, node.status)
      }
    })
  }

  function handleReorder(direction: 'up' | 'down') {
    startTransition(async () => {
      const result = await reorderNodes(roadmapId, node.id, direction)
      if (result.error) toast.error(result.error)
      else onMutated()
    })
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    startTransition(async () => {
      const result = await deleteNode(node.id)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Node deleted')
        onMutated()
      }
    })
  }

  return (
    <div className="group flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent/50 transition-colors">
      <button
        type="button"
        onClick={cycleStatus}
        disabled={isPending}
        className="shrink-0 hover:scale-110 transition-transform"
        title={`Status: ${node.status}`}
      >
        <RoadmapNodeStatusIcon status={node.status} />
      </button>

      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block">{node.title}</span>
        {node.description && (
          <span className="text-xs text-muted-foreground truncate block">{node.description}</span>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => handleReorder('up')}
          disabled={isFirst || isPending}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleReorder('down')}
          disabled={isLast || isPending}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="p-1 rounded hover:bg-muted"
        >
          <Pencil className="size-3.5 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className={`p-1 rounded transition-colors ${
            confirmDelete ? 'bg-destructive text-destructive-foreground' : 'hover:bg-muted'
          }`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <RoadmapNodeForm
        open={editOpen}
        onOpenChange={setEditOpen}
        roadmapId={roadmapId}
        parentNodes={rootNodes}
        initialData={node}
        onSuccess={onMutated}
      />
    </div>
  )
}
