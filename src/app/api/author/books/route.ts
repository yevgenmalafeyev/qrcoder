import { NextResponse } from "next/server"
import { getAuthenticatedSession, checkAuth, handleApiError } from "@/lib/api-middleware"
import { BookService } from "@/lib/services/book-service"
import { CreateBookRequest } from "@/types/api"

export async function GET() {
  try {
    const session = await getAuthenticatedSession()
    const authError = checkAuth(session, ['author'])
    if (authError) return authError

    const books = await BookService.getBooksByAuthor(session!.user.id)
    return NextResponse.json(books)
  } catch (error) {
    return handleApiError(error, 'Author books GET')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession()
    const authError = checkAuth(session, ['author'])
    if (authError) return authError

    const body = await request.json() as CreateBookRequest
    
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const book = await BookService.createBook({
      ...body,
      authorId: session!.user.id
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Create book')
  }
}