import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
}
// import { signIn } from "next-auth/react" // Not used in current implementation

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as AuthenticatedUser).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const author = await db.author.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    if (!author.isActive) {
      return NextResponse.json({ error: 'Author account is inactive' }, { status: 403 })
    }

    // In a real implementation, you would create a special session or token
    // For now, we'll return success and let the frontend handle the redirect
    return NextResponse.json({ 
      message: 'Impersonation successful',
      authorId: author.id,
      authorName: author.name
    })
  } catch (error) {
    console.error('Impersonate author API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}