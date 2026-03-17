import type { Session, Reflection } from "@/types/session"

// In-memory store for sessions and reflections
const sessions = new Map<string, Session>()

function generateId(): string {
  return crypto.randomUUID()
}

export function createSession(): Session {
  const session: Session = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    completed: false,
    reflections: [],
  }
  sessions.set(session.id, session)
  return session
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId)
}

export function addReflection(
  sessionId: string,
  step: number,
  input: string,
  response: string
): Reflection | undefined {
  const session = sessions.get(sessionId)
  if (!session) return undefined

  const reflection: Reflection = {
    id: generateId(),
    sessionId,
    step,
    input,
    response,
    createdAt: new Date().toISOString(),
  }
  session.reflections.push(reflection)
  return reflection
}

export function completeSession(sessionId: string): boolean {
  const session = sessions.get(sessionId)
  if (!session) return false
  session.completed = true
  return true
}

export function getReflections(sessionId: string): Reflection[] {
  const session = sessions.get(sessionId)
  if (!session) return []
  return session.reflections
}
