import Link from 'next/link';
import { getProducts, getArticles } from '@/lib/api';
import StatsBar from '@/components/StatsBar';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import ArticleCard from '@/components/ArticleCard';
import Newsletter from '@/components/Newsletter';
import StructuredData from '@/components/StructuredData';
import { SITE_URL } from '@/lib/constants';

export const revalidate = 3600;

export default async function HomePage() {
  const [products, articles] = await Promise.all([
    getProducts(),
    getArticles(),
  ]);

  const featuredProducts = products.slice(0, 6);
  const latestArticles = articles
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <>
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'VitalGuide',
        description: 'Health and wellbeing product directory with expert reviews',
        url: SITE_URL,
      }} />
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VitalGuide',
        url: SITE_URL,
        logo: `${SITE_URL}/og-image.png`,
        description: 'Health and wellbeing product directory with expert reviews',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'hello@vitalguide.life',
          contactType: 'customer support',
        },
      }} />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌱 Trusted Health Reviews</div>
          <h1>Health &amp; Wellness Products — Expert Reviews &amp; Comparisons</h1>
          <p>We research, test, and compare the best health and wellbeing products so you can make informed decisions — all in one place.</p>
          <div className="hero-buttons">
            <Link className="btn btn-primary" href="/supplements">Browse Products</Link>
            <Link className="btn btn-outline" href="/articles">Read Articles</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Explore</span>
            <h2>Browse by Category</h2>
            <p>Find expert reviews across our comprehensive health &amp; wellness categories.</p>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Top Picks</span>
              <h2>Featured Products</h2>
              <p>Our most popular and highest-rated products across all categories.</p>
            </div>
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Latest</span>
              <h2>Latest Articles</h2>
              <p>Expert insights on health, wellness, and nutrition.</p>
            </div>
            <div className="articles-grid">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
