import { AgentAvatar } from './bot-mark'
import type { GrokBotAgent } from './grok-bot-app-types'
import { ComputerIcon } from './icons'

type ChatHeaderProps = {
  agent: GrokBotAgent
  onOpenComputer?: () => void
}

export function ChatHeader({ agent, onOpenComputer }: ChatHeaderProps) {
  const openComputer = onOpenComputer ? { onClick: onOpenComputer } : {}

  return (
    <header className="flex h-[var(--grok-bot-toolbar-height)] shrink-0 items-center justify-between border-[var(--grok-bot-border-default)] border-b-[0.5px] px-5">
      <button
        type="button"
        aria-label={`Open ${agent.name}'s computer`}
        className="flex min-w-0 items-center gap-2 rounded-md text-[var(--cursor-text-primary)]"
        {...openComputer}
      >
        <AgentAvatar agent={agent} size={18} />
        <span className="truncate text-[13px] leading-[18px] tracking-[-0.08px]">
          {agent.name}
        </span>
      </button>
      <button
        type="button"
        aria-label="Open computer"
        aria-pressed={false}
        className="flex size-6 items-center justify-center rounded-md text-[var(--cursor-text-secondary)]"
        {...openComputer}
      >
        <ComputerIcon size={14} />
      </button>
    </header>
  )
}
