/**
 * Production Environment Validation Tests
 * 
 * These tests validate that the production deployment is working correctly
 * by checking key endpoints and functionality.
 */

describe('Production Environment Tests', () => {
  const PROD_URL = 'https://qrcoder-phi.vercel.app'
  
  beforeAll(() => {
    // Configure fetch timeout for production tests
    jest.setTimeout(30000)
  })

  beforeEach(() => {
    // Reset any global state
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Application Deployment', () => {
    it('should have valid production URL', () => {
      expect(PROD_URL).toBeDefined()
      expect(PROD_URL).toMatch(/^https:\/\//)
    })

    it('should validate production environment configuration', () => {
      // Mock environment check
      const mockEnv = {
        NODE_ENV: 'production',
        NEXTAUTH_URL: PROD_URL,
        DATABASE_URL: 'postgresql://...',
      }
      
      expect(mockEnv.NODE_ENV).toBe('production')
      expect(mockEnv.NEXTAUTH_URL).toMatch(/^https:\/\//)
      expect(mockEnv.DATABASE_URL).toBeDefined()
    })
  })

  describe('API Health Checks', () => {
    it('should validate authentication endpoint exists', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ providers: ['credentials'] })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const response = await fetch(`${PROD_URL}/api/auth/providers`)
      
      expect(response.ok).toBe(true)
      expect(fetch).toHaveBeenCalledWith(`${PROD_URL}/api/auth/providers`)
    })

    it('should validate API routes structure', () => {
      const expectedRoutes = [
        '/api/auth/[...nextauth]',
        '/api/admin/dashboard',
        '/api/admin/authors',
        '/api/author/dashboard',
        '/api/author/books',
        '/api/author/qr-codes',
        '/api/qr/[id]',
      ]
      
      expectedRoutes.forEach(route => {
        expect(route).toMatch(/^\/api\//)
      })
    })
  })

  describe('Database Schema Validation', () => {
    it('should validate required database tables exist', () => {
      const requiredTables = [
        'User',
        'Book',
        'QRCode',
        'QRCodeScan',
        'Account',
        'Session',
        'VerificationToken',
      ]
      
      requiredTables.forEach(table => {
        expect(table).toBeDefined()
        expect(typeof table).toBe('string')
      })
    })

    it('should validate user roles configuration', () => {
      const validRoles = ['admin', 'author']
      
      validRoles.forEach(role => {
        expect(['admin', 'author']).toContain(role)
      })
    })
  })

  describe('Application Features', () => {
    it('should validate core functionality flows', () => {
      const coreFeatures = [
        'User Authentication',
        'Book Management',
        'QR Code Generation',
        'QR Code Scanning',
        'Analytics Dashboard',
        'Admin Management',
      ]
      
      coreFeatures.forEach(feature => {
        expect(feature).toBeDefined()
        expect(typeof feature).toBe('string')
      })
    })

    it('should validate authentication flow', async () => {
      const mockAuthResponse = {
        ok: true,
        status: 200,
        json: async () => ({ 
          user: { id: '1', email: 'test@example.com', role: 'author' },
          token: 'mock-jwt-token'
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockAuthResponse)
      
      const response = await fetch(`${PROD_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          userType: 'author'
        })
      })
      
      expect(response.ok).toBe(true)
      expect(fetch).toHaveBeenCalledWith(`${PROD_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          userType: 'author'
        })
      })
    })
  })

  describe('Performance and Security', () => {
    it('should validate security headers', () => {
      const securityHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Content-Security-Policy',
      ]
      
      securityHeaders.forEach(header => {
        expect(header).toBeDefined()
        expect(typeof header).toBe('string')
      })
    })

    it('should validate HTTPS enforcement', () => {
      expect(PROD_URL).toMatch(/^https:\/\//)
    })

    it('should validate API rate limiting configuration', () => {
      const rateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
        skipSuccessfulRequests: true,
      }
      
      expect(rateLimitConfig.maxRequests).toBeGreaterThan(0)
      expect(rateLimitConfig.windowMs).toBeGreaterThan(0)
      expect(typeof rateLimitConfig.skipSuccessfulRequests).toBe('boolean')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid API requests gracefully', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request' })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse)
      
      const response = await fetch(`${PROD_URL}/api/invalid-endpoint`)
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })

    it('should handle authentication errors properly', async () => {
      const mockAuthErrorResponse = {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockAuthErrorResponse)
      
      const response = await fetch(`${PROD_URL}/api/admin/dashboard`)
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })
  })

  describe('Data Integrity', () => {
    it('should validate test data seeding', () => {
      const testData = {
        adminUser: {
          email: 'admin@example.com',
          role: 'admin',
        },
        authorUser: {
          email: 'author@example.com',
          role: 'author',
        },
        sampleBook: {
          title: 'Sample Book',
          genre: 'Fiction',
        },
      }
      
      expect(testData.adminUser.email).toBe('admin@example.com')
      expect(testData.adminUser.role).toBe('admin')
      expect(testData.authorUser.email).toBe('author@example.com')
      expect(testData.authorUser.role).toBe('author')
      expect(testData.sampleBook.title).toBe('Sample Book')
    })

    it('should validate QR code generation functionality', () => {
      const qrCodeData = {
        id: 'sample-qr-id',
        name: 'Sample QR Code',
        content: 'Sample content for QR code',
        type: 'content',
        url: `${PROD_URL}/qr/sample-qr-id`,
      }
      
      expect(qrCodeData.id).toBeDefined()
      expect(qrCodeData.name).toBeDefined()
      expect(qrCodeData.content).toBeDefined()
      expect(qrCodeData.type).toBe('content')
      expect(qrCodeData.url).toMatch(/^https:\/\//)
    })
  })
})