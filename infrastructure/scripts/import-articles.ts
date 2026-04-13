/**
 * Import articles from static HTML files into the VitalGuide Articles API.
 *
 * Parses each HTML file to extract:
 *   - title (from <h1> in .page-hero)
 *   - sub_title (from og:description meta tag)
 *   - summary (from meta description)
 *   - body (innerHTML of .article-content)
 *   - slug (from filename)
 *   - date (from JSON-LD datePublished)
 *   - time_to_read_in_minutes (from byline text)
 *   - categories (inferred from keywords/content)
 *   - image_url (from JSON-LD image or og:image)
 *
 * Usage:
 *   cd infrastructure
 *   npx ts-node scripts/import-articles.ts --dry-run
 *   npx ts-node scripts/import-articles.ts --api-url https://api.vitalguide.life --credentials admin:password
 */

import * as fs from 'fs';
import * as path from 'path';

const ARTICLES_DIR = path.resolve(__dirname, '../../articles');

const DRY_RUN = process.argv.includes('--dry-run');
const API_URL = getArg('--api-url') || 'https://api.vitalguide.life';
const CREDENTIALS = getArg('--credentials') || process.env.API_CREDENTIALS || '';

// The 17 articles to import
const SLUGS = [
  'acupressure-mat-guide',
  'based-bodyworks-review',
  'berberine-glp1',
  'best-adjustable-dumbbells',
  'best-creatine-monohydrate',
  'best-multivitamin-men',
  'best-sleep-trackers',
  'cgm-guide',
  'l-citrulline-performance',
  'mindfulness-guide',
  'mouth-taping-sleep',
  'nmn-nad-supplements',
  'shilajit-benefits',
  'taurine-benefits',
  'testosterone-optimization',
  'urolithin-a-supplements',
  'vo2-max-training',
];

// Category inference from slug keywords
const CATEGORY_MAP: Record<string, string[]> = {
  'acupressure-mat-guide': ['wellness'],
  'based-bodyworks-review': ['wellness'],
  'berberine-glp1': ['supplements'],
  'best-adjustable-dumbbells': ['fitness'],
  'best-creatine-monohydrate': ['sports-nutrition'],
  'best-multivitamin-men': ['supplements'],
  'best-sleep-trackers': ['health-technology', 'sleep'],
  'cgm-guide': ['health-technology'],
  'l-citrulline-performance': ['sports-nutrition', 'supplements'],
  'mindfulness-guide': ['mental-wellness'],
  'mouth-taping-sleep': ['sleep'],
  'nmn-nad-supplements': ['supplements'],
  'shilajit-benefits': ['supplements'],
  'taurine-benefits': ['supplements'],
  'testosterone-optimization': ['supplements', 'fitness'],
  'urolithin-a-supplements': ['supplements'],
  'vo2-max-training': ['fitness'],
};

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function extractBetween(html: string, startMarker: string, endMarker: string): string {
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return '';
  const contentStart = startIdx + startMarker.length;
  const endIdx = html.indexOf(endMarker, contentStart);
  if (endIdx === -1) return '';
  return html.substring(contentStart, endIdx);
}

function extractMeta(html: string, attr: string, value: string): string {
  // Handles both content="..." and name/property ordering variants
  const patterns = [
    new RegExp(`<meta\\s+${attr}="${value}"\\s+content="([^"]*)"`, 'i'),
    new RegExp(`<meta\\s+content="([^"]*)"\\s+${attr}="${value}"`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeHtmlEntities(m[1]);
  }
  return '';
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractJsonLd(html: string, type: string): Record<string, any> | null {
  const re = /<script\s+type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === type) return data;
    } catch {
      // skip malformed JSON-LD
    }
  }
  return null;
}

