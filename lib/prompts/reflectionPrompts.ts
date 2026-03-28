export const REFLECTION_STEPS = [
  {
    step: 1,
    label: "Movement",
    prompt: `You might take a moment to settle into this space.
    There is nothing you need to work out or complete here.
    For now, you might simply notice what feels present for you.`,
    background_desktop: '/reflection.png',
    background_mobile: '/reflection-mobile.png'
  },
  {
    step: 2,
    label: "Movement",
    prompt: `As you sit here for a moment longer, something may begin to come into your awareness.
    Not something you think you should focus on… but whatever has quietly been sitting with you.`,
    background_desktop: '/reflection.png',
    background_mobile: '/reflection-mobile.png'
  },
  {
    step: 3,
    label: "Movement",
    prompt: `If it feels natural, you might allow a few words to come through about what you're noticing.
    There is no need to organize the thought or explain it clearly.
    Simply write whatever feels true.`,
    background_desktop: '/reflection.png',
    background_mobile: '/reflection-mobile.png'
  },
  {
    step: 4,
    label: "Movement",
    prompt: `As you read what you’ve written, you might notice something about it.
    Perhaps a feeling…
    perhaps a pattern…
    or something you hadn’t quite recognized before.`,
    background_desktop: '/desk-4.png',
    background_mobile: '/mobile-4.png'
  },
  {
    step: 5,
    label: "Movement",
    prompt: `You might allow yourself to sit with what you've just noticed for a moment.
    Without needing to change it.
    Simply noticing what it feels like to acknowledge it.`,
    background_desktop: '/desk-5.png',
    background_mobile: '/mobile-5.png'
  },
  {
    step: 6,
    label: "Movement",
    prompt: `As you sit here now, you might begin to notice whether anything feels slightly different.
    Perhaps a little more space…
    perhaps a subtle shift…
    or simply a quiet awareness that wasn’t there before.`,
    background_desktop: '/desk-6.png',
    background_mobile: '/mobile-6.png'
  },
] as const

export const TOTAL_STEPS = REFLECTION_STEPS.length
