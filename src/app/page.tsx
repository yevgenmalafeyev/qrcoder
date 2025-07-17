import { LogoWithText } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, QrCode, BarChart3, Users, Shield, Smartphone } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <LogoWithText className="justify-center mb-6" size="lg" />
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Connect Books with
            <span className="text-blue-600"> Digital Content</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Enhance your books with QR codes that link to videos, images, and interactive content. 
            Track engagement and provide readers with enriched experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Easy QR Generation</CardTitle>
              <CardDescription>
                Create QR codes for any content type - videos, images, text, or external links
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Track scan rates, user engagement, and geographic distribution of your content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Mobile Optimized</CardTitle>
              <CardDescription>
                Seamless experience for readers scanning QR codes on any mobile device
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              For Authors & Publishers
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Book Management</h3>
                  <p className="text-gray-600">Organize your books and create QR codes for each chapter or section</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <QrCode className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Content Linking</h3>
                  <p className="text-gray-600">Link QR codes to videos, images, additional text, or external resources</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Performance Tracking</h3>
                  <p className="text-gray-600">Monitor how readers interact with your enhanced content</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 border">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">My Novel</h4>
                    <p className="text-sm text-gray-600">Chapter 1 - Introduction</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square ${
                          Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'
                        } rounded-sm`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  QR Code linking to character introduction video
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            For Administrators
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <Users className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Author Management</h3>
                <p className="text-gray-600">
                  Manage author accounts, reset passwords, and control access to the platform
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">System Analytics</h3>
                <p className="text-gray-600">
                  Comprehensive reporting across all authors and books with exportable data
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to enhance your books?
          </h2>
          <p className="text-gray-600 mb-8">
            Join authors and publishers who are already enriching their content with QR codes
          </p>
          <Link href="/login">
            <Button size="lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
