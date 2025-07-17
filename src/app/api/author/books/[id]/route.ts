import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface AuthenticatedSession {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as AuthenticatedSession | null
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const book = await db.book.findFirst({
      where: { 
        id: resolvedParams.id,
        authorId: session.user.id
      },
      include: {
        qrCodes: {
          include: {
            _count: {
              select: { scans: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Book detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as AuthenticatedSession | null
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, isbn, description } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const resolvedParams = await params
    const book = await db.book.findFirst({
      where: { 
        id: resolvedParams.id,
        authorId: session.user.id
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const updatedBook = await db.book.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        isbn,
        description
      }
    })

    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error('Update book API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as AuthenticatedSession | null
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const book = await db.book.findFirst({
      where: { 
        id: resolvedParams.id,
        authorId: session.user.id
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    await db.book.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Delete book API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}