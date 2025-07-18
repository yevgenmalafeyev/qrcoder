import { NextResponse } from 'next/server'
import { initializeDatabase, runDatabaseMigrations } from '@/lib/db-init'
import { testDatabaseConnection } from '@/lib/db'

export async function POST() {
  try {
    // First test database connection
    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Run migrations check
    const migrationsOk = await runDatabaseMigrations()
    if (!migrationsOk) {
      return NextResponse.json({
        success: false,
        error: 'Database migrations failed',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Initialize database with default data
    const initSuccess = await initializeDatabase()
    if (!initSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Database initialization failed',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}