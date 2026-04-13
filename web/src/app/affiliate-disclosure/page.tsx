import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure — VitalGuide',
  description: "VitalGuide's affiliate disclosure: we participate in the Amazon Associates Program and may earn commissions on qualifying purchases.",
  alternates: {
    canonical: `${SITE_URL}/affiliate-disclosure`,
  },
  openGraph: {
    title: 'Affiliate Disclosure — VitalGuide',
    description: "VitalGuide's affiliate disclosure: we participate in the Amazon Associates Program and may earn commissions on qualifying purchases.",
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affiliate Disclosure — VitalGuide',
    description: "VitalGuide's affiliate disclosure: we participate in the Amazon Associates Program and may earn commissions on qualifying purchases.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function AffiliateDisclosurePage() {
  return (
    <>
      <PageHero
        title="Affiliate Disclosure"
        description="Transparency about how VitalGuide earns revenue"
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
        ]}
      />

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2>Amazon Associates Program</h2>
          <p>VitalGuide is a participant in the <strong>Amazon Services LLC Associates Program</strong>, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
          <p style={{ marginTop: '1rem' }}>This means: when you click a product link on our site that leads to Amazon and you make a qualifying purchase, we may receive a small commission — <strong>at no additional cost to you</strong>.</p>

          <h2 style={{ marginTop: '2rem' }}>What This Means for You</h2>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li><strong>No extra cost.</strong> You pay the exact same price whether or not you use our affiliate links.</li>
            <li><strong>Revenue supports the site.</strong> Commissions help us fund independent research, writing, and site maintenance so we can keep providing free content.</li>
            <li><strong>Editorial independence.</strong> Affiliate relationships do not influence our reviews or rankings. We only recommend products we believe genuinely benefit our readers.</li>
          </ul>

          <h2 style={{ marginTop: '2rem' }}>FTC Compliance</h2>
          <p>In accordance with the <strong>Federal Trade Commission (FTC) guidelines</strong> (16 CFR Part 255), VitalGuide clearly discloses all material connections between our site and third parties whose products we promote. This disclosure appears:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>In the site-wide disclosure bar at the top of every page</li>
            <li>In the footer of every page</li>
            <li>On this dedicated Affiliate Disclosure page</li>
            <li>In the footer disclosure box on product and article pages</li>
          </ul>

          <h2 style={{ marginTop: '2rem' }}>Other Affiliate Programs</h2>
          <p>From time to time, VitalGuide may participate in other affiliate programs beyond Amazon. Any such relationships will be disclosed in the same manner described above.</p>

          <h2 style={{ marginTop: '2rem' }}>Questions?</h2>
          <p>If you have any questions about our affiliate relationships or how we choose products to feature, please <Link href="/contact">contact us</Link>.</p>
        </div>
      </section>
    </>
  );
}
