"use client"

import { LogoWithText } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { BookOpen, QrCode, BarChart3, Settings, LogOut, Home } from "lucide-react"

interface AuthorLayoutProps {
  children: ReactNode
}

export function AuthorLayout({ children }: AuthorLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Prevent hydration mismatch
  if (!mounted) {
    return <div>{children}</div>
  }

  const navigation = [
    { name: "Dashboard", href: "/author", icon: Home },
    { name: "Books", href: "/author/books", icon: BookOpen },
    { name: "QR Codes", href: "/author/qr-codes", icon: QrCode },
    { name: "Reports", href: "/author/reports", icon: BarChart3 },
    { name: "Settings", href: "/author/settings", icon: Settings },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <LogoWithText />
          </div>
          <nav className="mt-6">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500">Author</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}