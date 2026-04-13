'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getCategory(path: string): string {
  if (path.includes('/supplements')) return 'supplements';
  if (path.includes('/fitness')) return 'fitness';
  if (path.includes('/sports-nutrition')) return 'sports-nutrition';
  if (path.includes('/wellness')) return 'wellness';
  if (path.includes('/health-technology')) return 'health-technology';
  if (path.includes('/sleep')) return 'sleep';
  if (path.includes('/mental-wellness')) return 'mental-wellness';
  return 'general';
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function addUtm(url: string, productSlug: string, category: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'vitalguide.life');
    u.searchParams.set('utm_medium', 'affiliate');
    u.searchParams.set('utm_campaign', `${category}-reviews`);
    u.searchParams.set('utm_content', productSlug);
    return u.toString();
  } catch {
    return url;
  }
}

declare function gtag(...args: unknown[]): void;

export default function AffiliateTracking() {
  const pathname = usePathname();

  useEffect(() => {
    const category = getCategory(pathname);
    const links = document.querySelectorAll<HTMLAnchorElement>('a.btn-amazon, a[rel~="sponsored"]');

    links.forEach((link) => {
      const card = link.closest('.product-card, .comparison-col');
      const nameEl = card?.querySelector('h3, .comp-name');
      const productName = nameEl?.textContent?.trim() || link.textContent?.trim() || '';
      const productSlug = toSlug(productName);
      const originalUrl = link.getAttribute('href') || '';

      link.setAttribute('href', addUtm(originalUrl, productSlug, category));

      link.addEventListener('click', () => {
        if (typeof gtag === 'function') {
          gtag('event', 'affiliate_click', {
            product_name: productName,
            product_category: category,
            destination_url: originalUrl,
            event_category: 'affiliate',
            event_label: productName,
          });
        }
      });
    });
  }, [pathname]);

  return null;
}
