'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/actions/activity-actions'
import { generateProjectDocTemplate } from '@/lib/project-doc-template'
import type { ProjectInsert, ProjectWithDetails } from '@/types'
import type { ProjectStatusType, ProjectTypeType, VisibilityType } from '@/types/database'

export async function getProjects(filters?: {
  type?: ProjectTypeType
  status?: ProjectStatusType
  visibility?: VisibilityType
}): Promise<import('@/types').Project[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.visibility) query = query.eq('visibility', filters.visibility)

  const { data, error } = await query
  if (error) return []
  return data
}

export async function getProject(id: string): Promise<ProjectWithDetails | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_docs(*),
      project_milestones(*),
      lessons_learned(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  // Normalize joined data to match ProjectWithDetails shape
  const raw = data as Record<string, unknown>
  return {
    ...data,
    project_docs: Array.isArray(raw.project_docs)
      ? (raw.project_docs[0] ?? null)
      : (raw.project_docs ?? null),
    project_milestones: Array.isArray(raw.project_milestones)
      ? raw.project_milestones
      : [],
    lessons_learned: Array.isArray(raw.lessons_learned)
      ? (raw.lessons_learned[0] ?? null)
      : (raw.lessons_learned ?? null),
  } as ProjectWithDetails
}

export async function createProject(data: Omit<ProjectInsert, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error || !project) return { error: error?.message ?? 'Failed to create project' }

  // Insert initial project docs with template
  await supabase.from('project_docs').insert({
    project_id: project.id,
    content: generateProjectDocTemplate(project.name),
  })

  await logActivity(user.id, 'project', project.id, 'created')
  revalidatePath('/projects')
  return { data: project }
}

export async function updateProject(id: string, data: Partial<ProjectInsert>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: project, error } = await supabase
    .from('projects')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !project) return { error: error?.message ?? 'Failed to update project' }

  await logActivity(user.id, 'project', id, 'updated')
  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { data: project }
}

export async function updateProjectStatus(id: string, status: ProjectStatusType) {
  return updateProject(id, { status })
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  await logActivity(user.id, 'project', id, 'deleted')
  revalidatePath('/projects')
  return { success: true }
}

export async function updateProjectDoc(projectId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Upsert project doc
  const { error } = await supabase
    .from('project_docs')
    .upsert({ project_id: projectId, content, updated_at: new Date().toISOString() }, {
      onConflict: 'project_id',
    })

  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateLessonsLearned(projectId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('lessons_learned')
    .upsert({ project_id: projectId, content, updated_at: new Date().toISOString() }, {
      onConflict: 'project_id',
    })

  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
