import type { MetadataRoute } from 'next';
import { posts } from '@/data/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://hostia.solutions';
  const today = new Date();
  return [
    {
      url: `${base}/`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${base}/blog/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}/`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
