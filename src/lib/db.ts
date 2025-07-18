import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection retry utility
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      console.warn(`Database operation attempt ${attempt}/${maxRetries} failed:`, 
        error instanceof Error ? error.message : String(error))
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError
}

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Using fallback configuration.')
}

// Enhanced database client with better error handling
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: databaseUrl || 'postgresql://fallback@localhost:5432/qrcoder'
      }
    }
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

// Enhanced database operations with retry logic
export const dbWithRetry = {
  async connect() {
    return withRetry(async () => {
      await db.$connect()
      // Test the connection
      await db.$queryRaw`SELECT 1`
    })
  },

  async disconnect() {
    try {
      await db.$disconnect()
    } catch (error) {
      console.warn('Error disconnecting from database:', error)
    }
  },

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.connect()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    } finally {
      await this.disconnect()
    }
  },

  // Wrapper for any database operation with retry
  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    return withRetry(operation)
  }
}

// Enhanced connection testing
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL)
    console.log('Environment:', process.env.NODE_ENV)
    
    const result = await dbWithRetry.testConnection()
    if (result.success) {
      console.log('Database connected successfully')
      return true
    } else {
      console.error('Database connection failed:', result.error)
      return false
    }
  } catch (error) {
    console.error('Database connection test error:', error)
    return false
  }
}

// Check database health with retry
export async function checkDatabaseHealth() {
  try {
    return await dbWithRetry.withRetry(async () => {
      await db.$queryRaw`SELECT 1`
      const adminCount = await db.admin.count()
      return {
        connected: true,
        adminCount,
        error: null
      }
    })
  } catch (error) {
    return {
      connected: false,
      adminCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})