'use client'

import { cn } from '@repo/utilities/cn'
import { type KeyboardEvent, useEffect, useId, useRef } from 'react'

import { AgentAvatar } from './bot-mark'
import type { GrokBotAgent } from './grok-bot-app-types'
import { PlusIcon } from './icons'

type NewAgentHeaderProps = {
  query: string
  onQueryChange: (query: string) => void
  onCancel: () => void
  onSubmit?: () => void
}

type NewAgentPickerProps = {
  agents: GrokBotAgent[]
  query: string
  onSelectAgent: (id: string) => void
  onCreateAgent: () => void
}

type PickerRow = { kind: 'create' } | { kind: 'agent'; agent: GrokBotAgent }

const rowClassName =
  'mx-1.5 flex w-[calc(100%-12px)] items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] leading-[18px] text-[var(--cursor-text-primary)] hover:bg-[var(--grok-bot-sidebar-hover)] focus:bg-[var(--grok-bot-sidebar-hover)] focus:outline-none'

function filterAgents(agents: GrokBotAgent[], query: string) {
  const needle = query.toLowerCase()
  return agents.filter((agent) => {
    if (agent.group) return false
    return agent.name.toLowerCase().includes(needle)
  })
}

export function NewAgentHeader({
  query,
  onQueryChange,
  onCancel,
  onSubmit,
}: NewAgentHeaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        onCancel()
        break
      case 'Enter':
        event.preventDefault()
        onSubmit?.()
        break
      default:
        break
    }
  }

  return (
    <header className="flex h-[var(--grok-bot-toolbar-height)] shrink-0 items-center gap-2 border-[var(--grok-bot-border-default)] border-b-[0.5px] px-3">
      <label
        htmlFor={inputId}
        className="shrink-0 text-[13px] text-[var(--cursor-text-secondary)] leading-[18px]"
      >
        To:
      </label>
      <input
        id={inputId}
        ref={inputRef}
        value={query}
        placeholder="Search or create agents"
        className="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-[13px] text-[var(--cursor-text-primary)] leading-[18px] outline-none placeholder:text-[var(--cursor-text-secondary)] focus:border-[var(--grok-bot-current-agent-bubble)]"
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </header>
  )
}

export function NewAgentPicker({
  agents,
  query,
  onSelectAgent,
  onCreateAgent,
}: NewAgentPickerProps) {
  const filtered = filterAgents(agents, query)
  const rows: PickerRow[] = [
    { kind: 'create' },
    ...filtered.map((agent) => ({ kind: 'agent' as const, agent })),
  ]
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([])

  function focusRow(index: number) {
    const next = Math.min(Math.max(index, 0), rows.length - 1)
    rowRefs.current[next]?.focus()
  }

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusRow(index + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusRow(index - 1)
        break
      default:
        break
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-2 mt-1 rounded-xl bg-white py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.08)]">
        {rows.map((row, index) => {
          switch (row.kind) {
            case 'create':
              return (
                <button
                  key="create"
                  ref={(node) => {
                    rowRefs.current[index] = node
                  }}
                  type="button"
                  className={rowClassName}
                  onClick={onCreateAgent}
                  onKeyDown={(event) => handleRowKeyDown(event, index)}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--grok-bot-fill-secondary)] text-[var(--cursor-text-secondary)]">
                    <PlusIcon size={14} />
                  </span>
                  Create new agent
                </button>
              )
            case 'agent':
              return (
                <button
                  key={row.agent.id}
                  ref={(node) => {
                    rowRefs.current[index] = node
                  }}
                  type="button"
                  className={cn(rowClassName, 'min-w-0')}
                  onClick={() => onSelectAgent(row.agent.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, index)}
                >
                  <AgentAvatar agent={row.agent} size={24} />
                  <span className="truncate">{row.agent.name}</span>
                </button>
              )
            default: {
              const exhaustive: never = row
              return exhaustive
            }
          }
        })}
      </div>
    </div>
  )
}
