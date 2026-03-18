import { ProjectShowcaseCard } from './project-showcase-card'
import type { Project } from '@/types/index'

export function ProjectShowcaseGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectShowcaseCard key={project.id} project={project} />
      ))}
    </div>
  )
}
