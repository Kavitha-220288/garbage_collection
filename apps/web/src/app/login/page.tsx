'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-emerald-900">Redirecting to Opening Portal Gateway...</p>
      </div>
    </div>
  );
}
