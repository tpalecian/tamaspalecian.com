import { cn } from '@repo/utilities/cn'

import { AgentAvatar } from './bot-mark'
import type { GrokBotAgent } from './grok-bot-app-types'
import { ComputerIcon } from './icons'

type ChatHeaderProps = {
  agent: GrokBotAgent
  computerOpen: boolean
  onToggleComputer: () => void
}

export function ChatHeader({
  agent,
  computerOpen,
  onToggleComputer,
}: ChatHeaderProps) {
  return (
    <header className="flex h-[var(--grok-bot-toolbar-height)] shrink-0 items-center justify-between border-[var(--grok-bot-border-default)] border-b-[0.5px] px-5">
      <button
        type="button"
        aria-label={`Open ${agent.name}'s computer`}
        className="flex min-w-0 items-center gap-2 rounded-md text-[var(--cursor-text-primary)]"
        onClick={onToggleComputer}
      >
        <AgentAvatar agent={agent} size={18} />
        <span className="truncate text-[13px] leading-[18px] tracking-[-0.08px]">
          {agent.name}
        </span>
      </button>
      <button
        type="button"
        aria-label="Open computer"
        aria-pressed={computerOpen}
        className={cn(
          'flex size-6 items-center justify-center rounded-md',
          computerOpen
            ? 'bg-[var(--grok-bot-fill-secondary)] text-[var(--cursor-text-primary)]'
            : 'text-[var(--cursor-text-secondary)]'
        )}
        onClick={onToggleComputer}
      >
        <ComputerIcon size={14} />
      </button>
    </header>
  )
}
