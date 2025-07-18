/**
 * Functional Tests for Login System
 * Tests the complete login flow for both admin and author users
 */

import { TestEnvironment } from './utils/test-environment'
import { LoginPage } from './pages/login-page'
import { AdminDashboard } from './pages/admin-dashboard'
import { AuthorDashboard } from './pages/author-dashboard'

describe('Login Functional Tests', () => {
  let env: TestEnvironment
  let loginPage: LoginPage
  let adminDashboard: AdminDashboard
  let authorDashboard: AuthorDashboard

  beforeAll(async () => {
    env = new TestEnvironment()
    await env.setup()
    
    loginPage = new LoginPage(env)
    adminDashboard = new AdminDashboard(env)
    authorDashboard = new AuthorDashboard(env)
  })

  afterAll(async () => {
    await env.cleanup()
  })

  describe('Admin Login Flow', () => {
    it('should successfully login as admin with valid credentials', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('admin@example.com', 'admin123')
      await loginPage.submit()
      
      expect(await adminDashboard.isVisible()).toBe(true)
      expect(await adminDashboard.getWelcomeMessage()).toContain('Admin')
    })

    it('should reject admin login with invalid credentials', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('admin@example.com', 'wrongpassword')
      await loginPage.submit()
      
      expect(await loginPage.getErrorMessage()).toContain('Invalid credentials')
      expect(await adminDashboard.isVisible()).toBe(false)
    })

    it('should reject admin login with non-existent user', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('nonexistent@example.com', 'admin123')
      await loginPage.submit()
      
      expect(await loginPage.getErrorMessage()).toContain('Invalid credentials')
      expect(await adminDashboard.isVisible()).toBe(false)
    })
  })

  describe('Author Login Flow', () => {
    it('should successfully login as author with valid credentials', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('author')
      await loginPage.enterCredentials('author@example.com', 'author123')
      await loginPage.submit()
      
      expect(await authorDashboard.isVisible()).toBe(true)
      expect(await authorDashboard.getWelcomeMessage()).toContain('Author')
    })

    it('should reject author login with invalid credentials', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('author')
      await loginPage.enterCredentials('author@example.com', 'wrongpassword')
      await loginPage.submit()
      
      expect(await loginPage.getErrorMessage()).toContain('Invalid credentials')
      expect(await authorDashboard.isVisible()).toBe(false)
    })

    it('should reject author login with non-existent user', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('author')
      await loginPage.enterCredentials('nonexistent@example.com', 'author123')
      await loginPage.submit()
      
      expect(await loginPage.getErrorMessage()).toContain('Invalid credentials')
      expect(await authorDashboard.isVisible()).toBe(false)
    })
  })

  describe('Login Form Validation', () => {
    it('should require email field', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('', 'admin123')
      await loginPage.submit()
      
      expect(await loginPage.hasValidationError('email')).toBe(true)
    })

    it('should require password field', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('admin@example.com', '')
      await loginPage.submit()
      
      expect(await loginPage.hasValidationError('password')).toBe(true)
    })

    it('should validate email format', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('invalid-email', 'admin123')
      await loginPage.submit()
      
      expect(await loginPage.hasValidationError('email')).toBe(true)
    })
  })

  describe('User Type Selection', () => {
    it('should default to author user type', async () => {
      await loginPage.navigate()
      expect(await loginPage.getSelectedUserType()).toBe('author')
    })

    it('should allow switching to admin user type', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      expect(await loginPage.getSelectedUserType()).toBe('admin')
    })

    it('should allow switching back to author user type', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.selectUserType('author')
      expect(await loginPage.getSelectedUserType()).toBe('author')
    })
  })

  describe('Session Management', () => {
    it('should maintain session after successful login', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('admin@example.com', 'admin123')
      await loginPage.submit()
      
      // Navigate to different page and back
      await adminDashboard.navigate()
      expect(await adminDashboard.isVisible()).toBe(true)
      expect(await adminDashboard.isLoggedIn()).toBe(true)
    })

    it('should redirect to login when not authenticated', async () => {
      await env.clearSession()
      await adminDashboard.navigate()
      
      expect(await loginPage.isVisible()).toBe(true)
    })
  })

  describe('Logout Functionality', () => {
    it('should logout admin successfully', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('admin')
      await loginPage.enterCredentials('admin@example.com', 'admin123')
      await loginPage.submit()
      
      await adminDashboard.logout()
      expect(await loginPage.isVisible()).toBe(true)
      expect(await env.isLoggedIn()).toBe(false)
    })

    it('should logout author successfully', async () => {
      await loginPage.navigate()
      await loginPage.selectUserType('author')
      await loginPage.enterCredentials('author@example.com', 'author123')
      await loginPage.submit()
      
      await authorDashboard.logout()
      expect(await loginPage.isVisible()).toBe(true)
      expect(await env.isLoggedIn()).toBe(false)
    })
  })
})