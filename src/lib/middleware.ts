import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getToken } = require('next-auth/jwt')
    const token = await getToken({ req: request })
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    if (pathname.startsWith('/author')) {
      if (!token || token.role !== 'author') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    if (pathname === '/login' && token) {
      const redirectUrl = token.role === 'admin' ? '/admin' : '/author'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error (like database connection), allow access to login
    if (request.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/author/:path*', '/login']
}