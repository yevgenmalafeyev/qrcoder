import { db } from "@/lib/db"
import { QRCodeWithStats, CreateQRCodeRequest } from "@/types/api"

export class QRService {
  static async getQRCodesByAuthor(authorId: string): Promise<QRCodeWithStats[]> {
    return await db.qrCode.findMany({
      where: {
        book: {
          authorId
        }
      },
      include: {
        _count: {
          select: { scans: true }
        },
        book: {
          select: {
            id: true,
            title: true,
            authorId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getQRCodesByBook(bookId: string, authorId?: string): Promise<QRCodeWithStats[]> {
    const where = authorId 
      ? { bookId, book: { authorId } }
      : { bookId }
    
    return await db.qrCode.findMany({
      where,
      include: {
        _count: {
          select: { scans: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getQRCodeById(qrCodeId: string, authorId?: string): Promise<QRCodeWithStats | null> {
    const where = authorId 
      ? { id: qrCodeId, book: { authorId } }
      : { id: qrCodeId }
    
    return await db.qrCode.findUnique({
      where,
      include: {
        _count: {
          select: { scans: true }
        },
        scans: {
          orderBy: { scannedAt: 'desc' },
          take: 10
        }
      }
    })
  }

  static async createQRCode(data: CreateQRCodeRequest): Promise<QRCodeWithStats> {
    return await db.qrCode.create({
      data,
      include: {
        _count: {
          select: { scans: true }
        }
      }
    })
  }

  static async updateQRCode(
    qrCodeId: string, 
    data: Partial<CreateQRCodeRequest>,
    authorId?: string
  ): Promise<QRCodeWithStats | null> {
    const where = authorId 
      ? { id: qrCodeId, book: { authorId } }
      : { id: qrCodeId }
    
    return await db.qrCode.update({
      where,
      data,
      include: {
        _count: {
          select: { scans: true }
        }
      }
    })
  }

  static async deleteQRCode(qrCodeId: string, authorId?: string): Promise<boolean> {
    const where = authorId 
      ? { id: qrCodeId, book: { authorId } }
      : { id: qrCodeId }
    
    try {
      await db.qrCode.delete({ where })
      return true
    } catch {
      return false
    }
  }

  static async recordScan(qrCodeId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await db.qrScan.create({
      data: {
        qrCodeId,
        ipAddress,
        userAgent,
        scannedAt: new Date()
      }
    })
  }

  static async getQRCodeForScan(qrCodeId: string): Promise<QRCodeWithStats | null> {
    return await db.qrCode.findUnique({
      where: { id: qrCodeId },
      include: {
        _count: {
          select: { scans: true }
        },
        book: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })
  }

  static async getAllQRCodes(): Promise<QRCodeWithStats[]> {
    return await db.qrCode.findMany({
      include: {
        _count: {
          select: { scans: true }
        },
        book: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}