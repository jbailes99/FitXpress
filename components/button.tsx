import { memo } from 'react'
import cn from 'classnames'
import { Button as MaterialButton } from '@material-tailwind/react'

export const Button = memo(function Button({
  children,
  onClick,
  className,
  rounded,
  shadow,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
  rounded?: boolean
  shadow?: boolean
}) {
  return (
    <MaterialButton
      className={cn(
        className,
        'px-4 py-2 font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed',
        {
          'rounded-full': rounded,
          'shadow-lg': shadow,
        }
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </MaterialButton>
  )
})

// export const Button = memo(function Button({
//   children,
//   onClick,
//   className,
//   rounded,
//   shadow,
//   ...props
// }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
//   className?: string
//   rounded?: boolean
//   shadow?: boolean
//   children: React.ReactNode
//   onClick?: () => void
// }) {
//   return (
//     <button
//       className={cn(
//         className,
//         'px-4 py-2 font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed',
//         {
//           'rounded-full': rounded,
//           'shadow-lg': shadow,
//         }
//       )}
//       onClick={onClick}
//       {...props}
//     >
//       {children}
//     </button>
//   )
// })
