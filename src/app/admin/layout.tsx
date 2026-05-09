import { ReactNode } from 'react';
import Link from 'next/link';
import { Package, Settings, ShoppingBag } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="font-serif font-bold text-xl text-primary">Admin Doce Glow</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium">
            <Settings className="w-5 h-5 text-slate-500" />
            Configurações
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium">
            <Package className="w-5 h-5 text-slate-500" />
            Produtos
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium">
            <ShoppingBag className="w-5 h-5 text-slate-500" />
            Pedidos
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
