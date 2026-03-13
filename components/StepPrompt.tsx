interface StepPromptProps {
  label: string
  prompt: string
}

export function StepPrompt({ label, prompt }: StepPromptProps) {
  return (
    <div className="mb-0 h-36 flex flex-col justify-center">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {/* {label} */}
      </p>
      <p className="font-serif text-xl leading-relaxed text-foreground md:text-2xl">
        {prompt}
      </p>
    </div>
  )
}
