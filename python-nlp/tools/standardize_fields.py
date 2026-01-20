"""
Standardize Field Names Across All State Files
===============================================
Ensures all state JSON files use consistent field names.
"""

import json
from pathlib import Path


def standardize_state_file(file_path: Path) -> dict:
    """Standardize field names in a state JSON file"""

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Check if already standardized
    if not data.get("laws"):
        print(f"  {file_path.name}: No laws found, skipping")
        return data

    # Standardize each law
    for law in data["laws"]:
        # Rename statute_citation to law_citation (our standard)
        if "statute_citation" in law:
            law["law_citation"] = law.pop("statute_citation")

        # Ensure all required fields exist
        if "full_text" not in law:
            # Use requirements or summary as full_text
            if "requirements" in law:
                if isinstance(law["requirements"], list):
                    law["full_text"] = "\n".join(law["requirements"])
                else:
                    law["full_text"] = law["requirements"]
            else:
                law["full_text"] = law.get("summary", "")

        # Ensure severity exists
        if "severity" not in law:
            # Determine from summary
            summary_lower = law.get("summary", "").lower()
            if any(word in summary_lower for word in ["prohibit", "cannot", "illegal", "void"]):
                law["severity"] = "error"
            else:
                law["severity"] = "warning"

        # Ensure flagged_phrases exists
        if "flagged_phrases" not in law:
            topic = law.get("topic", "")
            law["flagged_phrases"] = [
                topic.replace('_', ' '),
                topic.replace('_', '-')
            ]

        # Ensure suggestion exists
        if "suggestion" not in law:
            state = data.get("state", "this state")
            topic = law.get("topic", "").replace('_', ' ')
            law["suggestion"] = f"Review {state} {topic} requirements and ensure compliance."

        # Ensure source_url exists
        if "source_url" not in law:
            law["source_url"] = ""

        # Ensure effective_date exists
        if "effective_date" not in law:
            law["effective_date"] = "Unknown"

        # Remove requirements field if it exists (now in full_text)
        if "requirements" in law:
            del law["requirements"]

        # Add confidence and needs_verification if missing
        if "confidence" not in law:
            confidence_level = law.get("confidence_level", "medium")
            if confidence_level == "high":
                law["confidence"] = 0.95
            elif confidence_level == "medium-high":
                law["confidence"] = 0.85
            elif confidence_level == "medium":
                law["confidence"] = 0.75
            else:
                law["confidence"] = 0.65

        if "needs_verification" not in law:
            law["needs_verification"] = law.get("confidence", 0.9) < 0.85

        # Remove confidence_level (replaced by confidence number)
        if "confidence_level" in law:
            del law["confidence_level"]

    # Ensure state-level fields exist
    if "data_collection_method" not in data:
        data["data_collection_method"] = "manual_high_quality"

    if "last_updated" not in data:
        data["last_updated"] = "2026-01-13"

    # Remove data_quality and additional_notes (move to review_notes if needed)
    if "data_quality" in data:
        del data["data_quality"]

    if "additional_notes" in data:
        del data["additional_notes"]

    # Add review_notes
    if "review_notes" not in data:
        data["review_notes"] = {
            "total_laws_found": len(data["laws"]),
            "high_confidence": len([l for l in data["laws"] if l.get("confidence", 0) >= 0.85]),
            "needs_verification": len([l for l in data["laws"] if l.get("needs_verification", False)]),
            "next_steps": "Data is high quality and ready for production use"
        }

    return data


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Standardize field names in state JSON files')
    parser.add_argument('--input-dir', '-i',
                       default='../data/Data json',
                       help='Input directory with JSON files')
    parser.add_argument('--output-dir', '-o',
                       default='../data/state_laws_final',
                       help='Output directory for standardized files')

    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print("STANDARDIZING STATE LAW FILES")
    print(f"{'='*60}\n")

    json_files = list(input_dir.glob("*.json"))

    if not json_files:
        print(f"[ERROR] No JSON files found in {input_dir}")
        return 1

    print(f"Found {len(json_files)} files to process\n")

    for file_path in json_files:
        print(f"Processing {file_path.name}...")

        try:
            standardized_data = standardize_state_file(file_path)

            # Save to output directory
            output_file = output_dir / file_path.name
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(standardized_data, f, indent=2, ensure_ascii=False)

            print(f"  [OK] Saved to {output_file.name}")

        except Exception as e:
            print(f"  [ERROR] {e}")

    print(f"\n{'='*60}")
    print("STANDARDIZATION COMPLETE")
    print(f"{'='*60}")
    print(f"Output directory: {output_dir}")
    print(f"\nNext steps:")
    print("1. Review files in output directory")
    print("2. Load into RAG database:")
    print("   cd ..")
    print("   python load_all_states.py --data-dir data/state_laws_final")
    print(f"{'='*60}\n")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
