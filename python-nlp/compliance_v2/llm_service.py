"""
LLM Service - Groq Cloud + Ollama Fallback for Legal Compliance Analysis
=========================================================================
Primary: Groq Cloud API (llama-3.3-70b-versatile) - Fast & Accurate
Fallback: Local Ollama (phi3:mini) - When rate limited or offline
"""

import os
import sys
import json
import logging
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
import re

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from .prompts import create_compliance_prompt

logger = logging.getLogger(__name__)

# Fix Windows console encoding for Unicode
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Ollama Configuration (Fallback)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini")

# Groq Free Tier Limits
GROQ_DAILY_TOKEN_LIMIT = 100000  # Approximate daily limit
GROQ_MINUTE_TOKEN_LIMIT = 6000   # Tokens per minute


def safe_print(text: str):
    """Print text safely, handling encoding errors on Windows"""
    try:
        print(text)
    except UnicodeEncodeError:
        # Fallback: replace problematic characters
        print(text.encode('ascii', 'replace').decode('ascii'))


def print_banner(message: str, char: str = "="):
    """Print a banner message to console"""
    line = char * 60
    safe_print(f"\n{line}")
    safe_print(f"  {message}")
    safe_print(f"{line}")


def print_status(label: str, value: str, icon: str = ""):
    """Print a status line to console"""
    safe_print(f"  {icon} {label}: {value}")


