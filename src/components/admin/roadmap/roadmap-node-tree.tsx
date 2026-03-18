'use client'
import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { RoadmapNodeItem } from './roadmap-node-item'
import { RoadmapNodeForm } from './roadmap-node-form'
import type { RoadmapNode, RoadmapNodeWithChildren } from '@/types/index'
import type { RoadmapNodeStatusType } from '@/types/database'

/** Build nested structure from flat node list */
function buildTree(nodes: RoadmapNode[]): RoadmapNodeWithChildren[] {
  const rootNodes = nodes
    .filter((n) => !n.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)

  return rootNodes.map((parent) => ({
    ...parent,
    children: nodes
      .filter((n) => n.parent_id === parent.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }))
}

/** Calculate progress from flat nodes */
function calcProgress(nodes: RoadmapNode[]) {
  const completed = nodes.filter(
    (n) => n.status === 'learned' || n.status === 'mastered'
  ).length
  const total = nodes.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completed, total, percentage }
}

type Props = {
  initialNodes: RoadmapNode[]
  roadmapId: string
}

export function RoadmapNodeTree({ initialNodes, roadmapId }: Props) {
  // Local state for optimistic updates; server revalidation keeps it in sync
  const [nodes, setNodes] = useState<RoadmapNode[]>(initialNodes)
  const [addRootOpen, setAddRootOpen] = useState(false)

  const tree = buildTree(nodes)
  const { completed, total, percentage } = calcProgress(nodes)

  // Optimistic status update — mutate local state immediately
  const handleStatusChange = useCallback((nodeId: string, status: RoadmapNodeStatusType) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status } : n))
    )
  }, [])

  // After mutations (add/delete/reorder), re-fetch via router refresh is handled
  // by revalidatePath in server actions; here we just reset to server data on next render
  const handleMutated = useCallback(() => {
    // No-op: Next.js revalidatePath will refresh the server component,
    // which passes new initialNodes to this component via re-render
  }, [])

  // Root nodes for parent select in forms
  const rootNodes = nodes.filter((n) => !n.parent_id)

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      {total > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{completed} / {total} completed ({percentage}%)</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Node tree */}
      {tree.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          No nodes yet — add your first topic below
        </div>
      ) : (
        <div className="space-y-1">
          {tree.map((node, idx) => (
            <RoadmapNodeItem
              key={node.id}
              node={node}
              roadmapId={roadmapId}
              rootNodes={rootNodes}
              isFirst={idx === 0}
              isLast={idx === tree.length - 1}
              onStatusChange={handleStatusChange}
              onMutated={handleMutated}
            />
          ))}
        </div>
      )}

      {/* Add top-level node */}
      <button
        type="button"
        onClick={() => setAddRootOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent/30 transition-colors"
      >
        <Plus className="size-4" />
        Add top-level node
      </button>

      <RoadmapNodeForm
        open={addRootOpen}
        onOpenChange={setAddRootOpen}
        roadmapId={roadmapId}
        parentNodes={rootNodes}
        defaultParentId={null}
        onSuccess={handleMutated}
      />
    </div>
  )
}
