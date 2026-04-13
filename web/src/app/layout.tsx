import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import AffiliateTracking from '@/components/AffiliateTracking';
import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Best Health & Wellness Products 2026 — Expert Reviews | VitalGuide',
    template: '%s | VitalGuide',
  },
  description: 'Discover and compare the best health and wellbeing products. Expert reviews on supplements, fitness equipment, sleep aids, and mental wellness tools.',
  metadataBase: new URL('https://vitalguide.life'),
  openGraph: {
    siteName: 'VitalGuide',
    type: 'website',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body>
        <Nav />
        {children}
        <Footer />
        <Analytics />
        <AffiliateTracking />
      </body>
    </html>
  );
}
