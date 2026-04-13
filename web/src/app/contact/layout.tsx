import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us — VitalGuide',
  description: 'Get in touch with VitalGuide. We welcome feedback, corrections, and general inquiries.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact Us — VitalGuide',
    description: 'Get in touch with VitalGuide. We welcome feedback, corrections, and general inquiries.',
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — VitalGuide',
    description: 'Get in touch with VitalGuide. We welcome feedback, corrections, and general inquiries.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
