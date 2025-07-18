"use client"

import { AuthorLayout } from "@/components/author/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { QrCode, Eye, Plus, ExternalLink } from "lucide-react"
import Link from "next/link"

interface QRCodeData {
  id: string
  name: string
  type: string
  content: string
  scanCount: number
  book: {
    title: string
    id: string
  }
  createdAt: string
}

export default function AuthorQRCodesPage() {
  const { data: session } = useSession()
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (session) {
      fetchQRCodes()
    }
  }, [session])

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/author/qr-codes')
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data)
      }
    } catch (error) {
      console.error('Failed to fetch QR codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'url': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-red-100 text-red-800'
      case 'text': return 'bg-green-100 text-green-800'
      case 'image': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
            <p className="text-gray-600 mt-2">
              Manage your QR codes and track their performance
            </p>
          </div>
          <Link href="/author/books">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create QR Code
            </Button>
          </Link>
        </div>

        {qrCodes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first QR code to start engaging with your readers
              </p>
              <Link href="/author/books">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create QR Code
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qrCode) => (
              <Card key={qrCode.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                      <CardDescription className="mt-1">
                        From &quot;{qrCode.book.title}&quot;
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(qrCode.type)}`}>
                      {qrCode.type.toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Scans</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{qrCode.scanCount || 0}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">Content Preview:</span>
                      <p className="mt-1 text-gray-900 truncate">
                        {qrCode.content}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Created {new Date(qrCode.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Link href={`/qr/${qrCode.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View QR
                        </Button>
                      </Link>
                      <Link href={`/author/books/${qrCode.book.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthorLayout>
  )
}

export const dynamic = 'force-dynamic'