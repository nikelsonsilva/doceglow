'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Settings, ShoppingBag, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Config', fullLabel: 'Configurações', icon: Settings },
  { href: '/admin/products', label: 'Produtos', fullLabel: 'Produtos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', fullLabel: 'Pedidos', icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile: Top header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif font-bold text-lg text-primary">Admin Doce Glow</h1>
        <div className="w-5" />
      </header>

      {/* Desktop: Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/" className="font-serif font-bold text-xl text-primary hover:opacity-80 transition-opacity">
            Admin Doce Glow
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {item.fullLabel}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0" key={pathname}>
        {children}
      </main>

      {/* Mobile: Bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition min-w-[64px] ${
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
