/**
 * Login Page Object
 * Provides methods to interact with the login page
 */

import { Page } from 'playwright'
import { TestEnvironment } from '../utils/test-environment'

export class LoginPage {
  private page: Page

  constructor(private env: TestEnvironment) {
    this.page = env.getPage()
  }

  async navigate(): Promise<void> {
    await this.env.navigateTo('/login')
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="login-form"]', { timeout: 2000 })
      return true
    } catch {
      // Fallback to checking for login elements
      const loginCard = await this.page.locator('text=Login').first()
      return await loginCard.isVisible()
    }
  }

  async selectUserType(type: 'admin' | 'author'): Promise<void> {
    const button = this.page.locator(`button:has-text("${type === 'admin' ? 'Admin' : 'Author'}")`)
    await button.click()
  }

  async getSelectedUserType(): Promise<string> {
    // Check which button has the default variant (selected state)
    const adminButton = this.page.locator('button:has-text("Admin")')
    const authorButton = this.page.locator('button:has-text("Author")')
    
    const adminClasses = await adminButton.getAttribute('class') || ''
    const authorClasses = await authorButton.getAttribute('class') || ''
    
    // Check for active/selected state classes
    if (adminClasses.includes('bg-primary') || !adminClasses.includes('border-input')) {
      return 'admin'
    }
    if (authorClasses.includes('bg-primary') || !authorClasses.includes('border-input')) {
      return 'author'
    }
    
    return 'author' // Default
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    await this.page.fill('#email', email)
    await this.page.fill('#password', password)
  }

  async submit(): Promise<void> {
    await this.page.click('button[type="submit"]')
    await this.page.waitForTimeout(1000) // Wait for form processing
  }

  async getErrorMessage(): Promise<string> {
    try {
      const errorElement = await this.page.locator('.text-red-600').first()
      return await errorElement.textContent() || ''
    } catch {
      return ''
    }
  }

  async hasValidationError(field: 'email' | 'password'): Promise<boolean> {
    try {
      // Check for HTML5 validation
      const input = this.page.locator(`#${field}`)
      const validationMessage = await input.evaluate((el: HTMLInputElement) => el.validationMessage)
      
      if (validationMessage) {
        return true
      }
      
      // Check for custom validation styling
      const inputClasses = await input.getAttribute('class') || ''
      return inputClasses.includes('border-red') || inputClasses.includes('error')
    } catch {
      return false
    }
  }

  async fillForm(email: string, password: string, userType: 'admin' | 'author'): Promise<void> {
    await this.selectUserType(userType)
    await this.enterCredentials(email, password)
  }

  async loginAs(email: string, password: string, userType: 'admin' | 'author'): Promise<void> {
    await this.navigate()
    await this.fillForm(email, password, userType)
    await this.submit()
  }

  async waitForRedirect(): Promise<void> {
    await this.page.waitForURL(/\/(admin|author)/, { timeout: 5000 })
  }

  async isFormDisabled(): Promise<boolean> {
    const submitButton = this.page.locator('button[type="submit"]')
    return await submitButton.isDisabled()
  }

  async getLoadingState(): Promise<boolean> {
    const submitButton = this.page.locator('button[type="submit"]')
    const buttonText = await submitButton.textContent()
    return buttonText?.includes('Signing in...') || false
  }
}