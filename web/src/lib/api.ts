import { Article, Product, PaginatedResponse } from './types';

const API_BASE = process.env.API_BASE_URL!;
const AUTH = Buffer.from(process.env.API_CREDENTIALS!).toString('base64');

async function apiFetch<T>(path: string, params?: Record<string, string>, revalidate = 3600): Promise<T> {
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${AUTH}` },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }

  return res.json();
}

async function fetchAll<T>(path: string, params?: Record<string, string>): Promise<T[]> {
  try {
    const all: T[] = [];
    let nextToken: string | null = null;

    do {
      const queryParams: Record<string, string> = { ...params, limit: '100' };
      if (nextToken) queryParams.nextToken = nextToken;

      const response = await apiFetch<PaginatedResponse<T>>(path, queryParams);
      all.push(...response.items);
      nextToken = response.nextToken;
    } while (nextToken);

    return all;
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    return [];
  }
}

export async function getProducts(category?: string, articleId?: string): Promise<Product[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  if (articleId) params.article_id = articleId;
  return fetchAll<Product>('/products', params);
}

export async function getProductById(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function getArticles(category?: string): Promise<Article[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  return fetchAll<Article>('/articles', params);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await apiFetch<PaginatedResponse<Article>>('/articles', { slug });
    return response.items[0] ?? null;
  } catch (error) {
    console.error(`Failed to fetch article by slug ${slug}:`, error);
    return null;
  }
}
