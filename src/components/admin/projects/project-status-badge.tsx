// Shared status/type badge utilities for project components
import { Badge } from '@/components/ui/badge'
import type { ProjectStatusType, ProjectTypeType } from '@/types/database'

const STATUS_STYLES: Record<ProjectStatusType, string> = {
  idea: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  paused: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const STATUS_LABELS: Record<ProjectStatusType, string> = {
  idea: 'Idea',
  planning: 'Planning',
  in_progress: 'In Progress',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

const TYPE_LABELS: Record<ProjectTypeType, string> = {
  software: 'Software',
  learning: 'Learning',
  content: 'Content',
  personal: 'Personal',
}

export function StatusBadge({ status }: { status: ProjectStatusType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export function TypeBadge({ type }: { type: ProjectTypeType }) {
  return (
    <Badge variant="outline" className="text-xs">
      {TYPE_LABELS[type]}
    </Badge>
  )
}

export { STATUS_LABELS, TYPE_LABELS }
