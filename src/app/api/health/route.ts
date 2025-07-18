import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database connection
    await db.$connect()
    await db.admin.findFirst()
    await db.$disconnect()
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'degraded',
      database: 'disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}