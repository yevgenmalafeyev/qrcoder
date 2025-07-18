import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

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
          return null
        }

        const { email, password, userType } = credentials

        try {
          // Check database connection first
          await db.$connect()
          
          if (userType === "admin") {
            const admin = await db.admin.findUnique({
              where: { email }
            })

            if (!admin) return null

            const isPasswordValid = await bcrypt.compare(password, admin.password)
            if (!isPasswordValid) return null

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

            if (!author || !author.isActive) return null

            const isPasswordValid = await bcrypt.compare(password, author.password)
            if (!isPasswordValid) return null

            return {
              id: author.id,
              email: author.email,
              name: author.name,
              role: "author"
            }
          }
        } catch (error) {
          console.error("Auth error:", error)
          
          // If database connection fails, provide a fallback for demo purposes
          const prismaError = error as { code?: string }
          const errorMessage = error instanceof Error ? error.message : String(error)
          
          if (prismaError?.code === 'P1001' || prismaError?.code === 'P2021' || 
              errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') ||
              !process.env.DATABASE_URL) {
            console.log('Database connection failed, using fallback auth')
            
            // Demo credentials for production demo
            if (userType === "admin" && email === "admin@example.com" && password === "admin123") {
              return {
                id: "demo-admin",
                email: "admin@example.com",
                name: "Demo Admin",
                role: "admin"
              }
            }
            
            if (userType === "author" && email === "author@example.com" && password === "author123") {
              return {
                id: "demo-author",
                email: "author@example.com",
                name: "Demo Author",
                role: "author"
              }
            }
          }
          
          return null
        } finally {
          await db.$disconnect()
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      try {
        if (token) {
          session.user.id = token.sub!
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
    strategy: "jwt" as const
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code: string, metadata?: unknown) => {
      console.error('NextAuth Error:', code, metadata)
    },
    warn: (code: string) => {
      console.warn('NextAuth Warning:', code)
    },
    debug: (code: string, metadata?: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, metadata)
      }
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}