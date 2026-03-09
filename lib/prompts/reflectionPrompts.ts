export const REFLECTION_STEPS = [
  {
    step: 1,
    label: "Movement",
    prompt: "Take a moment to arrive here. What feels most present for you right now?",
  },
  {
    step: 2,
    label: "Movement",
    prompt: "As you sit with the moment, what thoughts or feelings seem to be asking for your attention?",
  },
  {
    step: 3,
    label: "Movement",
    prompt: "What feels most alive or active in your life at the moment?",
  },
  {
    step: 4,
    label: "Movement",
    prompt: "When you sit quietly with that, what do you notice within yourself?",
  },
  {
    step: 5,
    label: "Movement",
    prompt: "As you reflect on what you’ve shared so far, what feels most meaningful or true for you?",
  },
  {
    step: 6,
    label: "Movement",
    prompt: "From where you are now, what feels most important to acknowledge for yourself?",
  },
] as const

export const TOTAL_STEPS = REFLECTION_STEPS.length
