import Link from 'next/link'
import { ProjectForm } from '@/components/admin/projects/project-form'

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-xl font-semibold">New Project</h1>
      </div>
      <ProjectForm />
    </div>
  )
}
