"""
Structure Aggregator Data - SIMPLE VERSION
===========================================
Uses Phi-3 WITHOUT quantization for more reliable loading.
Slower but works without bitsandbytes issues.
"""

import json
from pathlib import Path
from typing import Dict, List
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


class SimpleDataStructurer:
    """Structure raw aggregator data using Phi-3 (simple mode)"""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        print("\n[INFO] Loading Phi-3 model (simple mode - no quantization)...")
        print("This is slower but more reliable.\n")
        self._load_phi3_simple()

    def _load_phi3_simple(self):
        """Load Phi-3 in simple mode (no quantization)"""
        try:
            model_name = "microsoft/Phi-3-mini-4k-instruct"

            # Load tokenizer
            print("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                trust_remote_code=True
            )

            # Load model without quantization
            print("Loading model (this may take a few minutes)...")
            print("Model will use ~14GB RAM (or VRAM if GPU available)")

            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Device: {device}")

            if device == "cuda":
                # GPU - use float16
                self.model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    trust_remote_code=True,
                    low_cpu_mem_usage=True
                )
            else:
                # CPU - use float32 (no quantization)
                print("\n[WARNING] Running on CPU without quantization")
                print("This will be SLOW but should work.")
                print("Expect 2-5 minutes per state.\n")

                self.model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float32,
                    trust_remote_code=True,
                    low_cpu_mem_usage=True
                )

            print("[SUCCESS] Phi-3 loaded successfully!\n")

        except Exception as e:
            print(f"\n[ERROR] Failed to load Phi-3: {e}")
            print("\nThis might be due to insufficient RAM.")
            print("Phi-3-mini requires ~14GB RAM without quantization.")
            print("\nAlternatives:")
            print("1. Close other programs and try again")
            print("2. Use manual cleaning of data files")
            print("3. Run on a machine with more RAM\n")
            raise

    def structure_state_data(self, state_code: str, state_name: str, raw_topics: Dict) -> Dict:
        """Structure raw topic data for a state into proper format"""

        print(f"\nStructuring {state_name}...", end=" ", flush=True)

        laws = []

        for topic, sources in raw_topics.items():
            # Combine text from all sources for this topic
            combined_text = " ".join([s.get("summary", "") for s in sources])

            if not combined_text.strip():
                continue

            # Use Phi-3 to structure
            law = self._structure_with_phi3(state_name, topic, combined_text, sources)

            if law:
                laws.append(law)

        print(f"✓ ({len(laws)} laws)")

        # Create state data
        state_data = {
            "state": state_name,
            "state_code": state_code,
            "last_updated": "2025-01-12",
            "data_collection_method": "aggregator_scraping_phi3_simple",
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

        # Truncate text if too long
        text = text[:1500]

        source_names = ", ".join([s.get("source", "Unknown") for s in sources])

        prompt = f"""You are a legal expert. Extract key information about {state_name} {topic.replace('_', ' ')} law from this text.

SOURCE: {source_names}
TEXT: {text}

Extract:
1. Summary (2-3 clear sentences about the law)
2. Statute citation (if mentioned, else say "Not specified in source")
3. Key requirements (what employers must/cannot do)
4. Effective date (if mentioned, else say "Unknown")

Be concise and accurate. Only use information from the text provided.

OUTPUT JSON:
{{
  "summary": "...",
  "law_citation": "...",
  "requirements": "...",
  "effective_date": "..."
}}"""

        try:
            # Format for Phi-3
            messages = [{"role": "user", "content": prompt}]

            input_ids = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            ).to(self.model.device)

            # Generate (with smaller max tokens for speed)
            with torch.no_grad():
                outputs = self.model.generate(
                    input_ids,
                    max_new_tokens=512,  # Reduced for speed
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
                return self._create_fallback(topic, text, sources)

            json_str = response[json_start:json_end]
            data = json.loads(json_str)

            # Build proper structure
            summary = data.get("summary", text[:200])
            citation = data.get("law_citation", "Not specified in source")
            requirements = data.get("requirements", summary)
            effective_date = data.get("effective_date", "Unknown")

            # Clean up citation
            if "not specified" in citation.lower() or "not in source" in citation.lower():
                citation = "[NEEDS VERIFICATION - not found in aggregator source]"
                needs_verification = True
            else:
                needs_verification = "[NEEDS VERIFICATION" in citation

            law = {
                "topic": topic,
                "summary": summary,
                "law_citation": citation,
                "full_text": requirements,
                "severity": "error" if "prohibit" in summary.lower() or "cannot" in summary.lower() else "warning",
                "flagged_phrases": [topic.replace('_', ' '), topic.replace('_', '-')],
                "suggestion": f"Review {state_name} {topic.replace('_', ' ')} requirements. {requirements[:100]}",
                "source_url": sources[0].get("url", "") if sources else "",
                "effective_date": effective_date,
                "confidence": 0.75 if not needs_verification else 0.6,
                "needs_verification": needs_verification
            }

            return law

        except Exception as e:
            print(f"\n  [WARNING] Phi-3 failed for {topic}: {e}")
            return self._create_fallback(topic, text, sources)

    def _create_fallback(self, topic: str, text: str, sources: List) -> Dict:
        """Create basic structure if Phi-3 fails"""
        return {
            "topic": topic,
            "summary": text[:300].strip(),
            "law_citation": "[NEEDS VERIFICATION - extracted from aggregator]",
            "full_text": text[:500].strip(),
            "severity": "warning",
            "flagged_phrases": [topic.replace('_', ' ')],
            "suggestion": f"Review {topic.replace('_', ' ')} requirements",
            "source_url": sources[0].get("url", "") if sources else "",
            "effective_date": "Unknown",
            "confidence": 0.5,
            "needs_verification": True
        }

    def structure_all_states(self, raw_data_file: str) -> Dict:
        """Structure data for all states"""

        print("\n[INFO] Loading raw scraped data...")

        with open(raw_data_file, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)

        print(f"Found raw data for {len(raw_data)} states\n")
        print("="*60)
        print("STRUCTURING ALL STATES")
        print("="*60)

        structured_states = {}

        for i, (state_code, state_info) in enumerate(raw_data.items(), 1):
            state_name = state_info["state"]
            raw_topics = state_info["topics"]

            print(f"[{i}/50] ", end="")
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

        print(f"\n[SUCCESS] Structured {len(structured_data)} states!")
        print(f"Output directory: {output_path}\n")


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Structure raw aggregator data (simple/reliable version)')
    parser.add_argument('--input', '-i',
                       default='../data/aggregator_raw/all_states_raw.json',
                       help='Input raw data file')
    parser.add_argument('--output', '-o',
                       default='../data/state_laws_50_v2',
                       help='Output directory for structured JSON files')

    args = parser.parse_args()

    try:
        structurer = SimpleDataStructurer()

        structured_data = structurer.structure_all_states(args.input)

        structurer.save_structured_data(structured_data, args.output)

        print("="*60)
        print("SUMMARY")
        print("="*60)

        total_laws = sum(len(s["laws"]) for s in structured_data.values())
        needs_verification = sum(
            len([l for l in s["laws"] if l.get("needs_verification", True)])
            for s in structured_data.values()
        )

        print(f"States processed: {len(structured_data)}")
        print(f"Total laws extracted: {total_laws}")
        print(f"Needs verification: {needs_verification}")
        print(f"Average per state: {total_laws / len(structured_data):.1f}")

        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print(f"1. Review files in {args.output}/")
        print("2. Verify laws with 'needs_verification: true'")
        print("3. Load into RAG:")
        print("   cd ..")
        print("   python load_all_states.py")
        print("="*60 + "\n")

        return 0

    except Exception as e:
        print(f"\n[FAILED] {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
