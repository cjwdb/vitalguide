import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';
import StructuredData from './StructuredData';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const allItems = [{ name: 'Home', href: '/' }, ...items];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="breadcrumb">
        {allItems.map((item, i) => (
          <span key={item.href}>
            {i > 0 && ' › '}
            {i < allItems.length - 1 ? (
              <Link href={item.href}>{item.name}</Link>
            ) : (
              item.name
            )}
          </span>
        ))}
      </div>
    </>
  );
}
