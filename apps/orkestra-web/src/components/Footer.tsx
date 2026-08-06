import { ArrowUpRight } from 'lucide-react';
import { brand, footer, productLinks } from '@/data/content';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-display text-sm font-bold text-white">
                H
              </div>
              <span className="font-display text-lg font-semibold text-white">
                {brand.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              {brand.tagline}.
            </p>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Products
            </h4>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-slate-500 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a href="#contact" className="hover:text-slate-300">
              Contact
            </a>
            <a href="#" className="hover:text-slate-300">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-300">
              Terms
            </a>
          </div>
        </div>
        <div className="mt-4 border-t border-white/5 pt-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Languages</span>
            <div className="flex items-center gap-1">
              <span className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white">
                EN
              </span>
              <a
                href="/es"
                className="rounded-md px-2 py-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                ES
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
