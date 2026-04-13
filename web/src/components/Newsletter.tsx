'use client';

export default function Newsletter() {
  return (
    <section className="newsletter">
      <h2>Get Weekly Wellness Tips</h2>
      <p>Join 50,000+ readers who get our expert health insights delivered every Monday.</p>
      <form
        className="newsletter-form"
        onSubmit={(e) => {
          e.preventDefault();
          alert('Thanks for subscribing!');
        }}
      >
        <input type="email" placeholder="Enter your email" required />
        <button className="btn btn-primary" type="submit">Subscribe</button>
      </form>
    </section>
  );
}
