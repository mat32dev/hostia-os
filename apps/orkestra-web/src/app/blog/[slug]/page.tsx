import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { posts, getPostBySlug, relatedPosts, blogLocale, getPostLang } from '@/data/posts';
import { brand, productLinks } from '@/data/content';

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const lang = getPostLang(post);
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://hostia.solutions/blog/${post.slug}/` },
    openGraph: {
      type: 'article',
      locale: lang === 'es' ? 'es_ES' : 'en_US',
      siteName: 'HosT.ia',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: ['HosT.ia'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = relatedPosts(post);
  const lang = getPostLang(post);
  const locale = blogLocale[lang];
  const inLanguage = lang === 'es' ? 'es' : 'en';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: `https://hostia.solutions/blog/${post.slug}/`,
    headline: post.title,
    description: post.description,
    keywords: post.keywords.join(', '),
    datePublished: post.date,
    dateModified: post.date,
    inLanguage,
    author: { '@type': 'Organization', name: 'HosT.ia', url: 'https://hostia.solutions' },
    publisher: {
      '@type': 'Organization',
      name: 'HosT.ia',
      url: 'https://hostia.solutions',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hostia.solutions' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://hostia.solutions/blog/' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://hostia.solutions/blog/${post.slug}/` },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <article className="container max-w-3xl">
          <nav className="mb-6 text-xs text-slate-500">
            <a href="/" className="hover:text-slate-300">
              {locale.homeBreadcrumb}
            </a>
            <span className="mx-2">/</span>
            <a href="/blog/" className="hover:text-slate-300">
              Blog
            </a>
            <span className="mx-2">/</span>
            <span className="text-slate-400">{post.category}</span>
          </nav>

          <p className="eyebrow">{post.category}</p>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">{post.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-white/5 py-4 text-xs text-slate-500">
            <span>{new Date(post.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readMinutes} {locale.readIn}</span>
            <span>·</span>
            <span>{locale.byTeam}</span>
          </div>

          <div className="mt-10 space-y-12">
            {post.sections.map((section, i) => (
              <section key={i}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((p, j) => (
                  <p key={j} className="mt-4 leading-relaxed text-slate-300">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.table && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03]">
                          {section.table.headers.map((h, j) => (
                            <th key={j} className="px-4 py-3 font-semibold text-white">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, j) => (
                          <tr key={j} className="border-b border-white/5 last:border-0">
                            {row.map((cell, k) => (
                              <td
                                key={k}
                                className={`px-4 py-3 text-slate-300 ${k === 0 ? 'font-medium text-white' : ''}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            {post.faq.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                  {locale.faqTitle}
                </h2>
                <div className="mt-5 space-y-4">
                  {post.faq.map((f) => (
                    <div key={f.q} className="glass rounded-xl p-5">
                      <h3 className="font-semibold text-white">{f.q}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-white">{post.cta}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              {locale.ctaSubtitle}
            </p>
            <a href={locale.ctaButtonHref} className="btn-primary mt-6">
              {locale.ctaButtonLabel}
            </a>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-xl font-bold text-white">{locale.keepReading}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {related.map((p) => (
                  <a
                    key={p.slug}
                    href={`/blog/${p.slug}/`}
                    className="glass group rounded-xl p-5 transition-all hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      {p.category}
                    </span>
                    <h3 className="mt-2 font-display text-sm font-semibold leading-snug text-white transition-colors group-hover:text-indigo-300">
                      {p.title}
                    </h3>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row sm:items-center">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              {locale.relatedProducts}
            </span>
            <div className="flex flex-wrap gap-3">
              {productLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {link.name}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </main>
      <Footer />
    </>
  );
}
