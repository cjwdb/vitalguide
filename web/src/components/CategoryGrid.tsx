import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

export default function CategoryGrid() {
  return (
    <div className="category-grid">
      {CATEGORIES.map((cat) => (
        <Link key={cat.slug} href={`/${cat.slug}`} className="category-card">
          <span className="category-icon">{cat.icon}</span>
          <h3>{cat.name}</h3>
          <p>{cat.description}</p>
          <span className="card-link">Browse Products →</span>
        </Link>
      ))}
    </div>
  );
}
