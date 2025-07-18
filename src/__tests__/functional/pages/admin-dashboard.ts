/**
 * Admin Dashboard Page Object
 * Provides methods to interact with the admin dashboard
 */

import { Page } from 'playwright'
import { TestEnvironment } from '../utils/test-environment'

export class AdminDashboard {
  private page: Page

  constructor(private env: TestEnvironment) {
    this.page = env.getPage()
  }

  async navigate(): Promise<void> {
    await this.env.navigateTo('/admin')
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector('h1:has-text("Admin Dashboard")', { timeout: 3000 })
      return true
    } catch {
      // Fallback check
      const url = this.page.url()
      return url.includes('/admin') && !url.includes('/login')
    }
  }

  async getWelcomeMessage(): Promise<string> {
    try {
      const welcomeElement = await this.page.locator('h1').first()
      return await welcomeElement.textContent() || ''
    } catch {
      return ''
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for user menu or logout button
      const userMenu = this.page.locator('[data-testid="user-menu"]')
      const logoutButton = this.page.locator('button:has-text("Logout")')
      
      return await userMenu.isVisible() || await logoutButton.isVisible()
    } catch {
      // Fallback: check if we're on admin page and not redirected
      const url = this.page.url()
      return url.includes('/admin') && !url.includes('/login')
    }
  }

  async logout(): Promise<void> {
    try {
      // Try to find and click logout button
      const logoutButton = this.page.locator('button:has-text("Logout")')
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
      } else {
        // Try user menu dropdown
        const userMenu = this.page.locator('[data-testid="user-menu"]')
        if (await userMenu.isVisible()) {
          await userMenu.click()
          await this.page.locator('button:has-text("Logout")').click()
        }
      }
      
      // Wait for redirect to login
      await this.page.waitForURL(/\/login/, { timeout: 5000 })
    } catch (error) {
      console.warn('Logout failed:', error)
    }
  }

  async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {}
    
    try {
      // Look for stat cards
      const statCards = await this.page.locator('[data-testid="stat-card"]').all()
      
      for (const card of statCards) {
        const label = await card.locator('.stat-label').textContent()
        const value = await card.locator('.stat-value').textContent()
        
        if (label && value) {
          stats[label] = parseInt(value.replace(/[^0-9]/g, '')) || 0
        }
      }
    } catch {
      // Fallback: try to extract numbers from visible text
      const pageContent = await this.page.textContent('body')
      const numbers = pageContent?.match(/\d+/g) || []
      stats.totalUsers = parseInt(numbers[0]) || 0
      stats.totalQRCodes = parseInt(numbers[1]) || 0
    }
    
    return stats
  }

  async navigateToUsers(): Promise<void> {
    await this.page.click('a:has-text("Users")')
    await this.page.waitForURL(/\/admin\/users/, { timeout: 5000 })
  }

  async navigateToQRCodes(): Promise<void> {
    await this.page.click('a:has-text("QR Codes")')
    await this.page.waitForURL(/\/admin\/qr-codes/, { timeout: 5000 })
  }

  async navigateToSettings(): Promise<void> {
    await this.page.click('a:has-text("Settings")')
    await this.page.waitForURL(/\/admin\/settings/, { timeout: 5000 })
  }

  async getNavigationLinks(): Promise<string[]> {
    const links = await this.page.locator('nav a').all()
    const linkTexts: string[] = []
    
    for (const link of links) {
      const text = await link.textContent()
      if (text) {
        linkTexts.push(text.trim())
      }
    }
    
    return linkTexts
  }

  async searchUsers(query: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="Search"]')
    await searchInput.fill(query)
    await searchInput.press('Enter')
    await this.page.waitForTimeout(1000)
  }

  async getUsersCount(): Promise<number> {
    try {
      const userRows = await this.page.locator('tbody tr').count()
      return userRows
    } catch {
      return 0
    }
  }

  async getQRCodesCount(): Promise<number> {
    try {
      const qrRows = await this.page.locator('tbody tr').count()
      return qrRows
    } catch {
      return 0
    }
  }

  async hasErrorMessage(): Promise<boolean> {
    try {
      const errorElement = await this.page.locator('.text-red-600, .error-message').first()
      return await errorElement.isVisible()
    } catch {
      return false
    }
  }

  async getErrorMessage(): Promise<string> {
    try {
      const errorElement = await this.page.locator('.text-red-600, .error-message').first()
      return await errorElement.textContent() || ''
    } catch {
      return ''
    }
  }
}