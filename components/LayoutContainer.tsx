interface LayoutContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function LayoutContainer({ children, className = "", style }: LayoutContainerProps) {
  return (
    <main className={`relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 ${className}`} style={style} suppressHydrationWarning>
      <div className="w-full max-w-[680px]">{children}</div>
    </main>
  )
}
