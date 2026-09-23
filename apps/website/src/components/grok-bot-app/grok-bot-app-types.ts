export type BotMarkShape = 'blob' | 'triangle' | 'squircle'

export type BotMarkConfig = {
  color: string
  shape: BotMarkShape
}

export type GrokBotAgent = BotMarkConfig & {
  id: string
  name: string
  time: string
  preview: string
  group?: BotMarkConfig[]
}

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

export type GrokBotAppProps = {
  agents: GrokBotAgent[]
  activeAgentId: string
  messages: GrokBotMessage[]
  user: GrokBotUser
  composerPlaceholder?: string
  height?: number
  className?: string
  onSelectAgent?: (id: string) => void
  onNewAgent?: () => void
  onSearchChange?: (value: string) => void
  onOpenComputer?: () => void
  onSend?: (text: string) => void
}
