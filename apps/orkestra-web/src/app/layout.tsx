import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { brand, faq } from '@/data/content';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://hostia.solutions/#organization',
      name: 'HosT.ia',
      url: 'https://hostia.solutions',
      email: brand.email,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+34677659820',
        contactType: 'sales',
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Spanish'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://hostia.solutions/#website',
      url: 'https://hostia.solutions',
      name: 'HosT.ia — Autonomous AI Agents for Business',
      publisher: { '@id': 'https://hostia.solutions/#organization' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://hostia.solutions/#faq',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hostia.solutions'),
  title: {
    default: 'HosT.ia — Autonomous AI Agents for Business',
    template: '%s · HosT.ia',
  },
  description:
    'HosT.ia is the first fully-autonomous AI services agency. Deploy AI sales, support, voice and WhatsApp agents that run your business operations 24/7 — in under 30 days.',
  keywords: [
    'AI agents',
    'WhatsApp Business API',
    'voice AI agents',
    'AI customer service',
    'autonomous AI agency',
    'AI automation for business',
    'conversational AI',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'HosT.ia',
    title: 'HosT.ia — Autonomous AI Agents for Business',
    description:
      'AI sales, support, voice and WhatsApp agents that run your business operations 24/7 — deployed in under 30 days.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HosT.ia — Autonomous AI Agents for Business',
    description:
      'AI sales, support, voice and WhatsApp agents that run your business operations 24/7.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body className="font-sans">
        <script
          async
          src="https://stats.mat32.com/script.js"
          data-website-id="1488c53f-f94a-49b4-94c1-9177cdd34268"
          data-domains="hostia.solutions"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
