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
          return null
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
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt" as const
  },
  secret: process.env.NEXTAUTH_SECRET
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}