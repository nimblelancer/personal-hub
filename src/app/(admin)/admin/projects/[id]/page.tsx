import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/lib/actions/project-actions'
import { getLinkedEntities } from '@/lib/actions/entity-link-actions'
import { ProjectDetailTabs } from '@/components/admin/projects/project-detail-tabs'
import { StatusBadge } from '@/components/admin/projects/project-status-badge'
import { DeleteProjectButton } from '@/components/admin/projects/delete-project-button'
import { EntityLinkButton } from '@/components/shared/entity-link-button'
import { LinkedEntitiesList } from '@/components/shared/linked-entities-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const [project, linkedEntities] = await Promise.all([
    getProject(id),
    getLinkedEntities('project', id),
  ])

  if (!project) notFound()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin/projects" className="hover:text-foreground transition-colors">
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
          <EntityLinkButton entityType="project" entityId={id} />
          <Link
            href={`/admin/projects/${id}/edit`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted transition-colors"
          >
            Edit
          </Link>
          <DeleteProjectButton projectId={id} />
        </div>
      </div>

      {/* Linked entities */}
      {linkedEntities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Linked Items</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkedEntitiesList links={linkedEntities} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <ProjectDetailTabs project={project} />
    </div>
  )
}
