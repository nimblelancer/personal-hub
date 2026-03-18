import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { ArrowRight, Github, Linkedin, Globe, Twitter, Mail } from 'lucide-react'
import type { Profile } from '@/types/index'
import type { Json } from '@/types/database'

type ContactJson = {
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
  email?: string
}

function parseContact(contact: Json): ContactJson {
  if (typeof contact === 'object' && contact !== null && !Array.isArray(contact)) {
    return contact as ContactJson
  }
  return {}
}

const SOCIAL_ICONS: Array<{ key: string; icon: React.ElementType; label: string; isEmail?: boolean }> = [
  { key: 'github', icon: Github, label: 'GitHub' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'website', icon: Globe, label: 'Website' },
  { key: 'email', icon: Mail, label: 'Email', isEmail: true },
] as const

export function AboutSection({ profile }: { profile: Profile }) {
  const contact = parseContact(profile.contact_json)

  return (
    <section className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar */}
        {profile.avatar_url ? (
          <div className="shrink-0">
            <Image
              src={profile.avatar_url}
              alt={profile.display_name ?? 'Profile photo'}
              width={80}
              height={80}
              className="rounded-full object-cover w-20 h-20"
            />
          </div>
        ) : (
          <div className="shrink-0 w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground">
            {profile.display_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
        )}

        {/* Name + bio */}
        <div className="space-y-3 flex-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {profile.display_name ?? 'Developer'}
            </h1>
          </div>

          {profile.bio && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {profile.bio}
              </ReactMarkdown>
            </div>
          )}

          {/* Social links */}
          <div className="flex items-center gap-3 flex-wrap">
            {SOCIAL_ICONS.map(({ key, icon: Icon, label, isEmail }) => {
              const value = contact[key as keyof ContactJson]
              if (!value) return null
              const href = isEmail ? `mailto:${value}` : value
              return (
                <Link
                  key={key}
                  href={href}
                  target={isEmail ? undefined : '_blank'}
                  rel={isEmail ? undefined : 'noopener noreferrer'}
                  aria-label={label}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View Projects <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Read Blog
        </Link>
        <Link
          href="/resume"
          className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Resume
        </Link>
      </div>
    </section>
  )
}
