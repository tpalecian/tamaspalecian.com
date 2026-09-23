'use client'

import { cn } from '@repo/utilities/cn'
import { type ReactNode, useId } from 'react'

import { BotMark } from './bot-mark'
import type {
  GrokBotAgent,
  GrokBotAgentSettings,
  GrokBotRoutine,
} from './grok-bot-app-types'
import { ChevronLeftIcon, ClockIcon, CloseIcon, SettingsIcon } from './icons'

type AgentPanelMode = 'computer' | 'settings'

type AgentPanelProps = {
  agent: GrokBotAgent
  panel: AgentPanelMode
  onPanelChange: (panel: AgentPanelMode) => void
  onClose: () => void
  onUpdateAgent: (settings: Partial<GrokBotAgentSettings>) => void
}

type RoutineListProps = {
  routines: GrokBotRoutine[]
  color: string
}

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  color: string
  labelledBy?: string
}

type ScreenPreviewProps = {
  className?: string
}

const fieldClassName =
  'w-full rounded-lg border-[0.5px] border-[var(--grok-bot-border-default)] bg-white px-2.5 py-2 text-[13px] text-[var(--grok-bot-sidebar-text-primary)] leading-[18px]'

const labelClassName =
  'mb-1 block text-[12px] text-[var(--grok-bot-sidebar-text-secondary)] leading-4'

const SKELETON_WIDTHS = ['100%', '86%', '72%', '92%'] as const

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-[var(--grok-bot-sidebar-text-secondary)] hover:bg-black/[0.05]"
    >
      {children}
    </button>
  )
}

function MockWindow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-md bg-white px-1.5 py-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.18)]',
        className
      )}
    >
      <div className="mb-1 h-[3px] w-6 rounded-full bg-[#d5d5da]" />
      <div className="flex flex-col gap-[3px]">
        {SKELETON_WIDTHS.map((width) => (
          <div
            key={width}
            className="h-[3px] rounded-full bg-[#e7e7eb]"
            style={{ width }}
          />
        ))}
      </div>
    </div>
  )
}

