"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { FileText, DollarSign, Settings, LogOut, Home } from "lucide-react"

export function SupplierNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/supplier", label: "דשבורד", icon: Home },
    { href: "/supplier/requests", label: "בקשות פתוחות", icon: FileText },
    { href: "/supplier/offers", label: "הצעות שלי", icon: DollarSign },
    { href: "/supplier/settings", label: "הגדרות", icon: Settings },
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/supplier" className="text-2xl font-bold text-green-600">
                🚗 CarBot
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== "/supplier" && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-green-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon size={18} className="ml-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <LogOut size={18} className="ml-2" />
              התנתק
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

