'use client'
import { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

type ToolbarAction = {
  label: string
  before: string
  after: string
  placeholder: string
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: 'B', before: '**', after: '**', placeholder: 'bold' },
  { label: 'I', before: '*', after: '*', placeholder: 'italic' },
  { label: 'H', before: '## ', after: '', placeholder: 'heading' },
  { label: '`', before: '`', after: '`', placeholder: 'code' },
  { label: 'Link', before: '[', after: '](url)', placeholder: 'text' },
]

export function MarkdownEditor({ value, onChange, placeholder, className }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertAtCursor(action: ToolbarAction) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || action.placeholder
    const newValue =
      value.slice(0, start) + action.before + selected + action.after + value.slice(end)
    onChange(newValue)
    // Restore focus with updated cursor position
    requestAnimationFrame(() => {
      el.focus()
      const newCursor = start + action.before.length + selected.length + action.after.length
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Toolbar */}
      <div className="flex gap-1 flex-wrap">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => insertAtCursor(action)}
            className="px-2 py-0.5 text-xs border border-border rounded hover:bg-muted font-mono transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>
      {/* Panes */}
      <div className="flex flex-col md:flex-row gap-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Write markdown here...'}
          className="w-full md:w-1/2 font-mono text-sm p-3 border border-input rounded-lg resize-none min-h-[300px] bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <div className="w-full md:w-1/2 min-h-[300px] p-3 border border-border rounded-lg overflow-auto prose prose-sm dark:prose-invert max-w-none">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic text-sm">Preview will appear here...</p>
          )}
        </div>
      </div>
    </div>
  )
}
