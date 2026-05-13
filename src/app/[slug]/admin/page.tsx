'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Loader2, ExternalLink, Copy } from 'lucide-react';

function formatPhoneMask(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function stripPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export default function StoreAdminSettings() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    whatsapp_number: '',
    pix_key: '',
    primary_color: '#ec4899',
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stores/${slug}`);
        const data = await res.json();
        if (data && !data.error) {
          setForm({
            name: data.name || '',
            category: data.category || '',
            whatsapp_number: data.whatsapp_number || '',
            pix_key: data.pix_key || '',
            primary_color: data.primary_color || '#ec4899',
          });
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const storeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-slate-500 mt-1">Gerencie as informações da sua loja.</p>
      </div>

      {/* Store URL */}
      <div className="bg-gradient-to-r from-primary/5 to-pink-50 border border-primary/20 rounded-2xl p-5 mb-6">
        <p className="text-sm font-medium text-slate-600 mb-2">Link da sua loja:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-slate-200 text-primary font-medium truncate">
            {storeUrl}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(storeUrl); toast.success('Link copiado!'); }}
            className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4 text-slate-500" />
          </button>
          <a href={storeUrl} target="_blank" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da Loja</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Ramo</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="cosmeticos">Cosméticos</option>
            <option value="roupas">Roupas</option>
            <option value="comida">Comida</option>
            <option value="acessorios">Acessórios</option>
            <option value="perfumaria">Perfumaria</option>
            <option value="artesanato">Artesanato</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp (com DDD)</label>
          <input
            type="tel"
            value={formatPhoneMask(form.whatsapp_number)}
            onChange={e => setForm(f => ({ ...f, whatsapp_number: stripPhone(e.target.value) }))}
            placeholder="(85) 99999-9999"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Chave PIX</label>
          <input
            type="text"
            value={form.pix_key}
            onChange={e => setForm(f => ({ ...f, pix_key: e.target.value }))}
            placeholder="email@exemplo.com ou CPF"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cor principal</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primary_color}
              onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
              className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer"
            />
            <input
              type="text"
              value={form.primary_color}
              onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition shadow-md"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
