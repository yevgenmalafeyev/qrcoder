export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface BookWithStats {
  id: string
  title: string
  isbn?: string | null
  description?: string | null
  authorId: string
  createdAt: Date | string
  updatedAt: Date | string
  _count: {
    qrCodes: number
  }
  qrCodes: QRCodeWithStats[]
}

export interface QRCodeWithStats {
  id: string
  name: string
  type: 'URL' | 'VIDEO' | 'TEXT' | 'IMAGE'
  content: string
  bookId: string
  createdAt: Date | string
  updatedAt: Date | string
  _count: {
    scans: number
  }
  scans?: ScanRecord[]
}

export interface ScanRecord {
  id: string
  qrCodeId: string
  scannedAt: Date | string
  ipAddress?: string | null
  userAgent?: string | null
  country?: string | null
  city?: string | null
}

export interface AuthorWithStats {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  _count: {
    books: number
  }
  books?: BookWithStats[]
}

export interface AdminWithStats {
  id: string
  name: string
  email: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DashboardStats {
  totalBooks: number
  totalQRCodes: number
  totalScans: number
  activeAuthors?: number
  recentActivity?: RecentActivity[]
}

export interface RecentActivity {
  id: string
  type: 'book_created' | 'qr_created' | 'qr_scanned' | 'author_created'
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface ReportData {
  period: string
  books: BookWithStats[]
  totalScans: number
  topPerformingQRCodes: Array<{
    qrCode: QRCodeWithStats
    scanCount: number
  }>
  scansByDate: Array<{
    date: string
    scans: number
  }>
}

export interface CreateBookRequest {
  title: string
  isbn?: string
  description?: string
}

export interface CreateQRCodeRequest {
  name: string
  type: 'URL' | 'VIDEO' | 'TEXT' | 'IMAGE'
  content: string
  bookId: string
}

export interface CreateAuthorRequest {
  name: string
  email: string
  password: string
}

export interface UpdateAuthorRequest {
  name?: string
  email?: string
  isActive?: boolean
}

export interface ResetPasswordRequest {
  authorId: string
  newPassword: string
}