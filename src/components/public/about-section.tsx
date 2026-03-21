'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { ArrowRight, Github, Linkedin, Globe, Twitter, Mail } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
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

// Stagger animation variants
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// Base bento cell style
const CELL = 'rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4'

export function AboutSection({
  profile,
  projectCount,
  postCount,
}: {
  profile: Profile
  projectCount?: number
  postCount?: number
}) {
  const contact = parseContact(profile.contact_json)
  const availableSocials = SOCIAL_ICONS.filter(({ key }) => !!contact[key as keyof ContactJson])

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      {/* Bento grid: 3-col desktop, single-col mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-auto">

        {/* Cell 1: Avatar + social links (col 1, rows 1-2) */}
        <motion.div
          variants={itemVariants}
          className={`${CELL} flex flex-col items-center gap-4 sm:row-span-2 justify-center`}
        >
          {/* Avatar */}
          {profile.avatar_url ? (
            <div className="relative shrink-0">
              <Image
                src={profile.avatar_url}
                alt={profile.display_name ?? 'Profile photo'}
                width={96}
                height={96}
                className="rounded-full object-cover w-24 h-24 ring-2 ring-offset-2 ring-offset-card"
                style={{ '--tw-ring-color': 'oklch(0.60 0.18 165 / 0.4)' } as React.CSSProperties}
              />
              <span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 0 2px oklch(0.60 0.18 165 / 0.4)' }}
              />
            </div>
          ) : (
            <div
              className="shrink-0 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold ring-2 ring-offset-2"
              style={{
                background: 'oklch(0.60 0.18 165 / 0.1)',
                color: 'oklch(0.60 0.18 165)',
                boxShadow: '0 0 0 2px oklch(0.60 0.18 165 / 0.4)',
              }}
            >
              {profile.display_name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}

          {/* Social icons */}
          {availableSocials.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {availableSocials.map(({ key, icon: Icon, label, isEmail }) => {
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
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-background/60 text-muted-foreground transition-all hover:scale-110"
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.color = 'oklch(0.60 0.18 165)'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.60 0.18 165 / 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.color = ''
                      ;(e.currentTarget as HTMLElement).style.borderColor = ''
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Cell 2: Name + title (col 2-3, row 1) */}
        <motion.div
          variants={itemVariants}
          className={`${CELL} sm:col-span-2`}
        >
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(to right, oklch(0.60 0.18 165), oklch(0.65 0.16 200))',
            }}
          >
            {profile.display_name ?? 'Developer'}
          </h1>
        </motion.div>

        {/* Cell 3a: Projects stat */}
        {projectCount !== undefined && (
          <motion.div variants={itemVariants} className={`${CELL} text-center`}>
            <div
              className="text-3xl font-bold"
              style={{ color: 'oklch(0.60 0.18 165)' }}
            >
              {projectCount}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Projects</div>
          </motion.div>
        )}

        {/* Cell 3b: Posts stat */}
        {postCount !== undefined && (
          <motion.div variants={itemVariants} className={`${CELL} text-center`}>
            <div
              className="text-3xl font-bold"
              style={{ color: 'oklch(0.65 0.16 200)' }}
            >
              {postCount}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Posts</div>
          </motion.div>
        )}

        {/* Cell 4: Bio + CTAs (spans 2-3 cols on desktop) */}
        <motion.div
          variants={itemVariants}
          className={`${CELL} ${projectCount !== undefined || postCount !== undefined ? 'sm:col-span-2' : 'sm:col-span-3'} space-y-4`}
        >
          {profile.bio && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {profile.bio}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ background: 'oklch(0.60 0.18 165)' }}
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
        </motion.div>

      </div>
    </motion.section>
  )
}
