'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          switch (data.user.role) {
            case 'admin':
              router.push('/admin');
              break;
            case 'customer':
              router.push('/customer');
              break;
            case 'rdc_staff':
              router.push('/rdc');
              break;
            case 'logistics':
              router.push('/logistics');
              break;
            case 'ho_manager':
              router.push('/ho-manager');
              break;
            default:
              router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}