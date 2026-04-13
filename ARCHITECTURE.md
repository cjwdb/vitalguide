# VitalGuide Architecture & Infrastructure

This document is written for AI agents working in this repository. It covers the full stack: the static frontend, backend APIs, and every named AWS resource.

---

## Overview

VitalGuide is a health & wellness affiliate site live at **https://vitalguide.life**.

The system has two layers:

| Layer | What it is | Where it lives |
|-------|-----------|---------------|
| **Frontend** | Pure static HTML/CSS, no build step | S3 + CloudFront |
| **Backend** | REST APIs for products & articles | Lambda + API Gateway + DynamoDB |

Both layers share the same Route 53 hosted zone and use ACM certificates for TLS.

---

## AWS Account

- **Account ID:** `249608714856`
- **Primary region for APIs:** `us-east-1`
- **Region for S3 bucket:** `us-east-2`

---

## Frontend: Static Site

### How it is built

No build system, no framework, no package manager. HTML/CSS only. Edit files in `/Users/openclaw/git/vitalguide` and sync directly to S3.

**Page structure:**

| Type | Pattern | Layout |
|------|---------|--------|
| Home | `index.html` | Custom hero layout |
| Category pages | `/*.html` | `.article-layout` (main + sidebar) |
| Article pages | `/articles/*.html` | `.article-layout` or single-column |
| Static info | `about.html`, `privacy-policy.html`, etc. | Simple |

### Shared assets

- `styles.css` — single stylesheet with CSS custom properties in `:root`
- `analytics.js` — analytics script included on all pages
- `favicon.ico` / `favicon.svg` — site icons
- `og-image.png` — Open Graph image
- `robots.txt` — search engine directives
- `sitemap.xml` — sitemap for SEO

### How it is deployed

```bash
# 1. Sync to S3 (excludes agent workspace files)
aws s3 sync . s3://vitalguide --delete \
  --exclude ".claude/*" \
  --exclude "CLAUDE.md" \
  --exclude "content/*"

# 2. Bust the CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E2Z7FA0QPJODC7 \
  --paths "/*"
```

**ONLY the Founding Engineer agent may run these commands.** All other agents must assign deploy tasks to the Founding Engineer.

---

## AWS Resources: Frontend

### S3 Bucket

| Property | Value |
|----------|-------|
| Bucket name | `vitalguide` |
| Region | `us-east-2` |
| Purpose | Static file host; serves HTML, CSS, images |
| Access | Private — served exclusively via CloudFront |

### CloudFront Distribution

| Property | Value |
|----------|-------|
| Distribution ID | `E2Z7FA0QPJODC7` |
| Domain | `vitalguide.life` (and `www.vitalguide.life` → 301 redirect) |
| Origin | `vitalguide` S3 bucket (us-east-2) |
| TLS | ACM certificate for `vitalguide.life` |
| Cache | Invalidated on every deploy with `--paths "/*"` |

**CloudFront Function:** `vitalguide-url-rewrite` (source: `cloudfront-function.js`)

This function runs on every viewer request and handles URL rewriting:

| Rule | Behaviour |
|------|-----------|
| `www.*` host | 301 redirect to `https://vitalguide.life` |
| `/` | Rewrites to `/index.html` |
| URI with trailing `/` | Appends `index.html` (e.g. `/articles/` → `/articles/index.html`) |
| Known directory paths (e.g. `/articles`) | Appends `/index.html` |
| `*.html` URIs (except static info pages) | 301 redirect to extensionless URL |
| No extension | Appends `.html` so S3 can serve the file |

Static info pages that **keep** `.html` in their URL: `/about.html`, `/privacy-policy.html`, `/affiliate-disclosure.html`, `/how-we-review.html`, `/contact.html`.

### Route 53 Hosted Zone

| Property | Value |
|----------|-------|
| Hosted zone ID | `Z079432616DX8S61HR9MS` |
| Zone name | `vitalguide.life` |
| Records | A alias → CloudFront, A alias → `api.vitalguide.life` (API Gateway) |