export function ScreenPreview({ className }: ScreenPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative aspect-[16/10] overflow-hidden rounded-xl',
        className
      )}
      style={{ background: 'linear-gradient(#e9a36a, #d4613b)' }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-[68%] bg-[#4a6244]"
        style={{
          clipPath:
            'polygon(0% 58%, 14% 34%, 28% 52%, 44% 18%, 58% 46%, 74% 14%, 88% 40%, 100% 26%, 100% 100%, 0% 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[48%] bg-[#243528]"
        style={{
          clipPath:
            'polygon(0% 46%, 18% 22%, 36% 54%, 54% 16%, 72% 48%, 88% 24%, 100% 42%, 100% 100%, 0% 100%)',
        }}
      />
      <MockWindow className="absolute top-[16%] right-[12%] h-[46%] w-[54%]" />
      <MockWindow className="absolute top-[30%] left-[11%] z-[1] h-[48%] w-[58%]" />
      <div className="absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-1.5 py-1 shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
        <span className="size-1.5 rounded-full bg-[#3C82F6]" />
        <span className="size-1.5 rounded-full bg-[#54B9A6]" />
        <span className="size-1.5 rounded-full bg-[#885CF5]" />
      </div>
    </div>
  )
}

export function RoutineList({ routines, color }: RoutineListProps) {
  if (routines.length === 0) {
    return (
      <p className="mt-2 text-[12px] text-[var(--grok-bot-sidebar-text-tertiary)] leading-4">
        No routines yet
      </p>
    )
  }

  return (
    <ul className="mt-2 flex flex-col gap-2">
      {routines.map((routine) => (
        <li key={routine.id} className="flex min-w-0 items-center gap-2">
          <span className="inline-flex shrink-0" style={{ color }}>
            <ClockIcon size={14} />
          </span>
          <span className="shrink-0 font-medium text-[13px] text-[var(--grok-bot-sidebar-text-primary)] leading-[18px]">
            {routine.name}
          </span>
          <span
            className="min-w-0 truncate text-[13px] text-[var(--grok-bot-sidebar-text-tertiary)] leading-[18px]"
            title={routine.schedule}
          >
            {routine.schedule}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Toggle({ checked, onChange, color, labelledBy }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : 'Notifications'}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[20px] w-[36px] shrink-0 rounded-full transition-colors',
        !checked && 'bg-black/20'
      )}
      style={checked ? { backgroundColor: color } : undefined}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-[2px] left-[2px] size-[16px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-150',
          checked && 'translate-x-[16px]'
        )}
      />
    </button>
  )
}

function ComputerView({
  agent,
  onOpenSettings,
  onClose,
}: {
  agent: GrokBotAgent
  onOpenSettings: () => void
  onClose: () => void
}) {
  return (
    <>
      <header className="flex h-[var(--grok-bot-toolbar-height)] shrink-0 items-center justify-end gap-0.5 px-2">
        <IconButton label="Agent settings" onClick={onOpenSettings}>
          <SettingsIcon size={15} />
        </IconButton>
        <IconButton label="Close panel" onClick={onClose}>
          <CloseIcon size={15} />
        </IconButton>
      </header>
      <div className="grok-bot-app-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <ScreenPreview />
        <p className="mt-2 text-center text-[12px] text-[var(--grok-bot-sidebar-text-secondary)] leading-4">
          {`${agent.name}'s screen`}
        </p>
        <p className="mt-6 text-[12px] text-[var(--grok-bot-sidebar-text-secondary)] leading-4">
          Routines
        </p>
        <RoutineList routines={agent.routines ?? []} color={agent.color} />
      </div>
    </>
  )
}

function SettingsView({
  agent,
  onBack,
  onClose,
  onUpdateAgent,
}: {
  agent: GrokBotAgent
  onBack: () => void
  onClose: () => void
  onUpdateAgent: (settings: Partial<GrokBotAgentSettings>) => void
}) {
  const nameId = useId()
  const titleId = useId()
  const descriptionId = useId()
  const notificationsId = useId()

  return (
    <>
      <header className="relative flex h-[var(--grok-bot-toolbar-height)] shrink-0 items-center justify-between px-2">
        <IconButton label="Back" onClick={onBack}>
          <ChevronLeftIcon size={16} />
        </IconButton>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-semibold text-[13px] text-[var(--grok-bot-sidebar-text-primary)] leading-[18px]">
          Settings
        </span>
        <IconButton label="Close panel" onClick={onClose}>
          <CloseIcon size={15} />
        </IconButton>
      </header>
      <div className="grok-bot-app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-2 pb-4">
        <div className="flex justify-center pb-5">
          <BotMark color={agent.color} shape={agent.shape} size={64} />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor={nameId} className={labelClassName}>
              Name
            </label>
            <input
              id={nameId}
              type="text"
              value={agent.name}
              onChange={(event) => onUpdateAgent({ name: event.target.value })}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor={titleId} className={labelClassName}>
              Title (optional)
            </label>
            <input
              id={titleId}
              type="text"
              value={agent.title ?? ''}
              onChange={(event) => onUpdateAgent({ title: event.target.value })}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor={descriptionId} className={labelClassName}>
              Description
            </label>
            <textarea
              id={descriptionId}
              rows={5}
              value={agent.description ?? ''}
              onChange={(event) =>
                onUpdateAgent({ description: event.target.value })
              }
              className={cn(fieldClassName, 'resize-none')}
            />
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-black/[0.04] p-2.5">
            <div className="min-w-0 flex-1">
              <p
                id={notificationsId}
                className="font-medium text-[13px] text-[var(--grok-bot-sidebar-text-primary)] leading-[18px]"
              >
                Notifications
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--grok-bot-sidebar-text-tertiary)] leading-4">
                Get notified when this agent finishes or needs input
              </p>
            </div>
            <Toggle
              checked={agent.notifications ?? false}
              onChange={(notifications) => onUpdateAgent({ notifications })}
              color={agent.color}
              labelledBy={notificationsId}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function PanelBody({
  agent,
  panel,
  onPanelChange,
  onClose,
  onUpdateAgent,
}: AgentPanelProps) {
  switch (panel) {
    case 'computer':
      return (
        <ComputerView
          agent={agent}
          onOpenSettings={() => onPanelChange('settings')}
          onClose={onClose}
        />
      )
    case 'settings':
      return (
        <SettingsView
          agent={agent}
          onBack={() => onPanelChange('computer')}
          onClose={onClose}
          onUpdateAgent={onUpdateAgent}
        />
      )
    default: {
      const exhaustive: never = panel
      return exhaustive
    }
  }
}

export function AgentPanel({
  agent,
  panel,
  onPanelChange,
  onClose,
  onUpdateAgent,
}: AgentPanelProps) {
  return (
    <aside
      aria-label={
        panel === 'settings' ? 'Agent settings' : `${agent.name}'s computer`
      }
      className="flex h-full w-[280px] shrink-0 flex-col bg-[#FBF7F1] [border-left:0.5px_solid_var(--grok-bot-border-default)]"
    >
      <PanelBody
        agent={agent}
        panel={panel}
        onPanelChange={onPanelChange}
        onClose={onClose}
        onUpdateAgent={onUpdateAgent}
      />
    </aside>
  )
}
