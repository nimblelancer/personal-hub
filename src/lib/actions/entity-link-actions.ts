'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import type { EntityType, Database } from '@/types/database'

// Supabase server client type (return type of createClient)
type SupabaseClient = Awaited<ReturnType<typeof createServerClient<Database>>>

export type LinkedEntity = {
  linkId: string
  type: EntityType
  id: string
  title: string
}

export type SearchResult = {
  type: EntityType
  id: string
  title: string
}

export async function createEntityLink(
  aType: EntityType,
  aId: string,
  bType: EntityType,
  bId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check for existing link in either direction
  const { data: existing } = await supabase
    .from('entity_links')
    .select('id')
    .or(
      `and(entity_a_type.eq.${aType},entity_a_id.eq.${aId},entity_b_type.eq.${bType},entity_b_id.eq.${bId}),` +
      `and(entity_a_type.eq.${bType},entity_a_id.eq.${bId},entity_b_type.eq.${aType},entity_b_id.eq.${aId})`
    )
    .maybeSingle()

  if (existing) return { error: 'Link already exists' }

  const { error } = await supabase.from('entity_links').insert({
    entity_a_type: aType,
    entity_a_id: aId,
    entity_b_type: bType,
    entity_b_id: bId,
  })

  if (error) return { error: error.message }

  revalidatePath(`/admin/learning/notes/${aId}`)
  revalidatePath(`/admin/learning/notes/${bId}`)
  revalidatePath(`/admin/projects/${aId}`)
  revalidatePath(`/admin/projects/${bId}`)
  return {}
}

export async function deleteEntityLink(linkId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('entity_links')
    .delete()
    .eq('id', linkId)

  if (error) return { error: error.message }

  revalidatePath('/admin/learning/notes')
  revalidatePath('/admin/projects')
  return {}
}

export async function getLinkedEntities(
  entityType: EntityType,
  entityId: string
): Promise<LinkedEntity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('entity_links')
    .select('*')
    .or(
      `and(entity_a_type.eq.${entityType},entity_a_id.eq.${entityId}),` +
      `and(entity_b_type.eq.${entityType},entity_b_id.eq.${entityId})`
    )

  if (error || !data) return []

  // Resolve titles for each linked entity
  const results: LinkedEntity[] = []
  for (const link of data) {
    const isA = link.entity_a_type === entityType && link.entity_a_id === entityId
    const linkedType = isA ? link.entity_b_type : link.entity_a_type
    const linkedId = isA ? link.entity_b_id : link.entity_a_id

    const title = await resolveEntityTitle(supabase, linkedType, linkedId)
    if (title) {
      results.push({ linkId: link.id, type: linkedType, id: linkedId, title })
    }
  }

  return results
}

async function resolveEntityTitle(supabase: SupabaseClient, type: EntityType, id: string): Promise<string | null> {
  if (type === 'note') {
    const { data } = await supabase.from('notes').select('title').eq('id', id).single()
    return data?.title ?? null
  }
  if (type === 'project') {
    const { data } = await supabase.from('projects').select('name').eq('id', id).single()
    return data?.name ?? null
  }
  if (type === 'bookmark') {
    const { data } = await supabase.from('bookmarks').select('title').eq('id', id).single()
    return data?.title ?? null
  }
  return null
}

export async function searchEntities(
  query: string,
  excludeType?: EntityType,
  excludeId?: string
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const q = `%${query}%`

  const [notesRes, projectsRes, bookmarksRes] = await Promise.all([
    supabase
      .from('notes')
      .select('id, title')
      .eq('user_id', user.id)
      .ilike('title', q)
      .limit(5),
    supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', q)
      .limit(5),
    supabase
      .from('bookmarks')
      .select('id, title')
      .eq('user_id', user.id)
      .ilike('title', q)
      .limit(5),
  ])

  const results: SearchResult[] = []

  for (const note of notesRes.data ?? []) {
    if (excludeType === 'note' && excludeId === note.id) continue
    results.push({ type: 'note', id: note.id, title: note.title })
  }
  for (const project of projectsRes.data ?? []) {
    if (excludeType === 'project' && excludeId === project.id) continue
    results.push({ type: 'project', id: project.id, title: project.name })
  }
  for (const bookmark of bookmarksRes.data ?? []) {
    if (excludeType === 'bookmark' && excludeId === bookmark.id) continue
    results.push({ type: 'bookmark', id: bookmark.id, title: bookmark.title })
  }

  return results
}
