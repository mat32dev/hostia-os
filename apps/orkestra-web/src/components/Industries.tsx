import Icon from './Icon';
import { verticals } from '@/data/content';

export default function Industries() {
  return (
    <section id="industries" className="relative py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">Industries</div>
          <h2 className="section-title">
            Proven in the verticals where it matters
          </h2>
          <p className="section-subtitle mx-auto">
            We adapt our agents to the language, workflows and regulations of
            your industry — not the other way around.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {verticals.map((v) => (
            <div
              key={v.title}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-indigo-400/40 hover:bg-white/[0.05]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10 text-violet-300 transition-transform group-hover:scale-110">
                <Icon name={v.icon} className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
