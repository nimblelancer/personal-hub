'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/actions/activity-actions'
import { CreateRoadmapNodeSchema, UpdateRoadmapNodeSchema } from '@/lib/validations/roadmap-schemas'
import type { RoadmapNodeInsert } from '@/types/index'
import type { RoadmapNodeStatusType } from '@/types/database'

// ── Roadmap Node CRUD ─────────────────────────────────────────────────────────

export async function createNode(roadmapId: string, data: {
  title: string
  description?: string | null
  parent_id?: string | null
  status?: RoadmapNodeStatusType
}): Promise<{ error?: string; id?: string }> {
  const parsed = CreateRoadmapNodeSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  try {
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
  } catch {
    return { error: 'Failed to create node' }
  }
}

export async function updateNode(id: string, data: {
  title?: string
  description?: string | null
  parent_id?: string | null
  status?: RoadmapNodeStatusType
}): Promise<{ error?: string }> {
  const parsed = UpdateRoadmapNodeSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  try {
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
  } catch {
    return { error: 'Failed to update node' }
  }
}

export async function deleteNode(id: string): Promise<{ error?: string }> {
  try {
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
  } catch {
    return { error: 'Failed to delete node' }
  }
}

export async function updateNodeStatus(
  id: string,
  status: RoadmapNodeStatusType
): Promise<{ error?: string }> {
  try {
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
  } catch {
    return { error: 'Failed to update node status' }
  }
}

export async function reorderNodes(
  roadmapId: string,
  nodeId: string,
  direction: 'up' | 'down'
): Promise<{ error?: string }> {
  try {
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
  } catch {
    return { error: 'Failed to reorder nodes' }
  }
}
