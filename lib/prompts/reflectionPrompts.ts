export const REFLECTION_STEPS = [
  {
    step: 1,
    label: "Movement",
    prompt: "You might begin by noticing what feels most present for you right now.",
  },
  {
    step: 2,
    label: "Movement",
    prompt: "Perhaps you can notice where your attention naturally goes.",
  },
  {
    step: 3,
    label: "Movement",
    prompt: "You may begin to notice any thoughts moving through your mind.",
  },
  {
    step: 4,
    label: "Movement",
    prompt: "See if there is a feeling underneath those thoughts.",
  },
  {
    step: 5,
    label: "Movement",
    prompt: "You might gently acknowledge whatever is here.",
  },
  {
    step: 6,
    label: "Movement",
    prompt: "You may allow whatever is here to soften slightly.",
  },
] as const

export const TOTAL_STEPS = REFLECTION_STEPS.length
