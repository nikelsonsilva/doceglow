'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Settings, ShoppingBag } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Configurações', icon: Settings },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="font-serif font-bold text-xl text-primary">Admin Doce Glow</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" key={pathname}>
        {children}
      </main>
    </div>
  );
}
