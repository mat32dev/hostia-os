import { ArrowRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { brand } from '@/data/content';

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8 text-center sm:p-12">
          <div className="eyebrow">Get started</div>
          <h2 className="section-title">
            Ready to put AI to work for your business?
          </h2>
          <p className="section-subtitle mx-auto">
            Tell us about your operations. We\u2019ll map the highest-value
            conversations to automate and send you a scoped proposal within 48
            hours. No pressure, no obligation.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={brand.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp {brand.whatsapp}
            </a>
            <a href={`mailto:${brand.email}`} className="btn-secondary w-full sm:w-auto">
              <Mail className="h-4 w-4" />
              {brand.email}
            </a>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm text-slate-400 sm:flex-row sm:gap-6">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-500" /> Phone &amp; voice agents
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-slate-500" /> Free scoping call
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-slate-500" /> Response in &lt; 48h
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
