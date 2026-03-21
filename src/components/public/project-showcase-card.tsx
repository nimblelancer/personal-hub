'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types/index'

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  paused: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  planning: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  idea: 'bg-muted text-muted-foreground border-border',
  archived: 'bg-muted text-muted-foreground border-border',
}

const GRADIENT_PLACEHOLDERS = [
  'from-[oklch(0.60_0.18_165/0.3)] to-[oklch(0.65_0.16_200/0.2)]',
  'from-[oklch(0.60_0.18_165/0.25)] to-[oklch(0.55_0.20_280/0.2)]',
  'from-[oklch(0.65_0.16_200/0.3)] to-[oklch(0.60_0.18_165/0.2)]',
  'from-[oklch(0.55_0.20_280/0.2)] to-[oklch(0.65_0.16_200/0.25)]',
  'from-[oklch(0.60_0.18_165/0.2)] to-[oklch(0.65_0.16_200/0.3)]',
]

function gradientForId(id: string) {
  const idx = id.charCodeAt(0) % GRADIENT_PLACEHOLDERS.length
  return GRADIENT_PLACEHOLDERS[idx]
}

export function ProjectShowcaseCard({ project }: { project: Project }) {
  const statusClass = STATUS_COLORS[project.status] ?? STATUS_COLORS.idea
  const cardRef = useRef<HTMLAnchorElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rx = ((y - cy) / cy) * -6  // max ±6deg
    const ry = ((x - cx) / cx) * 6
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  return (
    <Link
      ref={cardRef}
      href={`/projects/${project.id}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'oklch(0.60 0.18 165 / 0.3)'
        el.style.boxShadow = '0 8px 32px oklch(0.60 0.18 165 / 0.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'oklch(1 0 0 / 0.1)'
        el.style.boxShadow = '0 0 0 0 transparent'
        handleMouseLeave()
      }}
      className="group flex flex-col rounded-xl border bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-300 ease-out"
      style={{
        borderColor: 'oklch(1 0 0 / 0.1)',
        boxShadow: '0 0 0 0 transparent',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientForId(project.id)}`} />
        )}
        {/* Status badge overlay — glass pill */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${statusClass}`}
        >
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-semibold text-sm leading-snug group-hover:text-foreground transition-colors">
          {project.name}
        </h3>
        {project.one_liner && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {project.one_liner}
          </p>
        )}
        {/* Tech stack badges with accent muted style */}
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md border px-1.5 py-0 text-xs font-medium"
                style={{
                  background: 'oklch(0.60 0.18 165 / 0.1)',
                  borderColor: 'oklch(0.60 0.18 165 / 0.3)',
                  color: 'oklch(0.60 0.18 165)',
                }}
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{project.tech_stack.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
