import { CheckCircle2, TrendingUp } from 'lucide-react';
import Icon from './Icon';
import { services } from '@/data/content';

export default function Services() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">What we build</div>
          <h2 className="section-title">
            AI agents that carry real business workload
          </h2>
          <p className="section-subtitle mx-auto">
            Every agent is designed around a business outcome, trained on your
            data, and delivered with explicit escalation, privacy and rollback
            policies.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:border-indigo-400/40 hover:bg-white/[0.05]"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {service.title}
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {service.description}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {service.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                  {service.metrics.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                    >
                      <TrendingUp className="h-3 w-3" />
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
