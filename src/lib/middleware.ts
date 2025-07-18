import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getToken } = require('next-auth/jwt')
    
    // Use the same secret as auth configuration
    const secret = process.env.NEXTAUTH_SECRET || 
      `fallback-secret-${process.env.VERCEL_URL || process.env.NETLIFY_URL || 'localhost:3000'}-${Date.now()}`
    
    const token = await getToken({ 
      req: request,
      secret,
      // Ensure we can read the token properly
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    })
    
    console.log('Middleware - Path:', pathname, 'Token:', token ? { id: token.id, role: token.role } : 'none')

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        console.log('Middleware - Redirecting to login: no admin token')
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
      }
      console.log('Middleware - Admin access granted')
    }

    // Author routes protection
    if (pathname.startsWith('/author')) {
      if (!token || token.role !== 'author') {
        console.log('Middleware - Redirecting to login: no author token')
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
      }
      console.log('Middleware - Author access granted')
    }

    // Redirect authenticated users away from login
    if (pathname === '/login' && token) {
      const redirectUrl = token.role === 'admin' ? '/admin' : '/author'
      console.log('Middleware - Redirecting authenticated user to:', redirectUrl)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      console.error('Middleware error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.slice(0, 500)
      })
    }
    
    // If there's an error (like JWT verification), redirect to login unless already there
    if (pathname !== '/login' && !pathname.startsWith('/api') && pathname !== '/') {
      console.log('Middleware - Error occurred, redirecting to login')
      return NextResponse.redirect(new URL('/login?error=session', request.url))
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/author/:path*', '/login']
}