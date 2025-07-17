import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@qrcoder.com' },
    update: {},
    create: {
      email: 'admin@qrcoder.com',
      password: adminPassword,
      name: 'Admin User',
    },
  })

  // Create author user
  const authorPassword = await hashPassword('author123')
  const author = await prisma.author.upsert({
    where: { email: 'yevgen.malafeyev@gmail.com' },
    update: {},
    create: {
      email: 'yevgen.malafeyev@gmail.com',
      password: authorPassword,
      name: 'Yevgen Malafeyev',
      isActive: true,
    },
  })

  // Create sample book
  const book = await prisma.book.upsert({
    where: { isbn: '978-0-123456-78-9' },
    update: {},
    create: {
      title: 'The Complete Guide to QR Codes',
      isbn: '978-0-123456-78-9',
      description: 'A comprehensive guide to understanding and implementing QR codes in modern applications.',
      authorId: author.id,
    },
  })

  // Create sample QR codes
  const qrCodes = await Promise.all([
    prisma.qrCode.create({
      data: {
        name: 'Introduction Video',
        type: 'VIDEO',
        content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        bookId: book.id,
      },
    }),
    prisma.qrCode.create({
      data: {
        name: 'Author Website',
        type: 'URL',
        content: 'https://yevgenmalafeyev.com',
        bookId: book.id,
      },
    }),
    prisma.qrCode.create({
      data: {
        name: 'Chapter 1 Summary',
        type: 'TEXT',
        content: 'This chapter introduces the fundamental concepts of QR codes and their applications in modern technology. We explore the history, structure, and various use cases of QR codes.',
        bookId: book.id,
      },
    }),
    prisma.qrCode.create({
      data: {
        name: 'Diagram 1.1',
        type: 'IMAGE',
        content: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&h=300&fit=crop',
        bookId: book.id,
      },
    }),
  ])

  // Create sample scans
  const now = new Date()
  const scans = []
  
  for (let i = 0; i < 50; i++) {
    const randomQrCode = qrCodes[Math.floor(Math.random() * qrCodes.length)]
    const randomDaysAgo = Math.floor(Math.random() * 30)
    const scanDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000)
    
    scans.push(
      prisma.qrScan.create({
        data: {
          qrCodeId: randomQrCode.id,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'][Math.floor(Math.random() * 5)],
          city: ['New York', 'Toronto', 'London', 'Berlin', 'Paris'][Math.floor(Math.random() * 5)],
          scannedAt: scanDate,
        },
      })
    )
  }

  await Promise.all(scans)

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('👤 Admin: admin@qrcoder.com / admin123')
  console.log('✍️ Author: yevgen.malafeyev@gmail.com / author123')
  console.log('\n📊 Sample Data:')
  console.log(`📚 Created 1 book: "${book.title}"`)
  console.log(`🔗 Created ${qrCodes.length} QR codes`)
  console.log(`📈 Created ${scans.length} scan records`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })