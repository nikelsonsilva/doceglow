'use client';


import Link from 'next/link';
import Image from 'next/image';

import { Store, Zap, ShoppingBag, Palette, ArrowRight, Sparkles, Shield, Smartphone, ChevronRight } from 'lucide-react';

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ========== NAV ========== */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Store className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-bold text-[22px] text-white tracking-tight">Doce Glow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] font-medium text-white/90 hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Login
            </Link>
            <Link href="/cadastro" className="text-[14px] font-semibold text-[#0B2A8A] bg-white px-5 py-2.5 rounded-full hover:bg-white/90 transition">
              Criar loja grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B2A8A 0%, #0D47C0 40%, #1565D8 70%, #0B2A8A 100%)' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[640px] items-center">
            
            {/* Left Content */}
            <div className="pt-32 pb-16 lg:pt-0 lg:pb-0 max-w-[520px]">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 px-4 py-1.5 rounded-full text-[13px] font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Plataforma 100% gratuita para começar
              </span>
              <h1 className="text-white text-[40px] md:text-[54px] leading-[1.06] font-bold mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                Crie sua loja online em 2 minutos
              </h1>
              <p className="text-white/65 text-[17px] leading-relaxed mb-9 max-w-[440px]">
                Catálogo de produtos, checkout via WhatsApp e painel de gestão. Tudo pronto para você vender mais.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link href="/cadastro" className="inline-flex items-center gap-2.5 bg-white text-[#0B2A8A] px-8 py-4 rounded-full text-[15px] font-bold hover:shadow-2xl hover:shadow-white/15 hover:scale-[1.02] transition">
                  Criar Minha Loja
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
                <Link href="/doceglow" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-[15px] font-medium transition-colors group">
                  Ver exemplo
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <p className="text-white/40 text-[13px]">
                Sem cartão de crédito · Cancele quando quiser
              </p>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:flex items-end justify-center relative h-full">
              {/* Model image */}
              <div className="relative z-10 h-full flex items-end">
                <Image
                  src="/images/hero-model.png"
                  alt="Empreendedora usando Doce Glow"
                  width={520}
                  height={640}
                  className="object-cover object-top h-[600px] w-auto"
                  style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
                  priority
                />
              </div>

              {/* Phone mockup - floating */}
              <div className="absolute right-0 top-[12%] z-20 w-[240px]">
                {/* Success card */}
                <div className="bg-white rounded-2xl shadow-2xl p-4 mb-4">
                  <p className="text-[13px] font-bold text-slate-800 mb-1">Faça como a Ana</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">+26% no faturamento nos primeiros 5 meses com a Doce Glow</p>
                </div>
                {/* Phone in glass card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-[24px] p-3 shadow-2xl">
                  <Image
                    src="/images/phone-mockup.png"
                    alt="Vitrine mobile"
                    width={220}
                    height={400}
                    className="w-full rounded-[16px]"
                    priority
                  />
                </div>
                {/* WhatsApp badge */}
                <div className="absolute -bottom-2 -right-2 w-11 h-11 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg ring-4 ring-[#0B2A8A]">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 48C480 42.7 600 45.3 720 50.7C840 56 960 64 1080 64C1200 64 1320 56 1380 52L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-[#0B2A8A] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-5">
              <Sparkles className="w-4 h-4" />
              Por que a Doce Glow?
            </span>
            <h2 className="text-[32px] md:text-[40px] font-bold text-slate-900 leading-tight mb-4">
              Tudo que você precisa para{' '}
              <span className="text-[#0B2A8A]">vender mais</span>
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Catálogo profissional, checkout via WhatsApp e painel de gestão completo. Pronto em 2 minutos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Pronto em 2 minutos',
                desc: 'Cadastre, escolha o nome da loja e comece a adicionar produtos. Sem complicação.',
                color: '#F59E0B',
                bg: 'bg-amber-50',
              },
              {
                icon: ShoppingBag,
                title: 'Checkout via WhatsApp',
                desc: 'Seus clientes compram e mandam o pedido direto no seu WhatsApp. Simples e direto.',
                color: '#10B981',
                bg: 'bg-emerald-50',
              },
              {
                icon: Palette,
                title: 'Personalização total',
                desc: 'Cores, logo e categorias. Sua loja com a cara do seu negócio.',
                color: '#8B5CF6',
                bg: 'bg-violet-50',
              },
            ].map((feat, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <h3 className="text-[18px] font-bold text-slate-800 mb-2.5">{feat.title}</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 text-center">
          <h2 className="text-[28px] md:text-[36px] font-bold text-slate-800 mb-3">Para todo tipo de negócio</h2>
          <p className="text-slate-500 text-[15px] mb-12">Venda cosméticos, roupas, comida, artesanato e muito mais.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['💄 Cosméticos', '👗 Roupas', '🍰 Comida', '💎 Acessórios', '🧴 Perfumaria', '🎨 Artesanato', '📱 Eletrônicos', '🏠 Casa & Decoração'].map((cat, i) => (
              <span key={i} className="bg-white border border-slate-200 px-6 py-3 rounded-full text-[14px] font-medium text-slate-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRUST ========== */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {[
              { icon: Shield, value: 'Seguro', desc: 'Dados protegidos e HTTPS' },
              { icon: Smartphone, value: 'Mobile First', desc: 'Funciona perfeito no celular' },
              { icon: Zap, value: 'Rápido', desc: 'Carregamento instantâneo' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-[#0B2A8A]" />
                </div>
                <p className="text-[20px] font-bold text-slate-800 mb-1">{item.value}</p>
                <p className="text-[14px] text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B2A8A 0%, #1565D8 100%)' }}>
        <div className="max-w-[800px] mx-auto px-6 py-20 md:py-24 text-center relative z-10">
          <h2 className="text-white text-[32px] md:text-[44px] font-bold leading-tight mb-5">
            Pronto para vender mais?
          </h2>
          <p className="text-white/70 text-[17px] mb-10 max-w-lg mx-auto">
            Crie sua loja agora. É grátis, rápido e sem compromisso.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-2.5 bg-white text-[#0B2A8A] px-9 py-4 rounded-full text-[16px] font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition">
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-[#060F2A] text-slate-400 py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-[16px]">Doce Glow</span>
          </div>
          <p className="text-[13px]">© {new Date().getFullYear()} Doce Glow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
