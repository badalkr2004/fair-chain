'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, BarChart3, Link2, Search,
  TrendingUp, User, ChevronLeft, ChevronRight, Leaf, Gavel, Truck, LogOut,
  Store, Receipt, X,
} from 'lucide-react';

const farmerNav = [
  { href: '/dashboard/farmer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/farmer/products', label: 'My Products', icon: Package },
  { href: '/dashboard/farmer/bids', label: 'Received Bids', icon: Gavel },
  { href: '/dashboard/farmer/orders', label: 'My Orders', icon: ShoppingCart },
  { href: '/dashboard/traceability', label: 'Traceability', icon: Search },
  { href: '/dashboard/forecast', label: 'Market Trends', icon: TrendingUp },
  { href: '/dashboard/farmer/profile', label: 'Profile', icon: User },
];

const intermediaryNav = [
  { href: '/dashboard/intermediary', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/intermediary/marketplace', label: 'Marketplace', icon: Store },
  { href: '/dashboard/intermediary/bids', label: 'My Bids', icon: Gavel },
  { href: '/dashboard/intermediary/supply-chains', label: 'Supply Chains', icon: Link2 },
  { href: '/dashboard/intermediary/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/traceability', label: 'Traceability', icon: Search },
  { href: '/dashboard/intermediary/profile', label: 'Profile', icon: User },
];

const consumerNav = [
  { href: '/dashboard/consumer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/consumer/marketplace', label: 'Marketplace', icon: Store },
  { href: '/dashboard/consumer/orders', label: 'My Orders', icon: ShoppingCart },
  { href: '/dashboard/traceability', label: 'Traceability', icon: Search },
  { href: '/dashboard/forecast', label: 'Market Trends', icon: TrendingUp },
  { href: '/dashboard/consumer/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const navItems = user?.role === 'FARMER' ? farmerNav
    : user?.role === 'INTERMEDIARY' ? intermediaryNav
    : consumerNav;

  const roleColor = user?.role === 'FARMER' ? 'bg-green-600'
    : user?.role === 'INTERMEDIARY' ? 'bg-amber-600'
    : 'bg-blue-600';

  const roleLightColor = user?.role === 'FARMER' ? 'bg-green-50 text-green-700'
    : user?.role === 'INTERMEDIARY' ? 'bg-amber-50 text-amber-700'
    : 'bg-blue-50 text-blue-700';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-[72px]',
          'lg:relative lg:z-auto',
          !sidebarOpen && 'max-lg:w-0 max-lg:overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', roleColor)}>
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">FairChain</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hidden lg:block"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="px-4 py-3">
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', roleLightColor)}>
              {user?.role}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-green-600' : 'text-gray-400')} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm', roleColor)}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer',
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
