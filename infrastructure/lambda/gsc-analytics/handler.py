"""
GSC Search Analytics Lambda — vitalguide.life

Triggered weekly by EventBridge. Pulls Search Console data and writes
JSON + Markdown reports to the configured S3 bucket.

Environment variables (set by CDK):
  S3_BUCKET        — S3 bucket name for reports
  SECRET_ARN       — Secrets Manager ARN for service account credentials JSON
  SITE_URL         — GSC site URL (default: sc-domain:vitalguide.life)
  DAYS             — Number of days of data to pull (default: 90)
"""

import json
import os
import boto3
import tempfile
from datetime import date, timedelta
from pathlib import Path

SITE_URL = os.environ.get("SITE_URL", "sc-domain:vitalguide.life")
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
DAYS = int(os.environ.get("DAYS", "90"))
S3_BUCKET = os.environ["S3_BUCKET"]
SECRET_ARN = os.environ["SECRET_ARN"]

CTR_IMPRESSION_THRESHOLD = 100
CTR_THRESHOLD = 0.03
PAGE2_POSITION_MIN = 11.0
PAGE2_POSITION_MAX = 20.0
TOP_QUERIES_LIMIT = 20
PAGE2_LIMIT = 30
CTR_LIMIT = 30


def get_credentials_from_secret():
    sm = boto3.client("secretsmanager")
    response = sm.get_secret_value(SecretId=SECRET_ARN)
    creds_json = json.loads(response["SecretString"])

    from google.oauth2 import service_account

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(creds_json, f)
        tmp_path = f.name

    return service_account.Credentials.from_service_account_file(tmp_path, scopes=SCOPES)


def build_service(credentials):
    from googleapiclient.discovery import build
    return build("searchconsole", "v1", credentials=credentials, cache_discovery=False)


def date_range(days: int):
    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=days - 1)
    return start.isoformat(), end.isoformat()


def query_analytics(service, start_date, end_date, dimensions, row_limit=1000, dimension_filter_groups=None):
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


def get_ctr_opportunities(service, start_date, end_date):
    rows = query_analytics(service, start_date, end_date, ["page"], row_limit=500)
    results = []
    for row in rows:
        impressions = row.get("impressions", 0)
        ctr = row.get("ctr", 0)
        if impressions >= CTR_IMPRESSION_THRESHOLD and ctr < CTR_THRESHOLD:
            results.append({
                "page": row["keys"][0],
                "impressions": int(impressions),
                "clicks": int(row.get("clicks", 0)),
                "ctr": round(ctr * 100, 2),
                "position": round(row.get("position", 0), 1),
            })
    results.sort(key=lambda x: x["impressions"], reverse=True)
    return results[:CTR_LIMIT]


def get_page2_quick_wins(service, start_date, end_date):
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


def get_top_queries(service, start_date, end_date):
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


def get_all_queries_pages(service, start_date, end_date):
    """Pull all query+page data for raw storage."""
    return query_analytics(service, start_date, end_date, ["query", "page", "device", "country"], row_limit=5000)


