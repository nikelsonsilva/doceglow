'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy admin redirect → nova rota multitenant
export default function LegacyAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a primeira loja (legado)
    router.replace('/doceglow/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Redirecionando...</p>
    </div>
  );
}
