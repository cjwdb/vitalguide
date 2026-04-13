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

export interface Article {
  id: string;
  slug: string;
  title: string;
  sub_title: string;
  summary: string;
  body: string;
  image_url: string;
  categories: string[];
  date: string;
  time_to_read_in_minutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  nextToken: string | null;
}
