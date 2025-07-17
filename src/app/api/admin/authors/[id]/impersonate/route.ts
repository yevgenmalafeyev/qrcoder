import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { signIn } from "next-auth/react"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const author = await db.author.findUnique({
      where: { id: params.id }
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