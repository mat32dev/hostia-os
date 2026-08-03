'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { Bell, LogOut, Menu, RefreshCw } from 'lucide-react';
import { useAlerts } from '@/lib/api';
import { getSessionUser, logout } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Overview', subtitle: 'Everything happening in your bar, right now' },
  '/orders': { title: 'Orders', subtitle: 'Create, track and close orders' },
  '/tables': { title: 'Tables', subtitle: 'Live floor map and table status' },
  '/menu': { title: 'Menu', subtitle: 'Dishes, prices and availability' },
  '/alerts': { title: 'Guard Alerts', subtitle: 'AI security events from your cameras' },
  '/conversations': { title: 'Conversations', subtitle: 'WhatsApp messages handled by your AI waiter' },
  '/reports': { title: 'Reports', subtitle: 'Revenue, top sellers and peak hours' },
  '/settings': { title: 'Settings', subtitle: 'Business, staff and integrations' },
};

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data: openAlerts } = useAlerts('open', 15000);
  const [refreshing, setRefreshing] = useState(false);
  const user = getSessionUser();

  const meta = PAGE_META[pathname] ?? { title: 'Host.ia Hub', subtitle: '' };
  const openCount = openAlerts?.length ?? 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate(() => true, undefined, { revalidate: true });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/settings?tab=account');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{meta.title}</h1>
          {meta.subtitle && (
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          aria-label="Refresh data"
          title="Refresh all data"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
        </Button>

        <Link
          href="/alerts"
          aria-label="Guard alerts"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {openCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {openCount > 99 ? '99+' : openCount}
            </span>
          )}
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 md:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {user.email.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[160px] truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings?tab=account">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
