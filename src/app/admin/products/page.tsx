'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminProductsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/doceglow/admin/products'); }, [router]);
  return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Redirecionando...</p></div>;
}
