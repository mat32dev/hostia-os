import { process } from '@/data/content';

export default function Process() {
  return (
    <section id="process" className="py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">How it works</div>
          <h2 className="section-title">From kickoff to production in 30 days</h2>
          <p className="section-subtitle mx-auto">
            A disciplined, transparent delivery process. You always know what is
            happening, what is tested, and what ships next.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-indigo-500/50 via-violet-500/30 to-transparent sm:left-1/2" />

          <div className="space-y-10">
            {process.map((p, i) => (
              <div
                key={p.step}
                className={`relative flex items-start gap-6 sm:w-1/2 ${
                  i % 2 === 0
                    ? 'sm:mr-auto sm:pr-12 sm:flex-row'
                    : 'sm:ml-auto sm:pl-12 sm:flex-row-reverse'
                }`}
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-surface-900 font-display text-sm font-bold gradient-text">
                  {p.step}
                </div>
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
