import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  label: string
}

export function IconButton({ icon: Icon, label, ...props }: IconButtonProps) {
  return (
    <button type="button" className="grid size-8 shrink-0 place-items-center rounded-md text-slate-500 transition-colors enabled:hover:bg-blue-50 enabled:hover:text-cobalt disabled:cursor-default disabled:text-slate-300" aria-label={label} title={label} {...props}>
      <Icon size={17} />
    </button>
  )
}
