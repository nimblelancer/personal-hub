import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  display_name: z.string().max(255).optional().nullable(),
  bio: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  contact_json: z.unknown().optional(),
  resume_content: z.string().optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
