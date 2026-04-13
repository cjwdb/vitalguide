import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How We Review Products — VitalGuide Editorial Methodology',
  description: 'Learn how VitalGuide reviews health and wellness products: our editorial standards, research methodology, selection criteria, independence policy, and expert review process.',
  alternates: {
    canonical: `${SITE_URL}/how-we-review`,
  },
  openGraph: {
    title: 'How We Review Products — VitalGuide Editorial Methodology',
    description: 'Learn how VitalGuide reviews health and wellness products: our editorial standards, research methodology, selection criteria, independence policy, and expert review process.',
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How We Review Products — VitalGuide Editorial Methodology',
    description: 'Learn how VitalGuide reviews health and wellness products: our editorial standards, research methodology, selection criteria, independence policy, and expert review process.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function HowWeReviewPage() {
  return (
    <>
      <PageHero
        title="How We Review"
        description="Our methodology for independent, evidence-based product evaluations"
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'How We Review', href: '/how-we-review' },
        ]}
      />

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '800px' }}>

          {/* Quick Trust Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            <div style={{ background: '#fff', border: '1px solid #e0e4d8', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#x1F52C;</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>Evidence-Based</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Peer-reviewed research cited on every article</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e0e4d8', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#x1F6AB;</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>No Paid Placements</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Rankings are never influenced by brand payments</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e0e4d8', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#x1F504;</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>Regularly Updated</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Content reviewed when new research or products emerge</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e0e4d8', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>&#x2705;</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>Independently Purchased</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>We do not accept free products in exchange for coverage</div>
            </div>
          </div>

          <h2>Our Editorial Team</h2>
          <p>VitalGuide&apos;s content is produced by a dedicated editorial team with backgrounds in health science, nutrition research, and evidence-based medicine. Our research process is led by health and wellness specialists who evaluate clinical literature, product formulations, and real-world user outcomes.</p>

          <div style={{ background: '#f8f9f4', border: '1px solid #e0e4d8', borderRadius: '8px', padding: '20px 24px', margin: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flexShrink: 0, width: '52px', height: '52px', background: 'linear-gradient(135deg, #2d6a4f, #40916c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>&#x1F33F;</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '17px', color: '#1a1a1a', marginBottom: '2px' }}>VitalGuide Editorial Team</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>Health &amp; Wellness Research Specialists</div>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: 0 }}>Our editorial team researches and evaluates health and wellness products using a systematic, evidence-based methodology. We analyze clinical trials, assess ingredient quality and bioavailability, evaluate third-party testing certifications, and synthesize real-world user data to produce recommendations that are accurate, actionable, and trustworthy. Our team reviews each article for scientific accuracy and updates content when new research emerges.</p>
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: '2.5rem' }}>How We Select Products for Review</h2>
          <p>Products are selected based on a combination of the following criteria:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li><strong>Market relevance</strong> — Products with strong consumer interest, high sales volume on major retail platforms, and category significance</li>
            <li><strong>Scientific credibility</strong> — Products where the active ingredients have a meaningful evidence base in peer-reviewed literature</li>
            <li><strong>Consumer question volume</strong> — Topics where readers frequently seek independent guidance to navigate confusing or misleading marketing claims</li>
            <li><strong>Competitive differentiation</strong> — Categories where meaningful differences between products exist and independent analysis adds clear value</li>
          </ul>
          <p>We do <strong>not</strong> select products for review because a brand requests it, offers payment, or provides free samples. Our product selection is entirely editorial-driven.</p>

          <h2 style={{ marginTop: '2.5rem' }}>What We Evaluate</h2>

          <h3 style={{ marginTop: '1.5rem' }}>1. Ingredient Quality &amp; Formulation (Supplements)</h3>
          <p>For supplements, we assess:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>Active ingredient dosages versus research-backed effective doses</li>
            <li>Form of ingredients (e.g., magnesium glycinate vs. magnesium oxide — bioavailability matters)</li>
            <li>Third-party testing certifications (USP, NSF Certified for Sport, Informed Sport, Informed Choice)</li>
            <li>Manufacturing standards: cGMP-compliant facilities, FDA-registered manufacturing</li>
            <li>Presence of unnecessary fillers, proprietary blends that obscure doses, or known allergens</li>
            <li>Certificate of Analysis (CoA) availability and brand transparency</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem' }}>2. Scientific Evidence Review</h3>
          <p>For every health claim, we reference peer-reviewed research from PubMed, NIH databases, the Cochrane Library, and other credible sources. We rate evidence by strength:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li><strong>Strong evidence</strong> — Multiple randomized controlled trials (RCTs) or high-quality meta-analyses support the claim</li>
            <li><strong>Emerging evidence</strong> — Promising preliminary studies exist but larger trials are needed</li>
            <li><strong>Limited evidence</strong> — Early-stage or animal research only; human clinical data is lacking or conflicted</li>
          </ul>
          <p>We are explicit about the strength of evidence for each claim and avoid overstating what the science supports.</p>

          <h3 style={{ marginTop: '1.5rem' }}>3. User Reviews &amp; Real-World Feedback</h3>
          <p>We analyze verified purchaser reviews across major retail platforms to surface real-world usage patterns. Our analysis looks at:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>Overall rating distribution — not just the average score, but the breakdown across 1-5 stars</li>
            <li>Common patterns in complaints and praise across verified purchasers</li>
            <li>Long-term use feedback versus initial impressions</li>
            <li>Reported side effects and tolerability issues</li>
            <li>Discrepancies between marketing claims and reported outcomes</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem' }}>4. Value for Money</h3>
          <p>We calculate cost per serving and cost per effective dose, then compare across products in the same category. A premium-priced product may still represent the best value if ingredient quality, dosing, and third-party testing justify the price. We always explain our value reasoning.</p>

          <h3 style={{ marginTop: '1.5rem' }}>5. Brand Transparency &amp; Trustworthiness</h3>
          <p>We evaluate the brand behind the product:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>Full ingredient label disclosure — no proprietary blends hiding key active doses</li>
            <li>Manufacturing location, certifications, and regulatory compliance</li>
            <li>Clear return, satisfaction, and quality guarantee policies</li>
            <li>Responsiveness to quality or safety concerns raised publicly</li>
            <li>History of FDA warning letters, recalls, or regulatory actions</li>
          </ul>

          <h3 style={{ marginTop: '1.5rem' }}>6. For Equipment &amp; Devices</h3>
          <p>For fitness equipment, wearables, and health technology, we additionally evaluate:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>Build quality, materials, and expected durability</li>
            <li>Accuracy (for measurement devices) relative to clinical reference standards</li>
            <li>Ease of use, setup complexity, and learning curve</li>
            <li>Software, app integration, and data privacy practices</li>
            <li>Warranty coverage and customer service reputation</li>
          </ul>

          <h2 style={{ marginTop: '2.5rem' }}>Our Rating &amp; Ranking Criteria</h2>
          <p>Our editorial rankings are determined by a weighted combination of the above factors, calibrated to the specific category. For supplements, ingredient quality and evidence base carry the highest weight. For equipment, build quality and value carry more weight. We explain our ranking rationale in each article.</p>
          <p>Rankings are <strong>not</strong> influenced by:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>Affiliate commission rates (we earn the same rate regardless of which product ranks #1)</li>
            <li>Brand advertising spend or promotional relationships</li>
            <li>Free product samples or brand outreach requesting coverage</li>
            <li>User voting, social media popularity, or influencer endorsements</li>
          </ul>

          <h2 style={{ marginTop: '2.5rem' }}>Are Products Purchased Independently?</h2>
          <p>Yes. VitalGuide does not accept free products from manufacturers in exchange for coverage or favorable reviews. Products featured in our articles are evaluated based on publicly available information, verified purchaser reviews from retail platforms, published clinical data, and independent laboratory testing information where available.</p>
          <p>We have affiliate relationships with Amazon and other retailers. When you click our links and purchase, we may earn a commission — at no extra cost to you. This revenue supports our editorial operations. However, our affiliate relationships do <strong>not</strong> influence our rankings or recommendations. Our affiliate disclosures are always visible at the top of every page and in our <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.</p>

          <h2 style={{ marginTop: '2.5rem' }}>How Often Is Content Updated?</h2>
          <p>Health research evolves, products change formulations, and new options enter the market regularly. We update our content when:</p>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>New significant clinical research is published that affects our recommendations</li>
            <li>A recommended product changes its formulation, certification status, or availability</li>
            <li>A better product enters the category that merits inclusion or a ranking change</li>
            <li>Readers surface new information through feedback that warrants investigation</li>
          </ul>
          <p>Each article includes a &ldquo;last reviewed&rdquo; or publication date so you can assess its recency.</p>

          <h2 style={{ marginTop: '2.5rem' }}>Expert Consultants &amp; Medical Review</h2>
          <p>For articles covering clinical health conditions, prescription medications, medical devices, or complex biochemistry, we consult with health professionals during the research process. Our editorial team reviews content for scientific accuracy before publication. We note when claims involve areas requiring professional medical judgment and consistently recommend readers consult qualified healthcare providers before making decisions that affect their health.</p>
          <p><strong>Important:</strong> VitalGuide content is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the guidance of your physician or qualified health provider with any questions about a medical condition or supplement regimen.</p>

          <h2 style={{ marginTop: '2.5rem' }}>What We Don&apos;t Do</h2>
          <ul style={{ margin: '1rem 0 1rem 1.5rem', lineHeight: 1.8 }}>
            <li>We do <strong>not</strong> accept paid placements or &ldquo;sponsored&rdquo; rankings</li>
            <li>We do <strong>not</strong> change reviews based on affiliate commission rates</li>
            <li>We do <strong>not</strong> accept free products from manufacturers in exchange for favorable coverage</li>
            <li>We do <strong>not</strong> make medical diagnoses or recommend supplements as treatments for disease</li>
            <li>We do <strong>not</strong> exaggerate evidence — we clearly note when research is preliminary or limited</li>
          </ul>

          <h2 style={{ marginTop: '2.5rem' }}>Questions or Corrections?</h2>
          <p>If you believe something we&apos;ve published is inaccurate, outdated, or missing important context, we want to know. Our goal is to maintain the highest possible standard of accuracy. <Link href="/contact">Contact us here.</Link></p>
        </div>
      </section>
    </>
  );
}
