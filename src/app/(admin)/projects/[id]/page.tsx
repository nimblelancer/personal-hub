import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/lib/actions/project-actions'
import { ProjectDetailTabs } from '@/components/admin/projects/project-detail-tabs'
import { StatusBadge } from '@/components/admin/projects/project-status-badge'
import { DeleteProjectButton } from '@/components/admin/projects/delete-project-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) notFound()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{project.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <StatusBadge status={project.status} />
            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {project.visibility}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${id}/edit`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted transition-colors"
          >
            Edit
          </Link>
          <DeleteProjectButton projectId={id} />
        </div>
      </div>

      {/* Tabs */}
      <ProjectDetailTabs project={project} />
    </div>
  )
}
