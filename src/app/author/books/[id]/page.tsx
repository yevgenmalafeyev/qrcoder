"use client"

import { AuthorLayout } from "@/components/author/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, BookOpen, QrCode, Eye, Plus, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import QRCodeComponent from "react-qr-code"

interface Book {
  id: string
  title: string
  isbn?: string
  description?: string
  createdAt: string
  qrCodes: Array<{
    id: string
    name: string
    type: 'URL' | 'VIDEO' | 'TEXT' | 'IMAGE'
    content: string
    createdAt: string
    _count: {
      scans: number
    }
  }>
}

export default function BookDetailPage() {
  const params = useParams()
  // const router = useRouter() // Not used in current implementation
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBook = useCallback(async () => {
    try {
      const response = await fetch(`/api/author/books/${params.id}`)
      if (!response.ok) {
        throw new Error('Book not found')
      }
      const data = await response.json()
      setBook(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchBook()
    }
  }, [params.id, fetchBook])

  const getQRCodeUrl = (qrCodeId: string) => {
    return `${window.location.origin}/qr/${qrCodeId}`
  }

  const downloadQRCode = (qrCodeId: string, name: string) => {
    const svg = document.getElementById(`qr-${qrCodeId}`)
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      canvas.width = 256
      canvas.height = 256
      ctx?.drawImage(img, 0, 0, 256, 256)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `${name}-qr-code.png`
          link.click()
        }
      })
      
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URL': return 'bg-blue-100 text-blue-800'
      case 'VIDEO': return 'bg-purple-100 text-purple-800'
      case 'TEXT': return 'bg-green-100 text-green-800'
      case 'IMAGE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AuthorLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthorLayout>
    )
  }

  if (error || !book) {
    return (
      <AuthorLayout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Book not found'}
            </h3>
            <Link href="/author/books">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Books
              </Button>
            </Link>
          </div>
        </div>
      </AuthorLayout>
    )
  }

  return (
    <AuthorLayout>
      <div className="p-8">
        <div className="mb-6">
          <Link href="/author/books">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Books
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              {book.isbn && (
                <p className="text-gray-600 mt-2">ISBN: {book.isbn}</p>
              )}
              {book.description && (
                <p className="text-gray-600 mt-2">{book.description}</p>
              )}
            </div>
            <Link href={`/author/books/${book.id}/qr-codes/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add QR Code
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Book Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">QR Codes</span>
                <Badge variant="secondary">{book.qrCodes.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Scans</span>
                <Badge variant="secondary">
                  {book.qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <Badge variant="secondary">
                  {new Date(book.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>QR Codes</CardTitle>
                <CardDescription>
                  Manage QR codes for this book
                </CardDescription>
              </CardHeader>
              <CardContent>
                {book.qrCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No QR codes yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Create your first QR code to link additional content to your book
                    </p>
                    <Link href={`/author/books/${book.id}/qr-codes/new`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create QR Code
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {book.qrCodes.map((qrCode) => (
                      <div key={qrCode.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div id={`qr-${qrCode.id}`}>
                              <QRCodeComponent
                                value={getQRCodeUrl(qrCode.id)}
                                size={80}
                                level="M"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {qrCode.name}
                              </h4>
                              <Badge className={getTypeColor(qrCode.type)}>
                                {qrCode.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {qrCode.content.length > 100 
                                ? `${qrCode.content.substring(0, 100)}...` 
                                : qrCode.content
                              }
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {qrCode._count.scans} scans
                              </div>
                              <div>
                                Created {new Date(qrCode.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadQRCode(qrCode.id, qrCode.name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Link href={getQRCodeUrl(qrCode.id)} target="_blank">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
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