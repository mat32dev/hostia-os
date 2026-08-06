import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { brand } from '@/data/content';

export const metadata: Metadata = {
  title: 'ES · HosT.ia',
  robots: { index: false, follow: false },
};

export default function SpanishPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 font-display text-lg font-bold text-white">
        H
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">
        Versión en español, próximamente
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        Estamos preparando la versión en español de {brand.name}. Mientras
        tanto, puedes contactar con nosotros en cualquier idioma.
      </p>
      <a
        href="/"
        className="btn-secondary mt-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al sitio en inglés
      </a>
    </main>
  );
}
