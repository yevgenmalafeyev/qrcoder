"use client"

import { AuthorLayout } from "@/components/author/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, QrCode, Link2, Video, FileText, Image } from "lucide-react"
import Link from "next/link"
import QRCodeComponent from "react-qr-code"

const QR_CODE_TYPES = [
  { 
    id: 'URL', 
    name: 'External Link', 
    icon: Link2, 
    description: 'Link to external website or resource',
    placeholder: 'https://example.com'
  },
  { 
    id: 'VIDEO', 
    name: 'Video', 
    icon: Video, 
    description: 'Link to video file or streaming URL',
    placeholder: 'https://example.com/video.mp4'
  },
  { 
    id: 'TEXT', 
    name: 'Text Content', 
    icon: FileText, 
    description: 'Display text content directly',
    placeholder: 'Enter your text content here...'
  },
  { 
    id: 'IMAGE', 
    name: 'Image', 
    icon: Image, 
    description: 'Link to image file',
    placeholder: 'https://example.com/image.jpg'
  }
]

export default function NewQRCodePage() {
  const params = useParams()
  const router = useRouter()
  const [book, setBook] = useState<{ id: string; title: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'URL' as 'URL' | 'VIDEO' | 'TEXT' | 'IMAGE',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchBook()
    }
  }, [params.id])

  useEffect(() => {
    if (formData.name && formData.content) {
      setPreviewUrl(`${window.location.origin}/qr/preview`)
    } else {
      setPreviewUrl('')
    }
  }, [formData.name, formData.content])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/author/books/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBook({ id: data.id, title: data.title })
      }
    } catch (err) {
      console.error('Failed to fetch book:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/author/qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          bookId: params.id
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create QR code')
      }

      const qrCode = await response.json()
      router.push(`/author/books/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const selectedType = QR_CODE_TYPES.find(type => type.id === formData.type)

  return (
    <AuthorLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/author/books/${params.id}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Book
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create QR Code</h1>
            {book && (
              <p className="text-gray-600 mt-2">
                Adding QR code to "{book.title}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code Details
                </CardTitle>
                <CardDescription>
                  Configure your QR code content and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Character Introduction Video"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700">
                      Content Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {QR_CODE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {selectedType && (
                      <p className="text-xs text-gray-500">{selectedType.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-gray-700">
                      Content *
                    </label>
                    {formData.type === 'TEXT' ? (
                      <textarea
                        id="content"
                        name="content"
                        rows={6}
                        value={formData.content}
                        onChange={handleChange}
                        placeholder={selectedType?.placeholder}
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    ) : (
                      <Input
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder={selectedType?.placeholder}
                        required
                      />
                    )}
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={loading || !formData.name || !formData.content}
                    >
                      {loading ? 'Creating...' : 'Create QR Code'}
                    </Button>
                    <Link href={`/author/books/${params.id}`}>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is how your QR code will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.name && formData.content ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <QRCodeComponent
                        value={previewUrl}
                        size={200}
                        level="M"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">{formData.name}</h3>
                      <p className="text-sm text-gray-600">
                        Type: {selectedType?.name}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          Content: {formData.content.length > 50 
                            ? `${formData.content.substring(0, 50)}...` 
                            : formData.content
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Enter name and content to see preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthorLayout>
  )
}