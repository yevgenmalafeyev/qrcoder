import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { subDays, format, eachDayOfInterval } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '30d'
    
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    const startDate = subDays(new Date(), days)
    const endDate = new Date()

    const authorId = session.user.id

    // Get overview stats
    const [totalBooks, totalQrCodes, totalScans, scansThisMonth] = await Promise.all([
      db.book.count({
        where: { authorId }
      }),
      db.qrCode.count({
        where: { book: { authorId } }
      }),
      db.qrScan.count({
        where: { qrCode: { book: { authorId } } }
      }),
      db.qrScan.count({
        where: { 
          qrCode: { book: { authorId } },
          scannedAt: { gte: subDays(new Date(), 30) }
        }
      })
    ])

    // Get scan trends
    const scansByDate = await db.qrScan.groupBy({
      by: ['scannedAt'],
      where: {
        qrCode: { book: { authorId } },
        scannedAt: { gte: startDate, lte: endDate }
      },
      _count: true
    })

    // Generate all dates in range
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })
    const scanTrends = allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const scansForDate = scansByDate.filter(scan => 
        format(scan.scannedAt, 'yyyy-MM-dd') === dateStr
      )
      return {
        date: format(date, 'MMM dd'),
        scans: scansForDate.reduce((sum, scan) => sum + scan._count, 0)
      }
    })

    // Get book performance
    const bookPerformance = await db.book.findMany({
      where: { authorId },
      select: {
        title: true,
        _count: {
          select: {
            qrCodes: true
          }
        },
        qrCodes: {
          select: {
            _count: {
              select: {
                scans: {
                  where: {
                    scannedAt: { gte: startDate, lte: endDate }
                  }
                }
              }
            }
          }
        }
      }
    })

    const formattedBookPerformance = bookPerformance.map(book => ({
      name: book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title,
      scans: book.qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0),
      qrCodes: book._count.qrCodes
    }))

    // Get QR code types distribution
    const qrCodeTypes = await db.qrCode.groupBy({
      by: ['type'],
      where: { book: { authorId } },
      _count: true
    })

    const formattedQrCodeTypes = qrCodeTypes.map(type => ({
      name: type.type,
      value: type._count,
      color: getTypeColor(type.type)
    }))

    // Get recent activity
    const recentActivity = await db.qrScan.findMany({
      where: {
        qrCode: { book: { authorId } },
        scannedAt: { gte: startDate, lte: endDate }
      },
      include: {
        qrCode: {
          include: {
            book: true
          }
        }
      },
      orderBy: { scannedAt: 'desc' },
      take: 10
    })

    const formattedRecentActivity = recentActivity.map(scan => ({
      date: format(scan.scannedAt, 'MMM dd'),
      book: scan.qrCode.book.title,
      qrCode: scan.qrCode.name,
      scans: 1
    }))

    // Group recent activity by QR code
    const groupedActivity = formattedRecentActivity.reduce((acc, activity) => {
      const key = `${activity.book}-${activity.qrCode}-${activity.date}`
      if (acc[key]) {
        acc[key].scans += 1
      } else {
        acc[key] = activity
      }
      return acc
    }, {} as Record<string, typeof formattedRecentActivity[0]>)

    const reportData = {
      overview: {
        totalScans,
        totalBooks,
        totalQrCodes,
        scansThisMonth
      },
      scanTrends,
      bookPerformance: formattedBookPerformance,
      qrCodeTypes: formattedQrCodeTypes,
      recentActivity: Object.values(groupedActivity).slice(0, 10)
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Author reports API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'URL': return '#3b82f6'
    case 'VIDEO': return '#8b5cf6'
    case 'TEXT': return '#10b981'
    case 'IMAGE': return '#f59e0b'
    default: return '#6b7280'
  }
}