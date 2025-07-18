import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const adminCount = await db.admin.count()
    const authorCount = await db.author.count()
    const bookCount = await db.book.count()
    
    return NextResponse.json({
      success: true,
      data: {
        admins: adminCount,
        authors: authorCount,
        books: bookCount
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database connection failed'
    }, { status: 500 })
  }
}