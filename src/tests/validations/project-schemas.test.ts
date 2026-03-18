import { describe, it, expect } from 'vitest'
import { CreateProjectSchema, UpdateProjectSchema } from '@/lib/validations/project-schemas'

describe('CreateProjectSchema', () => {
  it('accepts valid input with defaults', () => {
    const result = CreateProjectSchema.safeParse({ name: 'My Project' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('software')
      expect(result.data.status).toBe('idea')
      expect(result.data.visibility).toBe('private')
    }
  })

  it('accepts full valid input', () => {
    const result = CreateProjectSchema.safeParse({
      name: 'Personal Hub',
      description: 'A hub app',
      type: 'learning',
      status: 'in_progress',
      visibility: 'public',
      repo_url: 'https://github.com/user/repo',
      live_url: 'https://example.com',
      tech_stack: ['Next.js', 'Supabase'],
    })
    expect(result.success).toBe(true)
  })

  it('fails when name is missing', () => {
    const result = CreateProjectSchema.safeParse({ description: 'No name' })
    expect(result.success).toBe(false)
  })

  it('fails when name is empty string', () => {
    const result = CreateProjectSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('fails on invalid repo_url format', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Project', repo_url: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('accepts empty string for repo_url', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Project', repo_url: '' })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for live_url', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Project', live_url: '' })
    expect(result.success).toBe(true)
  })

  it('fails on invalid type enum', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Project', type: 'hobby' })
    expect(result.success).toBe(false)
  })

  it('fails on invalid status enum', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Project', status: 'done' })
    expect(result.success).toBe(false)
  })
})

describe('UpdateProjectSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = UpdateProjectSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update', () => {
    const result = UpdateProjectSchema.safeParse({ status: 'completed', visibility: 'public' })
    expect(result.success).toBe(true)
  })

  it('fails on invalid URL in partial update', () => {
    const result = UpdateProjectSchema.safeParse({ live_url: 'bad-url' })
    expect(result.success).toBe(false)
  })
})
