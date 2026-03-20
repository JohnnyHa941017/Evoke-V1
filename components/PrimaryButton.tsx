"use client"

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-accent px-8 sm:px-10 md:px-12 py-3 sm:py-4 text-base sm:text-lg md:text-xl font-light tracking-wide text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-40 ${className}`}
      style={{ fontFamily: "Bradley Hand ITC", fontSize: "clamp(18px, 4vw, 28px)" }}
    >
      {children}
    </button>
  )
}
