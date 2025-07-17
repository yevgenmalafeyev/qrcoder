import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authorId = session.user.id

    const [
      totalBooks,
      totalQrCodes,
      totalScans,
      recentScans
    ] = await Promise.all([
      db.book.count({
        where: { authorId }
      }),
      db.qrCode.count({
        where: { book: { authorId } }
      }),
      db.qrScan.count({
        where: { qrCode: { book: { authorId } } }
      }),
      db.qrScan.findMany({
        where: { qrCode: { book: { authorId } } },
        take: 10,
        orderBy: { scannedAt: 'desc' },
        include: {
          qrCode: {
            include: {
              book: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      totalBooks,
      totalQrCodes,
      totalScans,
      recentScans
    })
  } catch (error) {
    console.error('Author dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}