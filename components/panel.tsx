import { memo } from 'react'
import cn from 'classnames'
import { Card } from '@material-tailwind/react/components/Card'

export const Panel = memo(function Panel({ children, className }: { className?: string; children: React.ReactNode }) {
  return <Card className={cn(className, 'bg-secondary-400 p-4')}>{children}</Card>
})
