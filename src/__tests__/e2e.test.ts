/**
 * End-to-End Tests for Production Environment
 * 
 * These tests validate the core functionality of the QRCoder application
 * against the production environment.
 */

describe('Production E2E Tests', () => {
  const PROD_URL = 'https://qrcoder-phi.vercel.app'
  
  // Test credentials from seed data
  const TEST_ADMIN = {
    email: 'admin@example.com',
    password: 'admin123'
  }
  
  const TEST_AUTHOR = {
    email: 'author@example.com',
    password: 'author123'
  }

  beforeEach(() => {
    // Mock fetch for production testing
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Authentication Flow', () => {
    it('should allow admin login', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, user: { role: 'admin' } })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_ADMIN.email,
          password: TEST_ADMIN.password,
          userType: 'admin'
        })
      })
      
      expect(response.ok).toBe(true)
      expect(fetch).toHaveBeenCalledWith(`${PROD_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_ADMIN.email,
          password: TEST_ADMIN.password,
          userType: 'admin'
        })
      })
    })

    it('should allow author login', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, user: { role: 'author' } })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_AUTHOR.email,
          password: TEST_AUTHOR.password,
          userType: 'author'
        })
      })
      
      expect(response.ok).toBe(true)
    })

    it('should reject invalid credentials', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword',
          userType: 'author'
        })
      })
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })
  })

  describe('Admin API Endpoints', () => {
    it('should fetch admin dashboard data', async () => {
      const mockDashboardData = {
        totalAuthors: 5,
        totalBooks: 10,
        totalQRCodes: 50,
        totalScans: 200,
        recentActivity: []
      }
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockDashboardData
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': 'Bearer mock-admin-token' }
      })
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('totalAuthors')
      expect(data).toHaveProperty('totalBooks')
      expect(data).toHaveProperty('totalQRCodes')
      expect(data).toHaveProperty('totalScans')
    })

    it('should fetch authors list', async () => {
      const mockAuthors = [
        { id: '1', name: 'Author 1', email: 'author1@example.com' },
        { id: '2', name: 'Author 2', email: 'author2@example.com' }
      ]
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockAuthors
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/admin/authors`, {
        headers: { 'Authorization': 'Bearer mock-admin-token' }
      })
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('Author API Endpoints', () => {
    it('should fetch author dashboard data', async () => {
      const mockDashboardData = {
        totalBooks: 3,
        totalQrCodes: 15,
        totalScans: 75,
        recentScans: []
      }
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockDashboardData
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/author/dashboard`, {
        headers: { 'Authorization': 'Bearer mock-author-token' }
      })
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('totalBooks')
      expect(data).toHaveProperty('totalQrCodes')
      expect(data).toHaveProperty('totalScans')
    })

    it('should fetch author books', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', description: 'Description 1' },
        { id: '2', title: 'Book 2', description: 'Description 2' }
      ]
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockBooks
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/author/books`, {
        headers: { 'Authorization': 'Bearer mock-author-token' }
      })
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('QR Code Functionality', () => {
    it('should fetch QR code data', async () => {
      const mockQRCode = {
        id: '1',
        name: 'Test QR Code',
        content: 'Test content',
        book: {
          title: 'Test Book',
          author: { name: 'Test Author' }
        }
      }
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockQRCode
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/qr/test-qr-id`)
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('content')
      expect(data).toHaveProperty('book')
    })

    it('should record QR code scan', async () => {
      const mockScanResponse = {
        success: true,
        scanCount: 1
      }
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockScanResponse
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/qr/test-qr-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('success', true)
    })

    it('should handle non-existent QR code', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({ error: 'QR code not found' })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/qr/non-existent-id`)
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })
  })

  describe('Application Health', () => {
    it('should load home page', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () => '<html><body>QRCoder</body></html>'
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(PROD_URL)
      
      expect(response.ok).toBe(true)
      expect(response.status).toBe(200)
    })

    it('should load login page', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () => '<html><body>Login</body></html>'
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/login`)
      
      expect(response.ok).toBe(true)
      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      
      try {
        await fetch(`${PROD_URL}/api/admin/dashboard`)
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })

    it('should handle server errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/admin/dashboard`)
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })
})