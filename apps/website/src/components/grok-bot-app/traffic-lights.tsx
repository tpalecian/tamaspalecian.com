import { cn } from '@repo/utilities/cn'

type TrafficLightsProps = {
  className?: string
}

const dotClassName =
  'size-3 rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)]'

export function TrafficLights({ className }: TrafficLightsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute top-[18px] left-4 flex w-[52px] items-center justify-between',
        className
      )}
    >
      <span className={cn(dotClassName, 'bg-[#ff5f57]')} />
      <span className={cn(dotClassName, 'bg-[#febc2e]')} />
      <span className={cn(dotClassName, 'bg-[#28c840]')} />
    </div>
  )
}
