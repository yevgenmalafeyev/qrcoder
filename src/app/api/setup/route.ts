import { NextResponse } from 'next/server'
import { getEnvironmentSummary, generateEnvironmentSetupInstructions } from '@/lib/env-validation'
import { dbWithRetry } from '@/lib/db'

export async function GET() {
  const envSummary = getEnvironmentSummary()
  const platform = process.env.VERCEL ? 'Vercel' : 
                  process.env.NETLIFY ? 'Netlify' : 
                  process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 
                  process.env.RENDER ? 'Render' : 
                  'Unknown'

  // Test database connection
  const dbTest = await dbWithRetry.testConnection()

  const setup = {
    platform,
    environment: process.env.NODE_ENV,
    status: envSummary.isValid && dbTest.success ? 'ready' : 'needs_setup',
    issues: {
      environment: !envSummary.isValid,
      database: !dbTest.success
    },
    steps: [] as Array<{
      step: number
      title: string
      description: string
      status: 'complete' | 'pending' | 'error'
      action?: string
      details?: string[]
    }>
  }

  let stepNumber = 1

  // Step 1: Environment Variables
  setup.steps.push({
    step: stepNumber++,
    title: 'Configure Environment Variables',
    description: 'Set up required environment variables for authentication and database',
    status: envSummary.isValid ? 'complete' : 'pending',
    action: !envSummary.isValid ? 'Add missing environment variables' : undefined,
    details: !envSummary.isValid ? [
      'Missing variables: ' + envSummary.missing.join(', '),
      'Invalid variables: ' + envSummary.invalid.join(', ')
    ] : undefined
  })

  // Step 2: Database Connection
  setup.steps.push({
    step: stepNumber++,
    title: 'Database Connection',
    description: 'Ensure database is accessible and tables exist',
    status: dbTest.success ? 'complete' : 'error',
    action: !dbTest.success ? 'Fix database connection' : undefined,
    details: !dbTest.success ? [`Error: ${dbTest.error}`] : undefined
  })

  // Step 3: Database Initialization (only if connected)
  if (dbTest.success) {
    try {
      const { db } = await import('@/lib/db')
      const adminCount = await db.admin.count()
      const authorCount = await db.author.count()
      const hasUsers = adminCount > 0 && authorCount > 0

      setup.steps.push({
        step: stepNumber++,
        title: 'Database Initialization',
        description: 'Create initial admin and author users',
        status: hasUsers ? 'complete' : 'pending',
        action: !hasUsers ? 'Initialize database with demo users' : undefined,
        details: [
          `Admin users: ${adminCount}`,
          `Author users: ${authorCount}`,
          !hasUsers ? 'POST /api/diagnostics to create demo users' : ''
        ].filter(Boolean)
      })
    } catch (error) {
      setup.steps.push({
        step: stepNumber++,
        title: 'Database Initialization',
        description: 'Create initial admin and author users',
        status: 'error',
        action: 'Fix database schema or run migrations',
        details: [`Error: ${error instanceof Error ? error.message : String(error)}`]
      })
    }
  }

  // Step 4: Application Test
  if (envSummary.isValid && dbTest.success) {
    setup.steps.push({
      step: stepNumber++,
      title: 'Application Test',
      description: 'Test login and basic functionality',
      status: 'pending',
      action: 'Test login with demo credentials',
      details: [
        'Admin: admin@example.com / admin123',
        'Author: author@example.com / author123',
        'Try logging in at /login'
      ]
    })
  }

  return NextResponse.json({
    ...setup,
    instructions: generateEnvironmentSetupInstructions(platform),
    quickStart: {
      demoCredentials: {
        admin: { email: 'admin@example.com', password: 'admin123' },
        author: { email: 'author@example.com', password: 'author123' }
      },
      nextSteps: setup.status === 'ready' ? [
        '1. Go to /login',
        '2. Select user type (admin or author)',
        '3. Use demo credentials above',
        '4. Explore the application'
      ] : [
        '1. Fix environment variables',
        '2. Set up database connection',
        '3. Initialize demo users',
        '4. Test the application'
      ]
    }
  })
}

export async function POST() {
  try {
    const envSummary = getEnvironmentSummary()
    
    if (!envSummary.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables not properly configured',
        missing: envSummary.missing,
        invalid: envSummary.invalid
      }, { status: 400 })
    }

    // Test and initialize database
    const dbTest = await dbWithRetry.testConnection()
    if (!dbTest.success) {
      return NextResponse.json({
        success: false,
        error: `Database connection failed: ${dbTest.error}`
      }, { status: 500 })
    }

    // Initialize with demo users
    const { db } = await import('@/lib/db')
    const bcrypt = await import('bcryptjs')

    const result = await dbWithRetry.withRetry(async () => {
      const adminCount = await db.admin.count()
      const authorCount = await db.author.count()
      
      let adminCreated = false
      let authorCreated = false

      if (adminCount === 0) {
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

      if (authorCount === 0) {
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
        adminCount: await db.admin.count(),
        authorCount: await db.author.count()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Application setup completed successfully',
      result,
      nextSteps: [
        'Go to /login',
        'Use demo credentials:',
        '  Admin: admin@example.com / admin123',
        '  Author: author@example.com / author123'
      ]
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