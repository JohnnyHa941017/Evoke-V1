/*
export interface Session {
  id: string
  createdAt: string
  completed: boolean
  reflections: Reflection[]
}

export interface Reflection {
  id: string
  sessionId: string
  step: number
  input: string
  response: string
  createdAt: string
}
*/

export type Reflection = {
  step: number
  input: string
  response: string
}

export type Session = {
  sessionId: string
  currentStep: number
  completed: boolean
  reflections: Reflection[]
  createdAt: number
}


export interface StartSessionResponse {
  sessionId: string
}

export interface ReflectRequest {
  sessionId: string
  step: number
  input: string
}

export interface ReflectResponse {
  reflection: string
}

export interface CompleteSessionRequest {
  sessionId: string
  reorientation?: string
}
