'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import PageHero from '@/components/PageHero';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <PageHero
        title="Contact Us"
        description="We'd love to hear from you"
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Contact', href: '/contact' },
        ]}
      />

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2>Get in Touch</h2>
          <p>Whether you have a question about a product review, spotted an error, want to suggest a topic, or just want to say hello — we welcome your message.</p>

          <div style={{ background: 'var(--white)', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Send a Message</h3>

            {status === 'success' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '1.25rem 1.5rem', color: '#166534', fontWeight: 600 }}>
                Thank you for your message! We&apos;ll get back to you within 2 business days.
              </div>
            )}

            {status === 'error' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1.25rem 1.5rem', color: '#991b1b', fontWeight: 600 }}>
                Something went wrong. Please try again or email us directly at hello@vitalguide.life.
              </div>
            )}

            {status !== 'success' && (
              <form
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                action="https://formsubmit.co/ajax/hello@vitalguide.life"
                method="POST"
                onSubmit={handleSubmit}
              >
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>Your Name</label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Jane Smith"
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'inherit', fontSize: '15px' }}
                    type="text"
                  />
                </div>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>Email Address</label>
                  <input
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'inherit', fontSize: '15px' }}
                    type="email"
                  />
                </div>
                <div>
                  <label htmlFor="subject" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'inherit', fontSize: '15px', background: 'white' }}
                  >
                    <option value="">Select a topic...</option>
                    <option value="product-question">Product question</option>
                    <option value="correction">Correction or inaccuracy</option>
                    <option value="suggestion">Topic suggestion</option>
                    <option value="privacy">Privacy request</option>
                    <option value="press">Press inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>Message</label>
                  <textarea
                    id="message"
                    name="body"
                    placeholder="Your message here..."
                    required
                    rows={5}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <button
                    className="btn btn-primary"
                    style={{ width: 'auto' }}
                    type="submit"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <h2 style={{ marginTop: '2.5rem' }}>Other Ways to Reach Us</h2>
          <p>You can also email us directly at <strong>hello@vitalguide.life</strong>. We aim to respond within 2 business days.</p>

          <h2 style={{ marginTop: '2rem' }}>Common Questions</h2>
          <p><strong>Can I suggest a product for review?</strong><br />Yes! Send us the product name and why you&apos;d like to see it covered.</p>
          <p style={{ marginTop: '1rem' }}><strong>I found a factual error in an article. What should I do?</strong><br />Please let us know immediately. We take accuracy seriously and will correct errors promptly.</p>
          <p style={{ marginTop: '1rem' }}><strong>Do you accept guest posts?</strong><br />We do not currently accept guest submissions, but we are open to editorial partnerships with qualified health professionals.</p>
          <p style={{ marginTop: '1rem' }}><strong>I want to request access to or deletion of my data.</strong><br />See our <Link href="/privacy-policy">Privacy Policy</Link> for details, then contact us with your request.</p>
        </div>
      </section>
    </>
  );
}
