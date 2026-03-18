'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/lib/actions/project-actions'

interface DeleteProjectButtonProps {
  projectId: string
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this project? This action cannot be undone.')) return
    startTransition(async () => {
      await deleteProject(projectId)
      router.push('/projects')
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex h-8 items-center rounded-lg px-3 text-sm text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
