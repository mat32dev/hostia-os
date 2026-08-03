'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

/**
 * Client-side application shell: fixed sidebar (desktop), slide-in drawer
 * (mobile/tablet) and the top header. Owns the mobile navigation state.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
