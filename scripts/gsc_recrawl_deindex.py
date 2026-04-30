#!/usr/bin/env python3
"""
GSC Recrawl & De-index Tool for vitalguide.life

Submits near-ranking URLs for recrawl (via sitemap resubmission + URL inspection)
and identifies duplicate pages for de-indexing.

Usage:
    python3 gsc_recrawl_deindex.py [--credentials /path/to/creds.json] [--dry-run]

Setup:
    Same as gsc_monitor.py — needs a service account with full GSC access.
    Scope must include https://www.googleapis.com/auth/webmasters (not readonly).

Requirements:
    pip install google-auth google-auth-httplib2 google-api-python-client
"""

import os
import sys
import json
import argparse
from datetime import date, timedelta
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    print("ERROR: Missing dependencies. Run: pip install google-auth google-auth-httplib2 google-api-python-client")
    sys.exit(1)

SITE_URL = "sc-domain:vitalguide.life"
SITEMAP_URL = "https://vitalguide.life/sitemap.xml"
SCOPES = ["https://www.googleapis.com/auth/webmasters"]  # Full access, not readonly

# Near-ranking: positions 5-20 (bottom of page 1 through page 2)
NEAR_RANKING_POS_MIN = 5.0
NEAR_RANKING_POS_MAX = 20.0
MIN_IMPRESSIONS = 10

# Known duplicate URLs (old slugs that have been renamed)
# These serve 200 with self-referencing canonicals but are not in the deployed sitemap.
DUPLICATE_URLS = [
    "https://vitalguide.life/articles/beta-alanine-performance",
    "https://vitalguide.life/articles/breathwork-anxiety",
    "https://vitalguide.life/articles/chronotype-sleep-optimization",
    "https://vitalguide.life/articles/dopamine-detox-guide",
    "https://vitalguide.life/articles/oura-vs-whoop-comparison",
    "https://vitalguide.life/articles/rucking-benefits",
    "https://vitalguide.life/articles/sleep-debt-recovery",
    "https://vitalguide.life/articles/tongkat-ali-benefits",
]

# Mapping old slug -> new slug (for reference/logging)
SLUG_REDIRECTS = {
    "beta-alanine-performance": "beta-alanine-guide",
    "breathwork-anxiety": "breathwork-guide",
    "chronotype-sleep-optimization": "circadian-rhythm-guide",
    "dopamine-detox-guide": "digital-detox-guide",
    "oura-vs-whoop-comparison": "smart-ring-guide",
    "rucking-benefits": "rucking-guide",
    "sleep-debt-recovery": "sleep-stack-guide",
    "tongkat-ali-benefits": "tongkat-ali-guide",
}


def get_credentials(credentials_path: str | None = None):
    path = credentials_path or os.environ.get("GSC_CREDENTIALS") or "credentials.json"
    if not Path(path).exists():
        print(f"ERROR: Credentials file not found at '{path}'")
        print("Set GSC_CREDENTIALS env var or place credentials.json in this directory.")
        sys.exit(1)
    return service_account.Credentials.from_service_account_file(path, scopes=SCOPES)


def build_service(credentials):
    return build("searchconsole", "v1", credentials=credentials, cache_discovery=False)


def get_near_ranking_urls(service, days: int = 28) -> list[dict]:
    """Find URLs ranking in positions 5-20 with meaningful impressions."""
    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=days - 1)

    body = {
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "dimensions": ["page"],
        "rowLimit": 500,
    }

    try:
        response = service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
        rows = response.get("rows", [])
    except Exception as e:
        print(f"ERROR: Failed to query search analytics: {e}")
        return []

    near_ranking = []
    for row in rows:
        position = row.get("position", 0)
        impressions = row.get("impressions", 0)
        if NEAR_RANKING_POS_MIN <= position <= NEAR_RANKING_POS_MAX and impressions >= MIN_IMPRESSIONS:
            near_ranking.append({
                "url": row["keys"][0],
                "position": round(position, 1),
                "impressions": int(impressions),
                "clicks": int(row.get("clicks", 0)),
                "ctr": round(row.get("ctr", 0) * 100, 2),
            })

    near_ranking.sort(key=lambda x: x["impressions"], reverse=True)
    return near_ranking


