/**
 * Functional Tests for Admin Functionality
 * Tests the complete admin dashboard and management features
 */

import { TestEnvironment } from './utils/test-environment'
import { LoginPage } from './pages/login-page'
import { AdminDashboard } from './pages/admin-dashboard'

describe('Admin Functionality Tests', () => {
  let env: TestEnvironment
  let loginPage: LoginPage
  let adminDashboard: AdminDashboard

  beforeAll(async () => {
    env = new TestEnvironment()
    await env.setup()
    
    loginPage = new LoginPage(env)
    adminDashboard = new AdminDashboard(env)
  })

  afterAll(async () => {
    await env.cleanup()
  })

  beforeEach(async () => {
    // Start each test with a clean session
    await env.clearSession()
  })

  describe('Admin Dashboard Access', () => {
    it('should redirect to login when accessing admin without authentication', async () => {
      await adminDashboard.navigate()
      expect(await loginPage.isVisible()).toBe(true)
    })

    it('should access admin dashboard after successful login', async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigate()
      
      expect(await adminDashboard.isVisible()).toBe(true)
      expect(await adminDashboard.getWelcomeMessage()).toContain('Admin')
    })

    it('should display admin statistics on dashboard', async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigate()
      
      const stats = await adminDashboard.getStats()
      expect(typeof stats.totalUsers).toBe('number')
      expect(typeof stats.totalQRCodes).toBe('number')
    })

    it('should maintain session across page refreshes', async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigate()
      
      // Refresh the page
      await env.getPage().reload()
      await env.getPage().waitForLoadState('networkidle')
      
      expect(await adminDashboard.isVisible()).toBe(true)
      expect(await adminDashboard.isLoggedIn()).toBe(true)
    })
  })

  describe('Admin Navigation', () => {
    beforeEach(async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigate()
    })

    it('should have all required navigation links', async () => {
      const links = await adminDashboard.getNavigationLinks()
      
      expect(links).toContain('Dashboard')
      expect(links).toContain('Users')
      expect(links).toContain('QR Codes')
      expect(links).toContain('Settings')
    })

    it('should navigate to users management page', async () => {
      await adminDashboard.navigateToUsers()
      
      const currentUrl = env.getPage().url()
      expect(currentUrl).toContain('/admin/users')
    })

    it('should navigate to QR codes management page', async () => {
      await adminDashboard.navigateToQRCodes()
      
      const currentUrl = env.getPage().url()
      expect(currentUrl).toContain('/admin/qr-codes')
    })

    it('should navigate to settings page', async () => {
      await adminDashboard.navigateToSettings()
      
      const currentUrl = env.getPage().url()
      expect(currentUrl).toContain('/admin/settings')
    })
  })

  describe('User Management', () => {
    beforeEach(async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigateToUsers()
    })

    it('should display users list', async () => {
      const usersCount = await adminDashboard.getUsersCount()
      expect(usersCount).toBeGreaterThanOrEqual(0)
    })

    it('should allow searching users', async () => {
      await adminDashboard.searchUsers('admin')
      
      // Should not show error after search
      expect(await adminDashboard.hasErrorMessage()).toBe(false)
    })

    it('should handle empty search results gracefully', async () => {
      await adminDashboard.searchUsers('nonexistentuser123')
      
      // Should not crash or show error
      expect(await adminDashboard.hasErrorMessage()).toBe(false)
    })
  })

  describe('QR Code Management', () => {
    beforeEach(async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigateToQRCodes()
    })

    it('should display QR codes list', async () => {
      const qrCount = await adminDashboard.getQRCodesCount()
      expect(qrCount).toBeGreaterThanOrEqual(0)
    })

    it('should handle QR codes listing without errors', async () => {
      // Should load without errors
      expect(await adminDashboard.hasErrorMessage()).toBe(false)
    })
  })

  describe('Admin Session Management', () => {
    it('should logout successfully', async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigate()
      
      await adminDashboard.logout()
      
      expect(await loginPage.isVisible()).toBe(true)
      expect(await env.isLoggedIn()).toBe(false)
    })

    it('should redirect to login after logout', async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigate()
      
      await adminDashboard.logout()
      
      // Try to access admin page after logout
      await adminDashboard.navigate()
      expect(await loginPage.isVisible()).toBe(true)
    })
  })

  describe('Admin Error Handling', () => {
    beforeEach(async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
    })

    it('should handle invalid routes gracefully', async () => {
      await env.navigateTo('/admin/nonexistent')
      
      // Should either redirect or show appropriate error
      const currentUrl = env.getPage().url()
      expect(currentUrl).toMatch(/\/(admin|login|404)/)
    })

    it('should handle network errors gracefully', async () => {
      await adminDashboard.navigate()
      
      // Simulate network interruption by intercepting requests
      await env.getPage().route('**/*', route => {
        if (route.request().url().includes('/api/')) {
          route.abort()
        } else {
          route.continue()
        }
      })
      
      // Try to navigate and ensure no crashes
      await adminDashboard.navigateToUsers()
      
      // Should handle gracefully without throwing
      expect(await adminDashboard.hasErrorMessage()).toBe(false)
    })
  })

  describe('Admin Dashboard Responsiveness', () => {
    beforeEach(async () => {
      await loginPage.loginAs('admin@example.com', 'admin123', 'admin')
      await adminDashboard.navigate()
    })

    it('should be responsive on mobile viewport', async () => {
      // Set mobile viewport
      await env.getPage().setViewportSize({ width: 375, height: 667 })
      await adminDashboard.navigate()
      
      expect(await adminDashboard.isVisible()).toBe(true)
    })

    it('should be responsive on tablet viewport', async () => {
      // Set tablet viewport
      await env.getPage().setViewportSize({ width: 768, height: 1024 })
      await adminDashboard.navigate()
      
      expect(await adminDashboard.isVisible()).toBe(true)
    })

    it('should be responsive on desktop viewport', async () => {
      // Set desktop viewport
      await env.getPage().setViewportSize({ width: 1920, height: 1080 })
      await adminDashboard.navigate()
      
      expect(await adminDashboard.isVisible()).toBe(true)
    })
  })
})