class LLMService:
    """
    LLM service with Groq Cloud primary and Ollama fallback

    Flow:
    1. Try Groq API (fast, accurate, cloud-based)
    2. If rate limited (429) or error → fallback to Ollama
    3. If Ollama unavailable → use mock response
    """

    def __init__(self,
                 groq_api_key: str = GROQ_API_KEY,
                 groq_model: str = GROQ_MODEL,
                 ollama_model: str = OLLAMA_MODEL,
                 ollama_url: str = OLLAMA_BASE_URL):
        """
        Initialize LLM service with Groq + Ollama fallback
        """
        self.groq_api_key = groq_api_key
        self.groq_model = groq_model
        self.ollama_model = ollama_model
        self.ollama_url = ollama_url

        # Initialize Groq client
        self.groq_client = None
        self.groq_available = False
        self.ollama_available = False

        # Track which service is being used
        self.current_service = "initializing"

        # Rate limit tracking
        self.groq_rate_limited = False

        # Token usage tracking
        self.session_start = datetime.now()
        self.groq_tokens_used = 0
        self.groq_requests_count = 0
        self.ollama_tokens_used = 0
        self.ollama_requests_count = 0

        # Print initialization banner
        print_banner("LLM SERVICE INITIALIZING")
        print_status("Primary", f"Groq Cloud ({groq_model}) - FAST", "[CLOUD]")
        print_status("Fallback", f"Ollama Local ({ollama_model}) - ALWAYS AVAILABLE", "[LOCAL]")
        print_status("Groq Limit", f"{GROQ_DAILY_TOKEN_LIMIT:,} tokens/day", "[INFO]")
        safe_print("")

        self._initialize_groq()
        self.check_ollama_status()

        # Print status summary
        self._print_status_summary()

    def _initialize_groq(self):
        """Initialize Groq client"""
        try:
            self.groq_client = ChatGroq(
                api_key=self.groq_api_key,
                model_name=self.groq_model,
                temperature=0.1,
                max_tokens=1024
            )
            self.groq_available = True
            self.current_service = "groq"
            print_status("Groq Status", "CONNECTED", "[OK]")
        except Exception as e:
            print_status("Groq Status", f"FAILED - {e}", "[X]")
            self.groq_available = False

    def check_ollama_status(self) -> bool:
        """Check if Ollama server is running"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                self.ollama_available = any(
                    self.ollama_model in name or name.startswith(self.ollama_model.split(":")[0])
                    for name in model_names
                )
                if self.ollama_available:
                    print_status("Ollama Status", "AVAILABLE (Fallback Ready)", "[OK]")
                else:
                    print_status("Ollama Status", f"Model {self.ollama_model} not found", "[!]")
                return self.ollama_available
        except Exception as e:
            print_status("Ollama Status", "NOT RUNNING", "[!]")

        self.ollama_available = False
        return False

    def _print_status_summary(self):
        """Print current status summary"""
        safe_print("\n" + "-" * 60)
        if self.groq_available:
            safe_print("  [OK] USING: Groq Cloud (Fast, 70B model)")
        elif self.ollama_available:
            safe_print("  [OK] USING: Ollama Local (Fallback)")
        else:
            safe_print("  [X] WARNING: No LLM available - Mock mode only")

        if self.ollama_available:
            safe_print("  [OK] FALLBACK READY: Ollama (unlimited, always available)")
        safe_print("-" * 60 + "\n")

    def _print_token_usage(self):
        """Print current token usage to terminal"""
        elapsed = (datetime.now() - self.session_start).total_seconds() / 60

        safe_print("\n" + "=" * 60)
        safe_print("  TOKEN USAGE SUMMARY")
        safe_print("=" * 60)
        safe_print(f"  Session Duration: {elapsed:.1f} minutes")
        safe_print("")
        safe_print(f"  GROQ CLOUD:")
        safe_print(f"    - Requests: {self.groq_requests_count}")
        safe_print(f"    - Tokens Used: {self.groq_tokens_used:,}")
        safe_print(f"    - Daily Limit: {GROQ_DAILY_TOKEN_LIMIT:,}")
        safe_print(f"    - Remaining: ~{max(0, GROQ_DAILY_TOKEN_LIMIT - self.groq_tokens_used):,}")

        if self.groq_tokens_used >= GROQ_DAILY_TOKEN_LIMIT * 0.8:
            safe_print(f"    [!] WARNING: Approaching daily limit!")

        if self.groq_rate_limited:
            safe_print(f"    [X] STATUS: RATE LIMITED - Using Ollama")

        safe_print("")
        safe_print(f"  OLLAMA LOCAL:")
        safe_print(f"    - Requests: {self.ollama_requests_count}")
        safe_print(f"    - Tokens Used: {self.ollama_tokens_used:,}")
        safe_print(f"    - Limit: UNLIMITED")
        safe_print("=" * 60 + "\n")

    def load_model(self):
        """Load/verify models (for compatibility)"""
        if self.groq_available:
            safe_print("  [OK] Groq ready (no pre-loading needed)")
            return True

        if self.check_ollama_status():
            safe_print("  [OK] Ollama ready as fallback")
            return True

        safe_print("  [!] No LLM available, using mock mode")
        return False

    def generate(self,
                 prompt: str,
                 max_new_tokens: int = 1024,
                 temperature: float = 0.1,
                 top_p: float = 0.9) -> str:
        """
        Generate text using Groq (fast cloud) with Ollama fallback (always available)

        Priority:
        1. Groq Cloud - Fast, high quality (llama-3.3-70b)
        2. Ollama Local - Always available, unlimited, free
        3. Mock - Basic response if nothing works
        """
        # Try Groq first (fast cloud API)
        if self.groq_available and not self.groq_rate_limited:
            result = self._generate_groq(prompt, max_new_tokens, temperature)
            if result is not None:
                return result

        # Fallback to Ollama (always available locally)
        if self.check_ollama_status():
            safe_print("\n" + "!" * 60)
            safe_print("  [!] SWITCHING TO OLLAMA (Groq rate limited or unavailable)")
            safe_print("  [OK] Local fallback - unlimited, free, always works")
            safe_print("!" * 60 + "\n")
            result = self._generate_ollama(prompt, max_new_tokens, temperature, top_p)
            if result is not None:
                return result

        # Last resort: mock response
        safe_print("\n" + "!" * 60)
        safe_print("  [X] USING MOCK RESPONSE (No LLM available)")
        safe_print("!" * 60 + "\n")
        return self._mock_response(prompt)

    def _generate_groq(self, prompt: str, max_tokens: int, temperature: float) -> Optional[str]:
        """Generate using Groq API"""
        try:
            safe_print("\n" + "-" * 60)
            safe_print(f"  [>>>] GROQ CLOUD - Generating...")
            safe_print(f"        Model: {self.groq_model}")
            safe_print("-" * 60)

            # Update client settings if needed
            self.groq_client.max_tokens = max_tokens
            self.groq_client.temperature = temperature

            # Call Groq
            message = HumanMessage(content=prompt)
            response = self.groq_client.invoke([message])

            self.current_service = "groq"
            self.groq_rate_limited = False
            self.groq_requests_count += 1

            # Extract token usage from response metadata
            token_usage = {}
            if hasattr(response, 'response_metadata'):
                token_usage = response.response_metadata.get('token_usage', {})

            prompt_tokens = token_usage.get('prompt_tokens', 0)
            completion_tokens = token_usage.get('completion_tokens', 0)
            total_tokens = token_usage.get('total_tokens', prompt_tokens + completion_tokens)

            self.groq_tokens_used += total_tokens

            # Print success message with token info
            safe_print(f"\n  [OK] GROQ RESPONSE RECEIVED")
            safe_print(f"       Prompt Tokens: {prompt_tokens:,}")
            safe_print(f"       Completion Tokens: {completion_tokens:,}")
            safe_print(f"       Total Tokens (this request): {total_tokens:,}")
            safe_print(f"       Session Total: {self.groq_tokens_used:,} / {GROQ_DAILY_TOKEN_LIMIT:,}")

            # Warning if approaching limit
            usage_percent = (self.groq_tokens_used / GROQ_DAILY_TOKEN_LIMIT) * 100
            if usage_percent >= 80:
                safe_print(f"       [!] WARNING: {usage_percent:.1f}% of daily limit used!")
            elif usage_percent >= 50:
                safe_print(f"       Usage: {usage_percent:.1f}% of daily limit")

            safe_print("-" * 60 + "\n")

            return response.content

        except Exception as e:
            error_str = str(e).lower()

            # Check for rate limit
            if "429" in str(e) or "rate" in error_str or "limit" in error_str:
                safe_print("\n" + "!" * 60)
                safe_print("  [X] GROQ RATE LIMITED!")
                safe_print(f"      Error: {e}")
                safe_print("      Switching to Ollama fallback...")
                safe_print("!" * 60 + "\n")
                self.groq_rate_limited = True
            else:
                safe_print(f"\n  [X] GROQ ERROR: {e}\n")

            return None

    def _generate_ollama(self, prompt: str, max_tokens: int, temperature: float, top_p: float) -> Optional[str]:
        """Generate using local Ollama"""
        try:
            safe_print("\n" + "-" * 60)
            safe_print(f"  [LOCAL] OLLAMA - Generating...")
            safe_print(f"          Model: {self.ollama_model}")
            safe_print(f"          Note: No token limits (local)")
            safe_print("-" * 60)

            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": temperature,
                        "top_p": top_p,
                    }
                },
                timeout=120
            )

            if response.status_code == 200:
                result = response.json()
                generated_text = result.get("response", "")
                self.current_service = "ollama"
                self.ollama_requests_count += 1

                # Get token stats
                prompt_tokens = result.get("prompt_eval_count", 0)
                completion_tokens = result.get("eval_count", 0)
                total_tokens = prompt_tokens + completion_tokens
                duration = result.get("eval_duration", 0) / 1e9  # nanoseconds to seconds

                self.ollama_tokens_used += total_tokens

                safe_print(f"\n  [OK] OLLAMA RESPONSE RECEIVED")
                safe_print(f"       Prompt Tokens: {prompt_tokens:,}")
                safe_print(f"       Completion Tokens: {completion_tokens:,}")
                safe_print(f"       Total Tokens: {total_tokens:,}")
                if duration > 0:
                    safe_print(f"       Speed: {completion_tokens/duration:.1f} tokens/sec")
                safe_print(f"       Session Total (Ollama): {self.ollama_tokens_used:,}")
                safe_print("-" * 60 + "\n")

                return generated_text
            else:
                safe_print(f"\n  [X] OLLAMA ERROR: HTTP {response.status_code}\n")
                return None

        except Exception as e:
            safe_print(f"\n  [X] OLLAMA ERROR: {e}\n")
            return None

    def _mock_response(self, prompt: str) -> str:
        """Generate mock response when no LLM is available"""
        self.current_service = "mock"

        safe_print("\n" + "-" * 60)
        safe_print("  [MOCK] MODE - Generating basic response...")
        safe_print("         (No AI model available)")
        safe_print("-" * 60 + "\n")

        state_match = re.search(r"STATE:\s*(\w+)", prompt)
        state = state_match.group(1) if state_match else "UNKNOWN"

        violations = []
        prompt_lower = prompt.lower()

        if "non-compete" in prompt_lower or "competitive" in prompt_lower:
            violations.append({
                "severity": "error",
                "law_citation": f"{state} Employment Law",
                "violation_text": "non-compete clause detected",
                "explanation": "Non-compete agreements may be restricted or unenforceable in this state.",
                "suggestion": f"Remove the non-compete clause entirely, or if {state} allows limited restrictions, modify to include reasonable geographic scope, time limit (typically 6-12 months), and legitimate business interest justification.",
                "confidence": 0.75
            })

        if "salary history" in prompt_lower:
            violations.append({
                "severity": "warning",
                "law_citation": f"{state} Labor Code",
                "violation_text": "salary history inquiry",
                "explanation": "Asking about salary history may be prohibited under state law",
                "suggestion": "Remove any questions about prior salary or compensation history. Instead, ask candidates about their salary expectations for this role.",
                "confidence": 0.80
            })

        if "arbitration" in prompt_lower:
            violations.append({
                "severity": "info",
                "law_citation": "Federal Arbitration Act",
                "violation_text": "arbitration clause detected",
                "explanation": "Arbitration clauses are generally enforceable under federal law",
                "suggestion": "Language is acceptable. Ensure the arbitration clause specifies the governing rules (e.g., AAA, JAMS), cost-sharing provisions, and does not waive rights protected by state law.",
                "confidence": 0.70
            })

        if "at-will" in prompt_lower or "at will" in prompt_lower:
            violations.append({
                "severity": "info",
                "law_citation": f"{state} Employment Law",
                "violation_text": "at-will employment language",
                "explanation": "At-will employment language is standard and generally enforceable",
                "suggestion": "Language is acceptable but ensure it's not contradicted elsewhere in the contract (e.g., by progressive discipline policies or termination-for-cause-only clauses).",
                "confidence": 0.85
            })

        return json.dumps({"violations": violations}, indent=2)

    def analyze_compliance(self,
                          state: str,
                          document_text: str,
                          relevant_laws: List[Dict]) -> Dict[str, Any]:
        """
        Analyze document for compliance violations
        """
        print_banner(f"COMPLIANCE ANALYSIS - {state}")
        print_status("Document Size", f"{len(document_text):,} characters", "📄")
        print_status("Relevant Laws", f"{len(relevant_laws)} found", "📚")
        print("")

        prompt = create_compliance_prompt(state, document_text, relevant_laws)
        response = self.generate(prompt, max_new_tokens=1024, temperature=0.1)

        try:
            json_match = re.search(r'\{[\s\S]*"violations"[\s\S]*\}', response)
            if json_match:
                response_json = json.loads(json_match.group(0))
            else:
                response_json = json.loads(response)

            violations = response_json.get('violations', [])

            safe_print(f"  [OK] Analysis Complete: {len(violations)} violations found")

            # Print token usage summary
            self._print_token_usage()

            return {
                "success": True,
                "violations": violations,
                "state": state,
                "model": self._get_current_model(),
                "service": self.current_service,
                "llm_response": response,
                "laws_used": len(relevant_laws),
                "token_usage": {
                    "groq_tokens": self.groq_tokens_used,
                    "ollama_tokens": self.ollama_tokens_used,
                    "groq_remaining": max(0, GROQ_DAILY_TOKEN_LIMIT - self.groq_tokens_used)
                }
            }

        except json.JSONDecodeError as e:
            safe_print(f"  [X] Failed to parse LLM response: {e}")
            return {
                "success": False,
                "violations": [],
                "error": "Failed to parse LLM response",
                "raw_response": response,
                "model": self._get_current_model(),
                "service": self.current_service
            }

    def _get_current_model(self) -> str:
        """Get the currently active model name"""
        if self.current_service == "groq":
            return self.groq_model
        elif self.current_service == "ollama":
            return self.ollama_model
        return "mock"

    def get_status(self) -> Dict[str, Any]:
        """Get current status of the LLM service"""
        return {
            "primary": {
                "service": "groq",
                "model": self.groq_model,
                "available": self.groq_available,
                "rate_limited": self.groq_rate_limited,
                "tokens_used": self.groq_tokens_used,
                "tokens_remaining": max(0, GROQ_DAILY_TOKEN_LIMIT - self.groq_tokens_used),
                "requests": self.groq_requests_count
            },
            "fallback": {
                "service": "ollama",
                "model": self.ollama_model,
                "available": self.ollama_available,
                "tokens_used": self.ollama_tokens_used,
                "requests": self.ollama_requests_count
            },
            "current_service": self.current_service,
            "current_model": self._get_current_model(),
            "session_start": self.session_start.isoformat()
        }

    def reset_rate_limit(self):
        """Reset rate limit flag (call after waiting)"""
        self.groq_rate_limited = False
        safe_print("\n  [RESET] Groq rate limit reset - will try Groq again\n")

    def print_usage(self):
        """Print current usage to terminal"""
        self._print_token_usage()


# Singleton instance
_llm_service_instance = None


def get_llm_service(auto_load: bool = False) -> LLMService:
    """Get singleton LLM service instance"""
    global _llm_service_instance
    if _llm_service_instance is None:
        _llm_service_instance = LLMService()
        if auto_load:
            _llm_service_instance.load_model()
    return _llm_service_instance


# Test function
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    safe_print("\n" + "=" * 60)
    safe_print("  TESTING GROQ + OLLAMA LLM SERVICE")
    safe_print("=" * 60)

    llm = LLMService()

    safe_print("\n[Test 1] Simple generation test...")
    response = llm.generate("What is 2+2? Reply with just the number.", max_new_tokens=50)
    safe_print(f"   Response: {response.strip()}")

    safe_print("\n[Test 2] Checking status...")
    status = llm.get_status()
    safe_print(f"   Current Service: {status['current_service']}")
    safe_print(f"   Groq Tokens Used: {status['primary']['tokens_used']}")
    safe_print(f"   Groq Tokens Remaining: {status['primary']['tokens_remaining']}")

    # Print final usage
    llm.print_usage()