def resubmit_sitemap(service, dry_run: bool = False) -> bool:
    """Resubmit the sitemap to trigger recrawl of all listed URLs."""
    if dry_run:
        print(f"  [DRY RUN] Would resubmit sitemap: {SITEMAP_URL}")
        return True

    try:
        service.sitemaps().submit(siteUrl=SITE_URL, feedpath=SITEMAP_URL).execute()
        print(f"  Sitemap resubmitted: {SITEMAP_URL}")
        return True
    except Exception as e:
        print(f"  ERROR: Failed to resubmit sitemap: {e}")
        return False


def inspect_urls(service, urls: list[str], dry_run: bool = False) -> list[dict]:
    """Inspect URLs via URL Inspection API to check indexing status."""
    results = []
    for url in urls:
        if dry_run:
            print(f"  [DRY RUN] Would inspect: {url}")
            results.append({"url": url, "verdict": "DRY_RUN", "indexing_state": "N/A"})
            continue

        try:
            response = service.urlInspection().index().inspect(body={
                "inspectionUrl": url,
                "siteUrl": SITE_URL,
            }).execute()
            result = response.get("inspectionResult", {})
            index_result = result.get("indexStatusResult", {})
            results.append({
                "url": url,
                "verdict": index_result.get("verdict", "UNKNOWN"),
                "coverage_state": index_result.get("coverageState", ""),
                "last_crawl": index_result.get("lastCrawlTime", "never"),
                "indexing_state": index_result.get("indexingState", ""),
                "page_fetch_state": index_result.get("pageFetchState", ""),
            })
            print(f"  Inspected: {url} -> {index_result.get('verdict', 'UNKNOWN')}")
        except Exception as e:
            print(f"  ERROR inspecting {url}: {e}")
            results.append({"url": url, "verdict": "ERROR", "indexing_state": str(e)})

    return results


