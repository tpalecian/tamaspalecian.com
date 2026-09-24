export const BOT_MARK_SHAPES = [
  'blob',
  'pebble',
  'squircle',
  'tablet',
  'triangle',
  'hex',
  'cloud',
  'teardrop',
] as const

export type BotMarkShape = (typeof BOT_MARK_SHAPES)[number]

/**
 * Avatar motion from the Grok Bot lifecycle: calm at rest, a nod when work
 * arrives, then thinking, working, waiting, blocked, and done.
 */
export const BOT_MARK_STATES = [
  'idle',
  'acknowledge',
  'thinking',
  'working',
  'waiting',
  'blocked',
  'done',
] as const

export type BotMarkState = (typeof BOT_MARK_STATES)[number]

export type BotMarkConfig = {
  color: string
  shape: BotMarkShape
  state?: BotMarkState
}

export type GrokBotRoutine = {
  id: string
  name: string
  schedule: string
}

export type GrokBotAgent = BotMarkConfig & {
  id: string
  name: string
  time: string
  preview: string
  group?: BotMarkConfig[]
  title?: string
  description?: string
  notifications?: boolean
  unread?: boolean
  bubble?: string
  routines?: GrokBotRoutine[]
  state?: BotMarkState
}

export type GrokBotAgentSettings = Pick<
  GrokBotAgent,
  'name' | 'title' | 'description' | 'notifications'
>

export type GrokBotTextPart = {
  text: string
  bold?: boolean
}

export type GrokBotTimestampMessage = {
  id: string
  kind: 'timestamp'
  label: string
}

export type GrokBotChatMessage = {
  id: string
  kind: 'user' | 'agent'
  parts: GrokBotTextPart[]
  reactions?: string[]
}

export type GrokBotMessage = GrokBotTimestampMessage | GrokBotChatMessage

export type GrokBotUser = {
  name: string
  initials: string
}

export type GrokBotPanel = 'none' | 'computer' | 'settings'

export type GrokBotAppProps = {
  agents: GrokBotAgent[]
  threads: Record<string, GrokBotMessage[]>
  defaultActiveAgentId: string
  user: GrokBotUser
  defaultSidebarWidth?: number
  height?: number
  className?: string
}
