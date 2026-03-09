import Link from "next/link"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Link
        href="/"
        className="text-xs font-medium uppercase tracking-[0.25em] text-foreground/70 hover:text-foreground"
      >
        Evoke
      </Link>
      <div className="h-px w-12 bg-border" aria-hidden="true" />
    </header>
  )
}
