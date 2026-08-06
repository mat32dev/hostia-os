import { ArrowRight } from 'lucide-react';
import { brand, hero } from '@/data/content';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-cyan-500/20 blur-3xl animate-glow" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {hero.eyebrow} · Accepting new clients
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {hero.title}
            <br />
            <span className="gradient-text">{hero.titleAccent}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            {hero.subtitle}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#contact" className="btn-primary text-base">
              {hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#services" className="btn-secondary text-base">
              {hero.secondaryCta}
            </a>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            or message us directly on{' '}
            <a
              href={brand.whatsappLink}
              className="font-medium text-emerald-400 hover:underline"
            >
              WhatsApp {brand.whatsapp}
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {hero.stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-surface-900 px-6 py-6 text-center animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="font-display text-3xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