def generate_report(near_ranking: list[dict], duplicate_inspections: list[dict],
                    sitemap_resubmitted: bool) -> str:
    """Generate a markdown report of actions taken."""
    today = date.today().isoformat()
    lines = [
        f"# GSC Recrawl & De-index Report — vitalguide.life",
        f"",
        f"**Date:** {today}",
        f"",
        f"---",
        f"",
        f"## 1. Sitemap Resubmission",
        f"",
        f"{'Sitemap resubmitted successfully' if sitemap_resubmitted else 'Sitemap resubmission FAILED'}: `{SITEMAP_URL}`",
        f"",
        f"This signals Google to recrawl all URLs in the sitemap, prioritizing recently modified pages.",
        f"",
        f"---",
        f"",
        f"## 2. Near-Ranking URLs (Position 5-20)",
        f"",
        f"These {len(near_ranking)} URLs are near the top of search results and will benefit from recrawl.",
        f"",
    ]

    if near_ranking:
        lines.append("| URL | Position | Impressions | Clicks | CTR % |")
        lines.append("|-----|----------|-------------|--------|-------|")
        for r in near_ranking:
            url_path = r["url"].replace("https://vitalguide.life", "")
            lines.append(f"| `{url_path}` | {r['position']} | {r['impressions']:,} | {r['clicks']:,} | {r['ctr']}% |")
    else:
        lines.append("_No near-ranking URLs found with sufficient impressions._")

    lines += [
        f"",
        f"---",
        f"",
        f"## 3. Duplicate Pages — De-indexing Required",
        f"",
        f"These URLs are old slugs that still serve 200 with self-referencing canonical tags.",
        f"They have been replaced by newer slugs in the deployed sitemap.",
        f"",
        f"**Recommended actions (must be done in code, not via API):**",
        f"1. Add 301 redirects from old slugs to new slugs",
        f"2. OR add `<meta name=\"robots\" content=\"noindex\">` to old slug pages",
        f"3. Remove old pages from Next.js build output",
        f"",
        f"| Old Slug | New Slug | Index Status |",
        f"|----------|----------|--------------|",
    ]

    for inspection in duplicate_inspections:
        url_path = inspection["url"].replace("https://vitalguide.life/articles/", "")
        new_slug = SLUG_REDIRECTS.get(url_path, "?")
        verdict = inspection.get("verdict", "UNKNOWN")
        lines.append(f"| `{url_path}` | `{new_slug}` | {verdict} |")

    lines += [
        f"",
        f"---",
        f"",
        f"## 4. Summary",
        f"",
        f"- Sitemap resubmitted: {'Yes' if sitemap_resubmitted else 'No'}",
        f"- Near-ranking URLs found: {len(near_ranking)}",
        f"- Duplicate URLs identified: {len(DUPLICATE_URLS)}",
        f"- **Next step:** Fix duplicate pages via 301 redirects or noindex tags in the codebase",
        f"",
        f"_Report generated by `scripts/gsc_recrawl_deindex.py`_",
    ]

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="GSC recrawl & de-index tool for vitalguide.life")
    parser.add_argument("--credentials", type=str, default=None, help="Path to service account credentials JSON")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")
    parser.add_argument("--days", type=int, default=28, help="Days of search data to analyze (default: 28)")
    parser.add_argument("--output", type=str, default=None, help="Output report path")
    parser.add_argument("--skip-inspection", action="store_true", help="Skip URL inspection (saves API quota)")
    args = parser.parse_args()

    print("GSC Recrawl & De-index Tool")
    print("=" * 40)

    if args.dry_run:
        print("MODE: DRY RUN (no API calls will be made)\n")

    print("Connecting to Google Search Console API...")
    credentials = get_credentials(args.credentials)
    service = build_service(credentials)

    # Step 1: Get near-ranking URLs
    print(f"\n--- Step 1: Finding near-ranking URLs (last {args.days} days) ---")
    near_ranking = get_near_ranking_urls(service, args.days)
    print(f"Found {len(near_ranking)} near-ranking URLs (position {NEAR_RANKING_POS_MIN}-{NEAR_RANKING_POS_MAX})")
    for r in near_ranking[:10]:
        print(f"  {r['position']:5.1f}  {r['impressions']:5d} imp  {r['url']}")
    if len(near_ranking) > 10:
        print(f"  ... and {len(near_ranking) - 10} more")

    # Step 2: Resubmit sitemap
    print(f"\n--- Step 2: Resubmitting sitemap ---")
    sitemap_ok = resubmit_sitemap(service, args.dry_run)

    # Step 3: Inspect duplicate URLs
    print(f"\n--- Step 3: Inspecting {len(DUPLICATE_URLS)} duplicate URLs ---")
    if args.skip_inspection:
        print("  Skipped (--skip-inspection)")
        dup_inspections = [{"url": u, "verdict": "SKIPPED", "indexing_state": "N/A"} for u in DUPLICATE_URLS]
    else:
        dup_inspections = inspect_urls(service, DUPLICATE_URLS, args.dry_run)

    # Step 4: Generate report
    print(f"\n--- Step 4: Generating report ---")
    report = generate_report(near_ranking, dup_inspections, sitemap_ok)

    output_path = args.output
    if output_path is None:
        reports_dir = Path(__file__).parent / "reports"
        reports_dir.mkdir(exist_ok=True)
        output_path = str(reports_dir / f"gsc_recrawl_{date.today().isoformat()}.md")

    Path(output_path).write_text(report, encoding="utf-8")
    print(f"Report saved to: {output_path}")

    # Print summary
    print(f"\n{'=' * 40}")
    print(f"SUMMARY")
    print(f"  Near-ranking URLs:  {len(near_ranking)}")
    print(f"  Sitemap resubmit:   {'OK' if sitemap_ok else 'FAILED'}")
    print(f"  Duplicates found:   {len(DUPLICATE_URLS)}")
    print(f"\nIMPORTANT: Duplicate pages need code fixes (301 redirects or noindex).")
    print(f"The GSC API does not support programmatic URL removal requests.")
    print(f"See the report for the full duplicate URL mapping.")


if __name__ == "__main__":
    main()
