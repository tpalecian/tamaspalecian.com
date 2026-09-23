import { cn } from '@repo/utilities/cn'

import { ChatHeader } from './chat-header'
import { Composer } from './composer'
import type { GrokBotAppProps } from './grok-bot-app-types'
import { Sidebar } from './sidebar'
import { TrafficLights } from './traffic-lights'
import { Transcript } from './transcript'

export function GrokBotApp({
  agents,
  activeAgentId,
  messages,
  user,
  composerPlaceholder,
  height = 660,
  className,
  onSelectAgent,
  onNewAgent,
  onSearchChange,
  onOpenComputer,
  onSend,
}: GrokBotAppProps) {
  const agent = agents.find((item) => item.id === activeAgentId) ?? agents[0]
  if (!agent) return null

  return (
    <div
      className={cn(
        'grok-bot-app relative w-full overflow-hidden rounded-3xl border border-[var(--grok-bot-border-default)] bg-[var(--grok-bot-bg-editor)] text-[var(--cursor-text-primary)] shadow-sm',
        className
      )}
      data-theme="cursor-light"
      style={{ height }}
    >
      <div className="flex h-full">
        <TrafficLights />
        <Sidebar
          agents={agents}
          activeAgentId={activeAgentId}
          user={user}
          onSelectAgent={onSelectAgent}
          onNewAgent={onNewAgent}
          onSearchChange={onSearchChange}
        />
        <section
          className="flex min-w-0 flex-1 flex-col"
          aria-label={`Chat with ${agent.name}`}
        >
          <ChatHeader agent={agent} onOpenComputer={onOpenComputer} />
          <Transcript messages={messages} />
          <div className="shrink-0">
            <Composer
              placeholder={composerPlaceholder ?? `Message ${agent.name}`}
              onSend={onSend}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
