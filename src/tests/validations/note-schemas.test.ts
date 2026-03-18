import { describe, it, expect } from 'vitest'
import { CreateNoteSchema, UpdateNoteSchema } from '@/lib/validations/note-schemas'

describe('CreateNoteSchema', () => {
  it('accepts valid input with defaults', () => {
    const result = CreateNoteSchema.safeParse({ title: 'My Note' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.topic).toBe('other')
      expect(result.data.visibility).toBe('private')
      expect(result.data.content).toBe('')
    }
  })

  it('accepts full valid input', () => {
    const result = CreateNoteSchema.safeParse({
      title: 'AI Notes',
      content: 'Some content',
      topic: 'ai-ml',
      visibility: 'public',
      tags: ['machine-learning', 'deep-learning'],
    })
    expect(result.success).toBe(true)
  })

  it('fails when title is missing', () => {
    const result = CreateNoteSchema.safeParse({ content: 'No title here' })
    expect(result.success).toBe(false)
  })

  it('fails when title is empty string', () => {
    const result = CreateNoteSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('fails on invalid topic enum', () => {
    const result = CreateNoteSchema.safeParse({ title: 'Note', topic: 'math' })
    expect(result.success).toBe(false)
  })

  it('fails on invalid visibility enum', () => {
    const result = CreateNoteSchema.safeParse({ title: 'Note', visibility: 'internal' })
    expect(result.success).toBe(false)
  })
})

describe('UpdateNoteSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = UpdateNoteSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update', () => {
    const result = UpdateNoteSchema.safeParse({ title: 'Updated Title', topic: 'coding' })
    expect(result.success).toBe(true)
  })

  it('fails on invalid enum in partial update', () => {
    const result = UpdateNoteSchema.safeParse({ topic: 'history' })
    expect(result.success).toBe(false)
  })

  it('fails when title is empty string in update', () => {
    const result = UpdateNoteSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })
})
