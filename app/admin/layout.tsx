'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, LogOut, Menu, X,
  Tags, Archive, Tag, Image, Ticket, MessageSquare, Megaphone,
} from 'lucide-react'
import { useState } from 'react'

const ADMIN_MENU = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/variants', label: 'Variants', icon: Archive },
  { href: '/admin/inventory', label: 'Inventory', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/banners', label: 'Banners', icon: Megaphone },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-white">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-black/5 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-black/5">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="text-xl font-serif font-bold text-black">404</span>
            <span className="text-[9px] font-semibold text-black/30 uppercase tracking-[0.2em]">Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-0.5 flex-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'text-black bg-black/[0.06]'
                    : 'text-black/25 hover:text-black/50 hover:bg-black/[0.02]'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-black/5">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-black/15 hover:text-black/40 transition-colors"
          >
            <LogOut size={16} />
            Back to Site
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 w-full">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-black/40 hover:text-black/70"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden lg:block text-sm text-black/25">
              {ADMIN_MENU.find(m => m.href === pathname || (m.href !== '/admin' && pathname.startsWith(m.href)))?.label || 'Admin'}
            </div>
            <div className="w-8 h-8 bg-black/5 flex items-center justify-center text-black/40 text-xs font-medium">
              A
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