def render_markdown(report_date, start_date, end_date, ctr_opportunities, quick_wins, top_queries):
    lines = [
        f"# GSC Performance Report — vitalguide.life",
        f"",
        f"**Generated:** {report_date}  ",
        f"**Data range:** {start_date} → {end_date}",
        f"",
        f"---",
        f"",
        f"## 1. CTR Opportunities",
        f"Pages with **≥{CTR_IMPRESSION_THRESHOLD} impressions** and **<{int(CTR_THRESHOLD*100)}% CTR**",
        f"",
    ]
    if ctr_opportunities:
        lines.append("| Page | Impressions | Clicks | CTR % | Avg Position |")
        lines.append("|------|-------------|--------|-------|--------------|")
        for r in ctr_opportunities:
            page = r["page"].replace("https://vitalguide.life", "")
            lines.append(f"| `{page}` | {r['impressions']:,} | {r['clicks']:,} | {r['ctr']}% | {r['position']} |")
    else:
        lines.append("_No CTR opportunities found._")

    lines += [f"", f"---", f"", f"## 2. Page-2 Quick Wins", f"Keywords ranking **position 11–20**", f""]
    if quick_wins:
        lines.append("| Query | Page | Impressions | Clicks | CTR % | Position |")
        lines.append("|-------|------|-------------|--------|-------|----------|")
        for r in quick_wins:
            page = r["page"].replace("https://vitalguide.life", "")
            lines.append(f"| {r['query']} | `{page}` | {r['impressions']:,} | {r['clicks']:,} | {r['ctr']}% | {r['position']} |")
    else:
        lines.append("_No page-2 keywords found._")

    lines += [f"", f"---", f"", f"## 3. Top Performing Queries", f""]
    if top_queries:
        lines.append("| # | Query | Clicks | Impressions | CTR % | Avg Position |")
        lines.append("|---|-------|--------|-------------|-------|--------------|")
        for i, r in enumerate(top_queries, 1):
            lines.append(f"| {i} | {r['query']} | {r['clicks']:,} | {r['impressions']:,} | {r['ctr']}% | {r['position']} |")
    else:
        lines.append("_No query data available._")

    lines += [
        f"", f"---", f"",
        f"_Report generated by GSC Analytics Lambda_",
    ]
    return "\n".join(lines)


def upload_to_s3(key, body, content_type="application/json"):
    s3 = boto3.client("s3")
    s3.put_object(Bucket=S3_BUCKET, Key=key, Body=body, ContentType=content_type)
    print(f"Uploaded: s3://{S3_BUCKET}/{key}")


def handler(event, context):
    print(f"GSC Analytics Lambda starting — site: {SITE_URL}, days: {DAYS}")

    credentials = get_credentials_from_secret()
    service = build_service(credentials)

    start_date, end_date = date_range(DAYS)
    today = date.today().isoformat()
    print(f"Fetching data: {start_date} → {end_date}")

    ctr_opportunities = get_ctr_opportunities(service, start_date, end_date)
    quick_wins = get_page2_quick_wins(service, start_date, end_date)
    top_queries = get_top_queries(service, start_date, end_date)
    raw_rows = get_all_queries_pages(service, start_date, end_date)

    # Upload structured JSON data
    data_payload = {
        "generatedAt": today,
        "startDate": start_date,
        "endDate": end_date,
        "siteUrl": SITE_URL,
        "ctrOpportunities": ctr_opportunities,
        "page2QuickWins": quick_wins,
        "topQueries": top_queries,
    }
    upload_to_s3(
        f"gsc-reports/{today}/summary.json",
        json.dumps(data_payload, indent=2),
        "application/json",
    )

    # Upload raw rows as newline-delimited JSON for analytics
    if raw_rows:
        ndjson = "\n".join(json.dumps(row) for row in raw_rows)
        upload_to_s3(
            f"gsc-reports/{today}/raw-rows.ndjson",
            ndjson,
            "application/x-ndjson",
        )

    # Upload markdown report
    report_md = render_markdown(today, start_date, end_date, ctr_opportunities, quick_wins, top_queries)
    upload_to_s3(
        f"gsc-reports/{today}/report.md",
        report_md,
        "text/markdown",
    )

    # Upload latest symlink (overwrite latest.json for easy access)
    upload_to_s3(
        "gsc-reports/latest/summary.json",
        json.dumps(data_payload, indent=2),
        "application/json",
    )
    upload_to_s3("gsc-reports/latest/report.md", report_md, "text/markdown")

    print(f"Done. CTR opportunities: {len(ctr_opportunities)}, Quick wins: {len(quick_wins)}, Top queries: {len(top_queries)}, Raw rows: {len(raw_rows)}")

    return {
        "statusCode": 200,
        "generatedAt": today,
        "startDate": start_date,
        "endDate": end_date,
        "ctrOpportunitiesCount": len(ctr_opportunities),
        "page2QuickWinsCount": len(quick_wins),
        "topQueriesCount": len(top_queries),
        "rawRowsCount": len(raw_rows),
    }
