'use server'
// NOTE: The 'project-images' Supabase storage bucket must be created manually
// in the Supabase dashboard with public access enabled before using these actions.
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

export async function uploadProjectImage(
  projectId: string,
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'No file provided' }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: 'File too large. Maximum size is 2MB' }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}.${ext}`
  const path = `${projectId}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from('project-images')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage
    .from('project-images')
    .getPublicUrl(path)

  return { url: urlData.publicUrl }
}

export async function deleteProjectImage(path: string): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Validate ownership: path format is {projectId}/{filename}
  const projectId = path.split('/')[0]
  if (!projectId) return { error: 'Invalid path' }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return { error: 'Unauthorized' }

  const { error } = await supabase.storage
    .from('project-images')
    .remove([path])

  if (error) return { error: error.message }
  return { success: true }
}
