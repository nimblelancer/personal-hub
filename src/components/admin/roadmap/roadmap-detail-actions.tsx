'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteRoadmap } from '@/lib/actions/roadmap-actions'
import { RoadmapForm } from './roadmap-form'
import type { Roadmap } from '@/types/index'

type Props = {
  roadmap: Roadmap
}

export function RoadmapDetailActions({ roadmap }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    startTransition(async () => {
      const result = await deleteRoadmap(roadmap.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Roadmap deleted')
        router.push('/admin/learning/roadmap')
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors shrink-0">
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4 mr-2" />
            Edit Roadmap
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isPending}
            className={confirmDelete ? 'text-destructive focus:text-destructive' : ''}
          >
            <Trash2 className="size-4 mr-2" />
            {confirmDelete ? 'Confirm Delete' : 'Delete Roadmap'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Roadmap</DialogTitle>
          </DialogHeader>
          <RoadmapForm
            initialData={roadmap}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
