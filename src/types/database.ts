export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type NoteTopicType = 'ai-ml' | 'coding' | 'english' | 'japanese' | 'other'
export type VisibilityType = 'private' | 'public'
export type BookmarkStatusType = 'saved' | 'reading' | 'done' | 'noted'
export type ProjectTypeType = 'software' | 'learning' | 'content' | 'personal'
export type ProjectStatusType = 'idea' | 'planning' | 'in_progress' | 'paused' | 'completed' | 'archived'
export type MilestoneStatusType = 'pending' | 'in_progress' | 'completed'
export type RoadmapNodeStatusType = 'not_started' | 'in_progress' | 'learned' | 'mastered'
export type EntityType = 'note' | 'project' | 'bookmark' | 'lesson' | 'roadmap_node'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          contact_json: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          contact_json?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          topic: NoteTopicType
          tags: string[]
          visibility: VisibilityType
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string
          topic?: NoteTopicType
          tags?: string[]
          visibility?: VisibilityType
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
      review_schedule: {
        Row: {
          id: string
          note_id: string
          user_id: string
          next_review: string
          level: number
          last_reviewed: string | null
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          next_review?: string
          level?: number
          last_reviewed?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['review_schedule']['Insert']>
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          description: string | null
          tags: string[]
          status: BookmarkStatusType
          note_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title: string
          description?: string | null
          tags?: string[]
          status?: BookmarkStatusType
          note_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          type: ProjectTypeType
          status: ProjectStatusType
          visibility: VisibilityType
          one_liner: string | null
          tech_stack: string[]
          topics: string[]
          github_url: string | null
          demo_url: string | null
          thumbnail_url: string | null
          started_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: ProjectTypeType
          status?: ProjectStatusType
          visibility?: VisibilityType
          one_liner?: string | null
          tech_stack?: string[]
          topics?: string[]
          github_url?: string | null
          demo_url?: string | null
          thumbnail_url?: string | null
          started_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      project_docs: {
        Row: { id: string; project_id: string; content: string; created_at: string; updated_at: string }
        Insert: { id?: string; project_id: string; content?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['project_docs']['Insert']>
      }
      project_milestones: {
        Row: { id: string; project_id: string; title: string; description: string | null; status: MilestoneStatusType; sort_order: number; deadline: string | null; completed_at: string | null; created_at: string }
        Insert: { id?: string; project_id: string; title: string; description?: string | null; status?: MilestoneStatusType; sort_order?: number; deadline?: string | null; completed_at?: string | null; created_at?: string }
        Update: Partial<Database['public']['Tables']['project_milestones']['Insert']>
      }
      lessons_learned: {
        Row: { id: string; project_id: string; content: string; created_at: string; updated_at: string }
        Insert: { id?: string; project_id: string; content?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['lessons_learned']['Insert']>
      }
      roadmaps: {
        Row: { id: string; user_id: string; name: string; description: string | null; topic: NoteTopicType; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; description?: string | null; topic?: NoteTopicType; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['roadmaps']['Insert']>
      }
      roadmap_nodes: {
        Row: { id: string; roadmap_id: string; parent_id: string | null; title: string; description: string | null; status: RoadmapNodeStatusType; sort_order: number; created_at: string }
        Insert: { id?: string; roadmap_id: string; parent_id?: string | null; title: string; description?: string | null; status?: RoadmapNodeStatusType; sort_order?: number; created_at?: string }
        Update: Partial<Database['public']['Tables']['roadmap_nodes']['Insert']>
      }
      entity_links: {
        Row: { id: string; entity_a_type: EntityType; entity_a_id: string; entity_b_type: EntityType; entity_b_id: string; created_at: string }
        Insert: { id?: string; entity_a_type: EntityType; entity_a_id: string; entity_b_type: EntityType; entity_b_id: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['entity_links']['Insert']>
      }
      activity_log: {
        Row: { id: string; user_id: string; entity_type: EntityType; entity_id: string; action: string; created_at: string }
        Insert: { id?: string; user_id: string; entity_type: EntityType; entity_id: string; action: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['activity_log']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      note_topic: NoteTopicType
      visibility_type: VisibilityType
      bookmark_status: BookmarkStatusType
      project_type: ProjectTypeType
      project_status: ProjectStatusType
      milestone_status: MilestoneStatusType
      roadmap_node_status: RoadmapNodeStatusType
      entity_type: EntityType
    }
  }
}
