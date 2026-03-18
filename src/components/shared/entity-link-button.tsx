'use client'
import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EntityLinkDialog } from './entity-link-dialog'
import type { EntityType } from '@/types/database'

interface EntityLinkButtonProps {
  entityType: EntityType
  entityId: string
}

export function EntityLinkButton({ entityType, entityId }: EntityLinkButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Link2 className="size-3.5" />
        Link to...
      </Button>
      <EntityLinkDialog
        open={open}
        onOpenChange={setOpen}
        entityType={entityType}
        entityId={entityId}
      />
    </>
  )
}
