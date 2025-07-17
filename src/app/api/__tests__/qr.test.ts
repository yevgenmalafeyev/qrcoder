import { GET } from '../qr/[id]/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    qrCode: {
      findUnique: jest.fn(),
    },
    qrScan: {
      create: jest.fn(),
    },
  },
}))

describe('/api/qr/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return QR code data and track scan', async () => {
    const mockQrCode = {
      id: 'test-id',
      name: 'Test QR Code',
      type: 'TEXT',
      content: 'Test content',
      book: {
        title: 'Test Book',
        author: {
          name: 'Test Author',
        },
      },
    }

    ;(db.qrCode.findUnique as jest.Mock).mockResolvedValue(mockQrCode)
    ;(db.qrScan.create as jest.Mock).mockResolvedValue({})

    const request = new NextRequest('http://localhost:3000/api/qr/test-id')
    const response = await GET(request, { params: { id: 'test-id' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('Test QR Code')
    expect(data.type).toBe('TEXT')
    expect(data.content).toBe('Test content')
    expect(db.qrScan.create).toHaveBeenCalledWith({
      data: {
        qrCodeId: 'test-id',
        userAgent: null,
        ipAddress: 'unknown',
        country: 'Unknown',
        city: 'Unknown',
      },
    })
  })

  it('should return 404 for non-existent QR code', async () => {
    ;(db.qrCode.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/qr/nonexistent')
    const response = await GET(request, { params: { id: 'nonexistent' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('QR code not found')
  })

  it('should handle database errors', async () => {
    ;(db.qrCode.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/qr/test-id')
    const response = await GET(request, { params: { id: 'test-id' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})