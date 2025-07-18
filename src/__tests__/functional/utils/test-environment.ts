/**
 * Test Environment Setup
 * Manages browser instance and test utilities
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright'

export class TestEnvironment {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
  }

  async setup(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.TEST_HEADLESS !== 'false'
    })
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true
    })
    
    this.page = await this.context.newPage()
    
    // Set up request interception for better error handling
    this.page.on('requestfailed', (request) => {
      console.log(`Request failed: ${request.url()}`)
    })
    
    this.page.on('pageerror', (error) => {
      console.log(`Page error: ${error.message}`)
    })
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close()
    }
    if (this.context) {
      await this.context.close()
    }
    if (this.browser) {
      await this.browser.close()
    }
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('Test environment not set up. Call setup() first.')
    }
    return this.page
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  async navigateTo(path: string): Promise<void> {
    const page = this.getPage()
    await page.goto(`${this.baseUrl}${path}`)
    await page.waitForLoadState('networkidle')
  }

  async clearSession(): Promise<void> {
    const page = this.getPage()
    await page.context().clearCookies()
    try {
      await page.evaluate(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear()
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear()
        }
      })
    } catch (error) {
      // Ignore localStorage/sessionStorage errors in test environment
      console.log('Could not clear storage:', error)
    }
  }

  async isLoggedIn(): Promise<boolean> {
    const page = this.getPage()
    try {
      // Check if we can access a protected route
      await page.goto(`${this.baseUrl}/admin`)
      await page.waitForLoadState('networkidle')
      
      // If we're redirected to login, we're not logged in
      const currentUrl = page.url()
      return !currentUrl.includes('/login')
    } catch {
      return false
    }
  }

  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    const page = this.getPage()
    await page.waitForSelector(selector, { timeout })
  }

  async waitForUrl(urlPattern: string | RegExp, timeout: number = 5000): Promise<void> {
    const page = this.getPage()
    await page.waitForURL(urlPattern, { timeout })
  }

  async screenshot(name: string): Promise<void> {
    const page = this.getPage()
    await page.screenshot({ path: `screenshots/${name}.png` })
  }
}