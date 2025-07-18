"use client"

import { AuthorLayout } from "@/components/author/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { BookOpen, Plus, Search, QrCode, Eye, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { BookWithStats } from "@/types/api"

export default function AuthorBooksPage() {
  const [books, setBooks] = useState<BookWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/author/books')
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AuthorLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AuthorLayout>
    )
  }

  return (
    <AuthorLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
            <p className="text-gray-600 mt-2">
              Manage your books and their QR codes
            </p>
          </div>
          <Link href="/author/books/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Book
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search books by title or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No books found' : 'No books yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first book to get started with QR codes'
              }
            </p>
            {!searchTerm && (
              <Link href="/author/books/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Book
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const totalScans = book.qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0)
              
              return (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {book.title}
                        </CardTitle>
                        {book.isbn && (
                          <CardDescription className="mt-1">
                            ISBN: {book.isbn}
                          </CardDescription>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {book.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {book.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <QrCode className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {book._count.qrCodes} QR codes
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {totalScans} scans
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {new Date(book.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/author/books/${book.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/author/books/${book.id}/qr-codes/new`}>
                        <Button className="flex-1">
                          <QrCode className="h-4 w-4 mr-2" />
                          Add QR
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AuthorLayout>
  )
}

export const dynamic = 'force-dynamic'