function extractTitle(html: string): string {
  // Try h1 inside page-hero
  const heroMatch = html.match(/<div class="page-hero-inner">[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (heroMatch) return decodeHtmlEntities(heroMatch[1].replace(/<[^>]+>/g, '').trim());

  // Fallback: first h1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (h1Match) return decodeHtmlEntities(h1Match[1].replace(/<[^>]+>/g, '').trim());

  return '';
}

function extractReadingTime(html: string): number {
  // Look for "X min read" in the hero byline
  const m = html.match(/(\d+)\s*min\s*read/i);
  return m ? parseInt(m[1], 10) : 8; // default 8 min
}

function extractArticleBody(html: string): string {
  // Extract content between <div class="article-content"...> and the closing </div>
  // that precedes </main>
  const startRe = /<div\s+class="article-content"[^>]*>/;
  const startMatch = startRe.exec(html);
  if (!startMatch) return '';

  const contentStart = startMatch.index + startMatch[0].length;

  // Find </main> and work backwards to find the matching </div>
  const mainEndIdx = html.indexOf('</main>', contentStart);
  if (mainEndIdx === -1) return '';

  // The article-content div closes right before </main>
  // Find the last </div> before </main>
  const section = html.substring(contentStart, mainEndIdx);

  // The content is everything inside the article-content div.
  // We need to find the matching closing </div> by tracking depth.
  let depth = 1;
  let pos = 0;
  const fullHtml = html.substring(contentStart);

  while (depth > 0 && pos < fullHtml.length) {
    const nextOpen = fullHtml.indexOf('<div', pos);
    const nextClose = fullHtml.indexOf('</div>', pos);

    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return fullHtml.substring(0, nextClose).trim();
      }
      pos = nextClose + 6;
    }
  }

  // Fallback: return everything up to </main>
  return section.replace(/<\/div>\s*$/, '').trim();
}

interface ArticlePayload {
  slug: string;
  title: string;
  sub_title: string;
  summary: string;
  body: string;
  image_url: string;
  categories: string[];
  date: string;
  time_to_read_in_minutes: number;
}

function parseArticle(slug: string, html: string): ArticlePayload {
  const jsonLd = extractJsonLd(html, 'Article');

  const title = extractTitle(html);
  const summary = extractMeta(html, 'name', 'description');
  const subTitle = extractMeta(html, 'property', 'og:description');
  const imageUrl = jsonLd?.image || extractMeta(html, 'property', 'og:image') || '';
  const date = jsonLd?.datePublished || '';
  const readingTime = extractReadingTime(html);
  const body = extractArticleBody(html);
  const categories = CATEGORY_MAP[slug] || [];

  return {
    slug,
    title,
    sub_title: subTitle,
    summary,
    body,
    image_url: imageUrl,
    categories,
    date,
    time_to_read_in_minutes: readingTime,
  };
}

async function postArticle(article: ArticlePayload): Promise<{ id: string } | null> {
  const auth = Buffer.from(CREDENTIALS).toString('base64');

  const res = await fetch(`${API_URL}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(article),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`    API error ${res.status}: ${text}`);
    return null;
  }

  return res.json() as Promise<{ id: string }>;
}

async function main() {
  if (!DRY_RUN && !CREDENTIALS) {
    console.error('Error: --credentials user:pass or API_CREDENTIALS env var required');
    process.exit(1);
  }

  console.log(`Importing ${SLUGS.length} articles from ${ARTICLES_DIR}`);
  console.log(`API: ${API_URL}`);
  if (DRY_RUN) console.log('(DRY RUN — no API calls will be made)\n');
  else console.log('');

  let success = 0;
  let failed = 0;

  for (const slug of SLUGS) {
    const filePath = path.join(ARTICLES_DIR, `${slug}.html`);

    if (!fs.existsSync(filePath)) {
      console.log(`  MISS  ${slug} — file not found: ${filePath}`);
      failed++;
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const article = parseArticle(slug, html);

    if (!article.title) {
      console.log(`  FAIL  ${slug} — could not extract title`);
      failed++;
      continue;
    }

    if (!article.body) {
      console.log(`  FAIL  ${slug} — could not extract body content`);
      failed++;
      continue;
    }

    const bodyPreview = article.body.substring(0, 80).replace(/\n/g, ' ') + '...';

    if (DRY_RUN) {
      console.log(`  READY ${slug}`);
      console.log(`        title:      "${article.title}"`);
      console.log(`        date:       ${article.date}`);
      console.log(`        categories: [${article.categories.join(', ')}]`);
      console.log(`        read time:  ${article.time_to_read_in_minutes} min`);
      console.log(`        body:       ${bodyPreview}`);
      console.log(`        summary:    "${article.summary.substring(0, 80)}..."`);
      console.log('');
      success++;
      continue;
    }

    const result = await postArticle(article);
    if (result) {
      console.log(`  OK    ${slug} → id: ${result.id}`);
      success++;
    } else {
      console.log(`  FAIL  ${slug} — API call failed`);
      failed++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`  Total:     ${SLUGS.length}`);
  console.log(`  Success:   ${success}`);
  console.log(`  Failed:    ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
