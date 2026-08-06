import { results } from '@/data/content';

export default function Results() {
  return (
    <section id="results" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">Results</div>
          <h2 className="section-title">Real outcomes, measured weekly</h2>
          <p className="section-subtitle mx-auto">
            We don\u2019t report vanity metrics. Every engagement tracks the KPIs
            that move your P&L — and we optimize against them every week.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {results.map((r, i) => (
            <div
              key={r.label}
              className="glass rounded-2xl p-7 text-center transition-all hover:border-indigo-400/30"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="font-display text-4xl font-bold gradient-text">
                {r.value}
              </div>
              <div className="mt-2 text-sm text-slate-400">{r.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
