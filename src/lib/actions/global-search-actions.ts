'use server'

import { createClient } from '@/lib/supabase/server'

export type SearchResultItem = {
  id: string
  type: 'note' | 'bookmark' | 'project' | 'roadmap'
  title: string
  subtitle?: string
  href: string
}

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  if (query.length < 2) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const uid = user.id
  // Strip PostgREST filter special chars to prevent OR-clause injection
  const sanitized = query.replace(/[%_,.()"']/g, '')
  if (sanitized.length < 2) return []
  const pat = `%${sanitized}%`

  const [notesRes, bookmarksRes, projectsRes, roadmapsRes] = await Promise.all([
    supabase
      .from('notes')
      .select('id, title, topic')
      .eq('user_id', uid)
      .or(`title.ilike.${pat},content.ilike.${pat}`)
      .limit(5),
    supabase
      .from('bookmarks')
      .select('id, title, url')
      .eq('user_id', uid)
      .or(`title.ilike.${pat},url.ilike.${pat}`)
      .limit(5),
    supabase
      .from('projects')
      .select('id, name, one_liner')
      .eq('user_id', uid)
      .or(`name.ilike.${pat},one_liner.ilike.${pat}`)
      .limit(5),
    supabase
      .from('roadmaps')
      .select('id, name, description')
      .eq('user_id', uid)
      .or(`name.ilike.${pat},description.ilike.${pat}`)
      .limit(5),
  ])

  const results: SearchResultItem[] = []

  for (const note of notesRes.data ?? []) {
    results.push({
      id: note.id,
      type: 'note',
      title: note.title,
      subtitle: note.topic ?? undefined,
      href: `/admin/learning/notes/${note.id}`,
    })
  }

  for (const bm of bookmarksRes.data ?? []) {
    results.push({
      id: bm.id,
      type: 'bookmark',
      title: bm.title,
      subtitle: bm.url,
      href: `/admin/bookmarks`,
    })
  }

  for (const proj of projectsRes.data ?? []) {
    results.push({
      id: proj.id,
      type: 'project',
      title: proj.name,
      subtitle: proj.one_liner ?? undefined,
      href: `/admin/projects/${proj.id}`,
    })
  }

  for (const rm of roadmapsRes.data ?? []) {
    results.push({
      id: rm.id,
      type: 'roadmap',
      title: rm.name,
      subtitle: rm.description ?? undefined,
      href: `/admin/roadmaps/${rm.id}`,
    })
  }

  return results
}
