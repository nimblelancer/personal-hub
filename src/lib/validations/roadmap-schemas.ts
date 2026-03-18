import { z } from 'zod'

export const CreateRoadmapSchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  description: z.string().optional(),
  topic: z.enum(['ai-ml', 'coding', 'english', 'japanese', 'other']).optional(),
})

export const UpdateRoadmapSchema = CreateRoadmapSchema.partial()

export const CreateRoadmapNodeSchema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  description: z.string().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  status: z.enum(['not_started', 'in_progress', 'learned', 'mastered']).optional(),
})

export const UpdateRoadmapNodeSchema = CreateRoadmapNodeSchema.partial()

export const MilestoneSchema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  description: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  sort_order: z.number().int().optional(),
})

export const UpdateMilestoneSchema = MilestoneSchema.partial()

export type CreateRoadmapInput = z.infer<typeof CreateRoadmapSchema>
export type UpdateRoadmapInput = z.infer<typeof UpdateRoadmapSchema>
export type CreateRoadmapNodeInput = z.infer<typeof CreateRoadmapNodeSchema>
export type UpdateRoadmapNodeInput = z.infer<typeof UpdateRoadmapNodeSchema>
export type MilestoneInput = z.infer<typeof MilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>
