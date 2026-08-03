import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Shell } from '@/components/Shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Host.ia Hub',
    template: '%s · Host.ia Hub',
  },
  description:
    'Unified dashboard for bar owners: orders, tables, menu, Guard alerts, WhatsApp conversations and reports.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
