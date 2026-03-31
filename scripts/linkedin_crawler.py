#!/usr/bin/env python
"""
Lightweight LinkedIn jobs crawler using only the standard library.
Outputs a JSON list of job objects to stdout.

Usage:
  python scripts/linkedin_crawler.py --keywords "data scientist" --location "San Francisco, CA" --limit 25
"""

import argparse
import html
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime


SEARCH_URL = (
    "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
)


def fetch_html(keywords: str, location: str, limit: int) -> str:
    params = {
        "keywords": keywords,
        "location": location,
        "sortBy": "DD",      # newest first
        "f_TPR": "r172800",  # last 48 hours
        "position": 1,
        "pageNum": 0,
    }
    query = urllib.parse.urlencode(params)
    url = f"{SEARCH_URL}?{query}"

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urllib.request.urlopen(req, timeout=12) as resp:  # nosec: B310 (external call required)
        data = resp.read().decode("utf-8", errors="ignore")
    return data


def strip_html(text: str) -> str:
    text = re.sub(r"<script.*?>.*?</script>", "", text, flags=re.S)
    text = re.sub(r"<style.*?>.*?</style>", "", text, flags=re.S)
    text = re.sub(r"<.*?>", " ", text)
    return " ".join(text.split())


def find_attr(tag_html: str, attr: str) -> str:
    m = re.search(attr + r'="([^"]+)"', tag_html)
    return m.group(1) if m else ""


def parse_jobs(html_text: str, limit: int):
    # Split on list items containing job cards.
    blocks = re.findall(
        r"<li[^>]*?(?:jobs-search-results__list-item|result-card)[^>]*>(.*?)</li>",
        html_text,
        flags=re.S | re.I,
    )

    jobs = []
    for block in blocks:
        # Title
        m_title = re.search(
            r"<h3[^>]*?(?:base-search-card__title|result-card__title)[^>]*>(.*?)</h3>",
            block,
            flags=re.S | re.I,
        )
        title = strip_html(m_title.group(1)) if m_title else ""

        # Company
        m_company = re.search(
            r"<h4[^>]*?(?:base-search-card__subtitle|result-card__subtitle)[^>]*>(.*?)</h4>",
            block,
            flags=re.S | re.I,
        )
        company = strip_html(m_company.group(1)) if m_company else ""

        # Location
        m_loc = re.search(
            r"<span[^>]*?job-search-card__location[^>]*>(.*?)</span>",
            block,
            flags=re.S | re.I,
        )
        location = strip_html(m_loc.group(1)) if m_loc else ""

        # Snippet/description
        m_desc = re.search(
            r"<p[^>]*?job-search-card__snippet[^>]*>(.*?)</p>",
            block,
            flags=re.S | re.I,
        )
        description = strip_html(m_desc.group(1)) if m_desc else ""

        # Link
        m_link = re.search(
            r"<a[^>]*?(?:base-card__full-link|result-card__full-card-link)[^>]*?>",
            block,
            flags=re.S | re.I,
        )
        link = ""
        if m_link:
            link = find_attr(m_link.group(0), "href")
            if link and not link.startswith("http"):
                link = "https://www.linkedin.com" + link
            link = link.split("?")[0]

        # Posted time
        m_time = re.search(r"<time[^>]*datetime=\"([^\"]+)\"", block, flags=re.S | re.I)
        posted_at = m_time.group(1) if m_time else ""

        if not (title and company and link):
            continue

        jobs.append(
            {
                "title": html.unescape(title),
                "company": html.unescape(company),
                "location": html.unescape(location),
                "description": html.unescape(description),
                "job_url": link,
                "posted_at": posted_at,
                "source": "linkedin-request",
            }
        )

        if len(jobs) >= limit:
            break

    return jobs


def main():
    parser = argparse.ArgumentParser(description="LinkedIn job crawler")
    parser.add_argument("--keywords", required=True, help="job keywords")
    parser.add_argument("--location", default="United States", help="location text")
    parser.add_argument("--limit", type=int, default=25, help="max jobs to return")
    args = parser.parse_args()

    try:
        html_text = fetch_html(args.keywords, args.location, args.limit)
        jobs = parse_jobs(html_text, args.limit)
    except Exception as exc:  # pragma: no cover - runtime guard
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)

    print(json.dumps(jobs, ensure_ascii=False))


if __name__ == "__main__":
    main()
