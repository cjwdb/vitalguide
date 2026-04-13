export interface Product {
  id: string;
  name: string;
  description: string;
  affiliate_link: string;
  image_url: string;
  categories: string[];
  article_ids: string[];
  rating: number;
  reviews: number;
  best_rating: number;
  worst_rating: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
