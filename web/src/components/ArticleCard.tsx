import Link from 'next/link';
import { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  icon?: string;
}

export default function ArticleCard({ article, icon }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="article-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="article-img">
        {icon || '📄'}
      </div>
      <div className="article-body">
        <div className="article-meta">
          {article.categories[0] && (
            <span className="article-tag">{article.categories[0]}</span>
          )}
          <span className="article-date">{article.time_to_read_in_minutes} min read</span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
        <span className="read-more">Read Article</span>
      </div>
    </Link>
  );
}
