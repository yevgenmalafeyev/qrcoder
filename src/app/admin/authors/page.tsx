"use client"

import { AdminLayout } from "@/components/admin/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Users, Plus, Search, MoreHorizontal, Key, UserCheck, UserX, Eye, BookOpen, QrCode } from "lucide-react"
import { hashPassword } from "@/lib/auth"

interface Author {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  _count: {
    books: number
  }
  books: Array<{
    _count: {
      qrCodes: number
    }
    qrCodes: Array<{
      _count: {
        scans: number
      }
    }>
  }>
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingAuthor, setCreatingAuthor] = useState(false)

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/authors')
      const data = await response.json()
      setAuthors(data)
    } catch (error) {
      console.error('Failed to fetch authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingAuthor(true)

    try {
      const response = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAuthor),
      })

      if (response.ok) {
        setNewAuthor({ name: '', email: '', password: '' })
        setShowCreateForm(false)
        fetchAuthors()
      }
    } catch (error) {
      console.error('Failed to create author:', error)
    } finally {
      setCreatingAuthor(false)
    }
  }

  const toggleAuthorStatus = async (authorId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/authors/${authorId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchAuthors()
      }
    } catch (error) {
      console.error('Failed to toggle author status:', error)
    }
  }

  const resetPassword = async (authorId: string) => {
    try {
      const response = await fetch(`/api/admin/authors/${authorId}/reset-password`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Password reset successful. New password: ${data.newPassword}`)
      }
    } catch (error) {
      console.error('Failed to reset password:', error)
    }
  }

  const impersonateAuthor = async (authorId: string) => {
    try {
      const response = await fetch(`/api/admin/authors/${authorId}/impersonate`, {
        method: 'POST',
      })

      if (response.ok) {
        window.location.href = '/author'
      }
    } catch (error) {
      console.error('Failed to impersonate author:', error)
    }
  }

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Author Management</h1>
            <p className="text-gray-600 mt-2">
              Manage author accounts and permissions
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Author
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Author</CardTitle>
              <CardDescription>
                Add a new author to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createAuthor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newAuthor.name}
                      onChange={(e) => setNewAuthor(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Author name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newAuthor.email}
                      onChange={(e) => setNewAuthor(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="author@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={newAuthor.password}
                    onChange={(e) => setNewAuthor(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={creatingAuthor}>
                    {creatingAuthor ? 'Creating...' : 'Create Author'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search authors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredAuthors.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No authors found' : 'No authors yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first author to get started'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Author
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map((author) => {
              const totalQrCodes = author.books.reduce((sum, book) => sum + book._count.qrCodes, 0)
              const totalScans = author.books.reduce((sum, book) => 
                sum + book.qrCodes.reduce((qrSum, qr) => qrSum + qr._count.scans, 0), 0
              )
              
              return (
                <Card key={author.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {author.name}
                          <Badge variant={author.isActive ? "success" : "destructive"}>
                            {author.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {author.email}
                        </CardDescription>
                      </div>
                      <div className="relative">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Books</span>
                        </div>
                        <span className="font-medium">{author._count.books}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <QrCode className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">QR Codes</span>
                        </div>
                        <span className="font-medium">{totalQrCodes}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Total Scans</span>
                        </div>
                        <span className="font-medium">{totalScans}</span>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => impersonateAuthor(author.id)}
                            className="flex-1"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Login as
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetPassword(author.id)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAuthorStatus(author.id, author.isActive)}
                          >
                            {author.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center">
                        Created {new Date(author.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}