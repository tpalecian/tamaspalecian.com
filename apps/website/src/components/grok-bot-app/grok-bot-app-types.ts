export type BotMarkShape = 'blob' | 'triangle' | 'squircle'

export type BotMarkConfig = {
  color: string
  shape: BotMarkShape
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
