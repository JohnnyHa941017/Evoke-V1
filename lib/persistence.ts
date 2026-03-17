/**
 * Local Storage persistence utility for Evoke session state
 * Saves and restores complete session data across browser closures
 */

import type { Session, Reflection } from "@/types/session"

const SESSION_KEY = "evoke-session-id"
const SESSION_DATA_KEY = "evoke-session-data"
const CURRENT_STEP_KEY = "evoke-current-step"
const SESSION_COMPLETED_KEY = "evoke-session-completed"

/**
 * Save the current session state to localStorage
 */
export function persistSessionState(
  sessionId: string,
  currentStep: number,
  reflections: Reflection[],
  completed: boolean = false
): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SESSION_KEY, sessionId)
    localStorage.setItem(CURRENT_STEP_KEY, currentStep.toString())
    localStorage.setItem(SESSION_COMPLETED_KEY, completed.toString())
    
    // Save reflections data
    localStorage.setItem(
      SESSION_DATA_KEY,
      JSON.stringify({
        sessionId,
        currentStep,
        completed,
        reflections,
        lastSavedAt: new Date().toISOString(),
      })
    )
  } catch (error) {
    console.error("Failed to persist session state:", error)
  }
}

/**
 * Restore session state from localStorage if it exists
 */
export function restoreSessionState(): {
  sessionId: string | null
  currentStep: number | null
  reflections: Reflection[]
  completed: boolean
} {
  if (typeof window === "undefined") {
    return { sessionId: null, currentStep: null, reflections: [], completed: false }
  }

  try {
    const sessionId = localStorage.getItem(SESSION_KEY)
    const currentStepStr = localStorage.getItem(CURRENT_STEP_KEY)
    const completedStr = localStorage.getItem(SESSION_COMPLETED_KEY)
    
    const currentStep = currentStepStr ? parseInt(currentStepStr, 10) : null
    const completed = completedStr === "true"

    // Try to restore full session data
    const sessionDataStr = localStorage.getItem(SESSION_DATA_KEY)
    let reflections: Reflection[] = []

    if (sessionDataStr) {
      try {
        const data = JSON.parse(sessionDataStr)
        reflections = data.reflections || []
      } catch {
        // Invalid JSON, continue without reflections
      }
    }

    return { sessionId, currentStep, reflections, completed }
  } catch (error) {
    console.error("Failed to restore session state:", error)
    return { sessionId: null, currentStep: null, reflections: [], completed: false }
  }
}

/**
 * Save a single reflection to the session
 */
export function saveReflection(
  sessionId: string,
  step: number,
  input: string,
  response: string
): void {
  if (typeof window === "undefined") return

  try {
    const sessionDataStr = localStorage.getItem(SESSION_DATA_KEY)
    const sessionData = sessionDataStr ? JSON.parse(sessionDataStr) : { reflections: [] }

    // Update or add reflection
    const existingIndex = sessionData.reflections.findIndex(
      (r: Reflection) => r.step === step
    )

    const reflection: Reflection = { step, input, response }

    if (existingIndex >= 0) {
      sessionData.reflections[existingIndex] = reflection
    } else {
      sessionData.reflections.push(reflection)
    }

    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData))
  } catch (error) {
    console.error("Failed to save reflection:", error)
  }
}

/**
 * Update the current step in localStorage
 */
export function updateCurrentStep(step: number): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(CURRENT_STEP_KEY, step.toString())
    
    const sessionDataStr = localStorage.getItem(SESSION_DATA_KEY)
    if (sessionDataStr) {
      const sessionData = JSON.parse(sessionDataStr)
      sessionData.currentStep = step
      localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData))
    }
  } catch (error) {
    console.error("Failed to update current step:", error)
  }
}

/**
 * Mark session as completed
 */
export function markSessionCompleted(sessionId: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SESSION_COMPLETED_KEY, "true")
    
    const sessionDataStr = localStorage.getItem(SESSION_DATA_KEY)
    if (sessionDataStr) {
      const sessionData = JSON.parse(sessionDataStr)
      sessionData.completed = true
      localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData))
    }
  } catch (error) {
    console.error("Failed to mark session completed:", error)
  }
}

/**
 * Clear all session data from localStorage
 */
export function clearSessionData(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_DATA_KEY)
    localStorage.removeItem(CURRENT_STEP_KEY)
    localStorage.removeItem(SESSION_COMPLETED_KEY)
  } catch (error) {
    console.error("Failed to clear session data:", error)
  }
}

/**
 * Get all reflections from localStorage
 */
export function getSavedReflections(): Reflection[] {
  if (typeof window === "undefined") return []

  try {
    const sessionDataStr = localStorage.getItem(SESSION_DATA_KEY)
    if (sessionDataStr) {
      const data = JSON.parse(sessionDataStr)
      return data.reflections || []
    }
  } catch (error) {
    console.error("Failed to get saved reflections:", error)
  }

  return []
}
