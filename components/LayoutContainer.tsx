interface LayoutContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function LayoutContainer({ children, className = "", style }: LayoutContainerProps) {
  return (
    <main className={`relative flex min-h-screen items-center justify-center px-6 py-16 ${className}`} style={style} suppressHydrationWarning>
      <div className="w-full max-w-[680px]">{children}</div>
    </main>
  )
}
