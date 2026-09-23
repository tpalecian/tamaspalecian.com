import { MicIcon, PlusIcon } from './icons'

type ComposerProps = {
  placeholder: string
}

export function Composer({ placeholder }: ComposerProps) {
  return (
    <form className="relative z-[1] px-5 pb-3">
      <div className="grok-bot-app-composer-fade pointer-events-none absolute inset-x-0 bottom-full h-12" />
      <div className="flex items-center gap-2 rounded-full border-[0.5px] border-[var(--grok-bot-border-default)] bg-white px-2 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--grok-bot-fill-secondary)] text-[var(--cursor-text-secondary)]"
        >
          <PlusIcon size={14} />
        </span>
        {/* biome-ignore lint/a11y/useFocusableInteractive lint/a11y/useSemanticElements: readonly placeholder field is a non-editable div */}
        <div
          className="grok-bot-app-composer-field min-h-5 min-w-0 flex-1 text-[14px] leading-[20px]"
          role="textbox"
          aria-readonly="true"
          aria-multiline="true"
          contentEditable={false}
          data-empty=""
          data-placeholder={placeholder}
        />
        <button
          type="button"
          aria-label="Voice message"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--grok-bot-fill-emphasis)] text-white"
        >
          <MicIcon size={14} />
        </button>
      </div>
    </form>
  )
}
