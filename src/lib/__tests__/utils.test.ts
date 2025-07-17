import { formatDate, formatDateTime, generateQRCodeUrl } from '../utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-01T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toBe('December 1, 2023')
    })

    it('should handle string input', () => {
      const formatted = formatDate('2023-12-01T10:30:00Z')
      expect(formatted).toBe('December 1, 2023')
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const date = new Date('2023-12-01T10:30:00Z')
      const formatted = formatDateTime(date)
      expect(formatted).toMatch(/Dec 1, 2023/)
    })
  })

  describe('generateQRCodeUrl', () => {
    const originalEnv = process.env.NEXTAUTH_URL

    beforeEach(() => {
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
    })

    afterEach(() => {
      process.env.NEXTAUTH_URL = originalEnv
    })

    it('should generate correct QR code URL', () => {
      const url = generateQRCodeUrl('test-id-123')
      expect(url).toBe('http://localhost:3000/qr/test-id-123')
    })
  })
})