'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Project, Note } from '@/types/index'
import type { Json } from '@/types/database'

// Public — no auth required (anon key + RLS allows reading profiles)
export async function getPublicProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single()

  if (error) return null
  return data as Profile
}

// Public — fetch projects where visibility = 'public'
export async function getPublicProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('visibility', 'public')
    .order('updated_at', { ascending: false })

  if (error) return []
  return data as Project[]
}

// Public — fetch notes where visibility = 'public'
export async function getPublicNotes(): Promise<Note[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Note[]
}

// Auth-required — update profile
export async function updateProfile(data: {
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  contact_json?: Json
  resume_content?: string | null
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/resume')
  revalidatePath('/admin/settings')
  return {}
}
