import { describe, it, expect } from 'vitest'
import { CreateBookmarkSchema, UpdateBookmarkSchema } from '@/lib/validations/bookmark-schemas'

describe('CreateBookmarkSchema', () => {
  it('accepts valid input with defaults', () => {
    const result = CreateBookmarkSchema.safeParse({
      url: 'https://example.com',
      title: 'Example Site',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('saved')
    }
  })

  it('accepts full valid input', () => {
    const result = CreateBookmarkSchema.safeParse({
      url: 'https://docs.vitest.dev',
      title: 'Vitest Docs',
      description: 'Testing framework docs',
      status: 'reading',
      tags: ['testing', 'vitest'],
    })
    expect(result.success).toBe(true)
  })

  it('fails when url is missing', () => {
    const result = CreateBookmarkSchema.safeParse({ title: 'No URL' })
    expect(result.success).toBe(false)
  })

  it('fails on invalid url format', () => {
    const result = CreateBookmarkSchema.safeParse({ url: 'not-a-url', title: 'Bad URL' })
    expect(result.success).toBe(false)
  })

  it('fails when title is missing', () => {
    const result = CreateBookmarkSchema.safeParse({ url: 'https://example.com' })
    expect(result.success).toBe(false)
  })

  it('fails when title is empty string', () => {
    const result = CreateBookmarkSchema.safeParse({ url: 'https://example.com', title: '' })
    expect(result.success).toBe(false)
  })

  it('accepts null description', () => {
    const result = CreateBookmarkSchema.safeParse({
      url: 'https://example.com',
      title: 'Test',
      description: null,
    })
    expect(result.success).toBe(true)
  })

  it('fails on invalid status enum', () => {
    const result = CreateBookmarkSchema.safeParse({
      url: 'https://example.com',
      title: 'Test',
      status: 'archived',
    })
    expect(result.success).toBe(false)
  })
})

describe('UpdateBookmarkSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = UpdateBookmarkSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update', () => {
    const result = UpdateBookmarkSchema.safeParse({ status: 'done', tags: ['read'] })
    expect(result.success).toBe(true)
  })

  it('fails on invalid url in partial update', () => {
    const result = UpdateBookmarkSchema.safeParse({ url: 'ftp-bad' })
    expect(result.success).toBe(false)
  })
})
