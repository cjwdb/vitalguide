import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-disclosure">
          <strong>Affiliate Disclosure:</strong> VitalGuide is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. When you click our Amazon links and make a purchase, we may earn a small commission at no extra cost to you. This helps support our independent reviews.
        </div>
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🌿</div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--white)' }}>Vital<span style={{ color: 'var(--marigold)' }}>Guide</span></span>
            </div>
            <p>Independent reviews and comparisons of health and wellbeing products to help you live better every day.</p>
          </div>
          <div>
            <h4>Categories</h4>
            <ul>
              <li><Link href="/supplements">Vitamins &amp; Supplements</Link></li>
              <li><Link href="/fitness">Fitness Equipment</Link></li>
              <li><Link href="/sports-nutrition">Sports Nutrition</Link></li>
              <li><Link href="/wellness">Wellness &amp; Relaxation</Link></li>
              <li><Link href="/health-technology">Health Technology</Link></li>
            </ul>
          </div>
          <div>
            <h4>Articles</h4>
            <ul>
              <li><Link href="/articles/immune-support">Immune Support</Link></li>
              <li><Link href="/articles/improve-sleep">Better Sleep Guide</Link></li>
              <li><Link href="/articles/mindfulness-guide">Mindfulness Science</Link></li>
              <li><Link href="/articles/home-gym-guide">Home Gym Guide</Link></li>
              <li><Link href="/articles/red-light-therapy">Red Light Therapy</Link></li>
              <li><Link href="/articles/berberine-glp1">Berberine &amp; GLP-1</Link></li>
            </ul>
          </div>
          <div>
            <h4>About</h4>
            <ul>
              <li><Link href="/about">About VitalGuide</Link></li>
              <li><Link href="/how-we-review">How We Review</Link></li>
              <li><Link href="/affiliate-disclosure">Affiliate Disclosure</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 VitalGuide. All rights reserved.</span>
          <span>Made with 💚 for health enthusiasts</span>
        </div>
      </div>
    </footer>
  );
}
