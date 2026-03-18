'use client'
import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { updateNodeStatus, deleteNode, reorderNodes } from '@/lib/actions/roadmap-node-actions'
import { RoadmapNodeForm } from './roadmap-node-form'
import { RoadmapNodeStatusIcon } from './roadmap-node-status-icon'
import { RoadmapChildNodeItem } from './roadmap-child-node-item'
import type { RoadmapNode, RoadmapNodeWithChildren } from '@/types/index'
import type { RoadmapNodeStatusType } from '@/types/database'

// Status cycle: not_started → in_progress → learned → mastered → not_started
const STATUS_CYCLE: RoadmapNodeStatusType[] = ['not_started', 'in_progress', 'learned', 'mastered']

type Props = {
  node: RoadmapNodeWithChildren
  roadmapId: string
  /** All root-level nodes for parent select in form */
  rootNodes: RoadmapNode[]
  isFirst: boolean
  isLast: boolean
  /** Propagate optimistic status update */
  onStatusChange: (nodeId: string, status: RoadmapNodeStatusType) => void
  /** Trigger tree refresh after mutations */
  onMutated: () => void
}

export function RoadmapNodeItem({
  node,
  roadmapId,
  rootNodes,
  isFirst,
  isLast,
  onStatusChange,
  onMutated,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [addChildOpen, setAddChildOpen] = useState(false)
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
    <div className="group">
      {/* Node row */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors">
        {/* Status icon — clickable to cycle */}
        <button
          type="button"
          onClick={cycleStatus}
          disabled={isPending}
          className="shrink-0 hover:scale-110 transition-transform"
          title={`Status: ${node.status} — click to advance`}
        >
          <RoadmapNodeStatusIcon status={node.status} />
        </button>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{node.title}</span>
          {node.description && (
            <span className="text-xs text-muted-foreground truncate block">{node.description}</span>
          )}
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => handleReorder('up')}
            disabled={isFirst || isPending}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
            title="Move up"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleReorder('down')}
            disabled={isLast || isPending}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
            title="Move down"
          >
            <ChevronDown className="size-3.5" />
          </button>

          {/* Add child — only for root nodes */}
          {!node.parent_id && (
            <button
              type="button"
              onClick={() => setAddChildOpen(true)}
              className="p-1 rounded hover:bg-muted transition-colors"
              title="Add child node"
            >
              <Plus className="size-3.5 text-muted-foreground" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Edit node"
          >
            <Pencil className="size-3.5 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className={`p-1 rounded transition-colors ${
              confirmDelete
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'hover:bg-muted'
            }`}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete node'}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Children — indented */}
      {node.children.length > 0 && (
        <div className="ml-6 border-l border-border pl-2 mt-0.5 space-y-0.5">
          {node.children.map((child, idx) => (
            <RoadmapChildNodeItem
              key={child.id}
              node={child}
              roadmapId={roadmapId}
              rootNodes={rootNodes}
              isFirst={idx === 0}
              isLast={idx === node.children.length - 1}
              onStatusChange={onStatusChange}
              onMutated={onMutated}
            />
          ))}
        </div>
      )}

      {/* Edit form dialog */}
      <RoadmapNodeForm
        open={editOpen}
        onOpenChange={setEditOpen}
        roadmapId={roadmapId}
        parentNodes={rootNodes}
        initialData={node}
        onSuccess={onMutated}
      />

      {/* Add child dialog */}
      <RoadmapNodeForm
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        roadmapId={roadmapId}
        parentNodes={rootNodes}
        defaultParentId={node.id}
        onSuccess={onMutated}
      />
    </div>
  )
}
