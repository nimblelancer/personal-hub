import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getNote } from '@/lib/actions/note-actions'
import { getLinkedEntities } from '@/lib/actions/entity-link-actions'
import { NoteDetail } from '@/components/admin/notes/note-detail'
import { EntityLinkButton } from '@/components/shared/entity-link-button'
import { LinkedEntitiesList } from '@/components/shared/linked-entities-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = { params: Promise<{ id: string }> }

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params
  const [note, linkedEntities] = await Promise.all([
    getNote(id),
    getLinkedEntities('note', id),
  ])
  if (!note) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/learning/notes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-3.5" /> Notes
        </Link>
        <EntityLinkButton entityType="note" entityId={id} />
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{note.title}</h1>
      </div>
      <NoteDetail note={note} linkedEntities={
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Linked Items</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkedEntitiesList links={linkedEntities} />
          </CardContent>
        </Card>
      } />
    </div>
  )
}
