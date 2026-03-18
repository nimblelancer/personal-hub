import type { Metadata } from 'next'
import { getPublicProjects } from '@/lib/actions/profile-actions'
import { ProjectShowcaseGrid } from '@/components/public/project-showcase-grid'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A showcase of my public projects — side projects, experiments, and shipped work.',
  openGraph: {
    title: 'Projects',
    description: 'A showcase of my public projects.',
    type: 'website',
  },
}

export default async function ProjectsPage() {
  const projects = await getPublicProjects()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-sm">
          {projects.length} public project{projects.length !== 1 ? 's' : ''}
        </p>
      </header>
      <ProjectShowcaseGrid projects={projects} />
    </div>
  )
}
