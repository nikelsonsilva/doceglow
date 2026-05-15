'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Phone, MapPin, Package, Clock, RefreshCw } from 'lucide-react';

interface OrderItem {
  quantity: number;
  price_at_time: number;
  selected_options?: { groupName: string; options: string[]; extra: number; priceMode: string }[] | null;
  products: { name: string } | null;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  customers: { id: string; name: string; phone: string; street?: string; number?: string; neighborhood?: string; city?: string; state?: string } | null;
  order_items: OrderItem[];
}

interface CustomerGroup {
  customerId: string;
  name: string;
  phone: string;
  address: string;
  orders: Order[];
  totalSpent: number;
  orderCount: number;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendente', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  paid: { label: 'Pago', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  shipped: { label: 'Enviado', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return phone;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminOrders() {
  const { slug } = useParams<{ slug: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stores/${slug}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/stores/${slug}/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Status atualizado!');
      loadOrders();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  // Group orders by customer
  const customerGroups: CustomerGroup[] = Object.values(
    orders.reduce((acc: Record<string, CustomerGroup>, order) => {
      const cId = order.customers?.id || 'unknown';
      const c = order.customers;
      if (!acc[cId]) {
        const addr = c?.street
          ? `${c.street}, ${c.number || 's/n'} - ${c.neighborhood || ''}, ${c.city || ''}/${c.state || ''}`
          : '';
        acc[cId] = {
          customerId: cId,
          name: c?.name || 'Cliente desconhecido',
          phone: c?.phone || '',
          address: addr,
          orders: [],
          totalSpent: 0,
          orderCount: 0,
        };
      }
      acc[cId].orders.push(order);
      acc[cId].totalSpent += Number(order.total_amount) || 0;
      acc[cId].orderCount++;
      return acc;
    }, {})
  ).sort((a, b) => {
    const aLatest = new Date(a.orders[0]?.created_at || 0).getTime();
    const bLatest = new Date(b.orders[0]?.created_at || 0).getTime();
    return bLatest - aLatest;
  });

  const toggleCustomer = (id: string) => {
    setExpandedCustomer(prev => prev === id ? null : id);
    setExpandedOrder(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-slate-500 mt-1">
            {customerGroups.length} cliente{customerGroups.length !== 1 ? 's' : ''} · {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-300" />
          Carregando pedidos...
        </div>
      ) : customerGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
          <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">Nenhum pedido ainda</p>
          <p className="text-sm mt-1">Os pedidos aparecerão aqui quando os clientes fizerem compras.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customerGroups.map((group) => {
            const isExpanded = expandedCustomer === group.customerId;
            const pendingCount = group.orders.filter(o => o.status === 'pending').length;

            return (
              <div key={group.customerId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition">
                {/* Customer Header - Clickable */}
                <button
                  onClick={() => toggleCustomer(group.customerId)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                    {group.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 truncate">{group.name}</span>
                      {pendingCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {formatPhone(group.phone)}
                      </span>
                      <span>·</span>
                      <span>{group.orderCount} pedido{group.orderCount > 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">R$ {group.totalSpent.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  {/* Expand */}
                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded: Orders list */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {group.address && (
                      <div className="px-5 py-2.5 bg-slate-50 text-sm text-slate-500 flex items-center gap-2 border-b border-slate-100">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{group.address}</span>
                      </div>
                    )}

                    {group.orders.map((order) => {
                      const isOrderExpanded = expandedOrder === order.id;
                      const status = statusConfig[order.status] || statusConfig.pending;

                      return (
                        <div key={order.id} className="border-b border-slate-50 last:border-b-0">
                          {/* Order row */}
                          <button
                            onClick={() => setExpandedOrder(prev => prev === order.id ? null : order.id)}
                            className="w-full px-5 py-3 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-slate-700">
                                  R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text}`}>
                                  {status.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {formatDate(order.created_at)} às {formatTime(order.created_at)}
                                <span className="text-slate-300 ml-1">#{order.id.slice(0, 8)}</span>
                              </div>
                            </div>

                            {/* Status select */}
                            <select
                              value={order.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
                            >
                              <option value="pending">Pendente</option>
                              <option value="paid">Pago</option>
                              <option value="shipped">Enviado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>

                            <div className="shrink-0 text-slate-300">
                              {isOrderExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                          </button>

                          {/* Order items */}
                          {isOrderExpanded && order.order_items && order.order_items.length > 0 && (
                            <div className="bg-slate-50/70 px-5 py-3 ml-12 mr-5 mb-3 rounded-xl border border-slate-100">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Itens do pedido</p>
                              <div className="space-y-1.5">
                                {order.order_items.map((item, idx) => (
                                  <div key={idx} className="text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-700">
                                        <span className="font-medium text-primary">{item.quantity}x</span>{' '}
                                        {item.products?.name || 'Produto removido'}
                                      </span>
                                      <span className="text-slate-500 font-medium">
                                        R$ {(item.quantity * item.price_at_time).toFixed(2).replace('.', ',')}
                                      </span>
                                    </div>
                                    {item.selected_options && item.selected_options.length > 0 && (
                                      <div className="ml-5 mt-1 space-y-0.5 mb-1">
                                        {item.selected_options.map((opt: any, oi: number) => (
                                          <div key={oi} className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <span className="text-slate-300">↳</span>
                                            <span className="text-slate-400">{opt.groupName}:</span>
                                            <span className="font-medium text-slate-600">{opt.options?.join(', ')}</span>
                                            {opt.extra > 0 && (
                                              <span className="text-emerald-600">
                                                ({opt.priceMode === 'replace' ? 'R$' : '+R$'} {Number(opt.extra).toFixed(2).replace('.', ',')})
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-sm font-semibold">
                                <span className="text-slate-600">Total</span>
                                <span className="text-slate-800">R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
