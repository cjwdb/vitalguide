/**
 * Backfill script: sets the `slug` field on all articles in the
 * vitalguide_articles DynamoDB table.
 *
 * Strategy:
 *   1. Scan every article from DynamoDB.
 *   2. For each article, derive a slug from its title using the same
 *      slugification logic as the static filenames.
 *   3. Match against the known set of 54 slugs (from /articles/*.html).
 *   4. Write the slug back via UpdateItem.
 *
 * Usage:
 *   cd infrastructure
 *   npx ts-node scripts/backfill-slugs.ts
 *
 * Options:
 *   --dry-run   Print what would be updated without writing to DynamoDB.
 *   --region    AWS region (default: us-east-1)
 */

import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const TABLE_NAME = 'vitalguide_articles';
const REGION = process.argv.includes('--region')
  ? process.argv[process.argv.indexOf('--region') + 1]
  : 'us-east-1';
const DRY_RUN = process.argv.includes('--dry-run');

// All known article slugs from /articles/*.html (excluding index)
const KNOWN_SLUGS = new Set([
  'acupressure-mat-guide',
  'apigenin-sleep-longevity',
  'ashwagandha-stress',
  'based-bodyworks-review',
  'berberine-glp1',
  'best-adjustable-dumbbells',
  'best-creatine-monohydrate',
  'best-magnesium-sleep',
  'best-multivitamin-men',
  'best-protein-powder',
  'best-sleep-trackers',
  'best-vitamin-d-supplement',
  'beta-alanine-performance',
  'breathwork-anxiety',
  'caffeine-athletic-performance',
  'cgm-guide',
  'chronotype-sleep-optimization',
  'cold-plunge-guide',
  'collagen-peptides',
  'colostrum-supplements',
  'creatine-brain-health',
  'dopamine-detox-guide',
  'electrolyte-supplements',
  'gut-health-probiotics',
  'home-gym-guide',
  'immune-support',
  'improve-sleep',
  'intermittent-fasting',
  'l-citrulline-performance',
  'lions-mane-mushroom',
  'longevity-supplements',
  'magnesium-guide',
  'mindfulness-guide',
  'mouth-taping-sleep',
  'nmn-nad-supplements',
  'omega-3-fish-oil',
  'oura-vs-whoop-comparison',
  'post-workout-recovery',
  'red-light-therapy',
  'rhodiola-rosea',
  'rucking-benefits',
  'sauna-benefits',
  'shilajit-benefits',
  'sleep-debt-recovery',
  'smart-scales-guide',
  'spermidine-supplements',
  'strength-training-for-women',
  'taurine-benefits',
  'testosterone-optimization',
  'tongkat-ali-benefits',
  'urolithin-a-supplements',
  'vitamin-d3-k2',
  'vo2-max-training',
  'zone-2-cardio',
]);

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Try progressively shorter versions of the slug to find a match
function findMatchingSlug(title: string): string | null {
  const slug = toSlug(title);

  // Exact match
  if (KNOWN_SLUGS.has(slug)) return slug;

  // Try matching by substring — find the known slug that best matches the title
  for (const known of KNOWN_SLUGS) {
    // Check if the title-derived slug starts with or contains the known slug
    if (slug.startsWith(known) || slug.includes(known)) return known;
  }

  // Try the other direction: known slug is a prefix of the derived slug
  for (const known of KNOWN_SLUGS) {
    if (known.startsWith(slug)) return known;
  }

  // Check for key words from the title in known slugs
  const words = slug.split('-').filter((w) => w.length > 3);
  for (const known of KNOWN_SLUGS) {
    const matchCount = words.filter((w) => known.includes(w)).length;
    if (matchCount >= 2) return known;
  }

  return null;
}

async function main() {
  const client = new DynamoDBClient({ region: REGION });

  console.log(`Scanning ${TABLE_NAME} in ${REGION}...`);
  if (DRY_RUN) console.log('(DRY RUN — no writes will be made)\n');

  // Scan all articles
  const articles: Array<{ id: string; title: string; slug?: string }> = [];
  let lastKey: Record<string, any> | undefined;

  do {
    const result = await client.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastKey,
      }),
    );
    for (const item of result.Items || []) {
      const unmarshalled = unmarshall(item) as any;
      articles.push({
        id: unmarshalled.id,
        title: unmarshalled.title,
        slug: unmarshalled.slug,
      });
    }
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  console.log(`Found ${articles.length} articles\n`);

  const usedSlugs = new Set<string>();
  let updated = 0;
  let skipped = 0;
  let unmatched = 0;

  for (const article of articles) {
    // Skip if already has a slug
    if (article.slug) {
      console.log(`  SKIP  ${article.id} — already has slug: "${article.slug}"`);
      usedSlugs.add(article.slug);
      skipped++;
      continue;
    }

    const matchedSlug = findMatchingSlug(article.title);

    if (!matchedSlug) {
      console.log(`  ????  ${article.id} — NO MATCH for title: "${article.title}"`);
      console.log(`        derived slug: "${toSlug(article.title)}"`);
      unmatched++;
      continue;
    }

    if (usedSlugs.has(matchedSlug)) {
      console.log(`  DUPE  ${article.id} — slug "${matchedSlug}" already used, skipping`);
      unmatched++;
      continue;
    }

    usedSlugs.add(matchedSlug);

    if (DRY_RUN) {
      console.log(`  WOULD ${article.id} — "${article.title}" → "${matchedSlug}"`);
    } else {
      await client.send(
        new UpdateItemCommand({
          TableName: TABLE_NAME,
          Key: { id: { S: article.id } },
          UpdateExpression: 'SET slug = :slug, updatedAt = :now',
          ExpressionAttributeValues: {
            ':slug': { S: matchedSlug },
            ':now': { S: new Date().toISOString() },
          },
        }),
      );
      console.log(`  SET   ${article.id} — "${article.title}" → "${matchedSlug}"`);
    }
    updated++;
  }

  // Report unmatched known slugs
  const unmatchedKnown = [...KNOWN_SLUGS].filter((s) => !usedSlugs.has(s));

  console.log('\n--- Summary ---');
  console.log(`  Total articles:  ${articles.length}`);
  console.log(`  Updated:         ${updated}`);
  console.log(`  Skipped (exist): ${skipped}`);
  console.log(`  Unmatched:       ${unmatched}`);

  if (unmatchedKnown.length > 0) {
    console.log(`\n  Known slugs with no matching article (${unmatchedKnown.length}):`);
    for (const s of unmatchedKnown.sort()) {
      console.log(`    - ${s}`);
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
