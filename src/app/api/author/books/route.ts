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

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as AuthenticatedSession | null
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const books = await db.book.findMany({
      where: { authorId: session.user.id },
      include: {
        _count: {
          select: { qrCodes: true }
        },
        qrCodes: {
          include: {
            _count: {
              select: { scans: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Author books API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as AuthenticatedSession | null
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, isbn, description } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const book = await db.book.create({
      data: {
        title,
        isbn,
        description,
        authorId: session.user.id
      },
      include: {
        _count: {
          select: { qrCodes: true }
        }
      }
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Create book API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}