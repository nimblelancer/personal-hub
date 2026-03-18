'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activity-actions'
import { CreateBookmarkSchema, UpdateBookmarkSchema } from '@/lib/validations/bookmark-schemas'
import type { Bookmark, BookmarkInsert } from '@/types/index'
import type { BookmarkStatusType } from '@/types/database'

type BookmarkFilters = {
  search?: string
  status?: BookmarkStatusType
  tags?: string[]
}

export async function getBookmarks(filters: BookmarkFilters = {}): Promise<Bookmark[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,url.ilike.%${filters.search}%`)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function createBookmark(data: BookmarkInsert): Promise<{ error?: string; id?: string }> {
  const parsed = CreateBookmarkSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) return { error: error.message }

    await logActivity(user.id, 'bookmark', bookmark.id, 'created')
    revalidatePath('/admin/learning/bookmarks')
    return { id: bookmark.id }
  } catch {
    return { error: 'Failed to create bookmark' }
  }
}

export async function updateBookmark(
  id: string,
  data: Partial<BookmarkInsert>
): Promise<{ error?: string }> {
  const parsed = UpdateBookmarkSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('bookmarks')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/admin/learning/bookmarks')
    return {}
  } catch {
    return { error: 'Failed to update bookmark' }
  }
}

export async function deleteBookmark(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/admin/learning/bookmarks')
    return {}
  } catch {
    return { error: 'Failed to delete bookmark' }
  }
}
