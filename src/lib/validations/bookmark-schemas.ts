import { z } from 'zod'

export const CreateBookmarkSchema = z.object({
  url: z.string().url('Valid URL required'),
  title: z.string().min(1, 'Title required').max(255),
  description: z.string().optional().nullable(),
  status: z.enum(['saved', 'reading', 'done', 'noted']).default('saved'),
  tags: z.array(z.string()).optional(),
})

export const UpdateBookmarkSchema = CreateBookmarkSchema.partial()

export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>
export type UpdateBookmarkInput = z.infer<typeof UpdateBookmarkSchema>
