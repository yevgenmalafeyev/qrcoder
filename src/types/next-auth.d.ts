// import NextAuth from "next-auth" // Not used in current implementation

declare module "next-auth" {
  interface User {
    role: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}