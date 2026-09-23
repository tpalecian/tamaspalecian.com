'use client'

import { cn } from '@repo/utilities/cn'
import { type CSSProperties, useState } from 'react'

import { AgentPanel } from './agent-panel'
import { ChatHeader } from './chat-header'
import { Composer } from './composer'
import type {
  GrokBotAgent,
  GrokBotAgentSettings,
  GrokBotAppProps,
  GrokBotPanel,
} from './grok-bot-app-types'
import { NewAgentHeader, NewAgentPicker } from './new-agent-picker'
import { SIDEBAR_DEFAULT, Sidebar } from './sidebar'
import { TrafficLights } from './traffic-lights'
import { Transcript } from './transcript'

const AGENT_COLORS = [
  '#54B9A6',
  '#F19D38',
  '#6464EF',
  '#885CF5',
  '#3C82F6',
  '#ED712E',
] as const

type GrokBotAppStyle = CSSProperties & {
  '--grok-bot-current-agent-bubble': string
  '--grok-bot-current-agent-coat': string
}

function nextAgentColor(count: number): string {
  const color = AGENT_COLORS[count % AGENT_COLORS.length]
  return color ?? AGENT_COLORS[0]
}

function nextAgentId(agents: GrokBotAgent[]): string {
  const used = new Set(agents.map((agent) => agent.id))
  let n = 1
  while (used.has(`agent-${n}`)) n += 1
  return `agent-${n}`
}

function openPanel(
  panel: GrokBotPanel,
  composing: boolean
): 'computer' | 'settings' | null {
  if (composing) return null
  switch (panel) {
    case 'none':
      return null
    case 'computer':
    case 'settings':
      return panel
    default: {
      const exhaustive: never = panel
      return exhaustive
    }
  }
}

export function GrokBotApp({
  agents: initialAgents,
  threads,
  defaultActiveAgentId,
  user,
  defaultSidebarWidth,
  height = 660,
  className,
}: GrokBotAppProps) {
  const [agents, setAgents] = useState(initialAgents)
  const [activeAgentId, setActiveAgentId] = useState(defaultActiveAgentId)
  const [sidebarWidth, setSidebarWidth] = useState(
    defaultSidebarWidth ?? SIDEBAR_DEFAULT
  )
  const [panel, setPanel] = useState<GrokBotPanel>('none')
  const [composing, setComposing] = useState(false)
  const [query, setQuery] = useState('')

  const agent = agents.find((item) => item.id === activeAgentId) ?? agents[0]
  if (!agent) return null

  function selectAgent(id: string) {
    setActiveAgentId(id)
    setAgents((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    )
    setComposing(false)
    setQuery('')
  }

  function beginNewAgent() {
    setComposing(true)
    setPanel('none')
    setQuery('')
  }

  function cancelComposing() {
    setComposing(false)
    setQuery('')
  }

  function createAgent() {
    const created: GrokBotAgent = {
      id: nextAgentId(agents),
      name: 'New agent',
      time: 'Now',
      preview: '',
      color: nextAgentColor(agents.length),
      shape: 'blob',
      notifications: true,
    }
    setAgents((current) => [...current, created])
    setActiveAgentId(created.id)
    setComposing(false)
    setQuery('')
    setPanel('settings')
  }

  function toggleComputer() {
    setPanel((current) => {
      switch (current) {
        case 'none':
          return 'computer'
        case 'computer':
        case 'settings':
          return 'none'
        default: {
          const exhaustive: never = current
          return exhaustive
        }
      }
    })
  }

  function updateAgent(settings: Partial<GrokBotAgentSettings>) {
    setAgents((current) =>
      current.map((item) =>
        item.id === activeAgentId ? { ...item, ...settings } : item
      )
    )
  }

  const panelView = openPanel(panel, composing)
  const style: GrokBotAppStyle = {
    height,
    '--grok-bot-current-agent-bubble': agent.bubble ?? agent.color,
    '--grok-bot-current-agent-coat': agent.color,
  }
  const placeholder = composing ? 'Message agent' : `Message ${agent.name}`

  return (
    <div
      className={cn(
        'grok-bot-app relative w-full overflow-hidden rounded-3xl border border-[var(--grok-bot-border-default)] bg-[var(--grok-bot-bg-editor)] text-[var(--cursor-text-primary)] shadow-sm',
        className
      )}
      data-theme="cursor-light"
      style={style}
    >
      <div className="flex h-full">
        <TrafficLights className="z-20" />
        <Sidebar
          agents={agents}
          activeAgentId={activeAgentId}
          user={user}
          width={sidebarWidth}
          onResize={setSidebarWidth}
          onSelectAgent={selectAgent}
          onNewAgent={beginNewAgent}
        />
        <section
          aria-label={composing ? 'New agent' : `Chat with ${agent.name}`}
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          {composing ? (
            <>
              <NewAgentHeader
                query={query}
                onQueryChange={setQuery}
                onCancel={cancelComposing}
              />
              <NewAgentPicker
                agents={agents}
                query={query}
                onSelectAgent={selectAgent}
                onCreateAgent={createAgent}
              />
            </>
          ) : (
            <>
              <ChatHeader
                agent={agent}
                computerOpen={panel !== 'none'}
                onToggleComputer={toggleComputer}
              />
              <Transcript
                key={activeAgentId}
                messages={threads[activeAgentId] ?? []}
              />
            </>
          )}
          <div className="shrink-0">
            <Composer placeholder={placeholder} />
          </div>
        </section>
        {panelView ? (
          <AgentPanel
            agent={agent}
            panel={panelView}
            onPanelChange={setPanel}
            onClose={() => setPanel('none')}
            onUpdateAgent={updateAgent}
          />
        ) : null}
      </div>
    </div>
  )
}
