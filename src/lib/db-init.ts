import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function initializeDatabase() {
  try {
    console.log('Initializing database...')
    
    // Check if admin exists
    const adminCount = await db.admin.count()
    console.log(`Found ${adminCount} admins`)
    
    if (adminCount === 0) {
      console.log('Creating default admin...')
      await db.admin.create({
        data: {
          email: 'admin@example.com',
          password: await hashPassword('admin123'),
          name: 'System Administrator'
        }
      })
      console.log('Default admin created')
    }
    
    // Check if demo author exists
    const demoAuthor = await db.author.findUnique({
      where: { email: 'author@example.com' }
    })
    
    if (!demoAuthor) {
      console.log('Creating demo author...')
      await db.author.create({
        data: {
          email: 'author@example.com',
          password: await hashPassword('author123'),
          name: 'Demo Author',
          isActive: true
        }
      })
      console.log('Demo author created')
    }
    
    console.log('Database initialization complete')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error)
    return false
  }
}

export async function runDatabaseMigrations() {
  try {
    console.log('Running database migrations...')
    // In a real deployment, this would run `prisma migrate deploy`
    // For now, we'll just verify the schema exists
    await db.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    console.log('Database schema verified')
    return true
  } catch (error) {
    console.error('Database migration check failed:', error)
    return false
  }
}