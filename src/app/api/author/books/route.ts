import { withAuth, createApiError, createApiSuccess, handleApiError } from "@/lib/api-middleware"
import { BookService } from "@/lib/services/book-service"
import { CreateBookRequest } from "@/types/api"

export const GET = withAuth(async (request, session) => {
  try {
    const books = await BookService.getBooksByAuthor(session.user.id)
    return createApiSuccess(books)
  } catch (error) {
    return handleApiError(error, 'Author books GET')
  }
}, ['author'])

export const POST = withAuth(async (request, session) => {
  try {
    const body = await request.json() as CreateBookRequest
    
    if (!body.title) {
      return createApiError('Title is required', 400)
    }

    const book = await BookService.createBook({
      ...body,
      authorId: session.user.id
    })

    return createApiSuccess(book, 201)
  } catch (error) {
    return handleApiError(error, 'Create book')
  }
}, ['author'])