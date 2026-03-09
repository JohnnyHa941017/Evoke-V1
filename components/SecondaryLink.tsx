import Link from "next/link"

interface SecondaryLinkProps {
  href: string
  children: React.ReactNode
}

export function SecondaryLink({ href, children }: SecondaryLinkProps) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  )
}
