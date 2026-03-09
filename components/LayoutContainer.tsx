interface LayoutContainerProps {
  children: React.ReactNode
  className?: string
}

export function LayoutContainer({ children, className = "" }: LayoutContainerProps) {
  return (
    <main className={`flex min-h-screen items-center justify-center px-6 py-16 ${className}`}>
      <div className="w-full max-w-[680px]">{children}</div>
    </main>
  )
}
