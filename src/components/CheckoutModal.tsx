'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Check, Copy, ArrowRight, Loader2, X, MapPin, Wallet, MessageCircle, User, RotateCcw, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveSession, getSessionPhone } from '@/lib/session';

type Step = 'phone' | 'otp' | 'name' | 'address' | 'confirm-address' | 'review' | 'payment';

interface CustomerData {
  id?: string; phone: string; name?: string;
  cep?: string; street?: string; number?: string;
  neighborhood?: string; city?: string; state?: string; complement?: string;
}

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
function stripPhone(v: string): string { return v.replace(/\D/g, ''); }
function formatCep(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0,5)}-${d.slice(5)}` : d;
}

interface Props { 
  isOpen: boolean; 
  onClose: () => void;
  storeSlug?: string;
  storeName?: string;
  storeSettings?: { whatsapp_number: string; pix_key: string };
}

export default function CheckoutModal({ isOpen, onClose, storeSlug, storeName, storeSettings: extSettings }: Props) {
  const [step, setStep] = useState<Step>('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({ whatsapp_number: '', pix_key: '' });
  const [address, setAddress] = useState({ cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '' });
  const { items, total, clearCart, updateQuantity } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      // Use external settings if provided (multitenant), else fetch from old endpoint
      if (extSettings) {
        setSettings(extSettings);
      } else {
        fetch('/api/admin/settings').then(r => r.json()).then(d => {
          if (d && !d.error) setSettings({ whatsapp_number: d.whatsapp_number || '', pix_key: d.pix_key || '' });
        }).catch(() => {});
      }

      // Auto-login: if session is valid, skip phone/OTP
      const savedPhone = getSessionPhone();
      if (savedPhone && step === 'phone') {
        setPhone(formatPhone(savedPhone));
        autoLoginCustomer(savedPhone);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const rawPhone = stripPhone(phone);

  // Auto-login for returning customers with valid session
  const autoLoginCustomer = async (phoneNum: string) => {
    setLoading(true);
    try {
      const apiBase = storeSlug ? `/api/stores/${storeSlug}` : '/api';
      const custRes = await fetch(`${apiBase}/customers?phone=${phoneNum}`);
      const custData = await custRes.json();

      if (custData && custData.id) {
        setCustomer(custData);
        setFullName(custData.name || '');
        if (custData.cep) {
          setAddress({ cep: custData.cep, street: custData.street || '', number: custData.number || '', neighborhood: custData.neighborhood || '', city: custData.city || '', state: custData.state || '', complement: custData.complement || '' });
          setStep('confirm-address');
        } else {
          setStep('address');
        }
      } else {
        // Session exists but no customer in DB — reset to phone step
        setStep('phone');
      }
    } catch {
      setStep('phone');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (rawPhone.length < 10) { toast.error('Digite um WhatsApp válido com DDD'); return; }
    setLoading(true);
    try {
      const fullPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
      const res = await fetch('https://n8ntech.linkarbox.app/webhook/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      if (!res.ok) throw new Error('Falha ao enviar código');
      toast.success('Código enviado para seu WhatsApp!');
      setStep('otp');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Digite o código de 6 dígitos'); return; }
    setLoading(true);
    try {
      const fullPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
      const res = await fetch('https://n8ntech.linkarbox.app/webhook/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: otp }),
      });
      if (!res.ok) { toast.error('Código inválido. Tente novamente.'); setLoading(false); return; }

      // Save verified phone with 7-day session
      saveSession(rawPhone);
      window.dispatchEvent(new Event('vitrinia:phone-verified'));

      const apiBase = storeSlug ? `/api/stores/${storeSlug}` : '/api';
      const custRes = await fetch(`${apiBase}/customers?phone=${rawPhone}`);
      const custData = await custRes.json();

      if (custData && custData.id) {
        // Returning customer
        setCustomer(custData);
        setFullName(custData.name || '');
        if (custData.cep) {
          // Has address → confirm or change
          setAddress({ cep: custData.cep, street: custData.street || '', number: custData.number || '', neighborhood: custData.neighborhood || '', city: custData.city || '', state: custData.state || '', complement: custData.complement || '' });
          setStep('confirm-address');
        } else {
          setStep('address');
        }
      } else {
        // New customer → ask for name
        setCustomer({ phone: rawPhone });
        setStep('name');
      }
    } catch (e: any) {
      toast.error('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save name (new customer)
  const handleSaveName = () => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) { toast.error('Digite seu nome completo (nome e sobrenome)'); return; }
    setCustomer(c => c ? { ...c, name: fullName.trim() } : { phone: rawPhone, name: fullName.trim() });
    setStep('address');
  };

  // Fetch address from CEP
  const fetchCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${clean}`);
      const data = await res.json();
      if (!data.errors) {
        setAddress(a => ({ ...a, street: data.street || '', neighborhood: data.neighborhood || '', city: data.city || '', state: data.state || '' }));
      }
    } catch {}
  };

  // Step 4: Save address
  const handleSaveAddress = async () => {
    if (!address.cep || !address.street || !address.number) { toast.error('Preencha CEP, rua e número'); return; }
    setLoading(true);
    try {
      const payload = { phone: rawPhone, name: customer?.name || fullName, ...address };
      const apiBase = storeSlug ? `/api/stores/${storeSlug}` : '/api';
      const res = await fetch(`${apiBase}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setCustomer(saved);
      setStep('review');
    } catch { toast.error('Erro ao salvar endereço'); }
    finally { setLoading(false); }
  };

  // Confirm existing address
  const handleConfirmAddress = () => setStep('review');

  // Copy PIX
  const copyPix = () => {
    navigator.clipboard.writeText(settings.pix_key || '');
    setCopied(true);
    toast.success('Chave PIX copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Final: send to WhatsApp
  const handleFinish = async () => {
    const rawStorePhone = (settings.whatsapp_number || '85997505422').replace(/\D/g, '');
    const storePhone = rawStorePhone.startsWith('55') ? rawStorePhone : `55${rawStorePhone}`;
    const itemsText = items.map(i => {
      let line = `📦 ${i.quantity}x ${i.name} - R$ ${i.unitPrice.toFixed(2).replace('.',',')}`;
      if (i.selectedOptions?.length) {
        const optDetails = i.selectedOptions.map(s => `  ↳ ${s.groupName}: ${s.options.join(', ')}`).join('\n');
        line += '\n' + optDetails;
      }
      return line;
    }).join('\n');
    const addr = customer?.street ? `${customer.street}, ${customer.number} - ${customer.neighborhood}, ${customer.city}/${customer.state} (CEP: ${customer.cep})` : 'Não informado';

    // Save order via API
    try {
      const apiBase = storeSlug ? `/api/stores/${storeSlug}` : '/api';
      await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer?.id, items, total_amount: total }),
      }).catch(() => {});
    } catch {}

    const msg = [
      `*NOVO PEDIDO - ${(storeName || 'LOJA').toUpperCase()}!* 🛍️`,
      ``,
      `*Cliente:* ${customer?.name}`,
      `*Telefone:* ${formatPhone(rawPhone)}`,
      `*Endereço:* ${addr}`,
      ``,
      `*ITENS:*`,
      itemsText,
      ``,
      `*TOTAL:* R$ ${total.toFixed(2).replace('.',',')}`,
      ``,
      `✅ *O cliente informou que já realizou o PIX.*`,
    ].join('\n');

    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`, '_blank');
    clearCart();
    onClose();
  };

  const inputCls = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
  const btnCls = "w-full bg-primary text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover disabled:opacity-60 transition shadow-md shadow-pink-200";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-[61] flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="font-serif text-xl font-bold text-slate-800">
            {step === 'phone' || step === 'otp' ? 'Identificação' :
             step === 'name' ? 'Seus Dados' :
             step === 'address' ? 'Endereço de Entrega' :
             step === 'review' ? 'Revise seu Pedido' :
             step === 'confirm-address' ? 'Confirme a Entrega' : 'Pagamento'}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* ===== PHONE ===== */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-8 h-8 text-primary" /></div>
                <h3 className="text-lg font-semibold text-slate-800">Qual o seu WhatsApp?</h3>
                <p className="text-sm text-slate-500">Vamos enviar um código para validar.</p>
              </div>
              <input value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="DDD + seu número" inputMode="numeric"
                className={`${inputCls} text-center text-xl tracking-wide placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal`} />
              <button onClick={handleSendOtp} disabled={loading || rawPhone.length < 10} className={btnCls}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enviar Código <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {/* ===== OTP ===== */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Digite o código</h3>
                <p className="text-sm text-slate-500">Enviamos para o WhatsApp {phone}</p>
              </div>
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" maxLength={6} inputMode="numeric"
                className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`} />
              <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className={btnCls}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar'}
              </button>
              <button onClick={() => { setOtp(''); handleSendOtp(); }} className="w-full text-sm text-slate-500 flex items-center justify-center gap-1 hover:text-primary transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Reenviar código
              </button>
            </div>
          )}

          {/* ===== NAME (new customer) ===== */}
          {step === 'name' && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><User className="w-8 h-8 text-primary" /></div>
                <h3 className="text-lg font-semibold text-slate-800">Como você se chama?</h3>
                <p className="text-sm text-slate-500">Precisamos do seu nome completo para a entrega.</p>
              </div>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Maria da Silva" /* autoFocus removed for accessibility */
                className={`${inputCls} text-center text-lg`} />
              <p className="text-xs text-slate-400 text-center">Obrigatório: nome e sobrenome</p>
              <button onClick={handleSaveName} disabled={fullName.trim().split(/\s+/).length < 2} className={btnCls}>
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ===== ADDRESS ===== */}
          {step === 'address' && (
            <div className="space-y-4">
              {/* Link back to saved address */}
              {customer?.cep && useNewAddress && (
                <button onClick={() => {
                  setAddress({ cep: customer.cep!, street: customer.street || '', number: customer.number || '', neighborhood: customer.neighborhood || '', city: customer.city || '', state: customer.state || '', complement: customer.complement || '' });
                  setUseNewAddress(false);
                  setStep('confirm-address');
                }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-primary font-medium bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4" /> Usar endereço cadastrado
                </button>
              )}
              <div className="flex items-center gap-3 mb-2 bg-primary/5 p-3 rounded-2xl">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-slate-600">Preencha seu CEP e completamos o restante.</p>
              </div>
              <input value={address.cep} onChange={e => { const v = formatCep(e.target.value); setAddress(a => ({ ...a, cep: v })); if (stripPhone(v).length === 8) fetchCep(v); }}
                placeholder="60000-000" inputMode="numeric" className={inputCls} />
              <div className="grid grid-cols-3 gap-3">
                <input value={address.street} readOnly placeholder="Rua" className={`col-span-2 ${inputCls} bg-slate-100 text-slate-500`} />
                <input value={address.number} onChange={e => setAddress(a => ({ ...a, number: e.target.value }))} placeholder="Nº" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={address.neighborhood} readOnly placeholder="Bairro" className={`${inputCls} bg-slate-100 text-slate-500`} />
                <input value={address.city} readOnly placeholder="Cidade" className={`${inputCls} bg-slate-100 text-slate-500`} />
              </div>
              <input value={address.complement} onChange={e => setAddress(a => ({ ...a, complement: e.target.value }))} placeholder="Complemento (opcional)" className={inputCls} />
              <button onClick={handleSaveAddress} disabled={loading || !address.cep || !address.number} className={`${btnCls} mt-2`}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ir para Pagamento'}
              </button>
            </div>
          )}

          {/* ===== CONFIRM ADDRESS (returning customer) ===== */}
          {step === 'confirm-address' && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-slate-800">Olá, {customer?.name?.split(' ')[0]}! 👋</h3>
                <p className="text-sm text-slate-500 mt-1">Confirme o endereço de entrega:</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-medium text-slate-800">{customer?.street}, {customer?.number}</p>
                <p className="text-sm text-slate-500">{customer?.neighborhood} - {customer?.city}/{customer?.state}</p>
                <p className="text-sm text-slate-500">CEP: {customer?.cep}</p>
                {customer?.complement && <p className="text-sm text-slate-400">{customer.complement}</p>}
              </div>
              <button onClick={handleConfirmAddress} className={btnCls}>
                Usar este endereço <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => { setUseNewAddress(true); setAddress({ cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '' }); setStep('address'); }}
                className="w-full py-3 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm">
                Entregar em outro endereço
              </button>
            </div>
          )}

          {/* ===== REVIEW ORDER ===== */}
          {step === 'review' && (
            <div className="space-y-4">
              {/* Delivery info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-slate-700">{customer?.name}</p>
                  <p className="text-slate-500">{customer?.street}, {customer?.number} - {customer?.neighborhood}</p>
                  <p className="text-slate-500">{customer?.city}/{customer?.state}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Seu carrinho está vazio</p>
                  </div>
                ) : items.map(item => (
                  <div key={item.cartItemId} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-100">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img loading="lazy" src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-700 truncate">{item.name}</h4>
                      {item.selectedOptions?.length ? (
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                          {item.selectedOptions.map(s => s.options.join(', ')).join(' · ')}
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-400 mt-0.5">R$ {item.unitPrice.toFixed(2).replace('.',',')} cada</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                            {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-slate-800">R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.',',')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              {items.length > 0 && (
                <>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="font-medium text-slate-600">Total ({items.reduce((s,i) => s+i.quantity, 0)} itens)</span>
                    <span className="text-xl font-bold text-primary font-serif">R$ {total.toFixed(2).replace('.',',')}</span>
                  </div>
                  <button onClick={() => setStep('payment')} className={btnCls}>
                    Ir para Pagamento <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <button onClick={onClose} className="w-full py-2.5 text-sm text-slate-500 hover:text-primary transition-colors">
                Continuar comprando
              </button>
            </div>
          )}

          {/* ===== PAYMENT ===== */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total a pagar</p>
                  <p className="text-2xl font-bold text-slate-800 font-serif">R$ {total.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Wallet className="w-6 h-6" /></div>
              </div>
              <div className="p-5 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 text-center space-y-4">
                <p className="text-sm text-slate-600 font-medium">Copie a chave PIX abaixo:</p>
                <div className="bg-white p-3 rounded-xl border border-primary/20 flex items-center justify-between gap-3">
                  <span className="text-sm font-mono text-slate-500 truncate select-all">{settings.pix_key || 'Chave não configurada'}</span>
                  <button onClick={copyPix} className="p-2 shrink-0 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-center text-sm font-medium text-slate-800 mb-4">Você já realizou o pagamento?</p>
                <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Ainda não</button>
                  <button onClick={handleFinish} className="flex-1 py-3 rounded-full bg-[#25D366] text-white font-medium hover:bg-[#20bd5a] transition-colors shadow-md shadow-green-200 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Sim, já paguei
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
