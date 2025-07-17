import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalAuthors,
      totalBooks,
      totalQrCodes,
      totalScans,
    ] = await Promise.all([
      db.author.count(),
      db.book.count(),
      db.qrCode.count(),
      db.qrScan.count(),
    ])

    const recentActivity = await db.qrScan.findMany({
      take: 5,
      orderBy: { scannedAt: 'desc' },
      include: {
        qrCode: {
          include: {
            book: {
              include: {
                author: true
              }
            }
          }
        }
      }
    })

    const formattedActivity = recentActivity.map(scan => ({
      id: scan.id,
      type: 'scan',
      message: `QR code "${scan.qrCode.name}" from book "${scan.qrCode.book.title}" by ${scan.qrCode.book.author.name} was scanned`,
      timestamp: new Date(scan.scannedAt).toLocaleDateString()
    }))

    return NextResponse.json({
      totalAuthors,
      totalBooks,
      totalQrCodes,
      totalScans,
      recentActivity: formattedActivity
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}