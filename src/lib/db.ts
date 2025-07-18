import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Using fallback configuration.')
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://fallback@localhost:5432/qrcoder'
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Enhanced connection testing
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL)
    console.log('Environment:', process.env.NODE_ENV)
    
    await db.$connect()
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'missing')
    return false
  }
}

// Check database health
export async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`
    const adminCount = await db.admin.count()
    return {
      connected: true,
      adminCount,
      error: null
    }
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