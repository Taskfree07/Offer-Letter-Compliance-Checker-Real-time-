"""
Structure Aggregator Data using Phi-3
======================================
Takes raw scraped data from aggregator sites and uses Phi-3
to structure it into proper JSON format for our compliance system.

This gives us:
✅ REAL data from aggregator sites (not LLM generation)
✅ Phi-3 structures it properly
✅ Human verification for accuracy
"""

import json
from pathlib import Path
from typing import Dict, List
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


class DataStructurer:
    """Structure raw aggregator data using Phi-3"""

    def __init__(self, use_phi3: bool = True):
        self.use_phi3 = use_phi3
        self.model = None
        self.tokenizer = None

        if use_phi3:
            print("[INFO] Loading Phi-3 model...")
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
            print(f"[ERROR] Failed to load Phi-3: {e}")
            self.model = None

    def structure_state_data(self, state_code: str, state_name: str, raw_topics: Dict) -> Dict:
        """Structure raw topic data for a state into proper format"""

        print(f"\nStructuring {state_name}...")

        laws = []

        for topic, sources in raw_topics.items():
            # Combine text from all sources for this topic
            combined_text = " ".join([s.get("summary", "") for s in sources])

            if not combined_text.strip():
                continue

            # Use Phi-3 to structure
            if self.model:
                law = self._structure_with_phi3(state_name, topic, combined_text, sources)
            else:
                law = self._create_manual_template(topic, combined_text, sources)

            if law:
                laws.append(law)

        # Create state data
        state_data = {
            "state": state_name,
            "state_code": state_code,
            "last_updated": "2025-01-12",
            "data_collection_method": "aggregator_scraping_phi3_structured",
            "laws": laws,
            "review_notes": {
                "total_laws_found": len(laws),
                "needs_verification": len([l for l in laws if l.get("needs_verification", True)]),
                "next_steps": "Verify statute citations and effective dates"
            }
        }

        return state_data

    def _structure_with_phi3(self, state_name: str, topic: str, text: str, sources: List) -> Dict:
        """Use Phi-3 to structure raw text into law format"""

        source_names = ", ".join([s.get("source", "Unknown") for s in sources])

        prompt = f"""You are a legal expert. Structure this raw text about {state_name} {topic.replace('_', ' ')} law into a structured format.

RAW TEXT FROM LEGAL SOURCES ({source_names}):
{text[:1500]}

Extract and structure:
1. Summary (2-3 sentences of what the law requires/prohibits)
2. Statute citation (if mentioned, otherwise say "[Citation not in source]")
3. Severity: "error" if violation is illegal, "warning" if best practice
4. Flagged phrases: keywords that would trigger this rule
5. Suggestion: what to do to comply
6. Effective date (if mentioned, otherwise "Unknown")

OUTPUT JSON ONLY:
{{
  "summary": "...",
  "law_citation": "...",
  "severity": "error" or "warning",
  "flagged_phrases": [...],
  "suggestion": "...",
  "effective_date": "..."
}}"""

        try:
            messages = [{"role": "user", "content": prompt}]

            input_ids = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            ).to(self.model.device)

            with torch.no_grad():
                outputs = self.model.generate(
                    input_ids,
                    max_new_tokens=1024,
                    temperature=0.2,
                    do_sample=True,
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
                return self._create_manual_template(topic, text, sources)

            json_str = response[json_start:json_end]
            data = json.loads(json_str)

            # Add topic and metadata
            data["topic"] = topic
            data["full_text"] = data.get("summary", text[:300])
            data["source_url"] = sources[0].get("url", "") if sources else ""
            data["confidence"] = 0.85  # High confidence (real data, structured by LLM)
            data["needs_verification"] = "[Citation not in source]" in data.get("law_citation", "")

            return data

        except Exception as e:
            print(f"  [ERROR] Phi-3 structuring failed for {topic}: {e}")
            return self._create_manual_template(topic, text, sources)

    def _create_manual_template(self, topic: str, text: str, sources: List) -> Dict:
        """Create manual template if Phi-3 fails"""

        return {
            "topic": topic,
            "summary": text[:300],
            "law_citation": "[NEEDS VERIFICATION - extracted from aggregator]",
            "full_text": text,
            "severity": "warning",
            "flagged_phrases": [topic.replace('_', ' ')],
            "suggestion": f"Review {topic.replace('_', ' ')} requirements",
            "source_url": sources[0].get("url", "") if sources else "",
            "effective_date": "Unknown",
            "confidence": 0.6,
            "needs_verification": True
        }

    def structure_all_states(self, raw_data_file: str) -> Dict:
        """Structure data for all states"""

        print("\n[INFO] Loading raw scraped data...")

        with open(raw_data_file, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)

        print(f"Found raw data for {len(raw_data)} states")

        structured_states = {}

        for state_code, state_info in raw_data.items():
            state_name = state_info["state"]
            raw_topics = state_info["topics"]

            state_data = self.structure_state_data(state_code, state_name, raw_topics)

            structured_states[state_code] = state_data

        return structured_states

    def save_structured_data(self, structured_data: Dict, output_dir: str):
        """Save structured data as individual state files"""

        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        for state_code, state_data in structured_data.items():
            filename = output_path / f"{state_code}.json"

            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(state_data, f, indent=2, ensure_ascii=False)

            print(f"[SAVED] {filename}")

        print(f"\n[SUCCESS] Structured {len(structured_data)} states!")


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Structure raw aggregator data using Phi-3')
    parser.add_argument('--input', '-i',
                       default='../data/aggregator_raw/all_states_raw.json',
                       help='Input raw data file')
    parser.add_argument('--output', '-o',
                       default='../data/state_laws_50',
                       help='Output directory for structured JSON files')
    parser.add_argument('--no-phi3', action='store_true',
                       help='Skip Phi-3, create manual templates')

    args = parser.parse_args()

    structurer = DataStructurer(use_phi3=not args.no_phi3)

    structured_data = structurer.structure_all_states(args.input)

    structurer.save_structured_data(structured_data, args.output)

    print(f"\n{'='*60}")
    print("NEXT STEPS:")
    print(f"{'='*60}")
    print(f"1. Review files in {args.output}/")
    print("2. Verify laws with 'needs_verification: true'")
    print("3. Load into RAG database:")
    print("   python")
    print("   >>> from compliance_v2.rag_service import get_rag_service")
    print("   >>> rag = get_rag_service()")
    print("   >>> # Load all states")
    print(f"{'='*60}\n")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
