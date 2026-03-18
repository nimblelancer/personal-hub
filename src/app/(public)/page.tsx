import type { Metadata } from 'next'
import { getPublicProfile, getPublicProjects, getPublicNotes } from '@/lib/actions/profile-actions'
import { AboutSection } from '@/components/public/about-section'
import { ProjectShowcaseCard } from '@/components/public/project-showcase-card'
import { BlogPostCard } from '@/components/public/blog-post-card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getPublicProfile()
  const name = profile?.display_name ?? 'Portfolio'
  const bio = profile?.bio?.slice(0, 160) ?? 'Personal portfolio and blog.'

  return {
    title: name,
    description: bio,
    openGraph: {
      title: name,
      description: bio,
      type: 'website',
    },
  }
}

export default async function PublicHomePage() {
  const [profile, projects, notes] = await Promise.all([
    getPublicProfile(),
    getPublicProjects(),
    getPublicNotes(),
  ])

  const featuredProjects = projects.slice(0, 3)
  const recentPosts = notes.slice(0, 3)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 space-y-20">
      {/* About / Hero */}
      {profile && <AboutSection profile={profile} />}

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Featured Projects</h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All projects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectShowcaseCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Recent blog posts */}
      {recentPosts.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Posts</h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All posts <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentPosts.map((note) => (
              <BlogPostCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
