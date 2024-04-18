import { memo } from 'react'
import cn from 'classnames'

export const Panel = memo(function Panel({ children, className }: { className?: string; children: React.ReactNode }) {
  return <div className={cn(className, 'bg-secondary-400 p-4')}>{children}</div>
})
