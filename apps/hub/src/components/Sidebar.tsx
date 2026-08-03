'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  Settings,
  ShieldAlert,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAlerts, useHealth } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/tables', label: 'Tables', icon: LayoutGrid },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/alerts', label: 'Guard Alerts', icon: ShieldAlert },
  { href: '/conversations', label: 'Conversations', icon: MessageCircle },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

function ServiceStatusDots() {
  const { data: health } = useHealth();
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
      <span className="text-xs text-muted-foreground">Services</span>
      <div className="flex items-center gap-2">
        {(['pos', 'guard', 'chat'] as const).map((service) => {
          const status = health?.find((h) => h.service === service);
          const ok = status?.ok;
          return (
            <span
              key={service}
              title={`${service.toUpperCase()} — ${status ? (ok ? `online (${status.latencyMs}ms)` : 'unreachable') : 'checking…'}`}
              className={cn(
                'h-2 w-2 rounded-full',
                status === undefined && 'bg-zinc-600',
                status !== undefined && (ok ? 'bg-emerald-400' : 'bg-rose-500'),
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: openAlerts } = useAlerts('open', 15000);
  const openCount = openAlerts?.length ?? 0;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xl font-black text-primary-foreground">
          H
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Host.ia Hub</p>
          <p className="text-xs text-muted-foreground">Bar control center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const showBadge = item.href === '/alerts' && openCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <Badge className="border-rose-500/40 bg-rose-500/15 text-rose-400">{openCount}</Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 px-3 pb-4">
        <ServiceStatusDots />
        <p className="px-2 text-[10px] text-muted-foreground/60">Host.ia OS · Open-source hospitality</p>
      </div>
    </div>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card/50 backdrop-blur lg:block">
        <NavContent />
      </aside>

      {/* Mobile / tablet drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 border-r bg-card shadow-xl animate-slide-up">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
