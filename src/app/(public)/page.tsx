import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, FolderKanban, Layers } from 'lucide-react'

const sections = [
  {
    icon: BookOpen,
    label: 'Learning',
    description: 'Notes, spaced repetition, and curated bookmarks to build lasting knowledge.',
  },
  {
    icon: FolderKanban,
    label: 'Projects',
    description: 'Tracking side projects, experiments, and work in progress.',
  },
  {
    icon: Layers,
    label: 'Portfolio',
    description: 'A curated view of completed work and shipped things.',
  },
]

export default function PublicHomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 space-y-20">
      {/* Hero */}
      <section className="space-y-6 text-center">
        <Badge variant="secondary" className="text-xs">Personal Hub</Badge>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          A place for learning,<br className="hidden sm:block" /> building, and sharing.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          My personal productivity system — where I capture knowledge, track projects,
          and build in public.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/projects" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            View Projects <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/blog" className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Read Blog
          </Link>
        </div>
      </section>

      {/* About sections */}
      <section className="grid gap-6 sm:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-base">{s.label}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}
