import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BlogPostContent } from '@/components/public/blog-post-content'
import type { Note } from '@/types/index'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPublicNote(id: string): Promise<Note | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('visibility', 'public')
    .single()

  if (error || !data) return null
  return data as Note
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const note = await getPublicNote(id)
  if (!note) return { title: 'Post Not Found' }

  const preview = note.content.slice(0, 160).replace(/[#*`_]/g, '')
  return {
    title: note.title,
    description: preview,
    openGraph: {
      title: note.title,
      description: preview,
      type: 'article',
      publishedTime: note.created_at,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params
  const note = await getPublicNote(id)

  if (!note) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <BlogPostContent note={note} />
    </div>
  )
}
