"use client"

import { AuthorLayout } from "@/components/author/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, QrCode, Eye, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

interface AuthorStats {
  totalBooks: number
  totalQrCodes: number
  totalScans: number
  recentScans: Array<{
    id: string
    qrCode: {
      name: string
      book: {
        title: string
      }
    }
    scannedAt: string
  }>
}

export default function AuthorDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AuthorStats>({
    totalBooks: 0,
    totalQrCodes: 0,
    totalScans: 0,
    recentScans: []
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchAuthorStats()
  }, [])
  
  // Prevent rendering during build time when there's no session context
  if (typeof window === 'undefined') {
    return <AuthorLayout><div>Loading...</div></AuthorLayout>
  }

  const fetchAuthorStats = async () => {
    try {
      const response = await fetch('/api/author/dashboard')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch author stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "My Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "text-blue-600",
      href: "/author/books"
    },
    {
      title: "QR Codes",
      value: stats.totalQrCodes,
      icon: QrCode,
      color: "text-green-600",
      href: "/author/qr-codes"
    },
    {
      title: "Total Scans",
      value: stats.totalScans,
      icon: Eye,
      color: "text-purple-600",
      href: "/author/reports"
    },
    {
      title: "This Month",
      value: stats.recentScans.length,
      icon: TrendingUp,
      color: "text-orange-600",
      href: "/author/reports"
    }
  ]

  if (loading) {
    return (
      <AuthorLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your books and track QR code engagement
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/author/books/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Book
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {card.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>
                Latest QR code scans from your books
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentScans.length > 0 ? (
                  stats.recentScans.slice(0, 5).map((scan) => (
                    <div key={scan.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {scan.qrCode.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          from &quot;{scan.qrCode.book.title}&quot; • {new Date(scan.scannedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No scans yet</p>
                    <p className="text-xs mt-1">Create your first QR code to start tracking</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/author/books/new">
                  <div className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Create New Book
                  </div>
                </Link>
                <Link href="/author/qr-codes/new">
                  <div className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <QrCode className="h-4 w-4 mr-3" />
                    Generate QR Code
                  </div>
                </Link>
                <Link href="/author/reports">
                  <div className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    View Analytics
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthorLayout>
  )
}

export const dynamic = 'force-dynamic'