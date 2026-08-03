'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSWRConfig } from 'swr';
import {
  Camera,
  CheckCircle2,
  Cpu,
  KeyRound,
  Loader2,
  MessageCircle,
  RefreshCw,
  Server,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { posApi, useHealth, useTenant, useUsers } from '@/lib/api';
import { getSessionUser, login, logout } from '@/lib/auth';
import type { ServiceHealth, TenantUpdate, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/ui/state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Shared feedback banner ──────────────────────────────────────────────────
function Feedback({ feedback }: { feedback: { type: 'success' | 'error'; message: string } | null }) {
  if (!feedback) return null;
  return (
    <p
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        feedback.type === 'success'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-300',
      )}
    >
      {feedback.message}
    </p>
  );
}

// ─── Business tab ────────────────────────────────────────────────────────────
function BusinessTab() {
  const tenantSwr = useTenant();
  const [form, setForm] = useState<TenantUpdate>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (tenantSwr.data) {
      const t = tenantSwr.data;
      setForm({
        name: t.name,
        phone: t.phone,
        email: t.email,
        address: t.address ?? '',
        timezone: t.timezone,
        currency: t.currency,
        language: t.language,
      });
    }
  }, [tenantSwr.data]);

  const handleSave = async () => {
    if (!tenantSwr.data || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      await posApi.updateTenant(tenantSwr.data.id, form);
      await tenantSwr.mutate();
      setFeedback({ type: 'success', message: 'Business information saved.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? `${err.message} — if the POS returns 404/405, tenant updates are not supported by this backend version yet.`
            : 'Failed to save',
      });
    } finally {
      setSaving(false);
    }
  };

  if (tenantSwr.isLoading) return <LoadingState label="Loading business info…" />;
  if (tenantSwr.error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Could not load business information: {tenantSwr.error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business information</CardTitle>
        <CardDescription>
          Used on receipts, WhatsApp replies and reports. Tenant #{tenantSwr.data?.id} · slug{' '}
          <code className="text-primary">{tenantSwr.data?.slug}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="biz-name">Business name</Label>
            <Input id="biz-name" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="biz-phone">Phone (WhatsApp)</Label>
            <Input id="biz-phone" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+34 600 000 000" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="biz-email">Email</Label>
            <Input id="biz-email" type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="biz-address">Address</Label>
            <Input id="biz-address" value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Timezone</Label>
            <Select value={form.timezone ?? 'Europe/Madrid'} onValueChange={(v) => setForm((f) => ({ ...f, timezone: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="America/Mexico_City">America/Mexico_City</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={form.currency ?? 'EUR'} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="MXN">MXN ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Feedback feedback={feedback} />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Staff tab ───────────────────────────────────────────────────────────────
function StaffTab() {
  const tenantSwr = useTenant();
  const usersSwr = useUsers();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'staff' as UserRole });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleInvite = async () => {
    if (saving || !tenantSwr.data) return;
    setSaving(true);
    setFeedback(null);
    try {
      await posApi.registerStaff(tenantSwr.data.slug, form);
      setForm({ full_name: '', email: '', password: '', role: 'staff' });
      await usersSwr.mutate().catch(() => undefined);
      setFeedback({ type: 'success', message: `${form.full_name} can now sign in with ${form.email}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create the account' });
    } finally {
      setSaving(false);
    }
  };

  const valid = form.full_name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.password.length >= 6;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>People with access to the POS and this dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {usersSwr.isLoading ? (
            <LoadingState label="Loading team…" />
          ) : usersSwr.error ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The POS API does not expose a user-listing endpoint yet ({usersSwr.error.message}).
                New members are created with the form on the right.
              </p>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{getSessionUser()?.email ?? '—'}</span>
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {(usersSwr.data ?? []).map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    <Badge variant="outline" className={u.is_active ? 'text-emerald-400' : 'text-zinc-500'}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Add team member
          </CardTitle>
          <CardDescription>Create a POS account. They can change their password later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="staff-name">Full name</Label>
            <Input id="staff-name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="María García" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="staff-email">Email</Label>
            <Input id="staff-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="maria@yourbar.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="staff-password">Temporary password</Label>
            <Input id="staff-password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff — take orders</SelectItem>
                <SelectItem value="manager">Manager — reports & menu</SelectItem>
                <SelectItem value="admin">Admin — full access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Feedback feedback={feedback} />
          <div className="flex justify-end">
            <Button onClick={handleInvite} disabled={!valid || saving || !tenantSwr.data}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Integrations tab ────────────────────────────────────────────────────────
const SERVICE_META: Record<ServiceHealth['service'], { name: string; description: string; icon: typeof Server; href: string }> = {
  pos: { name: 'POS API', description: 'Orders, tables, menu, staff', icon: Server, href: '/api/pos/health' },
  guard: { name: 'Guard API', description: 'Camera analysis & cash matching', icon: Camera, href: '/api/guard/health' },
  chat: { name: 'Chat API', description: 'WhatsApp AI waiter', icon: MessageCircle, href: '/api/chat/health' },
};

function IntegrationsTab() {
  const healthSwr = useHealth();
  const [checking, setChecking] = useState(false);

  const recheck = async () => {
    setChecking(true);
    try {
      await healthSwr.mutate();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {(['pos', 'guard', 'chat'] as const).map((name) => {
          const meta = SERVICE_META[name];
          const status = healthSwr.data?.find((h) => h.service === name);
          const Icon = meta.icon;
          return (
            <Card key={name}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{meta.name}</CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                  </div>
                </div>
                {status === undefined ? (
                  <Badge variant="outline" className="text-muted-foreground">Checking…</Badge>
                ) : status.ok ? (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Online · {status.latencyMs}ms
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-400">
                    <XCircle className="mr-1 h-3 w-3" /> Offline
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Hub proxy: <code className="text-foreground">{meta.href}</code>
                </p>
                {status?.detail && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(status.detail)
                      .filter(([key]) => key !== 'status' && key !== 'service')
                      .map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-[10px] text-muted-foreground">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> WhatsApp Business API
          </CardTitle>
          <CardDescription>
            Credentials live on the chat service (<code>WA_PHONE_ID</code>, <code>WA_ACCESS_TOKEN</code> env
            vars) for security — they are never exposed to the browser. When the Chat API is online, your
            AI waiter is answering customers.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={recheck} disabled={checking}>
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Re-check connections
        </Button>
      </div>
    </div>
  );
}

// ─── Account tab ─────────────────────────────────────────────────────────────
function AccountTab() {
  const { mutate } = useSWRConfig();
  const [, forceRender] = useState(0);
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEV_EMAIL ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = getSessionUser();

  const handleLogin = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await login(email.trim(), password);
      await mutate(() => true, undefined, { revalidate: true });
      forceRender((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    logout();
    await mutate(() => true, undefined, { revalidate: true });
    forceRender((n) => n + 1);
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" /> Account
        </CardTitle>
        <CardDescription>
          Authentication is handled by the POS service. The token is stored locally in this browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                {user.email.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Session valid{user.exp ? ` until ${new Date(user.exp * 1000).toLocaleString()}` : ''}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbar.com"
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleLogin} disabled={!email.trim() || !password || saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
const SETTINGS_TABS = ['business', 'staff', 'integrations', 'account'] as const;
type SettingsTab = (typeof SETTINGS_TABS)[number];

function SettingsPageInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [tab, setTab] = useState<SettingsTab>(
    tabParam && SETTINGS_TABS.includes(tabParam) ? tabParam : 'business',
  );

  useEffect(() => {
    if (tabParam && SETTINGS_TABS.includes(tabParam)) setTab(tabParam);
  }, [tabParam]);

  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs value={tab} onValueChange={(v) => setTab(v as SettingsTab)}>
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="business" className="mt-4"><BusinessTab /></TabsContent>
        <TabsContent value="staff" className="mt-4"><StaffTab /></TabsContent>
        <TabsContent value="integrations" className="mt-4"><IntegrationsTab /></TabsContent>
        <TabsContent value="account" className="mt-4"><AccountTab /></TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading settings…" />}>
      <SettingsPageInner />
    </Suspense>
  );
}
