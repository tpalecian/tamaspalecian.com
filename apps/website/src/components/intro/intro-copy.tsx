import { cn } from '@repo/utilities/cn'

const introLineClass =
  'font-regular font-sans text-huge text-muted-foreground tracking-tight'

type IntroCopyProps = {
  className?: string
}

export function IntroCopy({ className }: IntroCopyProps) {
  return (
    <div className={cn(className)}>
      <p className={introLineClass}>Tamas Palecian</p>
      <p className={cn(introLineClass, 'mt-1')}>—Technical Lead</p>
    </div>
  )
}
