import { z } from 'zod'

export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  content: z.string().default(''),
  topic: z.enum(['ai-ml', 'coding', 'english', 'japanese', 'other']).default('other'),
  visibility: z.enum(['private', 'public']).default('private'),
  tags: z.array(z.string()).optional(),
})

export const UpdateNoteSchema = z.object({
  title: z.string().min(1, 'Title required').max(255).optional(),
  content: z.string().optional(),
  topic: z.enum(['ai-ml', 'coding', 'english', 'japanese', 'other']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>
