import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy — VitalGuide',
  description: "VitalGuide's privacy policy: how we collect, use, and protect your personal information.",
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  openGraph: {
    title: 'Privacy Policy — VitalGuide',
    description: "VitalGuide's privacy policy: how we collect, use, and protect your personal information.",
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — VitalGuide',
    description: "VitalGuide's privacy policy: how we collect, use, and protect your personal information.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        description="Last updated: January 1, 2026"
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Privacy Policy', href: '/privacy-policy' },
        ]}
      />

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2>Introduction</h2>
          <p>VitalGuide (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit <strong>vitalguide.life</strong>.</p>

          <h2 style={{ marginTop: '2rem' }}>Information We Collect</h2>
          <h3 style={{ marginTop: '1rem' }}>Automatically Collected Information</h3>
          <p>When you visit our site, we may automatically collect certain information about your device, including:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages viewed and time spent on pages</li>
            <li>Referring URLs</li>
            <li>IP address (anonymized)</li>
          </ul>
          <p>This information is collected via <strong>Google Analytics 4</strong> to help us understand how visitors use our site.</p>

          <h3 style={{ marginTop: '1rem' }}>Information You Provide</h3>
          <p>If you subscribe to our newsletter or contact us, we collect the email address and any other information you choose to provide.</p>

          <h2 style={{ marginTop: '2rem' }}>How We Use Your Information</h2>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>To analyze site traffic and improve our content</li>
            <li>To send newsletters if you subscribe (you can unsubscribe at any time)</li>
            <li>To respond to inquiries</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 style={{ marginTop: '2rem' }}>Affiliate Links &amp; Third Parties</h2>
          <p>VitalGuide participates in the <strong>Amazon Services LLC Associates Program</strong>. When you click an Amazon affiliate link and make a purchase, Amazon may collect information about your visit and purchase. We receive a small commission at no additional cost to you. Amazon&apos;s privacy policy governs any data collected through those links.</p>
          <p>We do not sell or share your personal information with third parties for their own marketing purposes.</p>

          <h2 style={{ marginTop: '2rem' }}>Cookies</h2>
          <p>We use cookies to support analytics (Google Analytics). You can disable cookies in your browser settings, but some site features may not function correctly. Google Analytics uses cookies to distinguish users and sessions.</p>

          <h2 style={{ marginTop: '2rem' }}>Your Rights (GDPR &amp; CCPA)</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Opt out of data collection for marketing purposes</li>
            <li>Data portability</li>
          </ul>
          <p>To exercise any of these rights, please <Link href="/contact">contact us</Link>.</p>

          <h2 style={{ marginTop: '2rem' }}>Data Retention</h2>
          <p>We retain analytics data in accordance with Google Analytics&apos; default retention settings (14 months). Email subscriber data is retained until you unsubscribe.</p>

          <h2 style={{ marginTop: '2rem' }}>Children&apos;s Privacy</h2>
          <p>VitalGuide is not directed at children under 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.</p>

          <h2 style={{ marginTop: '2rem' }}>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;last updated&rdquo; date. Continued use of the site after changes constitutes acceptance of the revised policy.</p>

          <h2 style={{ marginTop: '2rem' }}>Contact</h2>
          <p>If you have questions about this Privacy Policy, please <Link href="/contact">contact us</Link>.</p>
        </div>
      </section>
    </>
  );
}
