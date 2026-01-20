"""
Document to State JSON Converter
Upload a text document with state laws, converts to our JSON format

USAGE:
1. Create a text file with state laws (copy from government website)
2. Run: python doc_to_state_json.py --state MA --file ma_laws.txt
3. Script generates MA.json in correct format

This uses a SEPARATE Claude API call (not your current conversation)
"""

import argparse
import json
import os
from pathlib import Path
import re


def create_state_json_template(state_code: str, state_name: str, laws_text: str) -> dict:
    """
    Create a state JSON structure from raw text

    This is a MANUAL template - you fill in the details
    """

    # Parse the laws text to extract topics (basic heuristic)
    topics = []

    # Common topics to look for
    topic_keywords = {
        "non_compete": ["non-compete", "non compete", "noncompete", "competitive restriction"],
        "salary_history": ["salary history", "wage history", "previous compensation"],
        "pay_transparency": ["pay transparency", "salary range", "wage disclosure"],
        "background_checks": ["background check", "criminal history", "ban the box"],
        "paid_leave": ["paid leave", "sick leave", "family leave"],
        "arbitration": ["arbitration", "dispute resolution"],
        "exempt_threshold": ["exempt", "salary threshold", "overtime exempt"],
        "at_will": ["at-will", "at will employment"],
        "drug_screening": ["drug test", "drug screening"]
    }

    # Find which topics are mentioned in the text
    laws_lower = laws_text.lower()
    found_topics = []

    for topic, keywords in topic_keywords.items():
        if any(kw in laws_lower for kw in keywords):
            found_topics.append(topic)

    # Create template structure
    template = {
        "state": state_name,
        "state_code": state_code,
        "last_updated": "2025-01-12",  # Today's date
        "data_sources": [
            {
                "url": f"https://{state_code.lower()}.gov/labor",
                "title": f"{state_name} Department of Labor"
            }
        ],
        "laws": []
    }

    # Create law templates for each found topic
    for topic in found_topics:
        law = {
            "topic": topic,
            "summary": f"[FILL IN: Brief summary of {state_name} {topic} law]",
            "law_citation": f"[FILL IN: Exact statute reference]",
            "full_text": f"[FILL IN: Full explanation from source document]",
            "severity": "error",  # Change to "warning" or "info" as needed
            "flagged_phrases": [f"[FILL IN: phrases that trigger this rule]"],
            "suggestion": f"[FILL IN: How to fix this violation]",
            "source_url": f"https://{state_code.lower()}.gov/labor",
            "effective_date": "2025-01-01"
        }
        template["laws"].append(law)

    return template


def convert_text_to_state_json(state_code: str, state_name: str, input_file: str, output_file: str = None):
    """
    Convert a text document to state JSON format

    Args:
        state_code: Two-letter state code (e.g., "MA")
        state_name: Full state name (e.g., "Massachusetts")
        input_file: Path to text file with laws
        output_file: Output JSON file path (optional)
    """

    # Read input file
    with open(input_file, 'r', encoding='utf-8') as f:
        laws_text = f.read()

    print(f"\n{'='*60}")
    print(f"CONVERTING {state_name} ({state_code}) LAWS TO JSON")
    print(f"{'='*60}")
    print(f"\nInput file: {input_file}")
    print(f"Input size: {len(laws_text)} characters")

    # Create template
    state_json = create_state_json_template(state_code, state_name, laws_text)

    # Set output file
    if not output_file:
        script_dir = Path(__file__).parent.parent
        output_dir = script_dir / "data" / "state_laws_20"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"{state_code}.json"

    # Save JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(state_json, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] Created: {output_file}")
    print(f"Topics found: {len(state_json['laws'])}")
    print(f"\nTopics detected:")
    for law in state_json['laws']:
        print(f"  - {law['topic']}")

    print(f"\n{'='*60}")
    print("NEXT STEPS:")
    print(f"{'='*60}")
    print(f"1. Open: {output_file}")
    print(f"2. Fill in [FILL IN: ...] placeholders with actual law details")
    print(f"3. Add/remove topics as needed")
    print(f"4. Verify accuracy against official sources")
    print(f"5. Load into vector DB: python -c \"from compliance_v2.rag_service import get_rag_service; rag = get_rag_service(); rag.load_state_laws('{state_code}')\"")
    print(f"\n{'='*60}")

    # Also print the raw text to help with manual filling
    print(f"\nRAW TEXT PREVIEW (first 1000 chars):")
    print(f"{'='*60}")
    print(laws_text[:1000])
    print("...")
    print(f"{'='*60}\n")

    return output_file


def main():
    parser = argparse.ArgumentParser(description='Convert text document to state JSON')
    parser.add_argument('--state', '-s', required=True, help='State code (e.g., MA)')
    parser.add_argument('--name', '-n', required=True, help='State name (e.g., Massachusetts)')
    parser.add_argument('--file', '-f', required=True, help='Input text file with laws')
    parser.add_argument('--output', '-o', help='Output JSON file (optional)')

    args = parser.parse_args()

    # Validate state code
    if len(args.state) != 2:
        print("ERROR: State code must be 2 letters (e.g., MA)")
        return 1

    state_code = args.state.upper()

    # Check if input file exists
    if not os.path.exists(args.file):
        print(f"ERROR: Input file not found: {args.file}")
        return 1

    # Convert
    try:
        output_file = convert_text_to_state_json(
            state_code=state_code,
            state_name=args.name,
            input_file=args.file,
            output_file=args.output
        )

        return 0

    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