---

## Backend: REST APIs

All backend infrastructure is managed with **AWS CDK** (TypeScript) located in `infrastructure/`.

### CDK Stacks

| Stack | Description | Region |
|-------|-------------|--------|
| `VitalguideProductsStack` | Products DynamoDB + Lambda + API Gateway | `us-east-1` |
| `VitalguideArticlesStack` | Articles DynamoDB + Lambda + API Gateway | `us-east-1` |
| `VitalguideApiDomainStack` | ACM cert + custom domain + Route53 for `api.vitalguide.life` | `us-east-1` |

### API Custom Domain

| Property | Value |
|----------|-------|
| Domain | `api.vitalguide.life` |
| Endpoint type | REGIONAL |
| TLS | ACM certificate (DNS-validated via Route 53) |
| `/products` path | → `VitalguideProductsApi` |
| `/articles` path | → `VitalguideArticlesApi` |

### Authentication

All API endpoints use **HTTP Basic Authentication**. Credentials are passed to Lambda as the `BASIC_AUTH_CREDENTIALS` environment variable (`username:password` format). Set this at deploy time via the CDK context key `basicAuthCredentials` or the environment variable `BASIC_AUTH_CREDENTIALS`.

---

## AWS Resources: Products API

### DynamoDB Table — Products

| Property | Value |
|----------|-------|
| Table name | `vitalguide_products` |
| Region | `us-east-1` |
| Partition key | `id` (String, UUID) |
| Billing mode | PAY_PER_REQUEST (on-demand) |
| Removal policy | RETAIN (table is not deleted if stack is destroyed) |

**Item schema:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | Auto-generated |
| `name` | string | Product name |
| `description` | string | Product description |
| `affiliate_link` | string | Full affiliate URL including `?tag=vitalguide08-20` |
| `image_url` | string | Product image URL |
| `categories` | string[] | e.g. `["supplements", "sleep"]` |
| `article_ids` | string[] | IDs of related articles |
| `rating` | number | e.g. `4.8` |
| `reviews` | number | Review count |
| `best_rating` | number | Max rating (default 5) |
| `worst_rating` | number | Min rating (default 1) |
| `createdAt` | ISO 8601 string | Set on creation |
| `updatedAt` | ISO 8601 string | Updated on every write |

### Lambda Functions — Products

All functions: **ARM64**, **Node.js 22**, **256 MB memory**, **10 s timeout**, bundled with `esbuild`.

| Function name | Handler file | HTTP method | Path |
|--------------|-------------|-------------|------|
| `vitalguide-products-list` | `list.ts` | GET | `/products` |
| `vitalguide-products-post` | `post.ts` | POST | `/products` |
| `vitalguide-products-get` | `get.ts` | GET | `/products/{id}` |
| `vitalguide-products-update` | `update.ts` | PUT | `/products/{id}` |
| `vitalguide-products-patch` | `patch.ts` | PATCH | `/products/{id}` |
| `vitalguide-products-delete` | `delete.ts` | DELETE | `/products/{id}` |

Source: `infrastructure/lambda/*.ts`

### API Gateway — Products

| Property | Value |
|----------|-------|
| API name | `vitalguide-products-api` |
| Stage | `prod` |
| CORS | `*` (all origins, all methods) |
| Direct URL | `https://<id>.execute-api.us-east-1.amazonaws.com/prod` |
| Custom domain path | `https://api.vitalguide.life/products` |

---

## AWS Resources: Articles API

### DynamoDB Table — Articles

| Property | Value |
|----------|-------|
| Table name | `vitalguide_articles` |
| Region | `us-east-1` |
| Partition key | `id` (String, UUID) |
| Billing mode | PAY_PER_REQUEST (on-demand) |
| Removal policy | RETAIN |

