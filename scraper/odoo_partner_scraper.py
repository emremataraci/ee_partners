#!/usr/bin/env python3
"""
Odoo Turkey Partners Web Scraper
================================
Bu script Odoo'nun Türkiye partner sayfasından partner bilgilerini çeker.

Kullanım:
    python odoo_partner_scraper.py

Gereksinimler:
    pip install requests beautifulsoup4 pandas

Çıktı:
    - odoo_partners.csv: Tüm partner bilgilerini içeren CSV dosyası
    - odoo_partners.json: Tüm partner bilgilerini içeren JSON dosyası
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import re
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class Partner:
    """Partner veri modeli"""
    name: str
    level: str  # Gold, Silver, Ready
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
    scraped_at: str


class OdooPartnerScraper:
    """Odoo partner bilgilerini çeken scraper sınıfı"""
    
    BASE_URL = "https://www.odoo.com"
    PARTNERS_URL = "https://www.odoo.com/tr_TR/partners/country/turkiye-215"
    
    def __init__(self, delay_seconds: float = 1.0):
        """
        Args:
            delay_seconds: Her istek arasında beklenecek süre (saniye)
        """
        self.delay_seconds = delay_seconds
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        })
    
    def _get_page(self, url: str) -> Optional[BeautifulSoup]:
        """URL'den sayfa içeriğini çeker"""
        try:
            print(f"📥 Sayfa çekiliyor: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"❌ Hata: {url} çekilemedi - {e}")
            return None
    
    def _extract_text(self, element, default: str = "") -> str:
        """Element'ten text çıkarır"""
        if element:
            return element.get_text(strip=True)
        return default
    
    def _parse_partner_card(self, card) -> Optional[Partner]:
        """Partner kartından bilgileri çıkarır"""
        try:
            # Partner profil URL'i
            profile_url = card.get('href', '')
            if profile_url and not profile_url.startswith('http'):
                profile_url = self.BASE_URL + profile_url
            
            # Partner adı - h5 içindeki ilk span
            name_element = card.select_one('h5 span:first-child')
            name = self._extract_text(name_element, "Bilinmiyor")
            
            # Partner seviyesi (Gold, Silver, Ready)
            level_element = card.select_one('h5 span.badge')
            level = self._extract_text(level_element, "")
            
            # Logo URL
            logo_element = card.select_one('img')
            logo_url = None
            if logo_element:
                logo_url = logo_element.get('src', '')
                if logo_url and not logo_url.startswith('http'):
                    logo_url = self.BASE_URL + logo_url
            
            # Rating yüzdesi
            rating_element = card.select_one('span.text-warning')
            rating_percentage = None
            if rating_element:
                rating_text = self._extract_text(rating_element.find_next_sibling())
                if rating_text:
                    rating_percentage = rating_text
            
            # Lokasyon bilgileri - small tag içindeki spanlar
            location_spans = card.select('small span')
            city = ""
            district = ""
            country = "Türkiye"
            full_address = ""
            
            if location_spans:
                location_texts = [self._extract_text(span) for span in location_spans]
                location_texts = [t for t in location_texts if t]  # Boş olanları filtrele
                full_address = ", ".join(location_texts)
                
                # Genellikle: İlçe, İl, Ülke formatında
                if len(location_texts) >= 3:
                    district = location_texts[0]
                    city = location_texts[1]
                    country = location_texts[2]
                elif len(location_texts) == 2:
                    city = location_texts[0]
                    country = location_texts[1]
                elif len(location_texts) == 1:
                    city = location_texts[0]
            
            # Proje büyüklükleri
            all_small = card.select('small')
            average_project_size = None
            large_project_size = None
            
            for small in all_small:
                text = self._extract_text(small)
                if 'Ortalama Proje' in text or 'ortalama' in text.lower():
                    # Kullanıcı sayısını çıkar
                    match = re.search(r'(\d+)\s*kullanıcı', text, re.IGNORECASE)
                    if match:
                        average_project_size = f"{match.group(1)} kullanıcı"
                elif 'Büyük Proje' in text or 'büyük' in text.lower():
                    match = re.search(r'~?(\d+)\s*kullanıcı', text, re.IGNORECASE)
                    if match:
                        large_project_size = f"~{match.group(1)} kullanıcı"
            
            # Referans sayısı
            references_count = "0"
            for div in card.select('div'):
                text = self._extract_text(div)
                if 'Referans' in text:
                    match = re.search(r'(\d+)\s*Referans', text)
                    if match:
                        references_count = match.group(1)
                    break
            
            # Sertifikalı uzman sayısı
            certified_experts_count = "0"
            for div in card.select('div'):
                text = self._extract_text(div)
                if 'Sertifikalı Uzman' in text:
                    match = re.search(r'(\d+)\s*Sertifikalı', text)
                    if match:
                        certified_experts_count = match.group(1)
                    break
            
            return Partner(
                name=name,
                level=level,
                city=city,
                district=district,
                country=country,
                full_address=full_address,
                rating_percentage=rating_percentage,
                average_project_size=average_project_size,
                large_project_size=large_project_size,
                references_count=references_count,
                certified_experts_count=certified_experts_count,
                profile_url=profile_url,
                logo_url=logo_url,
                scraped_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            print(f"⚠️ Partner parse hatası: {e}")
            return None
    
    def _get_total_pages(self, soup: BeautifulSoup) -> int:
        """Toplam sayfa sayısını bulur"""
        try:
            # Pagination linklerini bul
            pagination = soup.select('.pagination .page-link')
            max_page = 1
            
            for link in pagination:
                href = link.get('href', '')
                # /page/X formatını ara
                match = re.search(r'/page/(\d+)', href)
                if match:
                    page_num = int(match.group(1))
                    max_page = max(max_page, page_num)
            
            return max_page
        except Exception:
            return 1
    
    def scrape_all_partners(self) -> List[Partner]:
        """Tüm partnerleri çeker"""
        partners = []
        
        # İlk sayfayı çek
        soup = self._get_page(self.PARTNERS_URL)
        if not soup:
            print("❌ Ana sayfa çekilemedi!")
            return partners
        
        # Toplam sayfa sayısını bul
        total_pages = self._get_total_pages(soup)
        print(f"📊 Toplam {total_pages} sayfa bulundu")
        
        # Tüm sayfaları dolaş
        for page_num in range(1, total_pages + 1):
            if page_num == 1:
                page_soup = soup
            else:
                time.sleep(self.delay_seconds)
                page_url = f"{self.PARTNERS_URL}/page/{page_num}"
                page_soup = self._get_page(page_url)
                if not page_soup:
                    continue
            
            # Partner kartlarını bul
            # Selector: a.text-decoration-none.row
            partner_cards = page_soup.select('a.text-decoration-none.row.p-2')
            
            if not partner_cards:
                # Alternatif selector dene
                partner_cards = page_soup.select('a[href*="/partners/"]')
                partner_cards = [c for c in partner_cards if 'row' in c.get('class', [])]
            
            print(f"📄 Sayfa {page_num}: {len(partner_cards)} partner bulundu")
            
            for card in partner_cards:
                partner = self._parse_partner_card(card)
                if partner and partner.name != "Bilinmiyor":
                    partners.append(partner)
                    print(f"  ✅ {partner.name} ({partner.level})")
        
        return partners
    
    def save_to_csv(self, partners: List[Partner], filename: str = "odoo_partners.csv"):
        """Partnerleri CSV dosyasına kaydeder"""
        if not partners:
            print("⚠️ Kaydedilecek partner yok!")
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=asdict(partners[0]).keys())
            writer.writeheader()
            for partner in partners:
                writer.writerow(asdict(partner))
        
        print(f"💾 {len(partners)} partner {filename} dosyasına kaydedildi")
    
    def save_to_json(self, partners: List[Partner], filename: str = "odoo_partners.json"):
        """Partnerleri JSON dosyasına kaydeder"""
        if not partners:
            print("⚠️ Kaydedilecek partner yok!")
            return
        
        data = {
            "scraped_at": datetime.now().isoformat(),
            "total_partners": len(partners),
            "source_url": self.PARTNERS_URL,
            "partners": [asdict(p) for p in partners]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 {len(partners)} partner {filename} dosyasına kaydedildi")


def main():
    """Ana çalıştırma fonksiyonu"""
    print("=" * 60)
    print("🚀 Odoo Türkiye Partner Scraper")
    print("=" * 60)
    print()
    
    # Scraper'ı başlat
    scraper = OdooPartnerScraper(delay_seconds=1.5)
    
    # Tüm partnerleri çek
    partners = scraper.scrape_all_partners()
    
    print()
    print("-" * 60)
    print(f"📊 Toplam {len(partners)} partner çekildi")
    print("-" * 60)
    
    if partners:
        # CSV olarak kaydet
        scraper.save_to_csv(partners)
        
        # JSON olarak kaydet
        scraper.save_to_json(partners)
        
        print()
        print("✅ İşlem tamamlandı!")
        print()
        
        # Özet göster
        print("📈 Partner Seviyeleri:")
        levels = {}
        for p in partners:
            level = p.level if p.level else "Belirtilmemiş"
            levels[level] = levels.get(level, 0) + 1
        for level, count in sorted(levels.items()):
            print(f"   • {level}: {count}")
        
        print()
        print("🏙️ Şehirlere Göre Dağılım:")
        cities = {}
        for p in partners:
            city = p.city if p.city else "Belirtilmemiş"
            cities[city] = cities.get(city, 0) + 1
        for city, count in sorted(cities.items(), key=lambda x: -x[1])[:10]:
            print(f"   • {city}: {count}")
    else:
        print("❌ Hiç partner çekilemedi. Lütfen bağlantınızı kontrol edin.")


if __name__ == "__main__":
    main()
