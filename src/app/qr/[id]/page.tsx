"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogoWithText } from "@/components/logo"
import { ExternalLink, Play, FileText, Image as ImageIcon } from "lucide-react"

interface QrCodeContent {
  id: string
  name: string
  type: 'URL' | 'VIDEO' | 'TEXT' | 'IMAGE'
  content: string
  book: {
    title: string
    author: {
      name: string
    }
  }
}

export default function QrCodePage() {
  const params = useParams()
  const router = useRouter()
  const [qrCode, setQrCode] = useState<QrCodeContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await fetch(`/api/qr/${params.id}`)
        if (!response.ok) {
          throw new Error('QR code not found')
        }
        const data = await response.json()
        setQrCode(data)
        
        if (data.type === 'URL') {
          setTimeout(() => {
            window.location.href = data.content
          }, 2000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchQrCode()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <LogoWithText className="justify-center mb-4" />
            <CardTitle className="text-center text-red-600">Content Not Found</CardTitle>
            <CardDescription className="text-center">
              The QR code you scanned is no longer available or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (qrCode.type) {
      case 'URL':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <ExternalLink className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h2>
              <p className="text-gray-600 mb-4">
                You will be redirected to the external link in a moment.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 break-all">{qrCode.content}</p>
              </div>
              <Button 
                onClick={() => window.location.href = qrCode.content}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Link Now
              </Button>
            </div>
          </div>
        )

      case 'VIDEO':
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{qrCode.name}</h2>
              <div className="bg-black rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full h-auto"
                  poster="/video-placeholder.jpg"
                >
                  <source src={qrCode.content} type="video/mp4" />
                  <source src={qrCode.content} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )

      case 'TEXT':
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{qrCode.name}</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{qrCode.content}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'IMAGE':
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{qrCode.name}</h2>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <img 
                  src={qrCode.content} 
                  alt={qrCode.name}
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <LogoWithText className="justify-center mb-4" />
            <div className="text-sm text-gray-600">
              From "{qrCode.book.title}" by {qrCode.book.author.name}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {renderContent()}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
            >
              Learn More About QRCoder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}