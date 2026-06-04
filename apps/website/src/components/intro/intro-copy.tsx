import { cn } from '@repo/utilities/cn'

type IntroCopyProps = {
  className?: string
}

export function IntroCopy({ className }: IntroCopyProps) {
  return (
    <div
      className={cn(
        'font-regular font-sans text-muted-foreground text-title leading-snug tracking-tight',
        className
      )}
    >
      <p>Tamas Palecian</p>
      <p className="mt-1">—Technical Lead</p>
    </div>
  )
}
