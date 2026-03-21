// Server Component — lists in_progress projects with next pending milestone
import Link from 'next/link'
import { Folder, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActiveProject } from '@/lib/actions/dashboard-actions'

const TYPE_COLORS: Record<string, string> = {
  software: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  learning: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  content: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  personal: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

interface ActiveProjectsWidgetProps {
  projects: ActiveProject[]
}

export function ActiveProjectsWidget({ projects }: ActiveProjectsWidgetProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border dark:border-white/10 hover:border-[oklch(0.60_0.18_165_/_0.3)] hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: 'oklch(0.60 0.18 165 / 0.15)', color: 'oklch(0.60 0.18 165)' }}
          >
            <Folder className="size-4" />
          </div>
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No active projects.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="flex items-start justify-between gap-2 rounded-md p-1.5 hover:bg-muted transition-colors group"
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate group-hover:underline">
                        {project.name}
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs ${TYPE_COLORS[project.type] ?? TYPE_COLORS.personal}`}
                      >
                        {project.type}
                      </span>
                    </div>
                    {project.nextMilestone && (
                      <p className="text-xs text-muted-foreground truncate">
                        Next: {project.nextMilestone.title}
                        {project.nextMilestone.deadline && (
                          <span className="ml-1">
                            · {new Date(project.nextMilestone.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
          style={{ color: 'oklch(0.60 0.18 165)' }}
        >
          View All Projects →
        </Link>
      </CardContent>
    </Card>
  )
}
