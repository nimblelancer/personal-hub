'use client'
import { useState } from 'react'
import Link from 'next/link'
import { StatusBadge, TypeBadge } from './project-status-badge'
import type { Project } from '@/types'
import type { ProjectStatusType, ProjectTypeType } from '@/types/database'

type SortKey = 'name' | 'type' | 'status' | 'started_at' | 'updated_at'

interface ProjectListViewProps {
  projects: Project[]
}

interface SortHeaderProps {
  col: SortKey
  label: string
  active: boolean
  sortAsc: boolean
  onSort: (col: SortKey) => void
}

function SortHeader({ col, label, active, sortAsc, onSort }: SortHeaderProps) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      {label}{active ? (sortAsc ? ' ↑' : ' ↓') : ''}
    </th>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ProjectListView({ projects }: ProjectListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('updated_at')
  const [sortAsc, setSortAsc] = useState(false)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sorted = [...projects].sort((a, b) => {
    const aVal = a[sortKey] ?? ''
    const bVal = b[sortKey] ?? ''
    const cmp = String(aVal).localeCompare(String(bVal))
    return sortAsc ? cmp : -cmp
  })

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No projects found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <SortHeader col="name" label="Name" active={sortKey === 'name'} sortAsc={sortAsc} onSort={handleSort} />
            <SortHeader col="type" label="Type" active={sortKey === 'type'} sortAsc={sortAsc} onSort={handleSort} />
            <SortHeader col="status" label="Status" active={sortKey === 'status'} sortAsc={sortAsc} onSort={handleSort} />
            <SortHeader col="started_at" label="Started" active={sortKey === 'started_at'} sortAsc={sortAsc} onSort={handleSort} />
            <SortHeader col="updated_at" label="Updated" active={sortKey === 'updated_at'} sortAsc={sortAsc} onSort={handleSort} />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((project) => (
            <tr key={project.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-3 py-2.5">
                <Link
                  href={`/projects/${project.id}`}
                  className="font-medium hover:underline"
                >
                  {project.name}
                </Link>
                {project.one_liner && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                    {project.one_liner}
                  </p>
                )}
              </td>
              <td className="px-3 py-2.5">
                <TypeBadge type={project.type as ProjectTypeType} />
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={project.status as ProjectStatusType} />
              </td>
              <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                {formatDate(project.started_at)}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                {formatDate(project.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
