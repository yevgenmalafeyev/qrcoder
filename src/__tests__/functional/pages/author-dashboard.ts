/**
 * Author Dashboard Page Object
 * Provides methods to interact with the author dashboard
 */

import { Page } from 'playwright'
import { TestEnvironment } from '../utils/test-environment'

export class AuthorDashboard {
  private page: Page

  constructor(private env: TestEnvironment) {
    this.page = env.getPage()
  }

  async navigate(): Promise<void> {
    await this.env.navigateTo('/author')
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector('h1:has-text("Author Dashboard")', { timeout: 3000 })
      return true
    } catch {
      // Fallback check
      const url = this.page.url()
      return url.includes('/author') && !url.includes('/login')
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
      // Fallback: check if we're on author page and not redirected
      const url = this.page.url()
      return url.includes('/author') && !url.includes('/login')
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
      stats.totalQRCodes = parseInt(numbers[0]) || 0
      stats.totalScans = parseInt(numbers[1]) || 0
    }
    
    return stats
  }

  async navigateToQRCodes(): Promise<void> {
    await this.page.click('a:has-text("QR Codes")')
    await this.page.waitForURL(/\/author\/qr-codes/, { timeout: 5000 })
  }

  async navigateToSettings(): Promise<void> {
    await this.page.click('a:has-text("Settings")')
    await this.page.waitForURL(/\/author\/settings/, { timeout: 5000 })
  }

  async createQRCode(url: string, name?: string): Promise<void> {
    // Navigate to QR codes page if not already there
    if (!this.page.url().includes('/author/qr-codes')) {
      await this.navigateToQRCodes()
    }
    
    // Click create button
    await this.page.click('button:has-text("Create QR Code")')
    
    // Fill form
    await this.page.fill('input[placeholder*="URL"]', url)
    if (name) {
      await this.page.fill('input[placeholder*="Name"]', name)
    }
    
    // Submit
    await this.page.click('button[type="submit"]')
    await this.page.waitForTimeout(1000)
  }

  async getQRCodesCount(): Promise<number> {
    try {
      const qrCards = await this.page.locator('[data-testid="qr-card"]').count()
      return qrCards
    } catch {
      // Fallback: count table rows
      try {
        const rows = await this.page.locator('tbody tr').count()
        return rows
      } catch {
        return 0
      }
    }
  }

  async deleteQRCode(name: string): Promise<void> {
    // Find QR code by name and delete
    const qrCard = this.page.locator(`[data-testid="qr-card"]:has-text("${name}")`)
    await qrCard.locator('button:has-text("Delete")').click()
    
    // Confirm deletion
    await this.page.locator('button:has-text("Confirm")').click()
    await this.page.waitForTimeout(1000)
  }

  async updateProfile(name: string, email: string): Promise<void> {
    await this.navigateToSettings()
    
    // Update profile form
    await this.page.fill('#name', name)
    await this.page.fill('#email', email)
    
    // Submit profile update
    await this.page.click('button:has-text("Save Profile")')
    await this.page.waitForTimeout(1000)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.navigateToSettings()
    
    // Change password form
    await this.page.fill('#currentPassword', currentPassword)
    await this.page.fill('#newPassword', newPassword)
    await this.page.fill('#confirmPassword', newPassword)
    
    // Submit password change
    await this.page.click('button:has-text("Update Password")')
    await this.page.waitForTimeout(1000)
  }

  async getSuccessMessage(): Promise<string> {
    try {
      const successElement = await this.page.locator('.text-green-600, .success-message, .text-blue-800').first()
      return await successElement.textContent() || ''
    } catch {
      return ''
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

  async hasErrorMessage(): Promise<boolean> {
    try {
      const errorElement = await this.page.locator('.text-red-600, .error-message').first()
      return await errorElement.isVisible()
    } catch {
      return false
    }
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

  async searchQRCodes(query: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="Search"]')
    await searchInput.fill(query)
    await searchInput.press('Enter')
    await this.page.waitForTimeout(1000)
  }
}