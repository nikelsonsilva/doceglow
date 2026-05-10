'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, Zap, Palette, ShoppingBag, ArrowRight, Sparkles, Shield, Smartphone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-slate-800">Doce Glow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors px-4 py-2">
              Entrar
            </Link>
            <Link href="/cadastro" className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-md shadow-pink-200">
              Criar Loja Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Plataforma 100% gratuita para começar
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
            Crie sua loja online em{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              2 minutos
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mt-6 max-w-xl mx-auto">
            Catálogo de produtos, checkout via WhatsApp e painel de gestão. 
            Tudo pronto para você vender mais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/cadastro" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg hover:shadow-pink-200 transition-all">
              Criar Minha Loja
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/doceglow" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium px-6 py-4 transition-colors">
              Ver exemplo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Pronto em 2 minutos',
              desc: 'Cadastre, escolha o nome da loja e comece a adicionar produtos. Sem complicação.',
              gradient: 'from-amber-400 to-orange-500',
            },
            {
              icon: ShoppingBag,
              title: 'Checkout via WhatsApp',
              desc: 'Seus clientes compram e mandam o pedido direto no seu WhatsApp. Simples e direto.',
              gradient: 'from-emerald-400 to-teal-500',
            },
            {
              icon: Palette,
              title: 'Personalização total',
              desc: 'Cores, logo e categorias. Sua loja com a cara do seu negócio.',
              gradient: 'from-violet-400 to-purple-500',
            },
          ].map((feat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-4`}>
                <feat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Para todo tipo de negócio</h2>
          <p className="text-slate-500 mb-10">Venda cosméticos, roupas, comida, artesanato e muito mais.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['💄 Cosméticos', '👗 Roupas', '🍰 Comida', '💎 Acessórios', '🧴 Perfumaria', '🎨 Artesanato', '📱 Eletrônicos', '🏠 Casa & Decoração'].map((cat, i) => (
              <span key={i} className="bg-white border border-slate-200 px-5 py-2.5 rounded-full text-sm font-medium text-slate-600 shadow-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Shield, value: 'Seguro', desc: 'Dados protegidos e HTTPS' },
            { icon: Smartphone, value: 'Mobile First', desc: 'Funciona perfeito no celular' },
            { icon: Zap, value: 'Rápido', desc: 'Carregamento instantâneo' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <item.icon className="w-8 h-8 text-primary mb-3" />
              <p className="text-lg font-bold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para vender mais?</h2>
          <p className="text-lg opacity-90 mb-8">Crie sua loja agora. É grátis, rápido e sem compromisso.</p>
          <Link href="/cadastro" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-xl transition-all">
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Store className="w-3 h-3 text-white" />
            </div>
            <span className="font-serif font-bold text-white">Doce Glow</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Doce Glow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
