/**
 * Jest setup for functional tests
 * Configures global test environment and utilities
 */

// Set default timeout for all tests
jest.setTimeout(60000)

// Global test environment variables
process.env.NODE_ENV = 'test'
process.env.TEST_HEADLESS = process.env.TEST_HEADLESS || 'true'
process.env.TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// Create screenshots directory if it doesn't exist
const fs = require('fs')
const path = require('path')

const screenshotsDir = path.join(__dirname, 'screenshots')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

// Global error handler for uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Global setup for all tests
beforeAll(async () => {
  console.log('Starting functional tests...')
  console.log('Test environment:', process.env.NODE_ENV)
  console.log('Base URL:', process.env.TEST_BASE_URL)
  console.log('Headless mode:', process.env.TEST_HEADLESS)
})

afterAll(async () => {
  console.log('Functional tests completed')
})

// Global test utilities
global.testUtils = {
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  generateRandomString: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
  
  generateTestEmail: () => {
    const random = global.testUtils.generateRandomString(8)
    return `test-${random}@example.com`
  },
  
  generateTestUrl: () => {
    const random = global.testUtils.generateRandomString(8)
    return `https://example.com/test-${random}`
  }
}

// Console output formatting
const originalConsoleLog = console.log
const originalConsoleError = console.error

console.log = (...args) => {
  const timestamp = new Date().toISOString()
  originalConsoleLog(`[${timestamp}] [LOG]`, ...args)
}

console.error = (...args) => {
  const timestamp = new Date().toISOString()
  originalConsoleError(`[${timestamp}] [ERROR]`, ...args)
}

// Test result reporting
let testResults = []

afterEach(async () => {
  const testResult = {
    name: expect.getState().currentTestName,
    status: 'passed', // Will be updated by Jest reporters
    duration: Date.now() - expect.getState().testStartTime,
    timestamp: new Date().toISOString()
  }
  
  testResults.push(testResult)
})

// Save test results on exit
process.on('exit', () => {
  const resultsFile = path.join(__dirname, 'test-reports', 'functional-results.json')
  const resultsDir = path.dirname(resultsFile)
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }
  
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2))
})