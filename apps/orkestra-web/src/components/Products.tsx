import { ArrowUpRight } from 'lucide-react';
import Icon from './Icon';
import { products } from '@/data/content';

export default function Products() {
  return (
    <section id="products" className="py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">Our open-source products</div>
          <h2 className="section-title">
            We ship our own software too
          </h2>
          <p className="section-subtitle mx-auto">
            HosT.ia OS is our open-source hospitality stack — POS, security and
            an AI waiter. The same agent platform that powers our client work,
            released as products you can run yourself.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {products.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:border-emerald-400/40 hover:bg-white/[0.05]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                  <Icon name={p.icon} className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
              </div>

              <h3 className="relative mt-5 font-display text-xl font-semibold text-white">
                {p.name}
              </h3>
              <p className="relative mt-1 text-sm font-medium text-emerald-300">
                {p.tagline}
              </p>
              <p className="relative mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                {p.desc}
              </p>
              <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                {p.cta}
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
