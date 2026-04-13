import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles } from '@/lib/api';
import { SITE_URL, CATEGORIES } from '@/lib/constants';
import StructuredData from '@/components/StructuredData';
import PageHero from '@/components/PageHero';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Health & Wellness Articles',
  description: 'Expert articles on supplements, fitness, nutrition, sleep, and mental wellness. Evidence-based guides to help you make informed health decisions.',
  alternates: {
    canonical: `${SITE_URL}/articles`,
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  supplements: '💊',
  fitness: '💪',
  'sports-nutrition': '🏋️',
  wellness: '🧘',
  'health-technology': '📱',
  sleep: '😴',
  'mental-wellness': '🧠',
};

export default async function ArticlesPage() {
  const articles = await getArticles();
  const sorted = articles.sort((a, b) => b.date.localeCompare(a.date));
  const featured = sorted[0];
  const rest = sorted.slice(1);

  // Count articles per category
  const categoryCounts: Record<string, number> = {};
  articles.forEach((a) => {
    a.categories.forEach((c) => {
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    });
  });

  return (
    <>
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Health & Wellness Articles',
        url: `${SITE_URL}/articles`,
      }} />

      <PageHero
        title="Health & Wellness Articles"
        description="Expert insights on supplements, fitness, nutrition, and more."
        breadcrumbs={[{ name: 'Articles', href: '/articles' }]}
      />

      <div className="article-layout" style={{ paddingTop: '40px' }}>
        <div className="article-main">
          {/* Featured Article */}
          {featured && (
            <div className="blog-featured">
              <div className="blog-featured-label">Featured Article</div>
              <div className="blog-featured-meta">
                {featured.categories[0] && (
                  <span className="article-tag">{featured.categories[0]}</span>
                )}
                <span className="article-date">{featured.time_to_read_in_minutes} min read</span>
              </div>
              <h2>
                <Link href={`/articles/${featured.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {featured.title}
                </Link>
              </h2>
              <p>{featured.summary}</p>
              <Link href={`/articles/${featured.slug}`} className="btn btn-primary">
                Read Article
              </Link>
            </div>
          )}

          {/* Article List */}
          <div className="blog-section-title" style={{ marginTop: '32px' }}>All Articles</div>
          <div className="blog-list">
            {rest.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="blog-post">
                <div className="blog-post-icon">
                  {CATEGORY_ICONS[article.categories[0]] || '📄'}
                </div>
                <div className="blog-post-body">
                  <div className="blog-post-meta">
                    {article.categories[0] && (
                      <span className="article-tag">{article.categories[0]}</span>
                    )}
                    <span className="blog-readtime">{article.time_to_read_in_minutes} min read</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="blog-post-footer">
                    <span className="article-date">
                      {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="read-link">Read Article</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="article-sidebar" style={{ position: 'sticky', top: '80px' }}>
          <div className="blog-sidebar-box">
            <h4>Categories</h4>
            <ul className="category-filter">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/${cat.slug}`}>
                    {cat.icon} {cat.name}
                    {categoryCounts[cat.slug] && (
                      <span className="count">{categoryCounts[cat.slug]}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
