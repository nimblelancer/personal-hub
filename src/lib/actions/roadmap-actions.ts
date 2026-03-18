'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/actions/activity-actions'
import { CreateRoadmapSchema, UpdateRoadmapSchema } from '@/lib/validations/roadmap-schemas'
import type { RoadmapInsert, RoadmapWithStats, Roadmap, RoadmapNode } from '@/types/index'
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
  const parsed = CreateRoadmapSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  try {
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
  } catch {
    return { error: 'Failed to create roadmap' }
  }
}

export async function updateRoadmap(id: string, data: {
  name?: string
  description?: string | null
  topic?: NoteTopicType
}): Promise<{ error?: string }> {
  const parsed = UpdateRoadmapSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  try {
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
  } catch {
    return { error: 'Failed to update roadmap' }
  }
}

export async function deleteRoadmap(id: string): Promise<{ error?: string }> {
  try {
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
  } catch {
    return { error: 'Failed to delete roadmap' }
  }
}
