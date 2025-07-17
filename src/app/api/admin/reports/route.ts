import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { subDays, format, eachDayOfInterval } from "date-fns"

interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '30d'
    const authorFilter = url.searchParams.get('author')
    
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    const startDate = subDays(new Date(), days)
    const endDate = new Date()

    // Build where clause for author filter
    const whereClause = authorFilter 
      ? { qrCode: { book: { author: { name: { contains: authorFilter, mode: 'insensitive' as const } } } } }
      : { qrCode: { book: {} } }

    const bookWhereClause = authorFilter
      ? { author: { name: { contains: authorFilter, mode: 'insensitive' as const } } }
      : {}

    // Get overview stats
    const [totalBooks, totalQrCodes, totalScans, totalAuthors, scansThisMonth] = await Promise.all([
      db.book.count({ where: bookWhereClause }),
      db.qrCode.count({ where: { book: bookWhereClause } }),
      db.qrScan.count({ where: whereClause }),
      db.author.count({ where: { isActive: true } }),
      db.qrScan.count({
        where: {
          ...whereClause,
          scannedAt: { gte: subDays(new Date(), 30) }
        }
      })
    ])

    // Get scan trends
    const scansByDate = await db.qrScan.groupBy({
      by: ['scannedAt'],
      where: {
        ...whereClause,
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

    // Get author performance
    const authorPerformance = await db.author.findMany({
      where: authorFilter ? { name: { contains: authorFilter, mode: 'insensitive' } } : {},
      select: {
        name: true,
        books: {
          select: {
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
        }
      },
      take: 10
    })

    const formattedAuthorPerformance = authorPerformance.map(author => ({
      name: author.name.length > 15 ? author.name.substring(0, 15) + '...' : author.name,
      books: author.books.length,
      qrCodes: author.books.reduce((sum, book) => sum + book._count.qrCodes, 0),
      scans: author.books.reduce((sum, book) => 
        sum + book.qrCodes.reduce((qrSum, qr) => qrSum + qr._count.scans, 0), 0
      )
    }))

    // Get QR code types distribution
    const qrCodeTypes = await db.qrCode.groupBy({
      by: ['type'],
      where: { book: bookWhereClause },
      _count: true
    })

    const formattedQrCodeTypes = qrCodeTypes.map(type => ({
      name: type.type,
      value: type._count,
      color: getTypeColor(type.type)
    }))

    // Get top books
    const topBooks = await db.book.findMany({
      where: bookWhereClause,
      include: {
        author: true,
        qrCodes: {
          include: {
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
      },
      take: 20
    })

    const formattedTopBooks = topBooks
      .map(book => ({
        title: book.title,
        author: book.author.name,
        scans: book.qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0)
      }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 10)

    const reportData = {
      overview: {
        totalScans,
        totalBooks,
        totalQrCodes,
        totalAuthors,
        scansThisMonth
      },
      scanTrends,
      authorPerformance: formattedAuthorPerformance,
      qrCodeTypes: formattedQrCodeTypes,
      topBooks: formattedTopBooks
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Admin reports API error:', error)
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