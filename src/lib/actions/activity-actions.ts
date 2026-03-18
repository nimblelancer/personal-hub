'use server'
import { createClient } from '@/lib/supabase/server'
import type { EntityType } from '@/types/database'

export async function logActivity(
  userId: string,
  entityType: EntityType,
  entityId: string,
  action: string
) {
  const supabase = await createClient()
  await supabase.from('activity_log').insert({
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    action,
  })
}
