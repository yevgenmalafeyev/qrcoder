"use client"

import { AdminLayout } from "@/components/admin/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useCallback } from "react"
import { Download, Filter, Eye, QrCode, BookOpen, Users } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AdminReportData {
  overview: {
    totalScans: number
    totalBooks: number
    totalQrCodes: number
    totalAuthors: number
    scansThisMonth: number
  }
  scanTrends: Array<{
    date: string
    scans: number
  }>
  authorPerformance: Array<{
    name: string
    scans: number
    books: number
    qrCodes: number
  }>
  qrCodeTypes: Array<{
    name: string
    value: number
    color: string
  }>
  topBooks: Array<{
    title: string
    author: string
    scans: number
  }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<AdminReportData>({
    overview: {
      totalScans: 0,
      totalBooks: 0,
      totalQrCodes: 0,
      totalAuthors: 0,
      scansThisMonth: 0
    },
    scanTrends: [],
    authorPerformance: [],
    qrCodeTypes: [],
    topBooks: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [authorFilter, setAuthorFilter] = useState('')

  const fetchReportData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        range: dateRange,
        ...(authorFilter && { author: authorFilter })
      })
      const response = await fetch(`/api/admin/reports?${params}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, authorFilter])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const exportReport = async () => {
    try {
      const params = new URLSearchParams({
        range: dateRange,
        ...(authorFilter && { author: authorFilter })
      })
      const response = await fetch(`/api/admin/reports/export?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `admin-report-${dateRange}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  const statCards = [
    {
      title: "Total Scans",
      value: reportData.overview.totalScans,
      icon: Eye,
      color: "text-blue-600"
    },
    {
      title: "Active Authors",
      value: reportData.overview.totalAuthors,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Total Books",
      value: reportData.overview.totalBooks,
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "QR Codes",
      value: reportData.overview.totalQrCodes,
      icon: QrCode,
      color: "text-orange-600"
    }
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">System Reports</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive analytics across all authors and books
            </p>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Filter by author..."
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-48"
            />
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title}>
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
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Scan Trends</CardTitle>
              <CardDescription>
                Total QR code scans across all authors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.scanTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Author Performance</CardTitle>
              <CardDescription>
                Scan distribution by author
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.authorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Types</CardTitle>
              <CardDescription>
                Distribution of QR code content types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.qrCodeTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.qrCodeTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Books</CardTitle>
              <CardDescription>
                Books with highest scan counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topBooks.length > 0 ? (
                  reportData.topBooks.map((book, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {book.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {book.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{book.scans}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No books found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export const dynamic = 'force-dynamic'