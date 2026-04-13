'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="nav-logo" href="/">
          <div className="nav-logo-icon">🌿</div>
          <span className="nav-logo-text">Vital<span>Guide</span></span>
        </Link>
        <ul className={`nav-links${open ? ' open' : ''}`}>
          <li><Link href="/supplements" onClick={() => setOpen(false)}>Supplements</Link></li>
          <li><Link href="/fitness" onClick={() => setOpen(false)}>Fitness</Link></li>
          <li><Link href="/sports-nutrition" onClick={() => setOpen(false)}>Sports Nutrition</Link></li>
          <li><Link href="/wellness" onClick={() => setOpen(false)}>Wellness</Link></li>
          <li><Link href="/health-technology" onClick={() => setOpen(false)}>Health Tech</Link></li>
          <li><Link href="/sleep" onClick={() => setOpen(false)}>Sleep</Link></li>
          <li><Link href="/mental-wellness" onClick={() => setOpen(false)}>Mental Wellness</Link></li>
          <li><Link className="nav-cta" href="/articles" onClick={() => setOpen(false)}>Articles</Link></li>
        </ul>
        <button
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          &#9776;
        </button>
      </div>
    </nav>
  );
}