**Item schema:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | Auto-generated |
| `title` | string | Article title |
| `sub_title` | string | Subtitle |
| `summary` | string | Short summary |
| `body` | string | Full article body (HTML or Markdown) |
| `image_url` | string | Featured image URL |
| `categories` | string[] | e.g. `["supplements", "sleep"]` |
| `date` | string | Publication date e.g. `"2026-04-01"` |
| `time_to_read_in_minutes` | number | Estimated read time |
| `createdAt` | ISO 8601 string | Set on creation |
| `updatedAt` | ISO 8601 string | Updated on every write |

### Lambda Functions — Articles

All functions: **ARM64**, **Node.js 22**, **256 MB memory**, **10 s timeout**, bundled with `esbuild`.

| Function name | Handler file | HTTP method | Path |
|--------------|-------------|-------------|------|
| `vitalguide-articles-list` | `list.ts` | GET | `/articles` |
| `vitalguide-articles-post` | `post.ts` | POST | `/articles` |
| `vitalguide-articles-get` | `get.ts` | GET | `/articles/{id}` |
| `vitalguide-articles-update` | `update.ts` | PUT | `/articles/{id}` |
| `vitalguide-articles-patch` | `patch.ts` | PATCH | `/articles/{id}` |
| `vitalguide-articles-delete` | `delete.ts` | DELETE | `/articles/{id}` |

Source: `infrastructure/lambda/articles/*.ts`

### API Gateway — Articles

| Property | Value |
|----------|-------|
| API name | `vitalguide-articles-api` |
| Stage | `prod` |
| CORS | `*` (all origins, all methods) |
| Custom domain path | `https://api.vitalguide.life/articles` |

---

## Infrastructure as Code (CDK)

Location: `infrastructure/`

```
infrastructure/
├── bin/
│   └── infrastructure.ts       # CDK app entrypoint — instantiates all stacks
├── lib/
│   ├── infrastructure-stack.ts # VitalguideProductsStack
│   ├── articles-stack.ts       # VitalguideArticlesStack
│   └── api-domain-stack.ts     # VitalguideApiDomainStack
├── lambda/
│   ├── auth.ts                 # Shared Basic Auth helper (products)
│   ├── post.ts / get.ts / ...  # Products CRUD handlers
│   └── articles/
│       ├── auth.ts             # Shared Basic Auth helper (articles)
│       └── post.ts / get.ts / ... # Articles CRUD handlers
├── docs/
│   └── api.md                  # API reference documentation
├── cdk.json                    # CDK configuration
└── package.json
```

**To deploy backend infrastructure:**

```bash
cd infrastructure
npm run build        # compile TypeScript
npx cdk diff         # preview changes
npx cdk deploy --all # deploy all stacks
```

Set credentials before deploying:

```bash
export BASIC_AUTH_CREDENTIALS="username:securepassword"
npx cdk deploy --all
```

---

## Content Directory

The `content/` directory is **excluded from S3 sync** and never deployed. It is used for local drafts, raw source material, and working files for AI agents generating page content.

---

## Key Conventions for AI Agents

- **Affiliate links** must include `?tag=vitalguide08-20` and have `rel="nofollow sponsored"` and `target="_blank"`. Use the `.btn-amazon` CSS class.
- **Navigation** is duplicated across every HTML file. When adding a new page, update `<nav>` in all files. Category pages use relative paths (`href="supplements"`); article pages use `../` prefix.
- **Canonical URLs** in `<link rel="canonical">` should use `vitalguide.life` (not the old `vitalguide.com` domain).
- **Product badges:** `.badge-gold`, `.badge-green`, `.badge-terra`.
- **Structured data:** `application/ld+json` with `@type: Article` + `BreadcrumbList` on all editorial pages.
- **Newsletter form:** client-side only — `onsubmit="event.preventDefault(); alert('Thanks for subscribing!');"` — no backend.
- **No build step:** changes to HTML/CSS are live after the next S3 sync + CloudFront invalidation.
