import { cn } from '@repo/utilities/cn'
import type { ChangeEvent } from 'react'

import { AgentAvatar } from './bot-mark'
import type { GrokBotAgent, GrokBotUser } from './grok-bot-app-types'
import { NewAgentIcon, SearchIcon } from './icons'

type SidebarProps = {
  agents: GrokBotAgent[]
  activeAgentId: string
  user: GrokBotUser
  width?: number
  onSelectAgent?: (id: string) => void
  onNewAgent?: () => void
  onSearchChange?: (value: string) => void
}

type SidebarHeaderProps = {
  onNewAgent?: () => void
}

type ChatSearchProps = {
  onSearchChange?: (value: string) => void
}

type AgentListProps = {
  agents: GrokBotAgent[]
  activeAgentId: string
  onSelectAgent?: (id: string) => void
}

type AgentRowProps = {
  agent: GrokBotAgent
  active: boolean
  onSelectAgent?: (id: string) => void
}

type SidebarFooterProps = {
  user: GrokBotUser
}

export function Sidebar({
  agents,
  activeAgentId,
  user,
  width = 276,
  onSelectAgent,
  onNewAgent,
  onSearchChange,
}: SidebarProps) {
  return (
    <aside
      className="flex h-full shrink-0 flex-col bg-[var(--grok-bot-sidebar-bg)] [border-right:0.5px_solid_var(--grok-bot-border-default)]"
      style={{ width }}
    >
      <SidebarHeader onNewAgent={onNewAgent} />
      <ChatSearch onSearchChange={onSearchChange} />
      <AgentList
        activeAgentId={activeAgentId}
        agents={agents}
        onSelectAgent={onSelectAgent}
      />
      <SidebarFooter user={user} />
    </aside>
  )
}

export function SidebarHeader({ onNewAgent }: SidebarHeaderProps) {
  return (
    <div className="flex h-[var(--grok-bot-toolbar-height)] shrink-0 items-center pr-2">
      <div aria-hidden="true" className="w-[72px] shrink-0" />
      <button
        aria-label="New agent"
        className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-[var(--grok-bot-sidebar-text-secondary)] hover:bg-[var(--grok-bot-sidebar-hover)]"
        type="button"
        {...(onNewAgent ? { onClick: onNewAgent } : {})}
      >
        <NewAgentIcon size={14} />
      </button>
    </div>
  )
}

export function ChatSearch({ onSearchChange }: ChatSearchProps) {
  return (
    <div className="shrink-0 px-2 pb-1">
      <div className="flex items-center gap-2 rounded-full bg-[var(--grok-bot-fill-secondary)] px-3">
        <SearchIcon
          className="shrink-0 text-[var(--grok-bot-sidebar-text-tertiary)]"
          size={14}
        />
        <input
          aria-label="Search chats"
          className="h-8 min-w-0 flex-1 bg-transparent text-[13px] text-[var(--grok-bot-sidebar-text-primary)] leading-[18px] outline-none placeholder:text-[var(--cursor-text-secondary)] [&::-webkit-search-cancel-button]:hidden"
          defaultValue=""
          placeholder="Search"
          type="search"
          {...(onSearchChange
            ? {
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                  onSearchChange(event.currentTarget.value)
                },
              }
            : {})}
        />
      </div>
    </div>
  )
}

export function AgentList({
  agents,
  activeAgentId,
  onSelectAgent,
}: AgentListProps) {
  return (
    <div className="grok-bot-app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
      {agents.map((agent) => (
        <AgentRow
          active={agent.id === activeAgentId}
          agent={agent}
          key={agent.id}
          onSelectAgent={onSelectAgent}
        />
      ))}
    </div>
  )
}

export function AgentRow({ agent, active, onSelectAgent }: AgentRowProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-[var(--grok-bot-sidebar-hover)]',
        'data-active:bg-[var(--grok-bot-sidebar-selected)] data-active:hover:bg-[var(--grok-bot-sidebar-selected)]'
      )}
      data-active={active ? '' : undefined}
      title={agent.name}
      type="button"
      {...(onSelectAgent ? { onClick: () => onSelectAgent(agent.id) } : {})}
    >
      <span className="shrink-0">
        <AgentAvatar agent={agent} size={32} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[14px] text-[var(--grok-bot-sidebar-text-primary)] leading-[20px] tracking-[-0.15px]">
            {agent.name}
          </span>
          <span className="shrink-0 text-[12px] text-[var(--grok-bot-sidebar-text-tertiary)] leading-[16px]">
            {agent.time}
          </span>
        </span>
        <span className="truncate text-[12px] text-[var(--grok-bot-sidebar-text-secondary)] leading-[16px]">
          {agent.preview}
        </span>
      </span>
    </button>
  )
}

export function SidebarFooter({ user }: SidebarFooterProps) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-4 py-3">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--grok-bot-sidebar-selected)] font-medium text-[10px] text-[var(--grok-bot-sidebar-text-secondary)] leading-none">
        {user.initials}
      </span>
      <span className="min-w-0 truncate text-[13px] text-[var(--grok-bot-sidebar-text-primary)] leading-[18px]">
        {user.name}
      </span>
    </div>
  )
}
