import type { Metadata } from 'next'
import { getPublicNotes } from '@/lib/actions/profile-actions'
import { BlogPostList } from '@/components/public/blog-post-list'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes, learnings, and thoughts on coding, AI/ML, and more.',
  openGraph: {
    title: 'Blog',
    description: 'Notes, learnings, and thoughts on coding, AI/ML, and more.',
    type: 'website',
  },
}

export default async function BlogPage() {
  const notes = await getPublicNotes()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="text-muted-foreground text-sm">
          {notes.length} post{notes.length !== 1 ? 's' : ''}
        </p>
      </header>
      <BlogPostList notes={notes} />
    </div>
  )
}
