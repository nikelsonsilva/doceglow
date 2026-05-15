'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Loader2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import OptionGroupsEditor, { OptionGroup } from '@/components/admin/OptionGroupsEditor';
import { storeHasOptionSupport, getCategorySuggestions } from '@/lib/store-features';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url: string;
  images?: string[];
  active: boolean;
  stock: number | null;
  has_options?: boolean;
  option_groups?: any[];
  created_at: string;
}

function formatPriceBR(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parsePriceBR(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
}

async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
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

export default function AdminProducts() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string>('');
  const [modalStep, setModalStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFood = storeHasOptionSupport(storeCategory);
  const categorySuggestions = getCategorySuggestions(storeCategory);

  const [form, setForm] = useState({
    name: '', priceDisplay: '', category: '',
    description: '', image_url: '', imageUrls: [] as string[], active: true,
    stockDisplay: '' as string,
    optionGroups: [] as OptionGroup[],
  });

  // Load store category
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/stores/${slug}`)
      .then(r => r.json())
      .then(d => { if (d?.category) setStoreCategory(d.category); })
      .catch(() => {});
  }, [slug]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stores/${slug}/products`);
      if (!res.ok) throw new Error('Erro ao carregar');
      setProducts(await res.json());
    } catch { toast.error('Erro ao carregar produtos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      const groups: OptionGroup[] = (product.option_groups || []).map((g: any) => ({
        name: g.name,
        min_select: g.min_select,
        max_select: g.max_select,
        price_mode: g.price_mode || 'add',
        sort_order: g.sort_order,
        options: (g.product_options || g.options || []).map((o: any) => ({
          name: o.name,
          extra_price: Number(o.extra_price) || 0,
        })),
      }));
      setForm({
        name: product.name,
        priceDisplay: product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        category: product.category,
        description: product.description || '',
        image_url: product.image_url,
        imageUrls: product.images || [product.image_url],
        active: product.active,
        stockDisplay: product.stock !== null && product.stock !== undefined ? String(product.stock) : '',
        optionGroups: groups,
      });
    } else {
      setEditingProduct(null);
      setForm({
        name: '', priceDisplay: '', category: categorySuggestions[0] || '',
        description: '', image_url: '', imageUrls: [], active: true, stockDisplay: '',
        optionGroups: [],
      });
    }
    setModalStep(0);
    setIsModalOpen(true);
  };

  const adminStepLabels = isFood ? ['Informações', 'Montagem', 'Mídia'] : ['Informações', 'Mídia'];
  const adminTotalSteps = adminStepLabels.length;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setForm(f => ({ ...f, priceDisplay: raw ? formatPriceBR(raw) : '' }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        formData.append('files', new File([compressed], file.name, { type: 'image/jpeg' }));
      }
      const res = await fetch(`/api/stores/${slug}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload falhou');
      const { urls } = await res.json();
      setForm(f => ({
        ...f,
        imageUrls: [...f.imageUrls, ...urls],
        image_url: f.image_url || urls[0],
      }));
      toast.success(`${urls.length} imagem(ns) enviada(s)!`);
    } catch { toast.error('Erro no upload'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const addUrlManual = () => {
    const url = prompt('Cole a URL pública da imagem:');
    if (url?.startsWith('http')) {
      setForm(f => ({
        ...f,
        imageUrls: [...f.imageUrls, url],
        image_url: f.image_url || url,
      }));
    }
  };

  const removeImage = (idx: number) => {
    setForm(f => {
      const updated = f.imageUrls.filter((_, i) => i !== idx);
      return { ...f, imageUrls: updated, image_url: updated[0] || '' };
    });
  };

  const setMainImage = (idx: number) => {
    setForm(f => ({ ...f, image_url: f.imageUrls[idx] }));
    toast.success('Imagem principal definida!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.priceDisplay) { toast.error('Preencha nome e preço'); return; }
    if (modalStep < adminTotalSteps - 1) return; // safety guard

    // Validate option groups
    if (form.optionGroups.length > 0) {
      for (const g of form.optionGroups) {
        if (!g.name.trim()) { toast.error('Todas as etapas precisam ter um nome'); return; }
        const validOpts = g.options.filter(o => o.name.trim());
        if (validOpts.length === 0) { toast.error(`A etapa "${g.name}" precisa ter pelo menos uma opção`); return; }
      }
    }

    setSaving(true);
    try {
      // Clean empty options
      const cleanGroups = form.optionGroups.map(g => ({
        ...g,
        options: g.options.filter(o => o.name.trim()),
      }));

      const payload: any = {
        name: form.name,
        price: parsePriceBR(form.priceDisplay),
        category: form.category,
        description: form.description || null,
        image_url: form.image_url || form.imageUrls[0] || '',
        images: form.imageUrls.length > 0 ? form.imageUrls : null,
        active: form.active,
        stock: form.stockDisplay.trim() === '' ? null : parseInt(form.stockDisplay, 10),
        option_groups: cleanGroups.length > 0 ? cleanGroups : undefined,
      };
      if (editingProduct) payload.id = editingProduct.id;

      const res = await fetch(`/api/stores/${slug}/products`, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/stores/${slug}/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      });
      toast.success(`Produto ${!active ? 'ativado' : 'desativado'}`);
      loadProducts();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      await fetch(`/api/stores/${slug}/products?id=${id}`, { method: 'DELETE' });
      toast.success('Produto excluído!');
      loadProducts();
    } catch { toast.error('Erro ao excluir'); }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isFood ? '🍽️ Cardápio' : 'Produtos'}
          </h2>
          <p className="text-slate-500 mt-1">
            {products.length} {isFood ? 'item' : 'produto'}{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => openModal()}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-md shadow-pink-200">
          <Plus className="w-5 h-5" /> {isFood ? 'Novo Item' : 'Novo Produto'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {isFood ? 'Nenhum item no cardápio.' : 'Nenhum produto cadastrado.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Imagem</th>
                  <th className="p-4 font-medium text-slate-500 text-xs uppercase tracking-wider">{isFood ? 'Item' : 'Produto'}</th>
                  <th className="p-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Categoria</th>
                  <th className="p-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Preço</th>
                  <th className="p-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Estoque</th>
                  <th className="p-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="p-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shadow-sm">
                        {p.image_url ? (
                          <img loading="lazy" src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-5 h-5"/></div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      {p.has_options && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Layers className="w-3 h-3" /> Montável
                        </span>
                      )}
                    </td>
                    <td className="p-4"><span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{p.category}</span></td>
                    <td className="p-4 font-semibold text-slate-800">R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      {p.stock === null || p.stock === undefined ? (
                        <span className="text-xs text-slate-400">∞</span>
                      ) : p.stock === 0 ? (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Esgotado</span>
                      ) : p.stock <= 5 ? (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{p.stock} un.</span>
                      ) : (
                        <span className="text-xs font-medium text-slate-600">{p.stock} un.</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleActive(p.id, p.active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${p.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors inline-flex rounded-lg hover:bg-blue-50" title="Editar"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p.id, p.name)} className="p-2 text-slate-400 hover:text-red-600 transition-colors inline-flex rounded-lg hover:bg-red-50" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====== MODAL WIZARD ====== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header with step progress */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingProduct ? (isFood ? 'Editar Item' : 'Editar Produto') : (isFood ? 'Novo Item' : 'Novo Produto')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              {/* Step indicators */}
              <div className="flex items-center gap-2">
                {adminStepLabels.map((label, i) => (
                  <button key={i} type="button" onClick={() => setModalStep(i)}
                    className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-lg transition-colors ${
                      i === modalStep ? '' : 'opacity-60 hover:opacity-80'
                    }`}>
                    <div className={`w-full h-1 rounded-full transition-colors ${
                      i < modalStep ? 'bg-emerald-400' : i === modalStep ? 'bg-primary' : 'bg-slate-200'
                    }`} />
                    <span className={`text-[11px] font-medium ${
                      i === modalStep ? 'text-primary' : 'text-slate-400'
                    }`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable step content — noValidate prevents browser validation from interfering with wizard steps */}
            <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* ====== STEP 0: Informações ====== */}
                {modalStep === 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        {isFood ? 'Nome do Item *' : 'Nome do Produto *'}
                      </label>
                      <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={isFood ? 'Ex: Macarronada Completa' : 'Ex: Batom Matte Hudamoji'}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isFood ? 'Preço base *' : 'Preço *'}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                          <input type="text" required value={form.priceDisplay} onChange={handlePriceChange}
                            placeholder="0,00" inputMode="numeric"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition" />
                        </div>
                        {isFood && form.optionGroups.length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">Preço base sem os extras</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoria *</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white transition">
                          {categorySuggestions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={3} placeholder={isFood ? 'Ex: Macarronada artesanal feita na hora' : 'Descreva o produto...'}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition" />
                    </div>
                  </>
                )}

                {/* ====== STEP 1: Montagem (food only) ====== */}
                {isFood && modalStep === 1 && (
                  <OptionGroupsEditor
                    groups={form.optionGroups}
                    onChange={(groups) => setForm(f => ({ ...f, optionGroups: groups }))}
                  />
                )}

                {/* ====== STEP 2 (or 1 for non-food): Mídia & Config ====== */}
                {modalStep === adminTotalSteps - 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Imagens</label>
                      <div className="flex gap-2 mb-3">
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition disabled:opacity-50">
                          {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Upload className="w-4 h-4" /> Subir do PC/Celular</>}
                        </button>
                        <button type="button" onClick={addUrlManual}
                          className="px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                      {form.imageUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {form.imageUrls.map((url, i) => (
                            <div key={i} className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition cursor-pointer ${form.image_url === url ? 'border-primary shadow-md' : 'border-transparent hover:border-slate-300'}`}
                              onClick={() => setMainImage(i)}>
                              <img loading="lazy" src={url} alt="" className="w-full h-full object-cover" />
                              {form.image_url === url && (
                                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] text-center py-0.5 font-semibold">PRINCIPAL</div>
                              )}
                              <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-2">Clique para definir como principal.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estoque</label>
                      <input type="number" min="0" value={form.stockDisplay}
                        onChange={e => setForm(f => ({ ...f, stockDisplay: e.target.value }))}
                        placeholder="Deixe vazio para ilimitado"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition" />
                      <p className="text-xs text-slate-400 mt-1">Vazio = sem controle. Zero = esgotado.</p>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-5 after:shadow-sm" />
                      </label>
                      <span className="text-sm text-slate-600">{form.active ? 'Ativo (visível na loja)' : 'Inativo (oculto)'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer with navigation */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3 shrink-0">
                {modalStep > 0 ? (
                  <button type="button" onClick={() => setModalStep(s => s - 1)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                    Cancelar
                  </button>
                )}
                {modalStep < adminTotalSteps - 1 ? (
                  <button type="button" onClick={() => setModalStep(s => s + 1)}
                    className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-md shadow-pink-200 flex items-center justify-center gap-1">
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={saving}
                    className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-md shadow-pink-200 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : (isFood ? 'Salvar Item' : 'Salvar Produto')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
