import { cn } from '@repo/utilities/cn'
import type { CSSProperties } from 'react'

import type {
  GrokBotChatMessage,
  GrokBotMessage,
  GrokBotTextPart,
} from './grok-bot-app-types'

type TranscriptProps = {
  messages: GrokBotMessage[]
}

type TimestampDividerProps = {
  label: string
}

type MessageBubbleProps = {
  message: GrokBotChatMessage
}

type ReactionsProps = {
  reactions: string[]
}

type TranscriptEntry =
  | {
      kind: 'group'
      id: string
      label: string
      message: GrokBotChatMessage
      separated: boolean
    }
  | {
      kind: 'message'
      message: GrokBotChatMessage
      separated: boolean
    }
  | {
      kind: 'timestamp'
      id: string
      label: string
    }

const reactionMaskStyle: CSSProperties = {
  maskImage:
    'radial-gradient(circle at calc(100% - 20px) calc(100% + 4px), transparent 11.5px, #000 12px)',
  WebkitMaskImage:
    'radial-gradient(circle at calc(100% - 20px) calc(100% + 4px), transparent 11.5px, #000 12px)',
}

function isChatMessage(message: GrokBotMessage): message is GrokBotChatMessage {
  switch (message.kind) {
    case 'user':
    case 'agent':
      return true
    case 'timestamp':
      return false
    default: {
      const exhaustive: never = message
      return exhaustive
    }
  }
}

function groupMessages(messages: GrokBotMessage[]): TranscriptEntry[] {
  const entries: TranscriptEntry[] = []
  let previousKind: GrokBotChatMessage['kind'] | null = null
  let index = 0

  while (index < messages.length) {
    const message = messages[index]
    if (!message) {
      index += 1
      continue
    }

    switch (message.kind) {
      case 'timestamp': {
        const next = messages[index + 1]
        if (next && isChatMessage(next)) {
          entries.push({
            kind: 'group',
            id: message.id,
            label: message.label,
            message: next,
            separated: previousKind !== null && previousKind !== next.kind,
          })
          previousKind = next.kind
          index += 2
          break
        }
        entries.push({
          kind: 'timestamp',
          id: message.id,
          label: message.label,
        })
        index += 1
        break
      }
      case 'user':
      case 'agent': {
        entries.push({
          kind: 'message',
          message,
          separated: previousKind !== null && previousKind !== message.kind,
        })
        previousKind = message.kind
        index += 1
        break
      }
      default: {
        const exhaustive: never = message
        return [exhaustive]
      }
    }
  }

  return entries
}

function MessageParts({ parts }: { parts: GrokBotTextPart[] }) {
  const seen = new Map<string, number>()
  return parts.map((part) => {
    const signature = `${part.bold ? 'b' : 't'}:${part.text}`
    const count = seen.get(signature) ?? 0
    seen.set(signature, count + 1)
    const key = `${signature}:${count}`
    return part.bold ? (
      <strong className="font-semibold" key={key}>
        {part.text}
      </strong>
    ) : (
      <span key={key}>{part.text}</span>
    )
  })
}

export function TimestampDivider({ label }: TimestampDividerProps) {
  return (
    <div className="mb-2 text-center text-[12px] text-[var(--cursor-text-secondary)] leading-[16px]">
      {label}
    </div>
  )
}

export function Reactions({ reactions }: ReactionsProps) {
  const seen = new Map<string, number>()
  return (
    <div className="absolute right-2 -bottom-[14px] flex h-6 items-center rounded-full bg-white px-1.5 text-[13px] leading-none shadow-[0_1px_2px_rgba(0,0,0,0.16),0_0_0_0.5px_rgba(0,0,0,0.08)]">
      {reactions.map((reaction) => {
        const count = seen.get(reaction) ?? 0
        seen.set(reaction, count + 1)
        return <span key={`${reaction}:${count}`}>{reaction}</span>
      })}
    </div>
  )
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const parts = <MessageParts parts={message.parts} />

  switch (message.kind) {
    case 'user': {
      const hasReactions = (message.reactions?.length ?? 0) > 0
      return (
        <div
          className={cn(
            'relative ml-auto w-fit max-w-[min(420px,85%)]',
            hasReactions && 'mb-[14px]'
          )}
        >
          <div
            className="whitespace-pre-wrap rounded-[16px] bg-[var(--grok-bot-bubble-user)] px-3 py-2 text-[14px] text-[var(--grok-bot-bubble-user-ink)] leading-[20px] tracking-[-0.15px]"
            style={hasReactions ? reactionMaskStyle : undefined}
          >
            {parts}
          </div>
          {hasReactions && message.reactions ? (
            <Reactions reactions={message.reactions} />
          ) : null}
        </div>
      )
    }
    case 'agent':
      return (
        <div className="w-fit max-w-[min(560px,92%)] whitespace-pre-wrap rounded-[16px] bg-[var(--grok-bot-bubble-agent)] px-3 py-2 text-[14px] text-[var(--cursor-text-primary)] leading-[20px] tracking-[-0.15px]">
          {parts}
        </div>
      )
    default: {
      const exhaustive: never = message.kind
      return exhaustive
    }
  }
}

export function Transcript({ messages }: TranscriptProps) {
  const entries = groupMessages(messages)

  return (
    <div className="grok-bot-app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-2 pb-12">
      <div className="flex flex-col gap-1">
        {entries.map((entry) => {
          switch (entry.kind) {
            case 'group':
              return (
                <div key={entry.id} className="mt-2 first:mt-0">
                  <TimestampDivider label={entry.label} />
                  <div className={cn(entry.separated && 'mt-3 first:mt-0')}>
                    <MessageBubble message={entry.message} />
                  </div>
                </div>
              )
            case 'message':
              return (
                <div
                  key={entry.message.id}
                  className={cn(entry.separated && 'mt-3 first:mt-0')}
                >
                  <MessageBubble message={entry.message} />
                </div>
              )
            case 'timestamp':
              return (
                <div key={entry.id} className="mt-2 first:mt-0">
                  <TimestampDivider label={entry.label} />
                </div>
              )
            default: {
              const exhaustive: never = entry
              return exhaustive
            }
          }
        })}
      </div>
    </div>
  )
}
