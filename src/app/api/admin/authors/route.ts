import { withAuth, createApiError, createApiSuccess, handleApiError } from "@/lib/api-middleware"
import { AuthorService } from "@/lib/services/author-service"
import { CreateAuthorRequest } from "@/types/api"

export const GET = withAuth(async () => {
  try {
    const authors = await AuthorService.getAllAuthors()
    return createApiSuccess(authors)
  } catch (error) {
    return handleApiError(error, 'Admin authors GET')
  }
}, ['admin'])

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json() as CreateAuthorRequest
    
    if (!body.name || !body.email || !body.password) {
      return createApiError('All fields are required', 400)
    }

    const emailExists = await AuthorService.checkEmailExists(body.email)
    if (emailExists) {
      return createApiError('Author with this email already exists', 409)
    }

    const author = await AuthorService.createAuthor(body)
    return createApiSuccess(author, 201)
  } catch (error) {
    return handleApiError(error, 'Create author')
  }
}, ['admin'])