import { Product } from '@/lib/types';

function formatStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3 ? '½' : '';
  return '★'.repeat(full) + half;
}

function formatReviews(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K+`;
  }
  return `${count}+`;
}

interface ProductCardProps {
  product: Product;
  badge?: string;
  badgeClass?: 'badge-green' | 'badge-gold' | 'badge-terra';
}

export default function ProductCard({ product, badge, badgeClass = 'badge-green' }: ProductCardProps) {
  return (
    <div className="product-card">
      {product.image_url && (
        <img
          className="product-img"
          src={product.image_url}
          alt={product.name}
          loading="lazy"
        />
      )}
      <div className="product-body">
        {badge && (
          <span className={`product-badge ${badgeClass}`}>{badge}</span>
        )}
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-meta">
          <span>
            <span className="stars">{formatStars(product.rating)}</span>
            <span className="rating-count"> {product.rating} &middot; {formatReviews(product.reviews)} reviews</span>
          </span>
        </div>
        <a
          className="btn-amazon"
          href={product.affiliate_link}
          target="_blank"
          rel="nofollow sponsored"
        >
          View on Amazon
        </a>
      </div>
    </div>
  );
}
