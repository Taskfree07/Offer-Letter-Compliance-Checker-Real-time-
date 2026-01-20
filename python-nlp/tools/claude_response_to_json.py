"""
Claude Chat Response to JSON Converter
========================================
Converts Claude's text response into structured JSON format
for state employment laws.

Usage:
    python claude_response_to_json.py --state MA --input response.txt
    python claude_response_to_json.py --state MA --text "paste response here"
"""

import json
import re
from pathlib import Path
import argparse


def parse_claude_response(text: str, state_code: str, state_name: str) -> dict:
    """Parse Claude's response into structured JSON"""

    laws = []

    # Try to split by topic markers
    # Claude usually formats as "**Topic**: [name]" or "Topic: [name]"
    topic_pattern = r'\*?\*?Topic\*?\*?:?\s*(.+?)(?:\n|$)'
    topics = re.split(topic_pattern, text, flags=re.IGNORECASE)

    current_law = None

    for i, chunk in enumerate(topics):
        chunk = chunk.strip()
        if not chunk:
            continue

        # Check if this is a topic name
        topic_keywords = {
            'non-compete': 'non_compete',
            'noncompete': 'non_compete',
            'non compete': 'non_compete',
            'salary history': 'salary_history',
            'pay transparency': 'pay_transparency',
            'salary range': 'pay_transparency',
            'background check': 'background_checks',
            'criminal history': 'background_checks',
            'paid leave': 'paid_leave',
            'sick leave': 'paid_leave',
            'family leave': 'paid_leave',
            'arbitration': 'arbitration',
            'at-will': 'at_will_employment',
            'drug screen': 'drug_screening',
            'drug test': 'drug_screening'
        }

        matched_topic = None
        for keyword, topic_code in topic_keywords.items():
            if keyword in chunk.lower():
                matched_topic = topic_code
                break

        if matched_topic and i + 1 < len(topics):
            # This chunk is a topic name, next chunk is the content
            if current_law:
                laws.append(current_law)

            # Parse the content (next chunk)
            content = topics[i + 1] if i + 1 < len(topics) else ""

            # Extract fields
            summary_match = re.search(r'\*?\*?Summary\*?\*?:?\s*(.+?)(?:\n\*?\*?[A-Z]|$)', content, re.DOTALL)
            citation_match = re.search(r'\*?\*?Citation\*?\*?:?\s*(.+?)(?:\n|$)', content)
            requirement_match = re.search(r'\*?\*?Requirement\*?\*?:?\s*(.+?)(?:\n|$)', content, re.DOTALL)
            effective_match = re.search(r'\*?\*?Effective\*?\*?:?\s*(.+?)(?:\n|$)', content)
            source_match = re.search(r'\*?\*?Source\*?\*?:?\s*(.+?)(?:\n|$)', content)
            confidence_match = re.search(r'\*?\*?Confidence\*?\*?:?\s*(.+?)(?:\n|$)', content)

            summary = summary_match.group(1).strip() if summary_match else content[:200]
            citation = citation_match.group(1).strip() if citation_match else "[Needs verification]"
            requirement = requirement_match.group(1).strip() if requirement_match else summary
            effective = effective_match.group(1).strip() if effective_match else "Unknown"
            source = source_match.group(1).strip() if source_match else f"https://www.{state_name.lower().replace(' ', '')}.gov"
            confidence_text = confidence_match.group(1).strip().lower() if confidence_match else "medium"

            # Convert confidence to number
            confidence_map = {
                'high': 0.9,
                'medium': 0.7,
                'low': 0.5
            }
            confidence = confidence_map.get(confidence_text, 0.7)

            # Determine severity
            severity = "error" if "cannot" in requirement.lower() or "prohibited" in requirement.lower() else "warning"

            # Extract flagged phrases
            flagged_phrases = [matched_topic.replace('_', ' '), matched_topic.replace('_', '-')]

            current_law = {
                "topic": matched_topic,
                "summary": summary,
                "law_citation": citation,
                "full_text": requirement,
                "severity": severity,
                "flagged_phrases": flagged_phrases,
                "suggestion": f"Review and comply with {state_name} requirements for {matched_topic.replace('_', ' ')}. {requirement}",
                "source_url": source,
                "effective_date": effective,
                "confidence": confidence,
                "needs_verification": confidence < 0.85
            }

    # Add last law
    if current_law:
        laws.append(current_law)

    # Create state data structure
    state_data = {
        "state": state_name,
        "state_code": state_code,
        "last_updated": "2025-01-12",
        "data_collection_method": "claude_chat_assisted",
        "laws": laws,
        "review_notes": {
            "total_laws_found": len(laws),
            "high_confidence": len([l for l in laws if l["confidence"] >= 0.85]),
            "needs_verification": len([l for l in laws if l["needs_verification"]]),
            "next_steps": "Verify statute citations and effective dates on official .gov websites"
        }
    }

    return state_data


def main():
    parser = argparse.ArgumentParser(description='Convert Claude Chat response to JSON')
    parser.add_argument('--state', '-s', required=True,
                       help='State code (e.g., MA)')
    parser.add_argument('--input', '-i',
                       help='Input text file with Claude response')
    parser.add_argument('--text', '-t',
                       help='Direct text input (use quotes)')
    parser.add_argument('--output', '-o', default='../data/state_laws_50',
                       help='Output directory')

    args = parser.parse_args()

    # State mapping
    from llm_law_generator import ALL_STATES

    state_code = args.state.upper()
    if state_code not in ALL_STATES:
        print(f"[ERROR] Unknown state: {state_code}")
        return 1

    state_name = ALL_STATES[state_code]

    # Get input text
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            text = f.read()
    elif args.text:
        text = args.text
    else:
        print("[ERROR] Provide either --input or --text")
        return 1

    # Parse
    print(f"\n[INFO] Parsing Claude response for {state_name}...\n")

    state_data = parse_claude_response(text, state_code, state_name)

    # Save
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / f"{state_code}.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(state_data, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Saved to: {output_file}")
    print(f"\nLaws found: {len(state_data['laws'])}")
    print(f"High confidence: {state_data['review_notes']['high_confidence']}")
    print(f"Need verification: {state_data['review_notes']['needs_verification']}")

    print(f"\n{'='*60}")
    print("NEXT STEPS:")
    print(f"{'='*60}")
    print(f"1. Open: {output_file}")
    print(f"2. Review laws with 'needs_verification: true'")
    print(f"3. Verify statute citations on official .gov websites")
    print(f"4. Update any incorrect information")
    print(f"5. Set 'needs_verification: false' when done")
    print(f"{'='*60}\n")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
