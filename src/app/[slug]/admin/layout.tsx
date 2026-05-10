'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Package, Settings, ShoppingBag, ArrowLeft, Store } from 'lucide-react';

export default function StoreAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { slug } = useParams<{ slug: string }>();

  const navItems = [
    { href: `/${slug}/admin`, label: 'Config', fullLabel: 'Configurações', icon: Settings },
    { href: `/${slug}/admin/products`, label: 'Produtos', fullLabel: 'Produtos', icon: Package },
    { href: `/${slug}/admin/orders`, label: 'Pedidos', fullLabel: 'Pedidos', icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile: Top header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <Link href={`/${slug}`} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-primary" />
          <h1 className="font-serif font-bold text-lg text-primary truncate max-w-[200px]">Admin</h1>
        </div>
        <div className="w-5" />
      </header>

      {/* Desktop: Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2">
          <Store className="w-5 h-5 text-primary shrink-0" />
          <Link href={`/${slug}`} className="font-serif font-bold text-lg text-primary hover:opacity-80 transition-opacity truncate">
            Painel Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${slug}/admin` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
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
        <div className="p-4 border-t border-slate-100">
          <Link href={`/${slug}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ver minha loja
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0" key={pathname}>
        {children}
      </main>

      {/* Mobile: Bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${slug}/admin` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[64px] ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
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
