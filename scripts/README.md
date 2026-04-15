# GSC Performance Monitor

Pulls SEO performance data from the Google Search Console API for vitalguide.life and generates a markdown report.

## Prerequisites

1. **GSC property verified** — `vitalguide.life` must be verified in [Google Search Console](https://search.google.com/search-console)
2. **Service account credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the **Google Search Console API**
   - Create a **Service Account** and download its JSON key
   - In GSC → Settings → Users and permissions, add the service account email with **Full** access

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set credentials path
export GSC_CREDENTIALS=/path/to/service-account-credentials.json
```

Or place the credentials file as `scripts/credentials.json` (already in `.gitignore`).

## Usage

```bash
# Default: last 90 days, saves to scripts/reports/gsc_report_YYYY-MM-DD.md
python3 scripts/gsc_monitor.py

# Custom date range
python3 scripts/gsc_monitor.py --days 28

# Custom output path
python3 scripts/gsc_monitor.py --output /tmp/report.md

# Skip URL inspection (faster, avoids quota limits)
python3 scripts/gsc_monitor.py --skip-coverage

# Specify credentials path explicitly
python3 scripts/gsc_monitor.py --credentials /path/to/creds.json
```

## Report Sections

1. **CTR Opportunities** — pages with ≥100 impressions and <3% CTR (need better titles/meta descriptions)
2. **Page-2 Quick Wins** — keywords ranking position 11–20 (content improvements can push to page 1)
3. **Top Performing Queries** — keywords driving the most clicks
4. **Indexing Coverage** — URL inspection results for key pages (all should be `PASS`)

## Notes

- GSC data lags ~3 days; the script automatically adjusts the end date
- The URL Inspection API has a quota of ~2,000 requests/day per property
- Reports are saved in `scripts/reports/` (gitignored)
- `credentials.json` is gitignored — never commit credentials to the repo
