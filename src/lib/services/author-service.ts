import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { AuthorWithStats, CreateAuthorRequest, UpdateAuthorRequest } from "@/types/api"

export class AuthorService {
  static async getAllAuthors(): Promise<AuthorWithStats[]> {
    return await db.author.findMany({
      include: {
        _count: {
          select: { books: true }
        },
        books: {
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getAuthorById(authorId: string): Promise<AuthorWithStats | null> {
    return await db.author.findUnique({
      where: { id: authorId },
      include: {
        _count: {
          select: { books: true }
        },
        books: {
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
        }
      }
    })
  }

  static async createAuthor(data: CreateAuthorRequest): Promise<AuthorWithStats> {
    const hashedPassword = await hashPassword(data.password)
    
    return await db.author.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        isActive: true
      },
      include: {
        _count: {
          select: { books: true }
        },
        books: {
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
        }
      }
    })
  }

  static async updateAuthor(
    authorId: string, 
    data: UpdateAuthorRequest
  ): Promise<AuthorWithStats | null> {
    return await db.author.update({
      where: { id: authorId },
      data,
      include: {
        _count: {
          select: { books: true }
        },
        books: {
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
        }
      }
    })
  }

  static async resetAuthorPassword(authorId: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await hashPassword(newPassword)
      await db.author.update({
        where: { id: authorId },
        data: { password: hashedPassword }
      })
      return true
    } catch {
      return false
    }
  }

  static async toggleAuthorStatus(authorId: string): Promise<AuthorWithStats | null> {
    const author = await db.author.findUnique({
      where: { id: authorId }
    })
    
    if (!author) return null
    
    return await db.author.update({
      where: { id: authorId },
      data: { isActive: !author.isActive },
      include: {
        _count: {
          select: { books: true }
        },
        books: {
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
        }
      }
    })
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    const author = await db.author.findUnique({
      where: { email }
    })
    return !!author
  }

  static async impersonateAuthor(authorId: string): Promise<AuthorWithStats | null> {
    return await db.author.findUnique({
      where: { id: authorId, isActive: true },
      include: {
        _count: {
          select: { books: true }
        },
        books: {
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
        }
      }
    })
  }
}