import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, hashPassword } from "@/lib/auth"
import { db } from "@/lib/db"

interface AuthenticatedSession {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

function generateRandomPassword(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as AuthenticatedSession | null
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const author = await db.author.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    const newPassword = generateRandomPassword()
    const hashedPassword = await hashPassword(newPassword)

    await db.author.update({
      where: { id: resolvedParams.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      message: 'Password reset successfully',
      newPassword
    })
  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}