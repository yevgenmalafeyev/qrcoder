import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const qrCode = await db.qrCode.findUnique({
      where: { id: resolvedParams.id },
      include: {
        book: {
          include: {
            author: true
          }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    const userAgent = request.headers.get('user-agent')
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    await db.qrScan.create({
      data: {
        qrCodeId: qrCode.id,
        userAgent,
        ipAddress,
        country: 'Unknown',
        city: 'Unknown',
      }
    })

    return NextResponse.json({
      id: qrCode.id,
      name: qrCode.name,
      type: qrCode.type,
      content: qrCode.content,
      book: {
        title: qrCode.book.title,
        author: {
          name: qrCode.book.author.name
        }
      }
    })
  } catch (error) {
    console.error('QR code API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}