'use client';

import { Menu, Bell } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';

export default function Header() {
  const { setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
