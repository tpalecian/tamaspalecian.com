'use client'

import { cn } from '@repo/utilities/cn'
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import { AgentAvatar } from './bot-mark'
import type { GrokBotAgent, GrokBotUser } from './grok-bot-app-types'
import { NewAgentIcon, PlusIcon, SearchIcon } from './icons'

export const SIDEBAR_MIN = 220
export const SIDEBAR_MAX = 360
export const SIDEBAR_RAIL = 66
export const SIDEBAR_COLLAPSE = 160
export const SIDEBAR_DEFAULT = 276

const NUDGE_STEP = 16

type SidebarProps = {
  agents: GrokBotAgent[]
  activeAgentId: string
  user: GrokBotUser
  width: number
  onResize: (width: number) => void
  onSelectAgent: (id: string) => void
  onNewAgent: () => void
}

type SidebarHeaderProps = {
  onNewAgent: () => void
}

type ChatSearchProps = {
  query: string
  onQueryChange: (value: string) => void
}

type AgentListProps = {
  agents: GrokBotAgent[]
  activeAgentId: string
  onSelectAgent: (id: string) => void
}

type AgentRowProps = {
  agent: GrokBotAgent
  active: boolean
  onSelectAgent: (id: string) => void
}

type SidebarFooterProps = {
  user: GrokBotUser
}

type SidebarRailProps = {
  agents: GrokBotAgent[]
  activeAgentId: string
  user: GrokBotUser
  onSelectAgent: (id: string) => void
  onNewAgent: () => void
}

type SidebarResizerProps = {
  width: number
  onResize: (width: number) => void
  onDraggingChange: (dragging: boolean) => void
}

function widthFromPointer(pointer: number): number {
  if (pointer < SIDEBAR_COLLAPSE) return SIDEBAR_RAIL
  return Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, pointer))
}

function nudgeWidth(width: number, delta: number): number {
  if (width <= SIDEBAR_RAIL) {
    return delta > 0 ? SIDEBAR_MIN : SIDEBAR_RAIL
  }
  if (delta < 0 && width <= SIDEBAR_MIN) return SIDEBAR_RAIL
  const next = width + delta
  if (next > SIDEBAR_MAX) return SIDEBAR_MAX
  if (next < SIDEBAR_MIN) return SIDEBAR_MIN
  return next
}

function UnreadDot() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-0 right-0 size-2 rounded-full bg-[#FF3B30] shadow-[0_0_0_2px_var(--grok-bot-sidebar-bg)]"
    />
  )
}

function UserInitials({ initials }: { initials: string }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--grok-bot-sidebar-selected)] font-medium text-[10px] text-[var(--grok-bot-sidebar-text-secondary)] leading-none">
      {initials}
    </span>
  )
}

export function SidebarResizer({
  width,
  onResize,
  onDraggingChange,
}: SidebarResizerProps) {
  const sidebarLeft = useRef(0)
  const pointerStart = useRef(0)
  const armedRef = useRef(false)
  const draggingRef = useRef(false)
  const lastClickAt = useRef(0)

  useEffect(() => {
    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [])

  function endDrag() {
    if (!draggingRef.current) return
    draggingRef.current = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    onDraggingChange(false)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const aside = event.currentTarget.parentElement
    if (!aside) return
    sidebarLeft.current = aside.getBoundingClientRect().left
    pointerStart.current = event.clientX
    armedRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!armedRef.current && !draggingRef.current) return
    if (!draggingRef.current) {
      if (Math.abs(event.clientX - pointerStart.current) < 3) return
      draggingRef.current = true
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
      onDraggingChange(true)
    }
    onResize(widthFromPointer(event.clientX - sidebarLeft.current))
  }

  function finishPointer(
    event: PointerEvent<HTMLDivElement>,
    allowToggle: boolean
  ) {
    const wasDragging = draggingRef.current
    armedRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    endDrag()
    if (!allowToggle || wasDragging) return
    const now = event.timeStamp
    if (now - lastClickAt.current < 500) {
      lastClickAt.current = 0
      onResize(width <= SIDEBAR_RAIL ? SIDEBAR_DEFAULT : SIDEBAR_RAIL)
      return
    }
    lastClickAt.current = now
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    finishPointer(event, true)
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    finishPointer(event, false)
  }

  function onLostPointerCapture() {
    armedRef.current = false
    endDrag()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        onResize(nudgeWidth(width, -NUDGE_STEP))
        break
      case 'ArrowRight':
        event.preventDefault()
        onResize(nudgeWidth(width, NUDGE_STEP))
        break
      default:
        break
    }
  }

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: focusable separator exposes aria-valuenow and is not a thematic break */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        aria-valuemin={SIDEBAR_RAIL}
        aria-valuemax={SIDEBAR_MAX}
        aria-valuenow={Math.round(width)}
        tabIndex={0}
        className="absolute top-0 -right-1.5 z-10 h-full w-3 cursor-col-resize touch-none select-none outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent after:transition-colors hover:after:bg-[var(--grok-bot-border-default)] focus-visible:outline-none focus-visible:after:bg-[var(--grok-bot-current-agent-coat)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onLostPointerCapture}
        onKeyDown={onKeyDown}
      />
    </>
  )
}

