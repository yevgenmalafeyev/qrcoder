import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, hashPassword } from "@/lib/auth"
import { db } from "@/lib/db"

interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authors = await db.author.findMany({
      include: {
        _count: {
          select: { books: true }
        },
        books: {
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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(authors)
  } catch (error) {
    console.error('Get authors API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if author already exists
    const existingAuthor = await db.author.findUnique({
      where: { email }
    })

    if (existingAuthor) {
      return NextResponse.json({ error: 'Author with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const author = await db.author.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true
      },
      include: {
        _count: {
          select: { books: true }
        }
      }
    })

    return NextResponse.json(author)
  } catch (error) {
    console.error('Create author API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}