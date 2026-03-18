'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { MilestoneStatusType } from '@/types/database'

type MilestoneInsert = {
  title: string
  description?: string | null
  deadline?: string | null
  status?: MilestoneStatusType
  sort_order?: number
}

export async function createMilestone(projectId: string, data: MilestoneInsert) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: milestone, error } = await supabase
    .from('project_milestones')
    .insert({ ...data, project_id: projectId })
    .select()
    .single()

  if (error || !milestone) return { error: error?.message ?? 'Failed to create milestone' }

  revalidatePath(`/projects/${projectId}`)
  return { data: milestone }
}

export async function updateMilestone(id: string, data: Partial<MilestoneInsert>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify ownership via project join before updating
  const { data: existing } = await supabase
    .from('project_milestones')
    .select('project_id, projects!inner(user_id)')
    .eq('id', id)
    .single()

  const raw = existing as Record<string, unknown> | null
  const project = raw?.projects as { user_id: string } | null
  if (!existing || project?.user_id !== user.id) return { error: 'Unauthorized' }

  const { data: milestone, error } = await supabase
    .from('project_milestones')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error || !milestone) return { error: error?.message ?? 'Failed to update milestone' }

  revalidatePath(`/projects/${existing.project_id}`)
  return { data: milestone }
}

export async function deleteMilestone(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify ownership before deleting
  const { data: existing } = await supabase
    .from('project_milestones')
    .select('project_id, projects!inner(user_id)')
    .eq('id', id)
    .single()

  const raw = existing as Record<string, unknown> | null
  const project = raw?.projects as { user_id: string } | null
  if (!existing || project?.user_id !== user.id) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('project_milestones')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${existing.project_id}`)
  return { success: true }
}

const STATUS_CYCLE: Record<MilestoneStatusType, MilestoneStatusType> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

export async function toggleMilestoneStatus(id: string, currentStatus: MilestoneStatusType) {
  const nextStatus = STATUS_CYCLE[currentStatus]
  return updateMilestone(id, { status: nextStatus })
}
