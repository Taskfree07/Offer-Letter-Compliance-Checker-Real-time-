import os
import json
from datetime import datetime
from langchain_community.document_loaders import SeleniumURLLoader

OUTPUT_DIR = "scraped_laws"
os.makedirs(OUTPUT_DIR, exist_ok=True)

GOVT_URLS = {
    "federal_min_wage": "https://www.dol.gov/general/topic/wages/minimumwage",
    "california_labor": "https://www.dir.ca.gov/dlse/",
    "new_york_labor": "https://dol.ny.gov/wages-and-hours",
    "texas_labor": "https://www.twc.texas.gov/jobseekers/texas-payday-law",
    "florida_labor": "https://www.myfloridalicense.com/DBPR/regulatory-plans-and-policies/",
    "washington_labor": "https://www.lni.wa.gov/workers-rights/wages/minimum-wage/",
    "illinois_labor": "https://labor.illinois.gov/laws-rules/fls.html",
    "massachusetts_labor": "https://www.mass.gov/minimum-wage-program",
    "new_jersey_labor": "https://www.nj.gov/labor/wagehour/",
    "colorado_labor": "https://cdle.colorado.gov/wage-and-hour-law"
}

def scrape_sites():
    results = []

    for key, url in GOVT_URLS.items():
        print(f"\n🔍 Scraping: {key}")

        try:
            loader = SeleniumURLLoader(
                urls=[url],
                browser="chrome"
            )

            docs = loader.load()

            if not docs or not docs[0].page_content.strip():
                print(f"⚠️ No content extracted for {key}")
                continue

            content = docs[0].page_content.strip()

            record = {
                "id": key,
                "source_url": url,
                "scraped_at": datetime.utcnow().isoformat(),
                "text_sample": content[:2000],  # safe size for review
                "full_text_length": len(content)
            }

            results.append(record)
            print(f"✅ Extracted {len(content)} characters")

        except Exception as e:
            print(f"❌ Failed for {key}: {e}")

    return results


if __name__ == "__main__":
    data = scrape_sites()

    output_file = os.path.join(OUTPUT_DIR, "legal_compliance_raw.json")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print("\n📁 Saved output to:", output_file)
