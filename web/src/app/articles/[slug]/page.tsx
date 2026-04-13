import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticles, getArticleBySlug, getProducts } from '@/lib/api';
import PageHero from '@/components/PageHero';
import StructuredData from '@/components/StructuredData';
import { SITE_URL } from '@/lib/constants';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    return articles
      .filter((a) => a.slug)
      .map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: `${SITE_URL}/articles/${slug}`,
      images: article.image_url ? [{ url: article.image_url }] : undefined,
    },
    twitter: {
      title: article.title,
      description: article.summary,
    },
    alternates: {
      canonical: `${SITE_URL}/articles/${slug}`,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Fetch related products and articles
  const [allArticles, relatedProducts] = await Promise.all([
    getArticles(),
    getProducts(undefined, article.id),
  ]);

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.categories.some((c) => article.categories.includes(c)))
    .slice(0, 5);

  return (
    <>
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.summary,
        datePublished: article.date,
        dateModified: article.updatedAt,
        url: `${SITE_URL}/articles/${slug}`,
        image: article.image_url || undefined,
        author: {
          '@type': 'Organization',
          name: 'VitalGuide',
        },
        publisher: {
          '@type': 'Organization',
          name: 'VitalGuide',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/og-image.png`,
          },
        },
      }} />

      <PageHero
        title={article.title}
        description={article.sub_title}
        breadcrumbs={[
          { name: 'Articles', href: '/articles' },
          { name: article.title, href: `/articles/${slug}` },
        ]}
        byline={`VitalGuide Team · Updated ${new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ${article.time_to_read_in_minutes} min read`}
      />

      <div className="article-layout">
        <div className="article-main">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </div>

        <aside className="article-sidebar">
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="sidebar-box">
              <h4>Top Picks</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {relatedProducts.slice(0, 5).map((product) => (
                  <li key={product.id} style={{ marginBottom: '12px' }}>
                    <a
                      href={product.affiliate_link}
                      target="_blank"
                      rel="nofollow sponsored"
                      style={{ fontWeight: 600, fontSize: '14px' }}
                    >
                      {product.name}
                    </a>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {'★'.repeat(Math.floor(product.rating))} {product.rating}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="sidebar-box">
              <h4>Related Articles</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {relatedArticles.map((a) => (
                  <li key={a.id} style={{ marginBottom: '10px' }}>
                    <Link href={`/articles/${a.slug}`} style={{ fontSize: '14px', fontWeight: 600 }}>
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Browse Category */}
          {article.categories[0] && (
            <div className="sidebar-box">
              <Link
                href={`/${article.categories[0]}`}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Browse {article.categories[0]} Products
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
