import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { posts, getPostLang } from '@/data/posts';
import { Clock, MessageCircle, Phone, Coins, Utensils, TerminalSquare, Download, Zap, GitBranch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'message-circle': MessageCircle,
  phone: Phone,
  coins: Coins,
  utensils: Utensils,
  terminal: TerminalSquare,
  download: Download,
  zap: Zap,
  'git-branch': GitBranch,
};

export const metadata: Metadata = {
  title: 'Blog — AI Agents, WhatsApp Automation & Voice AI',
  description:
    'Practical guides on WhatsApp Business AI agents, AI phone receptionists, automated collections and AI for restaurants — written by the team that builds them.',
  openGraph: {
    title: 'HosT.ia Blog — AI Agents, WhatsApp Automation & Voice AI',
    description:
      'Practical guides on WhatsApp Business AI agents, voice agents, automated collections and AI for restaurants.',
  },
};

export default function BlogIndex() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container">
          <div className="max-w-2xl">
            <p className="eyebrow">Blog</p>
            <h1 className="section-title">
              Field notes on <span className="gradient-text">AI agents</span> for business
            </h1>
            <p className="section-subtitle">
              No fluff. Practical guides on WhatsApp automation, voice agents, automated
              collections and AI for restaurants — written by the team that deploys them.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {posts.map((post) => {
              const Icon = iconMap[post.icon] ?? MessageCircle;
              return (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}/`}
                  className="group glass flex flex-col rounded-2xl p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${post.accent}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold uppercase tracking-wider text-indigo-400">
                        {post.category}
                      </span>
                      <span>·</span>
                      <span>{new Date(post.date).toLocaleDateString(getPostLang(post) === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <h2 className="mt-5 font-display text-xl font-bold leading-snug text-white transition-colors group-hover:text-indigo-300">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                    {post.excerpt}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readMinutes} {getPostLang(post) === 'es' ? 'min de lectura' : 'min read'}
                    </span>
                    <span className="font-semibold text-indigo-400 transition-colors group-hover:text-indigo-300">
                      {getPostLang(post) === 'es' ? 'Leer artículo →' : 'Read article →'}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
