interface ReflectionDisplayProps {
  reflection: string
}

export function ReflectionDisplay({ reflection }: ReflectionDisplayProps) {
  return (
    <div className="mt-10 rounded-lg border border-border bg-card px-6 py-6 md:px-8 md:py-8">
      <p className="font-serif text-lg leading-relaxed text-foreground/90 italic">
        {reflection}
      </p>
    </div>
  )
}
