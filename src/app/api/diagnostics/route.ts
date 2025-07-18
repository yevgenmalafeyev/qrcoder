import { NextResponse } from 'next/server'
import { db, dbWithRetry } from '@/lib/db'
import { validateEnvironment, getEnvironmentSummary, generateEnvironmentSetupInstructions } from '@/lib/env-validation'

export async function GET() {
  const envSummary = getEnvironmentSummary()
  const platform = process.env.VERCEL ? 'Vercel' : 
                  process.env.NETLIFY ? 'Netlify' : 
                  process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 
                  process.env.RENDER ? 'Render' : 
                  'Unknown'

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      platform,
      validation: envSummary,
      checks: validateEnvironment()
    },
    database: {
      connection: 'testing' as string,
      basicQuery: 'testing' as string,
      tables: 'testing' as string,
      adminCount: 0,
      authorCount: 0,
      error: null as string | null
    },
    setupInstructions: null as string | null
  }

  // Test database connection with retry logic
  try {
    const connectionResult = await dbWithRetry.testConnection()
    
    if (connectionResult.success) {
      diagnostics.database.connection = 'success'
      
      // Test basic query with retry
      try {
        await dbWithRetry.withRetry(async () => {
          await db.$queryRaw`SELECT 1 as test`
        })
        diagnostics.database.basicQuery = 'success'
      } catch (queryError) {
        diagnostics.database.basicQuery = 'failed'
        diagnostics.database.error = queryError instanceof Error ? queryError.message : String(queryError)
      }

      // Test table access with retry
      try {
        const [adminCount, authorCount] = await dbWithRetry.withRetry(async () => {
          return Promise.all([
            db.admin.count(),
            db.author.count()
          ])
        })
        diagnostics.database.tables = 'accessible'
        diagnostics.database.adminCount = adminCount
        diagnostics.database.authorCount = authorCount
      } catch (tableError) {
        diagnostics.database.tables = 'failed'
        if (!diagnostics.database.error) {
          diagnostics.database.error = tableError instanceof Error ? tableError.message : String(tableError)
        }
      }
    } else {
      diagnostics.database.connection = 'failed'
      diagnostics.database.basicQuery = 'skipped'
      diagnostics.database.tables = 'skipped'
      diagnostics.database.error = connectionResult.error || 'Unknown connection error'
    }

  } catch (connectionError) {
    diagnostics.database.connection = 'failed'
    diagnostics.database.basicQuery = 'skipped'
    diagnostics.database.tables = 'skipped'
    diagnostics.database.error = connectionError instanceof Error ? connectionError.message : String(connectionError)
  } finally {
    await dbWithRetry.disconnect()
  }

  // Generate setup instructions if environment is invalid
  if (!envSummary.isValid) {
    diagnostics.setupInstructions = generateEnvironmentSetupInstructions(platform)
  }

  const status = diagnostics.database.connection === 'success' && envSummary.isValid ? 200 : 503
  
  return NextResponse.json(diagnostics, { status })
}

export async function POST() {
  try {
    // Initialize database with retry logic
    const connectionResult = await dbWithRetry.testConnection()
    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        error: `Database connection failed: ${connectionResult.error}`
      }, { status: 500 })
    }

    const result = await dbWithRetry.withRetry(async () => {
      // Try to create admin user if none exists
      const adminCount = await db.admin.count()
      let adminCreated = false
      
      if (adminCount === 0) {
        const bcrypt = await import('bcryptjs')
        const hashedPassword = await bcrypt.hash('admin123', 12)
        
        await db.admin.create({
          data: {
            email: 'admin@example.com',
            name: 'Demo Admin',
            password: hashedPassword
          }
        })
        adminCreated = true
      }

      // Try to create author user if none exists
      const authorCount = await db.author.count()
      let authorCreated = false
      
      if (authorCount === 0) {
        const bcrypt = await import('bcryptjs')
        const hashedPassword = await bcrypt.hash('author123', 12)
        
        await db.author.create({
          data: {
            email: 'author@example.com',
            name: 'Demo Author',
            password: hashedPassword,
            isActive: true
          }
        })
        authorCreated = true
      }

      return {
        adminCreated,
        authorCreated,
        finalAdminCount: await db.admin.count(),
        finalAuthorCount: await db.author.count()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database initialization completed',
      details: {
        adminCreated: result.adminCreated,
        authorCreated: result.authorCreated,
        adminCount: result.finalAdminCount,
        authorCount: result.finalAuthorCount
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await dbWithRetry.disconnect()
  }
}