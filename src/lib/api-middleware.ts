import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export interface AuthenticatedSession {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface ApiError {
  error: string
  details?: unknown
}

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  return await getServerSession(authOptions) as AuthenticatedSession | null
}

export function checkAuth(session: AuthenticatedSession | null, allowedRoles: string[] = []): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}

export function createApiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function createApiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function handleApiError(error: unknown, context: string = 'API'): NextResponse {
  console.error(`${context} error:`, error)
  
  if (error instanceof Error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
  
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}