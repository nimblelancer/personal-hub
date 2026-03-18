import { describe, it, expect } from 'vitest'
import {
  CreateRoadmapSchema,
  UpdateRoadmapSchema,
  CreateRoadmapNodeSchema,
  UpdateRoadmapNodeSchema,
} from '@/lib/validations/roadmap-schemas'

describe('CreateRoadmapSchema', () => {
  it('accepts valid input with name only', () => {
    const result = CreateRoadmapSchema.safeParse({ name: 'AI Learning Path' })
    expect(result.success).toBe(true)
  })

  it('accepts full valid input', () => {
    const result = CreateRoadmapSchema.safeParse({
      name: 'Coding Roadmap',
      description: 'Learn to code',
      topic: 'coding',
    })
    expect(result.success).toBe(true)
  })

  it('fails when name is missing', () => {
    const result = CreateRoadmapSchema.safeParse({ description: 'No name' })
    expect(result.success).toBe(false)
  })

  it('fails when name is empty string', () => {
    const result = CreateRoadmapSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('fails on invalid topic enum', () => {
    const result = CreateRoadmapSchema.safeParse({ name: 'Roadmap', topic: 'math' })
    expect(result.success).toBe(false)
  })

  it('topic is optional and accepts undefined', () => {
    const result = CreateRoadmapSchema.safeParse({ name: 'Roadmap' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.topic).toBeUndefined()
    }
  })
})

describe('UpdateRoadmapSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = UpdateRoadmapSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update', () => {
    const result = UpdateRoadmapSchema.safeParse({ name: 'Updated', topic: 'japanese' })
    expect(result.success).toBe(true)
  })
})

describe('CreateRoadmapNodeSchema', () => {
  it('accepts valid input with title only', () => {
    const result = CreateRoadmapNodeSchema.safeParse({ title: 'Learn Basics' })
    expect(result.success).toBe(true)
  })

  it('accepts full valid input', () => {
    const result = CreateRoadmapNodeSchema.safeParse({
      title: 'Advanced Topics',
      description: 'Deep dive',
      parent_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'in_progress',
    })
    expect(result.success).toBe(true)
  })

  it('fails when title is missing', () => {
    const result = CreateRoadmapNodeSchema.safeParse({ description: 'No title' })
    expect(result.success).toBe(false)
  })

  it('fails when title is empty string', () => {
    const result = CreateRoadmapNodeSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('fails on invalid parent_id (not a uuid)', () => {
    const result = CreateRoadmapNodeSchema.safeParse({ title: 'Node', parent_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('accepts null parent_id', () => {
    const result = CreateRoadmapNodeSchema.safeParse({ title: 'Root Node', parent_id: null })
    expect(result.success).toBe(true)
  })

  it('fails on invalid status enum', () => {
    const result = CreateRoadmapNodeSchema.safeParse({ title: 'Node', status: 'done' })
    expect(result.success).toBe(false)
  })
})

describe('UpdateRoadmapNodeSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = UpdateRoadmapNodeSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update', () => {
    const result = UpdateRoadmapNodeSchema.safeParse({ status: 'mastered' })
    expect(result.success).toBe(true)
  })
})
