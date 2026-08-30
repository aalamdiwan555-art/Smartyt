'use client';

import type React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/landing' || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/onboarding');

  if (isPublic) {
    return <><div>{children}</div><Toaster position="top-right" /></>;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <Sidebar />
      <div className="app-content transition-all duration-300 md:ml-64">
        <Header />
        <main className="pt-16 p-4 md:p-6 max-w-[1440px] mx-auto">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}