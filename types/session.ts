export type Reflection = {
  step: number
  input: string
  response: string
}

export type Session = {
  id: string
  createdAt: string
  completed: boolean
  reflections: Reflection[]
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
