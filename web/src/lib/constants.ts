export const SITE_URL = 'https://vitalguide.life';
export const SITE_NAME = 'VitalGuide';
export const SITE_DESCRIPTION = 'Health & Wellness Products — Expert Reviews & Comparisons';
export const AMAZON_TAG = 'vitalguide08-20';
export const GA_ID = 'G-NE4SZ71P4X';

export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { slug: 'supplements', name: 'Vitamins & Supplements', icon: '💊', description: 'Expert-reviewed vitamins, minerals, and dietary supplements for optimal health.' },
  { slug: 'fitness', name: 'Fitness Equipment', icon: '💪', description: 'Top-rated fitness gear and equipment for your home gym and beyond.' },
  { slug: 'sports-nutrition', name: 'Sports Nutrition', icon: '🏋️', description: 'Performance-focused nutrition products for athletes and active lifestyles.' },
  { slug: 'wellness', name: 'Wellness & Relaxation', icon: '🧘', description: 'Products for mindfulness, relaxation, and holistic well-being.' },
  { slug: 'health-technology', name: 'Health Technology', icon: '📱', description: 'Smart devices and technology for tracking and improving your health.' },
  { slug: 'sleep', name: 'Sleep', icon: '😴', description: 'Products and solutions for better, deeper, more restorative sleep.' },
  { slug: 'mental-wellness', name: 'Mental Wellness', icon: '🧠', description: 'Supplements and tools for cognitive health, focus, and emotional balance.' },
];

export const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug);

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}
