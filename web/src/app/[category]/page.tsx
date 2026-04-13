import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProducts, getArticles } from '@/lib/api';
import { CATEGORY_SLUGS, getCategoryBySlug, SITE_URL } from '@/lib/constants';
import PageHero from '@/components/PageHero';
import ProductCard from '@/components/ProductCard';
import StructuredData from '@/components/StructuredData';

export const revalidate = 3600;

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};

  return {
    title: `Best ${cat.name} 2026 — Expert Reviews`,
    description: cat.description,
    alternates: {
      canonical: `${SITE_URL}/${slug}`,
    },
    openGraph: {
      title: `Best ${cat.name} 2026 — Expert Reviews | VitalGuide`,
      description: cat.description,
      url: `${SITE_URL}/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const [products, articles] = await Promise.all([
    getProducts(slug),
    getArticles(slug),
  ]);

  return (
    <>
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        headline: `Best ${cat.name} 2026`,
        url: `${SITE_URL}/${slug}`,
      }} />
      {products.length > 0 && (
        <StructuredData data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Best ${cat.name} 2026 Products`,
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              url: p.affiliate_link,
              ...(p.rating > 0 && {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: String(p.rating),
                  reviewCount: String(p.reviews),
                  bestRating: String(p.best_rating),
                  worstRating: String(p.worst_rating),
                },
              }),
            },
          })),
        }} />
      )}

      <PageHero
        title={`Best ${cat.name} 2026`}
        description={cat.description}
        breadcrumbs={[{ name: cat.name, href: `/${slug}` }]}
        byline="VitalGuide Team"
      />

      {/* Products Grid */}
      <section className="section">
        <div className="container">
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Products coming soon. Check back for expert reviews!
            </p>
          )}
        </div>
      </section>

      {/* Deep Dive Guides */}
      {articles.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Deep Dive</span>
              <h2>{cat.name} Guides</h2>
              <p>In-depth articles to help you make informed decisions.</p>
            </div>
            <div className="articles-grid">
              {articles.slice(0, 6).map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="article-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="article-img">{cat.icon}</div>
                  <div className="article-body">
                    <div className="article-meta">
                      <span className="article-tag">{slug}</span>
                      <span className="article-date">{article.time_to_read_in_minutes} min read</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.summary}</p>
                    <span className="read-more">Read Article</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