function SidebarRail({
  agents,
  activeAgentId,
  user,
  onSelectAgent,
  onNewAgent,
}: SidebarRailProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center">
      <div
        aria-hidden="true"
        className="h-[var(--grok-bot-toolbar-height)] w-full shrink-0"
      />
      <div className="grok-bot-app-scroll flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto">
        {agents.map((agent) => {
          const active = agent.id === activeAgentId
          return (
            <button
              key={agent.id}
              type="button"
              title={agent.name}
              aria-label={agent.name}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'relative flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--grok-bot-sidebar-hover)]',
                active &&
                  'bg-[var(--grok-bot-sidebar-selected)] hover:bg-[var(--grok-bot-sidebar-selected)]'
              )}
              onClick={() => onSelectAgent(agent.id)}
            >
              <span className="relative">
                <AgentAvatar agent={agent} size={30} />
                {agent.unread ? <UnreadDot /> : null}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2 py-3">
        <button
          type="button"
          aria-label="New agent"
          className="inline-flex size-7 items-center justify-center rounded-md text-[var(--grok-bot-sidebar-text-secondary)] hover:bg-[var(--grok-bot-fill-secondary)]"
          onClick={onNewAgent}
        >
          <PlusIcon size={14} />
        </button>
        <UserInitials initials={user.initials} />
      </div>
    </div>
  )
}

export function Sidebar({
  agents,
  activeAgentId,
  user,
  width,
  onResize,
  onSelectAgent,
  onNewAgent,
}: SidebarProps) {
  const [query, setQuery] = useState('')
  const [dragging, setDragging] = useState(false)
  const collapsed = width <= SIDEBAR_RAIL
  const needle = query.trim().toLowerCase()
  const visibleAgents = needle
    ? agents.filter((agent) => agent.name.toLowerCase().includes(needle))
    : agents

  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col bg-[var(--grok-bot-sidebar-bg)] [border-right:0.5px_solid_var(--grok-bot-border-default)]',
        dragging ? 'transition-none' : 'transition-[width] duration-150'
      )}
      style={{ width }}
    >
      {collapsed ? (
        <SidebarRail
          agents={agents}
          activeAgentId={activeAgentId}
          user={user}
          onSelectAgent={onSelectAgent}
          onNewAgent={onNewAgent}
        />
      ) : (
        <div className="flex h-full min-h-0 w-full flex-col">
          <SidebarHeader onNewAgent={onNewAgent} />
          <ChatSearch query={query} onQueryChange={setQuery} />
          <AgentList
            agents={visibleAgents}
            activeAgentId={activeAgentId}
            onSelectAgent={onSelectAgent}
          />
          <SidebarFooter user={user} />
        </div>
      )}
      <SidebarResizer
        width={width}
        onResize={onResize}
        onDraggingChange={setDragging}
      />
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
        onClick={onNewAgent}
      >
        <NewAgentIcon size={14} />
      </button>
    </div>
  )
}

export function ChatSearch({ query, onQueryChange }: ChatSearchProps) {
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
          placeholder="Search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
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
      onClick={() => onSelectAgent(agent.id)}
    >
      <span className="relative shrink-0">
        <AgentAvatar agent={agent} size={32} />
        {agent.unread ? <UnreadDot /> : null}
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
      <UserInitials initials={user.initials} />
      <span className="min-w-0 truncate text-[13px] text-[var(--grok-bot-sidebar-text-primary)] leading-[18px]">
        {user.name}
      </span>
    </div>
  )
}
