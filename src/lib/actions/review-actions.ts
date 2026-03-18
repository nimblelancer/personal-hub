'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activity-actions'
import { calculateNextReview, addDays } from '@/lib/review/spaced-repetition'
import type { NoteWithReview, ReviewRating } from '@/types/index'

export async function getReviewQueue(): Promise<NoteWithReview[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('review_schedule')
    .select('*, notes(*)')
    .eq('user_id', user.id)
    .lte('next_review', today)
    .order('next_review', { ascending: true })

  if (error) return []

  return (data ?? []).map((rs) => {
    const note = Array.isArray(rs.notes) ? rs.notes[0] : rs.notes
    return {
      ...note,
      review_schedule: {
        id: rs.id,
        note_id: rs.note_id,
        user_id: rs.user_id,
        next_review: rs.next_review,
        level: rs.level,
        last_reviewed: rs.last_reviewed,
        created_at: rs.created_at,
      },
    } as NoteWithReview
  })
}

export async function submitReview(
  scheduleId: string,
  noteId: string,
  rating: ReviewRating
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch current level
    const { data: schedule, error: fetchError } = await supabase
      .from('review_schedule')
      .select('level')
      .eq('id', scheduleId)
      .single()

    if (fetchError) return { error: fetchError.message }

    const { newLevel, nextReviewDays } = calculateNextReview(schedule.level, rating)

    const { error } = await supabase
      .from('review_schedule')
      .update({
        level: newLevel,
        next_review: addDays(nextReviewDays),
        last_reviewed: new Date().toISOString().split('T')[0],
      })
      .eq('id', scheduleId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }

    await logActivity(user.id, 'note', noteId, `review:${rating}`)
    revalidatePath('/admin/learning/review')
    return {}
  } catch {
    return { error: 'Failed to submit review' }
  }
}
