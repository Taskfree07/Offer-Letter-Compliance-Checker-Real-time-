"""
Enhance state law files with specific, actionable suggestions using LLM
"""
import json
import os
from pathlib import Path
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

# Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

# Initialize Groq
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.2,
    max_tokens=500
)

def generate_suggestion(state: str, topic: str, summary: str, law_citation: str, severity: str) -> str:
    """Generate a specific, actionable suggestion for a law"""

    prompt = f"""You are a legal compliance expert. Generate a SPECIFIC, ACTIONABLE suggestion for an offer letter based on this state law.

STATE: {state}
TOPIC: {topic}
LAW: {law_citation}
SUMMARY: {summary}
SEVERITY: {severity}

Requirements for your suggestion:
1. Be SPECIFIC to {state} law - mention the state name
2. Provide EXACT alternative language if the clause should be modified
3. If it's a ban (like non-compete ban), say "Remove this clause entirely" and explain what can be used instead
4. If it's a restriction (like salary history), provide compliant alternative wording
5. If it's acceptable (like at-will), confirm it's acceptable and note any caveats
6. Keep it concise but actionable (2-3 sentences max)

Examples of GOOD suggestions:
- "Remove the non-compete clause entirely as it is void under {state} law. Use only confidentiality and trade secret protection clauses instead."
- "Remove salary history questions. Replace with: 'Please provide your salary expectations for this role.'"
- "Modify background check timing: 'Background checks will be conducted after a conditional offer is extended.'"
- "Language is acceptable under {state} law. Ensure it's not contradicted elsewhere in the contract."

Generate ONLY the suggestion text, nothing else:"""

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        suggestion = response.content.strip()
        # Clean up any quotes or extra formatting
        suggestion = suggestion.strip('"\'')
        return suggestion
    except Exception as e:
        print(f"    Error generating suggestion: {e}")
        return None


def enhance_state_file(filepath: Path) -> bool:
    """Enhance a single state file with specific suggestions"""

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    state = data.get('state', filepath.stem)
    state_code = data.get('state_code', filepath.stem)
    laws = data.get('laws', [])

    if not laws:
        print(f"  No laws found in {filepath.name}")
        return False

    modified = False

    for i, law in enumerate(laws):
        current_suggestion = law.get('suggestion', '')

        # Skip if already has a specific suggestion (not generic)
        generic_suggestions = [
            'Review non compete requirements',
            'Review salary history requirements',
            'Review background check requirements',
            'Review drug screening requirements',
            'Review arbitration requirements',
            'Review pay transparency requirements',
            'Review at-will employment requirements',
            ''
        ]

        if current_suggestion not in generic_suggestions:
            print(f"    [{i+1}] {law.get('topic')}: Already has specific suggestion, skipping")
            continue

        topic = law.get('topic', 'unknown')
        summary = law.get('summary', '')
        law_citation = law.get('law_citation', '')
        severity = law.get('severity', 'warning')

        print(f"    [{i+1}] Generating suggestion for: {topic}")

        new_suggestion = generate_suggestion(state, topic, summary, law_citation, severity)

        if new_suggestion:
            law['suggestion'] = new_suggestion
            modified = True
            print(f"        -> {new_suggestion[:80]}...")

    if modified:
        # Save updated file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  Saved updated {filepath.name}")

    return modified


def main():
    print("=" * 70)
    print("ENHANCING STATE LAW FILES WITH SPECIFIC SUGGESTIONS")
    print("=" * 70)
    print()

    data_dir = Path("data/state_laws_50")
    state_files = sorted(data_dir.glob("*.json"))

    print(f"Found {len(state_files)} state files")
    print()

    # Skip California (already has good suggestions)
    skip_states = ['CA']

    enhanced_count = 0

    for filepath in state_files:
        state_code = filepath.stem

        if state_code in skip_states:
            print(f"[{state_code}] Skipping (already has quality data)")
            continue

        print(f"[{state_code}] Processing...")

        try:
            if enhance_state_file(filepath):
                enhanced_count += 1
        except Exception as e:
            print(f"  Error processing {filepath.name}: {e}")

        print()

    print("=" * 70)
    print(f"ENHANCEMENT COMPLETE: {enhanced_count} files updated")
    print("=" * 70)


if __name__ == "__main__":
    main()
