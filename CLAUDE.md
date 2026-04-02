# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

**ONLY the Founding Engineer agent may deploy.** All other agents: do NOT run aws s3 sync, aws cloudfront, or any deployment commands. If you need changes deployed, assign a task to the Founding Engineer.

**Deploy to production** (S3 + CloudFront) — Founding Engineer only:
```bash
# Upload files to S3 (always exclude .claude/ and content/)
aws s3 sync . s3://vitalguide --delete --exclude ".claude/*" --exclude "CLAUDE.md" --exclude "content/*"

# Invalidate CloudFront cache after changes
aws cloudfront create-invalidation --distribution-id E2Z7FA0QPJODC7 --paths "/*"
```

The site is live at **https://vitalguide.life** via:
- S3 bucket: `vitalguide` (us-east-2)
- CloudFront distribution: `E2Z7FA0QPJODC7`
- Route 53 hosted zone: `Z079432616DX8S61HR9MS`

## Architecture

This is a **pure static HTML/CSS site** — no build system, no package manager, no framework. There is no compilation step; edit files and deploy.

**Page types:**
- **Category pages** (`/*.html`) — long-form editorial pages for each health category (supplements, fitness, sports-nutrition, wellness, health-technology). They use `.article-layout` (main + sidebar) with `.article-content` inside, containing product sections with `.product-section` headings and `.btn-amazon` CTAs.
- **Article pages** (`/articles/*.html`) — long-form content using `.article-layout` (main + sidebar) or `.article-content` (single column).

**Shared CSS** (`styles.css`) uses CSS custom properties defined in `:root`. All pages link to this single stylesheet. Category pages link as `href="styles.css"`, article pages as `href="../styles.css"`.

**Internal links** use `.html` extensions in the source (e.g., `href="fitness.html"`). A CloudFront Function (`vitalguide-url-rewrite`) strips the extension at the CDN level so URLs like `/fitness` work publicly.

## Key Conventions

**Amazon affiliate links** must always include `?tag=vitalguide08-20` and use `rel="nofollow sponsored"` and `target="_blank"`. The `.btn-amazon` class styles these CTA buttons.

**Navigation** is duplicated in every file. When adding pages, update the `<nav>` in all existing files. Category pages link with relative paths (`href="supplements.html"`); article pages use `../` prefix (`href="../supplements.html"`).

**Canonical URLs** in `<link rel="canonical">` still reference `vitalguide.com` (the old domain) — these should be updated to `vitalguide.life` when editing pages.

**Product badges** use three colour variants: `.badge-gold`, `.badge-green`, `.badge-terra`.

**Article structured data** (`application/ld+json`) is included on both category pages and article pages (both use `@type: Article` + `BreadcrumbList`).

**Newsletter form** uses `onsubmit="event.preventDefault(); alert('Thanks for subscribing!');"` — there is no backend integration.
