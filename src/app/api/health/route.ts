import { NextResponse } from 'next/server'
import { testDatabaseConnection, checkDatabaseHealth } from '@/lib/db'

export async function GET() {
  try {
    // First test basic connectivity
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'degraded',
        database: 'disconnected',
        error: 'Database connection test failed',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Test database health
    const health = await checkDatabaseHealth()
    
    if (!health.connected) {
      return NextResponse.json({
        status: 'degraded',
        database: 'disconnected',
        error: health.error,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      adminCount: health.adminCount,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      status: 'degraded',
      database: 'disconnected',
      error: 'Database connection failed',
      details: errorMessage,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}