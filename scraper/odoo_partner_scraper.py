#!/usr/bin/env python3
"""
Odoo Europe Partner Scraper
===========================

Multi-region scraper for Odoo's public partner directory.

Examples:
    python odoo_partner_scraper.py --regions tr,de,fr
    python odoo_partner_scraper.py --all-europe --skip-details
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import time
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import requests
from bs4 import BeautifulSoup


@dataclass(frozen=True)
class RegionTarget:
    code: str
    country_code: str
    name: str
    slug: str


@dataclass
class Partner:
    region_code: str
    country_code: str
    name: str
    level: str
    city: str
    district: str
    country: str
    full_address: str
    rating_percentage: Optional[str]
    average_project_size: Optional[str]
    large_project_size: Optional[str]
    references_count: str
    certified_experts_count: str
    profile_url: str
    logo_url: Optional[str]
    about_text: Optional[str]
    certifications_breakdown: List[Dict]
    industries_breakdown: List[Dict]
    scraped_at: str


EUROPEAN_REGIONS: List[RegionTarget] = [
    RegionTarget("tr", "TR", "Türkiye", "turkiye"),
    RegionTarget("ad", "AD", "Andorra", "andorra"),
    RegionTarget("al", "AL", "Albania", "albania"),
    RegionTarget("at", "AT", "Austria", "austria"),
    RegionTarget("ba", "BA", "Bosnia and Herzegovina", "bosnia-and-herzegovina"),
    RegionTarget("be", "BE", "Belgium", "belgium"),
    RegionTarget("bg", "BG", "Bulgaria", "bulgaria"),
    RegionTarget("ch", "CH", "Switzerland", "switzerland"),
    RegionTarget("cy", "CY", "Cyprus", "cyprus"),
    RegionTarget("cz", "CZ", "Czech Republic", "czech-republic"),
    RegionTarget("de", "DE", "Germany", "germany"),
    RegionTarget("dk", "DK", "Denmark", "denmark"),
    RegionTarget("ee", "EE", "Estonia", "estonia"),
    RegionTarget("es", "ES", "Spain", "spain"),
    RegionTarget("fi", "FI", "Finland", "finland"),
    RegionTarget("fr", "FR", "France", "france"),
    RegionTarget("gb", "GB", "United Kingdom", "united-kingdom"),
    RegionTarget("gr", "GR", "Greece", "greece"),
    RegionTarget("hr", "HR", "Croatia", "croatia"),
    RegionTarget("hu", "HU", "Hungary", "hungary"),
    RegionTarget("ie", "IE", "Ireland", "ireland"),
    RegionTarget("is", "IS", "Iceland", "iceland"),
    RegionTarget("it", "IT", "Italy", "italy"),
    RegionTarget("lt", "LT", "Lithuania", "lithuania"),
    RegionTarget("lu", "LU", "Luxembourg", "luxembourg"),
    RegionTarget("lv", "LV", "Latvia", "latvia"),
    RegionTarget("mc", "MC", "Monaco", "monaco"),
    RegionTarget("me", "ME", "Montenegro", "montenegro"),
    RegionTarget("mk", "MK", "North Macedonia", "north-macedonia"),
    RegionTarget("mt", "MT", "Malta", "malta"),
    RegionTarget("nl", "NL", "Netherlands", "netherlands"),
    RegionTarget("no", "NO", "Norway", "norway"),
    RegionTarget("pl", "PL", "Poland", "poland"),
    RegionTarget("pt", "PT", "Portugal", "portugal"),
    RegionTarget("ro", "RO", "Romania", "romania"),
    RegionTarget("rs", "RS", "Serbia", "serbia"),
    RegionTarget("se", "SE", "Sweden", "sweden"),
    RegionTarget("si", "SI", "Slovenia", "slovenia"),
    RegionTarget("sk", "SK", "Slovakia", "slovakia"),
    RegionTarget("ua", "UA", "Ukraine", "ukraine"),
    RegionTarget("xk", "XK", "Kosovo", "kosovo"),
]

REGION_LOOKUP: Dict[str, RegionTarget] = {region.code: region for region in EUROPEAN_REGIONS}


class OdooPartnerScraper:
    BASE_URL = "https://www.odoo.com"
    DISCOVERY_URL = f"{BASE_URL}/partners?country_all=1"

    def __init__(self, delay_seconds: float = 0.75, include_details: bool = True):
        self.delay_seconds = delay_seconds
        self.include_details = include_details
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        })

    def _get_page(self, url: str) -> Optional[BeautifulSoup]:
        try:
            print(f"📥 Fetching: {url}")
            response = self.session.get(url, timeout=45)
            response.raise_for_status()
            response.encoding = "utf-8"
            return BeautifulSoup(response.text, "html.parser")
        except requests.RequestException as error:
            print(f"❌ Failed to fetch {url}: {error}")
            return None

    @staticmethod
    def _extract_text(element, default: str = "") -> str:
        if element:
            return element.get_text(strip=True)
        return default

    @staticmethod
    def _extract_first_number(value: str) -> Optional[str]:
        match = re.search(r"(\d+)", value or "")
        return match.group(1) if match else None

    def discover_region_urls(self) -> Dict[str, str]:
        soup = self._get_page(self.DISCOVERY_URL)
        if not soup:
            return {}

        html = str(soup)
        discovered_urls: Dict[str, str] = {}

        for region in EUROPEAN_REGIONS:
            match = re.search(rf'href="(/partners/country/{re.escape(region.slug)}-\d+)', html)
            if match:
                discovered_urls[region.code] = f"{self.BASE_URL}{match.group(1)}"

        missing = [region.code for region in EUROPEAN_REGIONS if region.code not in discovered_urls]
        if missing:
            print(f"⚠️ Missing live Odoo country paths for: {', '.join(missing)}")

        return discovered_urls

    def _parse_stat_total(self, block) -> str:
        header = block.select_one("div")
        if not header:
            return "0"

        number = self._extract_first_number(self._extract_text(header))
        return number or "0"

    def _parse_location(self, card, region: RegionTarget) -> Dict[str, str]:
        spans = card.select("#o_wcrm_partners_address span")
        location_parts = [self._extract_text(span).strip(",").strip() for span in spans]
        location_parts = [part for part in location_parts if part]

        country_variants = {
            region.name.lower(),
            region.name.lower().replace("&", "and"),
            region.country_code.lower(),
        }

        if location_parts and location_parts[0].isdigit():
            location_parts.pop(0)

        if location_parts and location_parts[0].lower() in country_variants:
            location_parts.pop(0)

        if location_parts and location_parts[-1].lower() in country_variants:
            location_parts.pop()

        full_address = ", ".join(location_parts)
        non_numeric_parts = [part for part in location_parts if not part.isdigit()]

        city = non_numeric_parts[0] if non_numeric_parts else ""
        district = non_numeric_parts[1] if len(non_numeric_parts) > 1 else ""

        return {
            "city": city,
            "district": district,
            "full_address": full_address,
        }

    def _parse_project_sizes(self, card) -> Dict[str, Optional[str]]:
        average_project_size = None
        large_project_size = None

        for element in card.select("small.text-muted"):
            text = self._extract_text(element)

            if "Average Project" in text or "Ortalama Proje" in text:
                match = re.search(r"(\d+)\s*(users|kullanıcı)", text, re.IGNORECASE)
                if match:
                    average_project_size = match.group(0)
            elif "Large Project" in text or "Büyük Proje" in text:
                match = re.search(r"~?(\d+)\s*(users|kullanıcı)", text, re.IGNORECASE)
                if match:
                    large_project_size = match.group(0)

        return {
            "average_project_size": average_project_size,
            "large_project_size": large_project_size,
        }

    def _parse_partner_card(self, card, region: RegionTarget) -> Optional[Partner]:
        try:
            profile_url = card.get("href", "")
            if profile_url and not profile_url.startswith("http"):
                profile_url = f"{self.BASE_URL}{profile_url}"

            name_element = card.select_one("h5 span:first-child")
            name = self._extract_text(name_element, "Unknown")

            if name == "K?ta Yaz?l?m":
                name = "Kıta Yazılım"

            level_element = card.select_one("h5 span.badge")
            level = self._extract_text(level_element, "").strip() or "Learning"
            if level.lower() == "learning":
                level = "Learning"

            logo_element = card.select_one("img")
            logo_url = logo_element.get("src", "") if logo_element else None
            if logo_url and not logo_url.startswith("http"):
                logo_url = f"{self.BASE_URL}{logo_url}"

            rating_text = self._extract_text(card.select_one("div.mb-2 small"))
            rating_percentage = self._extract_first_number(rating_text)

            location = self._parse_location(card, region)
            project_sizes = self._parse_project_sizes(card)

            references_block = card.select_one(".stat_ref")
            certifications_block = card.select_one(".stat_cert")

            return Partner(
                region_code=region.code,
                country_code=region.country_code,
                name=name,
                level=level,
                city=location["city"],
                district=location["district"],
                country=region.name,
                full_address=location["full_address"],
                rating_percentage=rating_percentage,
                average_project_size=project_sizes["average_project_size"],
                large_project_size=project_sizes["large_project_size"],
                references_count=self._parse_stat_total(references_block) if references_block else "0",
                certified_experts_count=self._parse_stat_total(certifications_block) if certifications_block else "0",
                profile_url=profile_url,
                logo_url=logo_url,
                about_text=None,
                certifications_breakdown=[],
                industries_breakdown=[],
                scraped_at=datetime.now().isoformat(),
            )
        except Exception as error:
            print(f"⚠️ Failed to parse partner card: {error}")
            return None

    def _parse_detail_pairs(self, block) -> List[Dict[str, int | str]]:
        if not block:
            return []

        tokens = list(block.stripped_strings)
        if len(tokens) <= 1:
            return []

        pairs = []
        cursor = 1
        while cursor + 1 < len(tokens):
            count = self._extract_first_number(tokens[cursor])
            label = tokens[cursor + 1].strip()
            if count and label:
                pairs.append({"label": label, "count": int(count)})
            cursor += 2
        return pairs

    def _scrape_partner_details(self, partner: Partner):
        if not partner.profile_url:
            return

        time.sleep(self.delay_seconds)
        soup = self._get_page(partner.profile_url)
        if not soup:
            return

        try:
            cert_pairs = self._parse_detail_pairs(soup.select_one(".stat_cert"))
            partner.certifications_breakdown = [
                {"version": pair["label"], "count": pair["count"]}
                for pair in cert_pairs
            ]

            industry_pairs = self._parse_detail_pairs(soup.select_one(".stat_ref"))
            partner.industries_breakdown = [
                {"industry": pair["label"], "count": pair["count"]}
                for pair in industry_pairs
            ]

            header = soup.select_one("#partner_name")
            if header and header.parent and header.parent.parent:
                about_container = header.parent.parent.find_next_sibling("div", class_="mb-5")
                if about_container:
                    about = about_container.get_text(separator=" ", strip=True)
                    about = re.sub(r"\s+", " ", about).strip()
                    if about:
                        partner.about_text = about
        except Exception as error:
            print(f"⚠️ Failed to parse detail page for {partner.name}: {error}")

    def _get_total_pages(self, soup: BeautifulSoup) -> int:
        max_page = 1
        for link in soup.select(".pagination .page-link"):
            href = link.get("href", "")
            match = re.search(r"/page/(\d+)", href)
            if match:
                max_page = max(max_page, int(match.group(1)))
        return max_page

    def scrape_region(self, region: RegionTarget, source_url: str) -> List[Partner]:
        soup = self._get_page(source_url)
        if not soup:
            print(f"❌ Could not load landing page for {region.name}")
            return []

        total_pages = self._get_total_pages(soup)
        print(f"\n🌍 {region.name} ({region.code.upper()}) - {total_pages} page(s)")

        partners: List[Partner] = []
        seen_urls = set()

        for page_number in range(1, total_pages + 1):
            if page_number == 1:
                page_soup = soup
            else:
                time.sleep(self.delay_seconds)
                page_soup = self._get_page(f"{source_url}/page/{page_number}")
                if not page_soup:
                    continue

            partner_cards = page_soup.select("a.text-decoration-none.row.p-2")
            print(f"  📄 Page {page_number}: {len(partner_cards)} partner card(s)")

            for card in partner_cards:
                partner = self._parse_partner_card(card, region)
                if not partner or not partner.profile_url or partner.profile_url in seen_urls:
                    continue

                seen_urls.add(partner.profile_url)

                if self.include_details:
                    self._scrape_partner_details(partner)

                partners.append(partner)
                print(f"    ✅ {partner.name} ({partner.level})")

        return partners

    def save_region_json(self, partners: List[Partner], region: RegionTarget, source_url: str, output_dir: Path):
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{region.code}.json"
        payload = {
            "region_code": region.code,
            "country_code": region.country_code,
            "country_name": region.name,
            "scraped_at": datetime.now().isoformat(),
            "total_partners": len(partners),
            "source_url": source_url,
            "partners": [asdict(partner) for partner in partners],
        }

        with output_path.open("w", encoding="utf-8") as file:
            json.dump(payload, file, ensure_ascii=False, indent=2)

        print(f"💾 Saved {len(partners)} partners to {output_path}")

    def save_region_csv(self, partners: List[Partner], region: RegionTarget, output_dir: Path):
        if not partners:
            return

        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{region.code}.csv"

        with output_path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=asdict(partners[0]).keys())
            writer.writeheader()
            for partner in partners:
                writer.writerow(asdict(partner))

        print(f"💾 Saved CSV snapshot to {output_path}")


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    default_output_dir = project_root / "web" / "public" / "data" / "regions"
    default_csv_dir = project_root / "scraper" / "output" / "csv"

    parser = argparse.ArgumentParser(description="Scrape Odoo partners by European region.")
    parser.add_argument(
        "--regions",
        default="tr",
        help="Comma-separated region codes (example: tr,de,fr). Ignored when --all-europe is used.",
    )
    parser.add_argument(
        "--all-europe",
        action="store_true",
        help="Scrape every configured European country.",
    )
    parser.add_argument(
        "--skip-details",
        action="store_true",
        help="Skip partner detail pages for faster runs.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.5,
        help="Delay between requests in seconds.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(default_output_dir),
        help="Directory for region JSON files.",
    )
    parser.add_argument(
        "--csv-dir",
        default=None,
        help=f"Optional directory for per-region CSV snapshots. Example: {default_csv_dir}",
    )
    return parser.parse_args()


def select_regions(raw_value: str, all_europe: bool) -> List[RegionTarget]:
    if all_europe:
        return EUROPEAN_REGIONS

    requested_codes = [code.strip().lower() for code in raw_value.split(",") if code.strip()]
    invalid_codes = [code for code in requested_codes if code not in REGION_LOOKUP]
    if invalid_codes:
        raise SystemExit(f"Unknown region code(s): {', '.join(invalid_codes)}")

    return [REGION_LOOKUP[code] for code in requested_codes] or [REGION_LOOKUP["tr"]]


def save_region_index(index_entries: List[Dict], output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    index_path = output_dir / "index.json"
    payload = {
        "generated_at": datetime.now().isoformat(),
        "regions": index_entries,
    }

    with index_path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)

    print(f"🗂️ Saved region index to {index_path}")


def summarize(partners: Iterable[Partner]):
    totals = {}
    for partner in partners:
        totals[partner.level] = totals.get(partner.level, 0) + 1
    return totals


def main():
    args = parse_args()
    regions = select_regions(args.regions, args.all_europe)
    output_dir = Path(args.output_dir).expanduser().resolve()
    csv_dir = Path(args.csv_dir).expanduser().resolve() if args.csv_dir else None

    print("=" * 68)
    print("🚀 Odoo Europe Partner Scraper")
    print("=" * 68)
    print(f"Regions: {', '.join(region.code.upper() for region in regions)}")
    print(f"Details: {'enabled' if not args.skip_details else 'skipped'}")
    print(f"Output:  {output_dir}")
    print()

    scraper = OdooPartnerScraper(
        delay_seconds=max(args.delay, 0),
        include_details=not args.skip_details,
    )

    discovered_urls = scraper.discover_region_urls()
    if not discovered_urls:
        raise SystemExit("Could not discover any live Odoo country URLs.")

    region_index = []

    for region in regions:
        source_url = discovered_urls.get(region.code)
        if not source_url:
            print(f"⚠️ Skipping {region.name}: no live Odoo path found")
            continue

        partners = scraper.scrape_region(region, source_url)
        scraper.save_region_json(partners, region, source_url, output_dir)

        if csv_dir:
            scraper.save_region_csv(partners, region, csv_dir)

        region_index.append({
            "code": region.code,
            "country_code": region.country_code,
            "country_name": region.name,
            "partner_count": len(partners),
            "scraped_at": datetime.now().isoformat(),
            "source_url": source_url,
            "levels": summarize(partners),
        })

        print(f"📊 {region.name}: {len(partners)} partners")

    save_region_index(region_index, output_dir)

    print()
    print("✅ Scrape completed.")


if __name__ == "__main__":
    main()
