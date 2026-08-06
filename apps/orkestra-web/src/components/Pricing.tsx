import { Check } from 'lucide-react';
import { pricing } from '@/data/content';

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">Pricing</div>
          <h2 className="section-title">Transparent. No per-seat surprises.</h2>
          <p className="section-subtitle mx-auto">
            Pick the engagement model that fits your stage. Start with a focused
            implementation and scale into fully managed agents.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {pricing.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-7 transition-all ${
                tier.highlight
                  ? 'border-indigo-400/50 bg-gradient-to-b from-indigo-500/10 to-transparent shadow-xl shadow-indigo-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  Most common
                </div>
              )}
              <div className="text-sm font-medium uppercase tracking-wider text-slate-400">
                {tier.target}
              </div>
              <h3 className="mt-1 font-display text-xl font-semibold text-white">
                {tier.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-white">
                  {tier.price}
                </span>
                <span className="text-sm text-slate-400">{tier.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-7 block text-center ${tier.highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}`}
              >
                Get a quote
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          All figures in USD. Every project includes the 12-point quality
          framework: escalation policy, error handling, privacy &amp; AI
          disclosure, rollback plan, operator manual and live monitoring.
        </p>
      </div>
    </section>
  );
}
