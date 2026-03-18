'use client'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { XIcon } from 'lucide-react'

interface ChipInputProps {
  label: string
  chips: string[]
  onChange: (chips: string[]) => void
}

export function ChipInput({ label, chips, onChange }: ChipInputProps) {
  const [inputVal, setInputVal] = useState('')

  function add() {
    const val = inputVal.trim()
    if (val && !chips.includes(val)) onChange([...chips, val])
    setInputVal('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-8 p-1.5 rounded-lg border border-input bg-transparent">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
          >
            {chip}
            <button
              type="button"
              onClick={() => onChange(chips.filter((c) => c !== chip))}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Type + Enter"
          className="flex-1 min-w-20 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}
