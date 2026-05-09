'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
}

function stripPhone(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

async function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    store_name: '',
    whatsapp_number: '',
    pix_key: '',
    logo_url: '',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data && !data.error) {
          setSettingsId(data.id);
          setFormData({
            store_name: data.store_name || '',
            whatsapp_number: data.whatsapp_number ? formatPhone(data.whatsapp_number) : '',
            pix_key: data.pix_key || '',
            logo_url: data.logo_url || '',
          });
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData(f => ({ ...f, whatsapp_number: raw ? formatPhone(raw) : '' }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('files', new File([compressed], 'logo.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload falhou');
      const { urls } = await res.json();
      setFormData(f => ({ ...f, logo_url: urls[0] }));
      toast.success('Logo enviada!');
    } catch { toast.error('Erro no upload'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        store_name: formData.store_name,
        whatsapp_number: stripPhone(formData.whatsapp_number),
        pix_key: formData.pix_key,
        logo_url: formData.logo_url,
      };
      if (settingsId) payload.id = settingsId;

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      const data = await res.json();
      if (data.id) setSettingsId(data.id);
      toast.success('Configurações salvas com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center text-slate-400 gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Carregando...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Configurações da Loja</h2>
        <p className="text-slate-500 mt-1">Gerencie os dados principais do catálogo Doce Glow.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Loja</label>
              <input type="text" value={formData.store_name}
                onChange={e => setFormData(f => ({ ...f, store_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>

            {/* WhatsApp com Máscara */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Número do WhatsApp</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📱</span>
                <input type="text" value={formData.whatsapp_number}
                  onChange={handlePhoneChange}
                  placeholder="(85) 99750-5422" inputMode="numeric"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Formato: (DDD) XXXXX-XXXX</p>
            </div>

            {/* Chave PIX */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chave PIX</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">💰</span>
                <input type="text" value={formData.pix_key}
                  onChange={e => setFormData(f => ({ ...f, pix_key: e.target.value }))}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logo da Loja</label>
              <div className="space-y-2">
                {formData.logo_url ? (
                  <div className="relative inline-block">
                    <img src={formData.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-xl border border-slate-200 bg-slate-50" />
                    <button type="button" onClick={() => setFormData(f => ({ ...f, logo_url: '' }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50">
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Upload className="w-4 h-4" /> Subir Logo</>}
                  </button>
                  <button type="button" onClick={() => {
                    const url = prompt('Cole a URL pública da logo:');
                    if (url?.startsWith('http')) setFormData(f => ({ ...f, logo_url: url }));
                  }}
                    className="px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-md shadow-pink-200 flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
