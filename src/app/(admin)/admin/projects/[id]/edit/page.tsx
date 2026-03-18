import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/lib/actions/project-actions'
import { ProjectForm } from '@/components/admin/projects/project-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) notFound()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/projects/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {project.name}
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-xl font-semibold">Edit Project</h1>
      </div>
      <ProjectForm initialData={project} />
    </div>
  )
}
