import { db } from "@/lib/db"
import { BookWithStats, CreateBookRequest } from "@/types/api"

export class BookService {
  static async getBooksByAuthor(authorId: string): Promise<BookWithStats[]> {
    return await db.book.findMany({
      where: { authorId },
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
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getBookById(bookId: string, authorId?: string): Promise<BookWithStats | null> {
    const where = authorId ? { id: bookId, authorId } : { id: bookId }
    
    return await db.book.findUnique({
      where,
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
    })
  }

  static async createBook(data: CreateBookRequest & { authorId: string }): Promise<BookWithStats> {
    return await db.book.create({
      data,
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
    })
  }

  static async updateBook(
    bookId: string, 
    data: Partial<CreateBookRequest>,
    authorId?: string
  ): Promise<BookWithStats | null> {
    const where = authorId ? { id: bookId, authorId } : { id: bookId }
    
    return await db.book.update({
      where,
      data,
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
    })
  }

  static async deleteBook(bookId: string, authorId?: string): Promise<boolean> {
    const where = authorId ? { id: bookId, authorId } : { id: bookId }
    
    try {
      await db.book.delete({ where })
      return true
    } catch {
      return false
    }
  }

  static async getAllBooks(): Promise<BookWithStats[]> {
    return await db.book.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}