"""
Legal Aggregator Site Scraper
==============================
Scrapes employment law data from legal aggregator sites that compile
state-by-state information and DON'T block bots.

Data Sources:
- SixFifty.com - Non-compete laws by state
- Homebase.com - Employment law guides
- Paycor.com - HR compliance resources
- NerdWallet, Indeed, etc. - Employment law summaries

These sites aggregate official data and update regularly.
"""

import requests
from bs4 import BeautifulSoup
import json
from pathlib import Path
from typing import Dict, List
import time
import re


# Aggregator sites with state employment law data (that don't block bots!)
AGGREGATOR_SOURCES = {
    "non_compete": [
        {
            "name": "SixFifty",
            "url": "https://www.sixfifty.com/resource-library/non-compete-agreement-by-state/",
            "covers_all_states": True
        },
        {
            "name": "Homebase",
            "url": "https://www.joinhomebase.com/blog/non-compete-laws",
            "covers_all_states": True
        }
    ],
    "salary_history": [
        {
            "name": "HR Dive",
            "url": "https://www.hrdive.com/news/salary-history-ban-states-list/516662/",
            "covers_all_states": False  # Only states with bans
        }
    ],
    "pay_transparency": [
        {
            "name": "Paycor",
            "url": "https://www.paycor.com/resource-center/articles/states-with-pay-transparency-laws/",
            "covers_all_states": False
        }
    ],
    "background_checks": [
        {
            "name": "GoodHire",
            "url": "https://www.goodhire.com/resources/articles/ban-the-box-laws-by-state/",
            "covers_all_states": False
        }
    ],
    "paid_leave": [
        {
            "name": "NCSL",
            "url": "https://www.ncsl.org/labor-and-employment/paid-sick-leave",
            "covers_all_states": False
        }
    ]
}


class AggregatorScraper:
    """Scrape employment law data from aggregator sites"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
        })

    def fetch_page(self, url: str) -> str:
        """Fetch page content"""
        print(f"  Fetching: {url}")

        try:
            time.sleep(2)  # Be polite
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text

        except Exception as e:
            print(f"  [ERROR] Failed to fetch {url}: {e}")
            return None

    def extract_state_data(self, html: str, topic: str, source_name: str) -> Dict:
        """Extract state-specific data from aggregator page"""

        soup = BeautifulSoup(html, 'html.parser')

        # Get main content (remove headers, footers, nav)
        for tag in soup(['script', 'style', 'nav', 'header', 'footer']):
            tag.decompose()

        text = soup.get_text()

        # State patterns
        states = {
            "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
            "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
            "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
            "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
            "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
            "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
            "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
            "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
            "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
            "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
            "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
            "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
            "WI": "Wisconsin", "WY": "Wyoming"
        }

        state_data = {}

        # Extract info for each state
        for code, name in states.items():
            # Find paragraphs mentioning this state
            pattern = rf'\b{name}\b'
            matches = re.finditer(pattern, text, re.IGNORECASE)

            state_text = []
            for match in matches:
                # Get context (±200 chars)
                start = max(0, match.start() - 200)
                end = min(len(text), match.end() + 200)
                context = text[start:end]
                state_text.append(context)

            if state_text:
                combined_text = " ".join(state_text)

                state_data[code] = {
                    "state": name,
                    "topic": topic,
                    "summary": combined_text[:500],  # First 500 chars
                    "source": source_name,
                    "needs_structuring": True
                }

        return state_data

    def scrape_topic(self, topic: str) -> Dict:
        """Scrape all sources for a given topic"""

        print(f"\n{'='*60}")
        print(f"SCRAPING: {topic.upper()}")
        print(f"{'='*60}\n")

        all_state_data = {}

        sources = AGGREGATOR_SOURCES.get(topic, [])

        for source in sources:
            print(f"\nSource: {source['name']}")

            html = self.fetch_page(source['url'])

            if html:
                state_data = self.extract_state_data(html, topic, source['name'])
                print(f"  Found data for {len(state_data)} states")

                # Merge with existing data
                for state_code, data in state_data.items():
                    if state_code not in all_state_data:
                        all_state_data[state_code] = []
                    all_state_data[state_code].append(data)

            time.sleep(3)  # Be polite to servers

        return all_state_data

    def scrape_all_topics(self) -> Dict:
        """Scrape all topics for all states"""

        all_data = {}

        for topic in AGGREGATOR_SOURCES.keys():
            topic_data = self.scrape_topic(topic)

            for state_code, state_entries in topic_data.items():
                if state_code not in all_data:
                    all_data[state_code] = {
                        "state": state_entries[0]["state"],
                        "topics": {}
                    }

                all_data[state_code]["topics"][topic] = state_entries

        return all_data

    def save_raw_data(self, data: Dict, output_dir: str = "../data/aggregator_raw"):
        """Save raw scraped data"""

        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        filename = output_path / "all_states_raw.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"\n[SAVED] Raw data: {filename}")
        print(f"States found: {len(data)}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Scrape employment law data from aggregator sites')
    parser.add_argument('--topic', '-t',
                       choices=['non_compete', 'salary_history', 'pay_transparency',
                               'background_checks', 'paid_leave', 'all'],
                       default='all',
                       help='Topic to scrape (default: all)')
    parser.add_argument('--output', '-o', default='../data/aggregator_raw',
                       help='Output directory')

    args = parser.parse_args()

    scraper = AggregatorScraper()

    if args.topic == 'all':
        print("\n[INFO] Scraping ALL topics from aggregator sites...")
        print("This will take 5-10 minutes (being polite to servers)")
        print(f"{'='*60}\n")

        data = scraper.scrape_all_topics()

    else:
        data = scraper.scrape_topic(args.topic)

    scraper.save_raw_data(data, args.output)

    print(f"\n{'='*60}")
    print("NEXT STEPS:")
    print(f"{'='*60}")
    print("1. Raw data saved - now needs structuring")
    print("2. Run: python structure_aggregator_data.py")
    print("3. This will use Phi-3 to structure the raw text into proper JSON")
    print("4. Then verify key facts (10 min per state)")
    print(f"{'='*60}\n")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
