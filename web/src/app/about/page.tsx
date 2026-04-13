import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About VitalGuide — Independent Health Product Reviews',
  description: 'VitalGuide is an independent health and wellness review site. Learn about our mission, our team, and how we evaluate products.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About VitalGuide — Independent Health Product Reviews',
    description: 'VitalGuide is an independent health and wellness review site. Learn about our mission, our team, and how we evaluate products.',
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About VitalGuide — Independent Health Product Reviews',
    description: 'VitalGuide is an independent health and wellness review site. Learn about our mission, our team, and how we evaluate products.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About VitalGuide"
        description="Independent health and wellness product reviews you can trust"
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ]}
      />

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2>Our Mission</h2>
          <p>VitalGuide was created with a simple goal: <strong>help people make informed decisions about health and wellness products</strong> without the noise, marketing hype, or hidden agendas that plague so many review sites.</p>
          <p style={{ marginTop: '1rem' }}>We cover supplements, sleep aids, mental wellness tools, and fitness equipment — the categories where the market is crowded and the stakes for making a bad choice are high. Our job is to cut through the clutter.</p>

          <h2 style={{ marginTop: '2rem' }}>What We Cover</h2>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li><strong>Supplements &amp; Vitamins</strong> — from vitamin D to magnesium, adaptogens to protein powders</li>
            <li><strong>Sleep &amp; Recovery</strong> — sleep trackers, white noise machines, melatonin, and more</li>
            <li><strong>Mental Wellness</strong> — meditation apps, light therapy lamps, nootropics, stress relief tools</li>
            <li><strong>Fitness Equipment</strong> — home gym essentials, resistance bands, cardio equipment, recovery tools</li>
            <li><strong>Trending Health Topics</strong> — in-depth articles on emerging research and popular wellness trends</li>
          </ul>

          <h2 style={{ marginTop: '2rem' }}>How We Stay Independent</h2>
          <p>VitalGuide earns revenue through affiliate commissions (see our <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>). We do <strong>not</strong> accept paid placements, sponsored reviews, or manufacturer-supplied samples in exchange for favorable coverage. Products are selected and ranked based on our research criteria — never because a brand paid for it.</p>

          <h2 style={{ marginTop: '2rem' }}>Our Readers</h2>
          <p>Over 50,000 readers visit VitalGuide each month. They&apos;re health-conscious adults who want reliable information to improve their everyday wellbeing — not fads, not pseudoscience, just honest guidance backed by research.</p>

          <h2 style={{ marginTop: '2rem' }}>Get in Touch</h2>
          <p>Questions, feedback, or press inquiries? We&apos;d love to hear from you. <Link href="/contact">Contact us here.</Link></p>
        </div>
      </section>
    </>
  );
}
