'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activity-actions'
import { addDays } from '@/lib/review/spaced-repetition'
import type { NoteInsert, NoteFilters, NoteWithReview } from '@/types/index'

export async function getNotes(filters: NoteFilters = {}): Promise<{ notes: NoteWithReview[]; total: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notes: [], total: 0 }

  const { search, topic, tags, visibility, page = 1, pageSize = 20 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('notes')
    .select('*, review_schedule(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }
  if (topic) {
    query = query.eq('topic', topic)
  }
  if (visibility) {
    query = query.eq('visibility', visibility)
  }
  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  const notes = (data ?? []).map((n) => ({
    ...n,
    review_schedule: Array.isArray(n.review_schedule) ? (n.review_schedule[0] ?? null) : n.review_schedule,
  })) as NoteWithReview[]

  return { notes, total: count ?? 0 }
}

export async function getNote(id: string): Promise<NoteWithReview | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notes')
    .select('*, review_schedule(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return null

  return {
    ...data,
    review_schedule: Array.isArray(data.review_schedule) ? (data.review_schedule[0] ?? null) : data.review_schedule,
  } as NoteWithReview
}

export async function createNote(data: NoteInsert): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: note, error } = await supabase
    .from('notes')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  // Create initial review schedule — next review tomorrow
  await supabase.from('review_schedule').insert({
    note_id: note.id,
    user_id: user.id,
    next_review: addDays(1),
    level: 0,
  })

  await logActivity(user.id, 'note', note.id, 'created')
  revalidatePath('/learning/notes')
  return { id: note.id }
}

export async function updateNote(id: string, data: Partial<NoteInsert>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  await logActivity(user.id, 'note', id, 'updated')
  revalidatePath('/learning/notes')
  revalidatePath(`/learning/notes/${id}`)
  return {}
}

export async function deleteNote(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/learning/notes')
  return {}
}
