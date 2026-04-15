#!/usr/bin/env python3
"""
Google Search Console Performance Monitor for vitalguide.life

Usage:
    python3 gsc_monitor.py [--days 90] [--output report.md]

Setup:
    1. Enable Google Search Console API in Google Cloud Console
    2. Create a service account, download credentials JSON
    3. Grant the service account "Owner" or "Full" access in GSC > Settings > Users and permissions
    4. Set env var: GSC_CREDENTIALS=/path/to/service-account-credentials.json
       or place credentials.json in the same directory as this script.

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
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

CTR_IMPRESSION_THRESHOLD = 100  # minimum impressions to flag CTR opportunity
CTR_THRESHOLD = 0.03            # 3% CTR threshold
PAGE2_POSITION_MIN = 11.0       # average position range for page-2 quick wins
PAGE2_POSITION_MAX = 20.0
TOP_QUERIES_LIMIT = 20
PAGE2_LIMIT = 30
CTR_LIMIT = 30


def get_credentials(credentials_path: str | None = None):
    path = credentials_path or os.environ.get("GSC_CREDENTIALS") or "credentials.json"
    if not Path(path).exists():
        print(f"ERROR: Credentials file not found at '{path}'")
        print("Set GSC_CREDENTIALS env var or place credentials.json in this directory.")
        sys.exit(1)
    return service_account.Credentials.from_service_account_file(path, scopes=SCOPES)


def build_service(credentials):
    return build("searchconsole", "v1", credentials=credentials, cache_discovery=False)


def date_range(days: int) -> tuple[str, str]:
    end = date.today() - timedelta(days=3)  # GSC data lags ~3 days
    start = end - timedelta(days=days - 1)
    return start.isoformat(), end.isoformat()


def query_analytics(service, start_date: str, end_date: str, dimensions: list[str],
                    row_limit: int = 1000, dimension_filter_groups=None) -> list[dict]:
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "rowLimit": row_limit,
        "startRow": 0,
    }
    if dimension_filter_groups:
        body["dimensionFilterGroups"] = dimension_filter_groups

    try:
        response = service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
        return response.get("rows", [])
    except Exception as e:
        print(f"WARNING: API query failed for dimensions={dimensions}: {e}")
        return []


def get_ctr_opportunities(service, start_date: str, end_date: str) -> list[dict]:
    """Pages with >100 impressions and <3% CTR."""
    rows = query_analytics(service, start_date, end_date, ["page"], row_limit=500)
    opportunities = []
    for row in rows:
        impressions = row.get("impressions", 0)
        ctr = row.get("ctr", 0)
        if impressions >= CTR_IMPRESSION_THRESHOLD and ctr < CTR_THRESHOLD:
            opportunities.append({
                "page": row["keys"][0],
                "impressions": int(impressions),
                "clicks": int(row.get("clicks", 0)),
                "ctr": round(ctr * 100, 2),
                "position": round(row.get("position", 0), 1),
            })
    opportunities.sort(key=lambda x: x["impressions"], reverse=True)
    return opportunities[:CTR_LIMIT]


def get_page2_quick_wins(service, start_date: str, end_date: str) -> list[dict]:
    """Keywords with average position 11-20 (page 2 of Google)."""
    rows = query_analytics(service, start_date, end_date, ["query", "page"], row_limit=1000)
    quick_wins = []
    for row in rows:
        position = row.get("position", 0)
        impressions = row.get("impressions", 0)
        if PAGE2_POSITION_MIN <= position <= PAGE2_POSITION_MAX and impressions >= 10:
            quick_wins.append({
                "query": row["keys"][0],
                "page": row["keys"][1],
                "impressions": int(impressions),
                "clicks": int(row.get("clicks", 0)),
                "ctr": round(row.get("ctr", 0) * 100, 2),
                "position": round(position, 1),
            })
    quick_wins.sort(key=lambda x: x["impressions"], reverse=True)
    return quick_wins[:PAGE2_LIMIT]


def get_top_queries(service, start_date: str, end_date: str) -> list[dict]:
    """Top queries by clicks."""
    rows = query_analytics(service, start_date, end_date, ["query"], row_limit=TOP_QUERIES_LIMIT)
    result = []
    for row in rows:
        result.append({
            "query": row["keys"][0],
            "clicks": int(row.get("clicks", 0)),
            "impressions": int(row.get("impressions", 0)),
            "ctr": round(row.get("ctr", 0) * 100, 2),
            "position": round(row.get("position", 0), 1),
        })
    result.sort(key=lambda x: x["clicks"], reverse=True)
    return result


def get_coverage_issues(service) -> list[dict]:
    """URLs with indexing issues from URL inspection (sampling key pages)."""
    key_pages = [
        "https://vitalguide.life/",
        "https://vitalguide.life/supplements",
        "https://vitalguide.life/fitness",
        "https://vitalguide.life/wellness",
        "https://vitalguide.life/sleep",
        "https://vitalguide.life/sports-nutrition",
        "https://vitalguide.life/articles/berberine-glp1",
        "https://vitalguide.life/articles/best-creatine-monohydrate",
        "https://vitalguide.life/articles/magnesium-guide",
        "https://vitalguide.life/articles/best-protein-powder",
        "https://vitalguide.life/articles/vitamin-d3-k2",
    ]
    issues = []
    for url in key_pages:
        try:
            response = service.urlInspection().index().inspect(body={
                "inspectionUrl": url,
                "siteUrl": SITE_URL,
            }).execute()
            result = response.get("inspectionResult", {})
            index_result = result.get("indexStatusResult", {})
            verdict = index_result.get("verdict", "UNKNOWN")
            if verdict != "PASS":
                issues.append({
                    "url": url,
                    "verdict": verdict,
                    "coverage_state": index_result.get("coverageState", ""),
                    "last_crawl": index_result.get("lastCrawlTime", "never"),
                    "robots_txt": index_result.get("robotsTxtState", ""),
                    "indexing_state": index_result.get("indexingState", ""),
                })
        except Exception as e:
            issues.append({"url": url, "verdict": "ERROR", "coverage_state": str(e),
                           "last_crawl": "", "robots_txt": "", "indexing_state": ""})
    return issues


def render_markdown(
    report_date: str,
    start_date: str,
    end_date: str,
    ctr_opportunities: list[dict],
    quick_wins: list[dict],
    top_queries: list[dict],
    coverage_issues: list[dict],
) -> str:
    lines = [
        f"# GSC Performance Report — vitalguide.life",
        f"",
        f"**Generated:** {report_date}  ",
        f"**Data range:** {start_date} → {end_date}",
        f"",
        f"---",
        f"",
        f"## 1. CTR Opportunities",
        f"Pages with **≥{CTR_IMPRESSION_THRESHOLD} impressions** and **<{int(CTR_THRESHOLD*100)}% CTR** — these need better title tags or meta descriptions.",
        f"",
    ]

    if ctr_opportunities:
        lines.append("| Page | Impressions | Clicks | CTR % | Avg Position |")
        lines.append("|------|-------------|--------|-------|--------------|")
        for r in ctr_opportunities:
            page = r["page"].replace("https://vitalguide.life", "")
            lines.append(f"| `{page}` | {r['impressions']:,} | {r['clicks']:,} | {r['ctr']}% | {r['position']} |")
    else:
        lines.append("_No CTR opportunities found — all high-impression pages have >3% CTR._")

    lines += [
        f"",
        f"---",
        f"",
        f"## 2. Page-2 Quick Wins",
        f"Keywords ranking **position 11–20** — a small content boost could push these to page 1.",
        f"",
    ]

    if quick_wins:
        lines.append("| Query | Page | Impressions | Clicks | CTR % | Position |")
        lines.append("|-------|------|-------------|--------|-------|----------|")
        for r in quick_wins:
            page = r["page"].replace("https://vitalguide.life", "")
            lines.append(f"| {r['query']} | `{page}` | {r['impressions']:,} | {r['clicks']:,} | {r['ctr']}% | {r['position']} |")
    else:
        lines.append("_No page-2 keywords found with ≥10 impressions._")

    lines += [
        f"",
        f"---",
        f"",
        f"## 3. Top Performing Queries",
        f"Queries driving the most clicks to the site.",
        f"",
    ]

    if top_queries:
        lines.append("| # | Query | Clicks | Impressions | CTR % | Avg Position |")
        lines.append("|---|-------|--------|-------------|-------|--------------|")
        for i, r in enumerate(top_queries, 1):
            lines.append(f"| {i} | {r['query']} | {r['clicks']:,} | {r['impressions']:,} | {r['ctr']}% | {r['position']} |")
    else:
        lines.append("_No query data available._")

    lines += [
        f"",
        f"---",
        f"",
        f"## 4. Indexing Coverage — Key Pages",
        f"URL inspection results for top priority pages. All should show `PASS`.",
        f"",
    ]

    if coverage_issues:
        lines.append("| URL | Verdict | Coverage State | Last Crawl |")
        lines.append("|-----|---------|----------------|------------|")
        for r in coverage_issues:
            url = r["url"].replace("https://vitalguide.life", "")
            lines.append(f"| `{url}` | **{r['verdict']}** | {r['coverage_state']} | {r['last_crawl'][:10] if r['last_crawl'] else 'N/A'} |")
    else:
        lines.append("_All key pages are indexed. No coverage issues found._")

    lines += [
        f"",
        f"---",
        f"",
        f"## Action Items",
        f"",
        f"Based on this report, prioritize:",
        f"",
        f"1. **Fix titles/meta descriptions** for CTR opportunity pages (Section 1)",
        f"2. **Improve content depth** for page-2 quick win keywords (Section 2)",
        f"3. **Resolve any indexing issues** for pages not showing `PASS` (Section 4)",
        f"",
        f"_Report generated by `scripts/gsc_monitor.py`_",
    ]

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="GSC performance monitor for vitalguide.life")
    parser.add_argument("--days", type=int, default=90, help="Number of days to analyze (default: 90)")
    parser.add_argument("--output", type=str, default=None, help="Output file path (default: reports/gsc_report_YYYY-MM-DD.md)")
    parser.add_argument("--credentials", type=str, default=None, help="Path to service account credentials JSON")
    parser.add_argument("--skip-coverage", action="store_true", help="Skip URL inspection (URL inspection API may have quota limits)")
    args = parser.parse_args()

    print(f"Connecting to Google Search Console API...")
    credentials = get_credentials(args.credentials)
    service = build_service(credentials)

    start_date, end_date = date_range(args.days)
    today = date.today().isoformat()
    print(f"Fetching data: {start_date} → {end_date}")

    print("  → CTR opportunities...")
    ctr_opportunities = get_ctr_opportunities(service, start_date, end_date)

    print("  → Page-2 quick wins...")
    quick_wins = get_page2_quick_wins(service, start_date, end_date)

    print("  → Top performing queries...")
    top_queries = get_top_queries(service, start_date, end_date)

    if args.skip_coverage:
        coverage_issues = []
        print("  → Coverage check skipped (--skip-coverage)")
    else:
        print("  → Coverage / URL inspection...")
        coverage_issues = get_coverage_issues(service)

    report = render_markdown(today, start_date, end_date, ctr_opportunities, quick_wins, top_queries, coverage_issues)

    output_path = args.output
    if output_path is None:
        reports_dir = Path(__file__).parent / "reports"
        reports_dir.mkdir(exist_ok=True)
        output_path = str(reports_dir / f"gsc_report_{today}.md")

    Path(output_path).write_text(report, encoding="utf-8")
    print(f"\nReport saved to: {output_path}")

    # Print summary to stdout
    print(f"\n=== Summary ===")
    print(f"CTR opportunities:   {len(ctr_opportunities)} pages")
    print(f"Page-2 quick wins:   {len(quick_wins)} keywords")
    print(f"Top queries:         {len(top_queries)} queries")
    print(f"Coverage issues:     {len(coverage_issues)} pages with problems")


if __name__ == "__main__":
    main()
