'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function formatPhoneMask(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

const CATEGORIES = [
  { value: 'cosmeticos', label: '💄 Cosméticos' },
  { value: 'roupas', label: '👗 Roupas' },
  { value: 'comida', label: '🍰 Comida' },
  { value: 'acessorios', label: '💎 Acessórios' },
  { value: 'perfumaria', label: '🧴 Perfumaria' },
  { value: 'artesanato', label: '🎨 Artesanato' },
  { value: 'eletronicos', label: '📱 Eletrônicos' },
  { value: 'casa', label: '🏠 Casa & Decoração' },
  { value: 'outro', label: '📦 Outro' },
];

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    owner_name: '',
    email: '',
    password: '',
    store_name: '',
    category: '',
    whatsapp_number: '',
  });
  const [slugStatus, setSlugStatus] = useState<{ available: boolean; slug: string; reason?: string } | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const slugTimer = useRef<NodeJS.Timeout | null>(null);

  // Real-time slug availability check (debounced)
  useEffect(() => {
    if (slugTimer.current) clearTimeout(slugTimer.current);
    setSlugStatus(null);

    if (!form.store_name || form.store_name.length < 3) return;

    setCheckingSlug(true);
    slugTimer.current = setTimeout(async () => {
      try {
        const slug = form.store_name
          .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
        const res = await fetch(`/api/stores?slug=${slug}`);
        const data = await res.json();
        setSlugStatus(data);
      } catch {
        setSlugStatus(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => { if (slugTimer.current) clearTimeout(slugTimer.current); };
  }, [form.store_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.owner_name || !form.email || !form.password || !form.store_name || !form.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (form.password.length < 6) {
      toast.error('A senha precisa ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar loja');
      }

      toast.success('Loja criada com sucesso! 🎉');
      router.push(`/${data.slug}/admin`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar sua loja. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-slate-800">Vitrinia</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Crie sua loja</h1>
            <p className="text-slate-500">Preencha as informações abaixo e comece a vender.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            {/* Owner Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Seu nome completo *</label>
              <input
                type="text"
                required
                value={form.owner_name}
                onChange={e => update('owner_name', e.target.value)}
                placeholder="Maria Silva"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">Dados da Loja</p>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Loja *</label>
              <input
                type="text"
                required
                value={form.store_name}
                onChange={e => update('store_name', e.target.value)}
                placeholder="Ex: Maria Cosméticos"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              {form.store_name && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {checkingSlug ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" /><span className="text-xs text-slate-400">Verificando...</span></>
                  ) : slugStatus ? (
                    slugStatus.available ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-600">Disponível: <span className="font-medium">vitrinia.semfila.app/{slugStatus.slug}</span></span></>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-xs text-red-500">{slugStatus.reason || 'Indisponível'}</span></>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">
                      Sua loja ficará em: <span className="text-primary font-medium">
                        vitrinia.semfila.app/{form.store_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 40)}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ramo da Loja *</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update('category', cat.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition border-2 ${
                      form.category === cat.value
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp da Loja</label>
              <input
                type="tel"
                value={formatPhoneMask(form.whatsapp_number)}
                onChange={e => update('whatsapp_number', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="(85) 99999-9999"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <p className="text-xs text-slate-400 mt-1">Os pedidos dos clientes serão enviados para este número.</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-200 disabled:opacity-50 transition"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Criando sua loja...</>
              ) : (
                <>Criar Minha Loja</>
              )}
            </button>

            <p className="text-center text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
