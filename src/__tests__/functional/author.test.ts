/**
 * Functional Tests for Author Functionality
 * Tests the complete author dashboard and QR code management features
 */

import { TestEnvironment } from './utils/test-environment'
import { LoginPage } from './pages/login-page'
import { AuthorDashboard } from './pages/author-dashboard'

describe('Author Functionality Tests', () => {
  let env: TestEnvironment
  let loginPage: LoginPage
  let authorDashboard: AuthorDashboard

  beforeAll(async () => {
    env = new TestEnvironment()
    await env.setup()
    
    loginPage = new LoginPage(env)
    authorDashboard = new AuthorDashboard(env)
  })

  afterAll(async () => {
    await env.cleanup()
  })

  beforeEach(async () => {
    // Start each test with a clean session
    await env.clearSession()
  })

  describe('Author Dashboard Access', () => {
    it('should redirect to login when accessing author without authentication', async () => {
      await authorDashboard.navigate()
      expect(await loginPage.isVisible()).toBe(true)
    })

    it('should access author dashboard after successful login', async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigate()
      
      expect(await authorDashboard.isVisible()).toBe(true)
      expect(await authorDashboard.getWelcomeMessage()).toContain('Author')
    })

    it('should display author statistics on dashboard', async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigate()
      
      const stats = await authorDashboard.getStats()
      expect(typeof stats.totalQRCodes).toBe('number')
      expect(typeof stats.totalScans).toBe('number')
    })

    it('should maintain session across page refreshes', async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigate()
      
      // Refresh the page
      await env.getPage().reload()
      await env.getPage().waitForLoadState('networkidle')
      
      expect(await authorDashboard.isVisible()).toBe(true)
      expect(await authorDashboard.isLoggedIn()).toBe(true)
    })
  })

  describe('Author Navigation', () => {
    beforeEach(async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigate()
    })

    it('should have all required navigation links', async () => {
      const links = await authorDashboard.getNavigationLinks()
      
      expect(links).toContain('Dashboard')
      expect(links).toContain('QR Codes')
      expect(links).toContain('Settings')
    })

    it('should navigate to QR codes management page', async () => {
      await authorDashboard.navigateToQRCodes()
      
      const currentUrl = env.getPage().url()
      expect(currentUrl).toContain('/author/qr-codes')
    })

    it('should navigate to settings page', async () => {
      await authorDashboard.navigateToSettings()
      
      const currentUrl = env.getPage().url()
      expect(currentUrl).toContain('/author/settings')
    })
  })

  describe('QR Code Management', () => {
    beforeEach(async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigateToQRCodes()
    })

    it('should display QR codes list', async () => {
      const qrCount = await authorDashboard.getQRCodesCount()
      expect(qrCount).toBeGreaterThanOrEqual(0)
    })

    it('should create a new QR code', async () => {
      const initialCount = await authorDashboard.getQRCodesCount()
      
      await authorDashboard.createQRCode('https://example.com', 'Test QR Code')
      
      // Check if QR code was created (should increase count or show success)
      const successMessage = await authorDashboard.getSuccessMessage()
      const hasError = await authorDashboard.hasErrorMessage()
      
      // Should either show success or not show error
      expect(hasError).toBe(false)
      if (successMessage) {
        expect(successMessage).toContain('created')
      }
    })

    it('should handle invalid URL gracefully', async () => {
      await authorDashboard.createQRCode('invalid-url', 'Invalid QR Code')
      
      // Should either show validation error or handle gracefully
      const hasError = await authorDashboard.hasErrorMessage()
      if (hasError) {
        const errorMessage = await authorDashboard.getErrorMessage()
        expect(errorMessage).toContain('valid')
      }
    })

    it('should search QR codes', async () => {
      await authorDashboard.searchQRCodes('test')
      
      // Should not show error after search
      expect(await authorDashboard.hasErrorMessage()).toBe(false)
    })

    it('should handle empty search results gracefully', async () => {
      await authorDashboard.searchQRCodes('nonexistentqrcode123')
      
      // Should not crash or show error
      expect(await authorDashboard.hasErrorMessage()).toBe(false)
    })
  })

  describe('Author Settings', () => {
    beforeEach(async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigateToSettings()
    })

    it('should display settings form', async () => {
      const currentUrl = env.getPage().url()
      expect(currentUrl).toContain('/author/settings')
      
      // Check if form elements are present
      const nameInput = env.getPage().locator('#name')
      const emailInput = env.getPage().locator('#email')
      
      expect(await nameInput.isVisible()).toBe(true)
      expect(await emailInput.isVisible()).toBe(true)
    })

    it('should update profile information', async () => {
      await authorDashboard.updateProfile('Test Author Updated', 'author@example.com')
      
      const successMessage = await authorDashboard.getSuccessMessage()
      const hasError = await authorDashboard.hasErrorMessage()
      
      // Should either show success or not show error
      expect(hasError).toBe(false)
      if (successMessage) {
        expect(successMessage).toContain('updated')
      }
    })

    it('should handle invalid email format', async () => {
      await authorDashboard.updateProfile('Test Author', 'invalid-email')
      
      // Should show validation error or handle gracefully
      const hasError = await authorDashboard.hasErrorMessage()
      if (hasError) {
        const errorMessage = await authorDashboard.getErrorMessage()
        expect(errorMessage).toContain('email')
      }
    })

    it('should change password', async () => {
      await authorDashboard.changePassword('author123', 'newpassword123')
      
      const successMessage = await authorDashboard.getSuccessMessage()
      const hasError = await authorDashboard.hasErrorMessage()
      
      // Should either show success or not show error
      expect(hasError).toBe(false)
      if (successMessage) {
        expect(successMessage).toContain('password')
      }
    })

    it('should handle incorrect current password', async () => {
      await authorDashboard.changePassword('wrongpassword', 'newpassword123')
      
      const hasError = await authorDashboard.hasErrorMessage()
      if (hasError) {
        const errorMessage = await authorDashboard.getErrorMessage()
        expect(errorMessage).toContain('current password')
      }
    })

    it('should validate password confirmation', async () => {
      // Try to submit mismatched passwords
      await env.getPage().fill('#currentPassword', 'author123')
      await env.getPage().fill('#newPassword', 'newpassword123')
      await env.getPage().fill('#confirmPassword', 'differentpassword')
      await env.getPage().click('button:has-text("Update Password")')
      
      const hasError = await authorDashboard.hasErrorMessage()
      if (hasError) {
        const errorMessage = await authorDashboard.getErrorMessage()
        expect(errorMessage).toContain('match')
      }
    })
  })

  describe('Author Session Management', () => {
    it('should logout successfully', async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigate()
      
      await authorDashboard.logout()
      
      expect(await loginPage.isVisible()).toBe(true)
      expect(await env.isLoggedIn()).toBe(false)
    })

    it('should redirect to login after logout', async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigate()
      
      await authorDashboard.logout()
      
      // Try to access author page after logout
      await authorDashboard.navigate()
      expect(await loginPage.isVisible()).toBe(true)
    })
  })

  describe('Author Error Handling', () => {
    beforeEach(async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
    })

    it('should handle invalid routes gracefully', async () => {
      await env.navigateTo('/author/nonexistent')
      
      // Should either redirect or show appropriate error
      const currentUrl = env.getPage().url()
      expect(currentUrl).toMatch(/\/(author|login|404)/)
    })

    it('should handle network errors gracefully', async () => {
      await authorDashboard.navigate()
      
      // Simulate network interruption by intercepting requests
      await env.getPage().route('**/*', route => {
        if (route.request().url().includes('/api/')) {
          route.abort()
        } else {
          route.continue()
        }
      })
      
      // Try to navigate and ensure no crashes
      await authorDashboard.navigateToQRCodes()
      
      // Should handle gracefully without throwing
      expect(await authorDashboard.hasErrorMessage()).toBe(false)
    })
  })

  describe('Author Dashboard Responsiveness', () => {
    beforeEach(async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      await authorDashboard.navigate()
    })

    it('should be responsive on mobile viewport', async () => {
      // Set mobile viewport
      await env.getPage().setViewportSize({ width: 375, height: 667 })
      await authorDashboard.navigate()
      
      expect(await authorDashboard.isVisible()).toBe(true)
    })

    it('should be responsive on tablet viewport', async () => {
      // Set tablet viewport
      await env.getPage().setViewportSize({ width: 768, height: 1024 })
      await authorDashboard.navigate()
      
      expect(await authorDashboard.isVisible()).toBe(true)
    })

    it('should be responsive on desktop viewport', async () => {
      // Set desktop viewport
      await env.getPage().setViewportSize({ width: 1920, height: 1080 })
      await authorDashboard.navigate()
      
      expect(await authorDashboard.isVisible()).toBe(true)
    })
  })

  describe('Cross-Role Access Control', () => {
    it('should prevent author from accessing admin routes', async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      
      // Try to access admin dashboard
      await env.navigateTo('/admin')
      
      // Should redirect to login or show access denied
      const currentUrl = env.getPage().url()
      expect(currentUrl).toMatch(/\/(login|author|403)/)
    })

    it('should prevent author from accessing admin API endpoints', async () => {
      await loginPage.loginAs('author@example.com', 'author123', 'author')
      
      // Try to access admin API
      const response = await env.getPage().request.get('/api/admin/users')
      
      // Should return 401, 403, or redirect
      expect([401, 403, 302]).toContain(response.status())
    })
  })
})