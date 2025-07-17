import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { subDays, format } from "date-fns"

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
      ? { 
          qrCode: { 
            book: { 
              author: { 
                name: { contains: authorFilter, mode: 'insensitive' as const } 
              } 
            } 
          } 
        }
      : {}

    // Get detailed scan data
    const scans = await db.qrScan.findMany({
      where: {
        ...whereClause,
        scannedAt: { gte: startDate, lte: endDate }
      },
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
      },
      orderBy: { scannedAt: 'desc' }
    })

    // Create CSV content
    const csvHeaders = [
      'Date',
      'Time',
      'Author',
      'Book Title',
      'QR Code Name',
      'QR Code Type',
      'User Agent',
      'IP Address',
      'Country',
      'City'
    ]

    const csvRows = scans.map(scan => [
      format(scan.scannedAt, 'yyyy-MM-dd'),
      format(scan.scannedAt, 'HH:mm:ss'),
      scan.qrCode.book.author.name,
      scan.qrCode.book.title,
      scan.qrCode.name,
      scan.qrCode.type,
      scan.userAgent || '',
      scan.ipAddress || '',
      scan.country || '',
      scan.city || ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="admin-report-${range}-${format(new Date(), 'yyyy-MM-dd')}.csv"`
      }
    })
  } catch (error) {
    console.error('Export admin report API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}