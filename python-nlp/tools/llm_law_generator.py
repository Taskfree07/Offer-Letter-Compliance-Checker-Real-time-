"""
LLM-Based State Law Generator
==============================
Uses LLM's existing knowledge to generate state employment laws,
then prompts for human verification.

This is MUCH faster than web scraping because:
- LLMs already know most state laws (trained on legal docs)
- No 403 Forbidden errors
- No fighting with bot blockers
- Still accurate with human verification

Process:
1. LLM generates laws from its training knowledge
2. Flags uncertain items
3. You verify key facts (10 min per state)
4. Save verified data to JSON
"""

import json
from pathlib import Path
from typing import Dict, List
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


# All 50 US States
ALL_STATES = {
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

# Topics to cover
LAW_TOPICS = [
    "non_compete",
    "salary_history",
    "pay_transparency",
    "background_checks",
    "paid_leave",
    "arbitration",
    "at_will_employment",
    "drug_screening"
]


class LawGenerator:
    """Generate state employment laws using LLM knowledge"""

    def __init__(self, use_phi3: bool = True):
        self.use_phi3 = use_phi3
        self.model = None
        self.tokenizer = None

        if use_phi3:
            print("\n[INFO] Loading Phi-3 model...")
            print("This may take a few minutes on first run.\n")
            self._load_phi3()

    def _load_phi3(self):
        """Load Phi-3 model"""
        try:
            model_name = "microsoft/Phi-3-mini-4k-instruct"

            self.tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                trust_remote_code=True
            )

            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Device: {device}")

            if device == "cuda":
                self.model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    trust_remote_code=True
                )
            else:
                print("Using CPU with 4-bit quantization (slower but works)")
                from transformers import BitsAndBytesConfig

                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4"
                )

                self.model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    quantization_config=quantization_config,
                    device_map="auto",
                    trust_remote_code=True
                )

            print("[SUCCESS] Phi-3 loaded!\n")

        except Exception as e:
            print(f"[WARNING] Failed to load Phi-3: {e}")
            print("Will generate manual template instead.\n")
            self.model = None

    def generate_state_laws(self, state_code: str) -> Dict:
        """Generate employment laws for a state"""

        state_name = ALL_STATES[state_code]

        print(f"\n{'='*60}")
        print(f"GENERATING LAWS FOR {state_name} ({state_code})")
        print(f"{'='*60}\n")

        if self.model is not None:
            return self._generate_with_llm(state_code, state_name)
        else:
            return self._generate_manual_template(state_code, state_name)

    def _generate_with_llm(self, state_code: str, state_name: str) -> Dict:
        """Use Phi-3 to generate laws"""

        prompt = f"""You are a legal expert on US state employment law.

TASK: List the key employment laws in {state_name} that affect OFFER LETTERS.

For each law, provide:
1. Topic (non_compete, salary_history, pay_transparency, background_checks, paid_leave, arbitration, at_will_employment, or drug_screening)
2. Summary (2-3 sentences)
3. Law citation (statute number, e.g., "Cal. Bus. & Prof. Code § 16600")
4. Whether employers can/cannot do something
5. Effective date (year)
6. Confidence (0.0-1.0) - how certain you are this is accurate

IMPORTANT:
- Only include laws you're confident about (confidence >= 0.6)
- If {state_name} has NO specific law on a topic, don't include it
- Focus on laws that affect what can/cannot be in offer letters

OUTPUT JSON ONLY:
{{
  "laws": [
    {{
      "topic": "...",
      "summary": "...",
      "law_citation": "...",
      "full_text": "...",
      "severity": "error" or "warning" or "info",
      "flagged_phrases": [...],
      "suggestion": "...",
      "effective_date": "...",
      "confidence": 0.X,
      "needs_verification": true/false
    }}
  ]
}}"""

        print("[LLM] Generating laws from training knowledge...")

        try:
            # Format for Phi-3
            messages = [{"role": "user", "content": prompt}]

            input_ids = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            ).to(self.model.device)

            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    input_ids,
                    max_new_tokens=2048,
                    temperature=0.3,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.eos_token_id
                )

            response = self.tokenizer.decode(
                outputs[0][input_ids.shape[1]:],
                skip_special_tokens=True
            )

            # Extract JSON
            json_start = response.find('{')
            json_end = response.rfind('}') + 1

            if json_start == -1:
                print("[WARNING] No JSON in response, creating manual template")
                return self._generate_manual_template(state_code, state_name)

            json_str = response[json_start:json_end]
            data = json.loads(json_str)

            laws = data.get("laws", [])

            print(f"[SUCCESS] Generated {len(laws)} laws\n")

            # Add metadata
            for law in laws:
                # Mark for verification if confidence < 0.85
                law["needs_verification"] = law.get("confidence", 0.7) < 0.85

            # Create full state data
            state_data = {
                "state": state_name,
                "state_code": state_code,
                "last_updated": "2025-01-12",
                "data_collection_method": "llm_generated_phi3",
                "laws": laws,
                "review_notes": {
                    "total_laws_generated": len(laws),
                    "needs_verification": len([l for l in laws if l.get("needs_verification", True)]),
                    "avg_confidence": f"{sum(l.get('confidence', 0.7) for l in laws) / max(len(laws), 1):.1%}",
                    "next_steps": "Verify statute citations and effective dates on official .gov websites"
                }
            }

            return state_data

        except Exception as e:
            print(f"[ERROR] LLM generation failed: {e}")
            print("Creating manual template instead\n")
            return self._generate_manual_template(state_code, state_name)

    def _generate_manual_template(self, state_code: str, state_name: str) -> Dict:
        """Create manual template for human to fill in"""

        print(f"[INFO] Creating manual template for {state_name}")
        print("You'll need to fill this in manually using Claude Chat or research\n")

        # Create placeholder laws
        laws = []
        for topic in LAW_TOPICS:
            law = {
                "topic": topic,
                "summary": f"[TO FILL] Research {state_name} laws about {topic.replace('_', ' ')}",
                "law_citation": "[TO FILL - Find exact statute citation]",
                "full_text": f"[TO FILL] Detailed requirements for {topic.replace('_', ' ')} in {state_name}",
                "severity": "warning",
                "flagged_phrases": [topic.replace('_', ' '), topic.replace('_', '-')],
                "suggestion": f"[TO FILL] How to comply with {state_name} {topic.replace('_', ' ')} law",
                "source_url": f"[TO FILL - Link to official {state_name} .gov source]",
                "effective_date": "[TO FILL - When did this law take effect?]",
                "confidence": 0.0,
                "needs_verification": True,
                "manual_entry_required": True
            }
            laws.append(law)

        state_data = {
            "state": state_name,
            "state_code": state_code,
            "last_updated": "2025-01-12",
            "data_collection_method": "manual_template",
            "laws": laws,
            "review_notes": {
                "total_laws_generated": len(laws),
                "needs_verification": len(laws),
                "avg_confidence": "0%",
                "next_steps": "Fill in all [TO FILL] fields using research or Claude Chat"
            }
        }

        return state_data

    def save_state_data(self, state_data: Dict, output_dir: str = "../data/state_laws_50") -> Path:
        """Save generated state data"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        state_code = state_data["state_code"]
        filename = output_path / f"{state_code}.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(state_data, f, indent=2, ensure_ascii=False)

        print(f"[SAVED] {filename}")
        return filename

    def print_verification_report(self, state_data: Dict):
        """Print what needs verification"""

        state_name = state_data["state"]
        laws = state_data["laws"]

        needs_verification = [l for l in laws if l.get("needs_verification", True)]

        print(f"\n{'='*60}")
        print(f"VERIFICATION REPORT: {state_name}")
        print(f"{'='*60}")
        print(f"\nTotal laws generated: {len(laws)}")
        print(f"Need verification: {len(needs_verification)}")
        print(f"Ready to use: {len(laws) - len(needs_verification)}")

        if needs_verification:
            print(f"\n[ACTION NEEDED] Verify these {len(needs_verification)} laws:")
            for law in needs_verification:
                conf = law.get('confidence', 0.0)
                print(f"\n  Topic: {law['topic']}")
                print(f"  Confidence: {conf:.1%}")
                print(f"  Citation: {law.get('law_citation', 'MISSING')}")
                print(f"  Action: Verify on official .gov website")

        print(f"\n{'='*60}")
        print("NEXT STEPS:")
        print(f"{'='*60}")
        print(f"1. Open: data/state_laws_50/{state_data['state_code']}.json")
        print(f"2. For each law with 'needs_verification: true':")
        print(f"   - Google: '{state_name} [topic] employment law'")
        print(f"   - Find official .gov source")
        print(f"   - Verify statute citation")
        print(f"   - Update effective_date")
        print(f"   - Set needs_verification: false")
        print(f"   - Set confidence: 1.0")
        print(f"3. Estimated time: {len(needs_verification) * 2}-{len(needs_verification) * 3} minutes")
        print(f"{'='*60}\n")


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Generate state employment laws using LLM')
    parser.add_argument('--state', '-s', required=True,
                       help='State code (e.g., MA) or ALL for all states')
    parser.add_argument('--output', '-o', default='../data/state_laws_50',
                       help='Output directory')
    parser.add_argument('--no-phi3', action='store_true',
                       help='Skip Phi-3, create manual templates instead')

    args = parser.parse_args()

    # Create generator
    generator = LawGenerator(use_phi3=not args.no_phi3)

    # Generate for specified state(s)
    if args.state.upper() == "ALL":
        print(f"\n[BATCH MODE] Generating all 50 states...")
        print("This will take 2-3 hours. Get some coffee!\n")

        for i, (state_code, state_name) in enumerate(ALL_STATES.items(), 1):
            print(f"\n[{i}/50] Processing {state_name}...")

            state_data = generator.generate_state_laws(state_code)
            generator.save_state_data(state_data, args.output)
            generator.print_verification_report(state_data)

        print(f"\n[SUCCESS] Generated all 50 states!")
        print(f"Next: Verify low-confidence items (est. 7-10 hours total)")

    else:
        state_code = args.state.upper()

        if state_code not in ALL_STATES:
            print(f"[ERROR] Unknown state: {state_code}")
            print(f"Valid states: {', '.join(list(ALL_STATES.keys())[:10])}...")
            return 1

        # Generate single state
        state_data = generator.generate_state_laws(state_code)
        generator.save_state_data(state_data, args.output)
        generator.print_verification_report(state_data)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
