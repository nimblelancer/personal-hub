import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProjectListView } from '@/components/admin/projects/project-list-view'
import { ProjectFilters } from '@/components/admin/projects/project-filters'
import { buttonVariants } from '@/components/ui/button-variants'
import type { Project } from '@/types'

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string; visibility?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  const allProjects = (projects ?? []) as Project[]

  // Apply filters from URL search params
  const params = await searchParams
  const search = params.search?.toLowerCase() ?? ''
  const typeFilter = params.type ?? ''
  const statusFilter = params.status ?? ''
  const visibilityFilter = params.visibility ?? ''

  const filtered = allProjects.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search) && !p.one_liner?.toLowerCase().includes(search)) return false
    if (typeFilter && p.type !== typeFilter) return false
    if (statusFilter && p.status !== statusFilter) return false
    if (visibilityFilter && p.visibility !== visibilityFilter) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Link href="/admin/projects/new" className={buttonVariants({ size: 'sm' })}>
          New Project
        </Link>
      </div>
      <Suspense>
        <ProjectFilters />
      </Suspense>
      <ProjectListView projects={filtered} />
    </div>
  )
}
