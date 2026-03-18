import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectDetailView } from '@/components/public/project-detail-view'
import type { Project, ProjectDoc } from '@/types/index'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPublicProject(id: string): Promise<{ project: Project; docs: ProjectDoc | null } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_docs(*)')
    .eq('id', id)
    .eq('visibility', 'public')
    .single()

  if (error || !data) return null

  const raw = data as Record<string, unknown>
  const docs = Array.isArray(raw.project_docs)
    ? (raw.project_docs[0] ?? null)
    : (raw.project_docs ?? null)

  return { project: data as Project, docs: docs as ProjectDoc | null }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getPublicProject(id)
  if (!result) return { title: 'Project Not Found' }

  const { project } = result
  return {
    title: project.name,
    description: project.one_liner ?? `Project: ${project.name}`,
    openGraph: {
      title: project.name,
      description: project.one_liner ?? `Project: ${project.name}`,
      type: 'article',
    },
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getPublicProject(id)

  if (!result) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <ProjectDetailView project={result.project} docs={result.docs} />
    </div>
  )
}
