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

export type ArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;
