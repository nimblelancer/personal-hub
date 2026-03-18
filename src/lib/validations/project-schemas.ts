import { z } from 'zod'

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  description: z.string().optional(),
  type: z.enum(['software', 'learning', 'content', 'personal']).default('software'),
  status: z.enum(['idea', 'planning', 'in_progress', 'paused', 'completed', 'archived']).default('idea'),
  visibility: z.enum(['private', 'public']).default('private'),
  repo_url: z.string().url().optional().or(z.literal('')),
  live_url: z.string().url().optional().or(z.literal('')),
  tech_stack: z.array(z.string()).optional(),
  cover_image_url: z.string().optional().nullable(),
})

export const UpdateProjectSchema = CreateProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
