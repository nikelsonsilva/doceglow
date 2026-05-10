'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { X, ShoppingBag, RotateCcw, Loader2, Clock, Package, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  quantity: number;
  price_at_time: number;
  products: { id: string; name: string; price: number; image_url: string; category: string };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerPhone: string | null;
  storeSlug?: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function OrdersDrawer({ isOpen, onClose, customerPhone, storeSlug }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    if (isOpen && customerPhone) {
      setLoading(true);
      const apiBase = storeSlug ? `/api/stores/${storeSlug}` : '/api';
      fetch(`${apiBase}/customers/orders?phone=${customerPhone}`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setOrders(data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, customerPhone]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleReorder = (order: Order) => {
    let count = 0;
    order.order_items.forEach(item => {
      if (item.products) {
        for (let i = 0; i < item.quantity; i++) {
          addItem({
            id: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image_url: item.products.image_url,
            category: item.products.category,
            active: true,
          });
        }
        count += item.quantity;
      }
    });
    toast.success(`${count} itens adicionados ao carrinho!`, { icon: '🛒' });
    onClose();
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <h2 className="font-serif text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Meus Pedidos
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!customerPhone ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 text-center px-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p className="text-sm">Faça uma compra para ver seu histórico de pedidos aqui.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Nenhum pedido encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const isExpanded = expanded === order.id;
                const st = statusMap[order.status] || statusMap.pending;
                return (
                  <div key={order.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    {/* Order header - clickable */}
                    <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="w-full p-4 flex items-center justify-between text-left">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">R$ {order.total_amount.toFixed(2).replace('.',',')}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Expanded items */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="border-t border-slate-200 pt-3 space-y-2">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-100">
                                <img src={item.products?.image_url} alt={item.products?.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{item.products?.name}</p>
                                <p className="text-xs text-slate-400">{item.quantity}x R$ {item.price_at_time.toFixed(2).replace('.',',')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => handleReorder(order)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-sm shadow-pink-200 text-sm">
                          <RotateCcw className="w-4 h-4" /> Repetir Pedido
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
