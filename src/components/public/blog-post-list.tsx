import { BlogPostCard } from './blog-post-card'
import type { Note } from '@/types/index'

export function BlogPostList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-sm">No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.map((note) => (
        <BlogPostCard key={note.id} note={note} />
      ))}
    </div>
  )
}
