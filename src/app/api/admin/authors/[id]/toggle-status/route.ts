import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isActive } = await request.json()

    const resolvedParams = await params
    const author = await db.author.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    const updatedAuthor = await db.author.update({
      where: { id: resolvedParams.id },
      data: { isActive },
      include: {
        _count: {
          select: { books: true }
        }
      }
    })

    return NextResponse.json(updatedAuthor)
  } catch (error) {
    console.error('Toggle author status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}