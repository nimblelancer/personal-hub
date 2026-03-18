'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/actions/activity-actions'
import type { RoadmapInsert, RoadmapNodeInsert, RoadmapWithStats, Roadmap, RoadmapNode } from '@/types/index'
import type { NoteTopicType, RoadmapNodeStatusType } from '@/types/database'

// ── Roadmap CRUD ──────────────────────────────────────────────────────────────

export async function getRoadmaps(): Promise<RoadmapWithStats[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: roadmaps, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !roadmaps) return []

  // Fetch all nodes for all roadmaps in a single query
  const roadmapIds = roadmaps.map((r) => r.id)
  if (roadmapIds.length === 0) return []

  const { data: allNodes } = await supabase
    .from('roadmap_nodes')
    .select('id, roadmap_id, status')
    .in('roadmap_id', roadmapIds)

  const nodes = allNodes ?? []

  return roadmaps.map((r) => {
    const rNodes = nodes.filter((n) => n.roadmap_id === r.id)
    const completedStatuses: RoadmapNodeStatusType[] = ['learned', 'mastered']
    const completed = rNodes.filter((n) => completedStatuses.includes(n.status as RoadmapNodeStatusType)).length
    const total = rNodes.length
    return {
      ...r,
      node_count: total,
      completed_count: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })
}

export async function getRoadmap(id: string): Promise<{ roadmap: Roadmap; nodes: RoadmapNode[] } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roadmap, error: rError } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (rError || !roadmap) return null

  const { data: nodes, error: nError } = await supabase
    .from('roadmap_nodes')
    .select('*')
    .eq('roadmap_id', id)
    .order('sort_order', { ascending: true })

  if (nError) return null

  return { roadmap, nodes: nodes ?? [] }
}

export async function createRoadmap(data: {
  name: string
  description?: string
  topic?: NoteTopicType
}): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const insert: RoadmapInsert = {
    user_id: user.id,
    name: data.name,
    description: data.description ?? null,
    topic: data.topic ?? 'other',
  }

  const { data: roadmap, error } = await supabase
    .from('roadmaps')
    .insert(insert)
    .select()
    .single()

  if (error || !roadmap) return { error: error?.message ?? 'Failed to create roadmap' }

  await logActivity(user.id, 'roadmap_node', roadmap.id, 'roadmap_created')
  revalidatePath('/admin/learning/roadmap')
  return { id: roadmap.id }
}

export async function updateRoadmap(id: string, data: {
  name?: string
  description?: string | null
  topic?: NoteTopicType
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('roadmaps')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  await logActivity(user.id, 'roadmap_node', id, 'roadmap_updated')
  revalidatePath('/admin/learning/roadmap')
  revalidatePath(`/admin/learning/roadmap/${id}`)
  return {}
}

export async function deleteRoadmap(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('roadmaps')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  await logActivity(user.id, 'roadmap_node', id, 'roadmap_deleted')
  revalidatePath('/admin/learning/roadmap')
  return {}
}

// ── Roadmap Node CRUD ─────────────────────────────────────────────────────────

export async function createNode(roadmapId: string, data: {
  title: string
  description?: string | null
  parent_id?: string | null
  status?: RoadmapNodeStatusType
}): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Determine sort_order — max in the same parent group + 1
  const siblingsQuery = supabase
    .from('roadmap_nodes')
    .select('sort_order')
    .eq('roadmap_id', roadmapId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const { data: siblings } = data.parent_id
    ? await siblingsQuery.eq('parent_id', data.parent_id)
    : await siblingsQuery.is('parent_id', null)

  const maxOrder = siblings?.[0]?.sort_order ?? -1
  const nextOrder = maxOrder + 1

  const insert: RoadmapNodeInsert = {
    roadmap_id: roadmapId,
    parent_id: data.parent_id ?? null,
    title: data.title,
    description: data.description ?? null,
    status: data.status ?? 'not_started',
    sort_order: nextOrder,
  }

  const { data: node, error } = await supabase
    .from('roadmap_nodes')
    .insert(insert)
    .select()
    .single()

  if (error || !node) return { error: error?.message ?? 'Failed to create node' }

  revalidatePath(`/admin/learning/roadmap/${roadmapId}`)
  return { id: node.id }
}

export async function updateNode(id: string, data: {
  title?: string
  description?: string | null
  parent_id?: string | null
  status?: RoadmapNodeStatusType
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify ownership via roadmap
  const { data: node } = await supabase
    .from('roadmap_nodes')
    .select('roadmap_id')
    .eq('id', id)
    .single()

  if (!node) return { error: 'Node not found' }

  const { error } = await supabase
    .from('roadmap_nodes')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/admin/learning/roadmap/${node.roadmap_id}`)
  return {}
}

export async function deleteNode(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: node } = await supabase
    .from('roadmap_nodes')
    .select('roadmap_id')
    .eq('id', id)
    .single()

  if (!node) return { error: 'Node not found' }

  // Promote children to root (parent_id = null)
  await supabase
    .from('roadmap_nodes')
    .update({ parent_id: null })
    .eq('parent_id', id)

  const { error } = await supabase
    .from('roadmap_nodes')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/admin/learning/roadmap/${node.roadmap_id}`)
  return {}
}

export async function updateNodeStatus(
  id: string,
  status: RoadmapNodeStatusType
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: node } = await supabase
    .from('roadmap_nodes')
    .select('roadmap_id')
    .eq('id', id)
    .single()

  if (!node) return { error: 'Node not found' }

  const { error } = await supabase
    .from('roadmap_nodes')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }

  await logActivity(user.id, 'roadmap_node', id, `status_${status}`)
  revalidatePath(`/admin/learning/roadmap/${node.roadmap_id}`)
  return {}
}

export async function reorderNodes(
  roadmapId: string,
  nodeId: string,
  direction: 'up' | 'down'
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get current node
  const { data: current } = await supabase
    .from('roadmap_nodes')
    .select('*')
    .eq('id', nodeId)
    .single()

  if (!current) return { error: 'Node not found' }

  // Find adjacent node in same parent group
  const adjacentQuery = supabase
    .from('roadmap_nodes')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('sort_order', { ascending: direction === 'up' })

  const { data: siblings } = current.parent_id
    ? await adjacentQuery.eq('parent_id', current.parent_id)
    : await adjacentQuery.is('parent_id', null)

  if (!siblings) return {}

  const currentIndex = siblings.findIndex((n) => n.id === nodeId)
  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

  if (swapIndex < 0 || swapIndex >= siblings.length) return {}

  const swap = siblings[swapIndex]
  const currentOrder = current.sort_order
  const swapOrder = swap.sort_order

  // Swap sort orders
  await supabase.from('roadmap_nodes').update({ sort_order: swapOrder }).eq('id', nodeId)
  await supabase.from('roadmap_nodes').update({ sort_order: currentOrder }).eq('id', swap.id)

  revalidatePath(`/admin/learning/roadmap/${roadmapId}`)
  return {}
}
