import { NextResponse } from "next/server"
import { getAuthenticatedSession, checkAuth, handleApiError } from "@/lib/api-middleware"
import { AuthorService } from "@/lib/services/author-service"
import { CreateAuthorRequest } from "@/types/api"

export async function GET() {
  try {
    const session = await getAuthenticatedSession()
    const authError = checkAuth(session, ['admin'])
    if (authError) return authError

    const authors = await AuthorService.getAllAuthors()
    return NextResponse.json(authors)
  } catch (error) {
    return handleApiError(error, 'Admin authors GET')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession()
    const authError = checkAuth(session, ['admin'])
    if (authError) return authError

    const body = await request.json() as CreateAuthorRequest
    
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const emailExists = await AuthorService.checkEmailExists(body.email)
    if (emailExists) {
      return NextResponse.json({ error: 'Author with this email already exists' }, { status: 409 })
    }

    const author = await AuthorService.createAuthor(body)
    return NextResponse.json(author, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Create author')
  }
}