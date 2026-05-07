# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For full architecture details and a complete AWS resource inventory, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Deployment

**ONLY the Founding Engineer agent may deploy.** All other agents: do NOT run aws s3 sync, aws cloudfront, or any deployment commands. If you need changes deployed, assign a task to the Founding Engineer.

**Deploy to production** (S3 + CloudFront) — Founding Engineer only:
```bash
# Step 1: Sync DOWN from S3 first to pick up any files added by other agents
aws s3 sync s3://vitalguide . --exclude ".claude/*" --exclude "CLAUDE.md" --exclude "content/*" --exclude "web/*" --exclude ".git/*"

# Step 2: Upload files to S3 (add/update only — never deletes remote files)
aws s3 sync . s3://vitalguide --exclude ".claude/*" --exclude "CLAUDE.md" --exclude "content/*" --exclude "web/*" --exclude ".git/*" --exclude "ARCHITECTURE.md"

# Step 3: Invalidate CloudFront cache after changes
aws cloudfront create-invalidation --distribution-id E2Z7FA0QPJODC7 --paths "/*"
```

**Clean deploy** (removes orphaned S3 files — use only when intentionally deleting content):
```bash
# DANGER: This deletes any S3 file not present locally. Only use after syncing down first.
aws s3 sync . s3://vitalguide --delete --exclude ".claude/*" --exclude "CLAUDE.md" --exclude "content/*" --exclude "web/*" --exclude ".git/*" --exclude "ARCHITECTURE.md"
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

**Internal links** do NOT use `.html` extensions (e.g., `href="fitness"` not `href="fitness.html"`). A CloudFront Function (`vitalguide-url-rewrite`) appends `.html` when fetching from S3 so URLs like `/fitness` work publicly. Home links use `href="/"`.

## Key Conventions

**Amazon affiliate links** must always include `?tag=vitalguide08-20` and use `rel="nofollow sponsored"` and `target="_blank"`. The `.btn-amazon` class styles these CTA buttons.

**Navigation** is duplicated in every file. When adding pages, update the `<nav>` in all existing files. Category pages link with relative paths (`href="supplements"`); article pages use `../` prefix (`href="../supplements"`).

**Canonical URLs** in `<link rel="canonical">` still reference `vitalguide.com` (the old domain) — these should be updated to `vitalguide.life` when editing pages.

**Product badges** use three colour variants: `.badge-gold`, `.badge-green`, `.badge-terra`.

**Article structured data** (`application/ld+json`) is included on both category pages and article pages (both use `@type: Article` + `BreadcrumbList`).

**Newsletter form** uses `onsubmit="event.preventDefault(); alert('Thanks for subscribing!');"` — there is no backend integration.

## New Article Checklist

When creating a new article HTML file in `articles/`, you **must** also update these files in the same change:
1. **`articles/index.html`** — add a `<a class="blog-post">` entry and update the sidebar category counts.
2. **`sitemap.xml`** — add a `<url>` entry with the article's URL, today's date as `<lastmod>`, `<changefreq>monthly</changefreq>`, and `<priority>0.7</priority>`.
