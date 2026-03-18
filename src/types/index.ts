import type { Database, NoteTopicType, VisibilityType } from './database'

export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type ReviewSchedule = Database['public']['Tables']['review_schedule']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert']

// Project types
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type Milestone = Database['public']['Tables']['project_milestones']['Row']
export type LessonsLearned = Database['public']['Tables']['lessons_learned']['Row']
export type ProjectDoc = Database['public']['Tables']['project_docs']['Row']

export type ProjectWithDetails = Project & {
  project_docs: ProjectDoc | null
  project_milestones: Milestone[]
  lessons_learned: LessonsLearned | null
}

// Note with its review schedule joined
export type NoteWithReview = Note & {
  review_schedule: ReviewSchedule | null
}

export type NoteFilters = {
  search?: string
  topic?: NoteTopicType
  tags?: string[]
  visibility?: VisibilityType
  page?: number
  pageSize?: number
}

export type ReviewRating = 'remember' | 'fuzzy' | 'forgot'
