import 'react'

declare module 'react' {
  interface HTMLAttributes<T> extends React.HTMLAttributes<T> {
    placeholder?: string
    onPointerEnterCapture?: React.PointerEventHandler<T>
    onPointerLeaveCapture?: React.PointerEventHandler<T>
    className?: string
  }
}
