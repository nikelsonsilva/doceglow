'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
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
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Status do pedido atualizado!');
      loadOrders();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-slate-500 mt-2">Acompanhe os pedidos gerados pelo site.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 font-medium text-slate-500 text-sm">ID / Data</th>
                <th className="p-4 font-medium text-slate-500 text-sm">Cliente</th>
                <th className="p-4 font-medium text-slate-500 text-sm">Telefone</th>
                <th className="p-4 font-medium text-slate-500 text-sm">Total</th>
                <th className="p-4 font-medium text-slate-500 text-sm">Status</th>
                <th className="p-4 font-medium text-slate-500 text-sm">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Nenhum pedido encontrado.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-800">{order.id.slice(0, 8)}...</div>
                      <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-800">{order.customers?.name || 'Não informado'}</td>
                    <td className="p-4 text-sm text-slate-500">{order.customers?.phone}</td>
                    <td className="p-4 font-medium text-slate-800">R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                        order.status === 'paid' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {order.status === 'pending' ? 'Pendente' : order.status === 'paid' ? 'Pago' : 'Enviado'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="pending">Marcar como Pendente</option>
                        <option value="paid">Marcar como Pago</option>
                        <option value="shipped">Marcar como Enviado</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
