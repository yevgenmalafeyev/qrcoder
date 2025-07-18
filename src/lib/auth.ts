import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

// Generate a fallback secret if none is provided
const generateFallbackSecret = () => {
  const fallback = process.env.VERCEL_URL || process.env.NETLIFY_URL || 'localhost:3000'
  return `fallback-secret-${fallback}-${Date.now()}`
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const { email, password, userType } = credentials
        console.log(`Attempting to authenticate ${userType} user: ${email}`)

        try {
          // Check database connection first
          await db.$connect()
          console.log('Database connected successfully')
          
          if (userType === "admin") {
            const admin = await db.admin.findUnique({
              where: { email }
            })

            if (!admin) {
              console.log('Admin not found in database')
              return null
            }

            const isPasswordValid = await bcrypt.compare(password, admin.password)
            if (!isPasswordValid) {
              console.log('Invalid admin password')
              return null
            }

            console.log('Admin authentication successful')
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: "admin"
            }
          } else {
            const author = await db.author.findUnique({
              where: { email }
            })

            if (!author || !author.isActive) {
              console.log('Author not found or inactive')
              return null
            }

            const isPasswordValid = await bcrypt.compare(password, author.password)
            if (!isPasswordValid) {
              console.log('Invalid author password')
              return null
            }

            console.log('Author authentication successful')
            return {
              id: author.id,
              email: author.email,
              name: author.name,
              role: "author"
            }
          }
        } catch (error) {
          console.error("Database auth error:", error)
          
          // If database connection fails, provide a fallback for demo purposes
          const prismaError = error as { code?: string }
          const errorMessage = error instanceof Error ? error.message : String(error)
          
          if (prismaError?.code === 'P1001' || prismaError?.code === 'P2021' || 
              errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') ||
              !process.env.DATABASE_URL) {
            console.log('Database connection failed, using fallback auth')
            
            // Demo credentials for production demo
            if (userType === "admin" && email === "admin@example.com" && password === "admin123") {
              console.log('Fallback admin authentication successful')
              return {
                id: "demo-admin",
                email: "admin@example.com",
                name: "Demo Admin",
                role: "admin"
              }
            }
            
            if (userType === "author" && email === "author@example.com" && password === "author123") {
              console.log('Fallback author authentication successful')
              return {
                id: "demo-author",
                email: "author@example.com",
                name: "Demo Author",
                role: "author"
              }
            }
          }
          
          console.log('Authentication failed')
          return null
        } finally {
          try {
            await db.$disconnect()
          } catch (disconnectError) {
            console.warn('Failed to disconnect from database:', disconnectError)
          }
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      try {
        if (user) {
          console.log('JWT callback - adding user data to token:', { id: user.id, role: user.role })
          token.role = user.role
          token.id = user.id
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      try {
        if (token) {
          console.log('Session callback - adding token data to session:', { id: token.id, role: token.role })
          session.user.id = token.id || token.sub
          session.user.role = token.role as string
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || generateFallbackSecret(),
  debug: true, // Enable debug in production to diagnose issues
  logger: {
    error: (code: string, metadata?: unknown) => {
      console.error('NextAuth Error:', code, metadata)
    },
    warn: (code: string) => {
      console.warn('NextAuth Warning:', code)
    },
    debug: (code: string, metadata?: unknown) => {
      console.log('NextAuth Debug:', code, metadata)
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}