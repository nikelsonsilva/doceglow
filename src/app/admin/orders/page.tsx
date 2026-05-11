'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminOrdersRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/doceglow/admin/orders'); }, [router]);
  return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Redirecionando...</p></div>;
}
