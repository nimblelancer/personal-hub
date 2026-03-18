'use server'
import { createClient } from '@/lib/supabase/server'

export type ReviewDueNote = {
  noteId: string
  title: string
  daysOverdue: number
  nextReview: string
}

export type ActiveProject = {
  id: string
  name: string
  type: string
  status: string
  nextMilestone: { title: string; deadline: string | null } | null
}

export type ActivityEntry = {
  id: string
  entityType: string
  entityId: string
  action: string
  createdAt: string
  entityTitle: string | null
}

export async function getReviewDueCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { count } = await supabase
    .from('review_schedule')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review', today)

  return count ?? 0
}

export async function getReviewDuePreview(
  userId: string,
  limit = 5
): Promise<ReviewDueNote[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('review_schedule')
    .select('id, note_id, next_review, notes(title)')
    .eq('user_id', userId)
    .lte('next_review', today)
    .order('next_review', { ascending: true })
    .limit(limit)

  if (!data) return []

  const todayMs = new Date(today).getTime()
  return data.map((row) => {
    const raw = row as Record<string, unknown>
    const notes = raw.notes as { title: string } | null
    const nextReview = row.next_review
    const daysOverdue = Math.floor(
      (todayMs - new Date(nextReview).getTime()) / 86_400_000
    )
    return {
      noteId: row.note_id,
      title: notes?.title ?? 'Untitled',
      daysOverdue,
      nextReview,
    }
  })
}

export async function getActiveProjects(userId: string): Promise<ActiveProject[]> {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, type, status')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })
    .limit(5)

  if (!projects || projects.length === 0) return []

  const projectIds = projects.map((p) => p.id)

  const { data: milestones } = await supabase
    .from('project_milestones')
    .select('project_id, title, deadline, sort_order')
    .in('project_id', projectIds)
    .eq('status', 'pending')
    .order('sort_order', { ascending: true })

  const milestoneMap: Record<string, { title: string; deadline: string | null }> = {}
  for (const m of milestones ?? []) {
    if (!milestoneMap[m.project_id]) {
      milestoneMap[m.project_id] = { title: m.title, deadline: m.deadline }
    }
  }

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    status: p.status,
    nextMilestone: milestoneMap[p.id] ?? null,
  }))
}

export async function getRecentActivity(
  userId: string,
  limit = 20
): Promise<ActivityEntry[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('activity_log')
    .select('id, entity_type, entity_id, action, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!data) return []

  // Batch-fetch entity titles in parallel — one query per type, no per-item N+1
  const noteIds = data.filter((r) => r.entity_type === 'note').map((r) => r.entity_id)
  const projectIds = data.filter((r) => r.entity_type === 'project').map((r) => r.entity_id)
  const bookmarkIds = data.filter((r) => r.entity_type === 'bookmark').map((r) => r.entity_id)

  const [notesRes, projectsRes, bookmarksRes] = await Promise.all([
    noteIds.length > 0
      ? supabase.from('notes').select('id, title').in('id', noteIds)
      : Promise.resolve({ data: [] }),
    projectIds.length > 0
      ? supabase.from('projects').select('id, name').in('id', projectIds)
      : Promise.resolve({ data: [] }),
    bookmarkIds.length > 0
      ? supabase.from('bookmarks').select('id, title').in('id', bookmarkIds)
      : Promise.resolve({ data: [] }),
  ])

  const titleMap: Record<string, string> = {}
  for (const n of notesRes.data ?? []) titleMap[n.id] = n.title
  for (const p of (projectsRes.data ?? []) as { id: string; name: string }[]) titleMap[p.id] = p.name
  for (const b of bookmarksRes.data ?? []) titleMap[b.id] = b.title

  return data.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    createdAt: row.created_at,
    entityTitle: titleMap[row.entity_id] ?? null,
  }))
}
