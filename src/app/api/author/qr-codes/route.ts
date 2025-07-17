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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, type, content, bookId } = await request.json()

    if (!name || !type || !content || !bookId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!['URL', 'VIDEO', 'TEXT', 'IMAGE'].includes(type)) {
      return NextResponse.json({ error: 'Invalid QR code type' }, { status: 400 })
    }

    // Verify the book belongs to the author
    const book = await db.book.findFirst({
      where: { 
        id: bookId,
        authorId: session.user.id
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const qrCode = await db.qrCode.create({
      data: {
        name,
        type,
        content,
        bookId
      },
      include: {
        book: {
          include: {
            author: true
          }
        }
      }
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error('Create QR code API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const qrCodes = await db.qrCode.findMany({
      where: { 
        book: { 
          authorId: session.user.id 
        } 
      },
      include: {
        book: true,
        _count: {
          select: { scans: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('Get QR codes API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}