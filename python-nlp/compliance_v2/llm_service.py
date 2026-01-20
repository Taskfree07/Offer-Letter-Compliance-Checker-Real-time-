"""
LLM Service - Ollama Integration for Legal Compliance Analysis
===============================================================
Uses Ollama with Phi-3 mini for efficient local inference.
Fallback to mock mode if Ollama is not available.
"""

import os
import json
import logging
import requests
from typing import Dict, Any, List, Optional
import re

from .prompts import create_compliance_prompt

logger = logging.getLogger(__name__)

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini")


class LLMService:
    """
    LLM service for compliance analysis using Ollama (Phi-3 mini)

    Benefits of Ollama:
    - Uses GGUF quantized models (3-4x less RAM than HuggingFace)
    - Optimized for CPU inference
    - Simple REST API
    - ~4 GB RAM for Phi-3 mini
    """

    def __init__(self,
                 model_name: str = DEFAULT_MODEL,
                 base_url: str = OLLAMA_BASE_URL):
        """
        Initialize LLM service with Ollama

        Args:
            model_name: Ollama model name (default: phi3:mini)
            base_url: Ollama server URL (default: http://localhost:11434)
        """
        self.model_name = model_name
        self.base_url = base_url
        self.is_available = False
        self._checked = False

        logger.info(f"Initializing Ollama LLM service")
        logger.info(f"Model: {model_name}")
        logger.info(f"Server: {base_url}")

    def check_ollama_status(self) -> bool:
        """Check if Ollama server is running and model is available"""
        if self._checked:
            return self.is_available

        try:
            # Check if Ollama is running
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", "") for m in models]

                # Check if our model is available
                model_available = any(
                    self.model_name in name or name.startswith(self.model_name.split(":")[0])
                    for name in model_names
                )

                if model_available:
                    logger.info(f"✅ Ollama is running with {self.model_name}")
                    self.is_available = True
                else:
                    logger.warning(f"⚠️ Ollama running but {self.model_name} not found")
                    logger.info(f"Available models: {model_names}")
                    logger.info(f"Run: ollama pull {self.model_name}")
                    self.is_available = False
            else:
                self.is_available = False

        except requests.exceptions.ConnectionError:
            logger.warning("❌ Ollama server not running")
            logger.info("Start Ollama: Open 'Ollama' app or run 'ollama serve'")
            self.is_available = False
        except Exception as e:
            logger.warning(f"❌ Ollama check failed: {e}")
            self.is_available = False

        self._checked = True
        return self.is_available

    def load_model(self):
        """
        Load/verify the model (for compatibility with existing code)
        With Ollama, models are loaded on-demand by the server
        """
        if not self.check_ollama_status():
            logger.warning("Ollama not available, using mock mode")
            return False

        # Pre-warm the model by sending a simple request
        try:
            logger.info(f"Pre-warming {self.model_name}...")
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": "Hello",
                    "stream": False,
                    "options": {"num_predict": 1}
                },
                timeout=60
            )
            if response.status_code == 200:
                logger.info("✅ Model loaded and ready")
                return True
        except Exception as e:
            logger.warning(f"Model pre-warm failed: {e}")

        return self.is_available

    def generate(self,
                 prompt: str,
                 max_new_tokens: int = 1024,
                 temperature: float = 0.1,
                 top_p: float = 0.9) -> str:
        """
        Generate text using Ollama

        Args:
            prompt: Input prompt
            max_new_tokens: Maximum tokens to generate
            temperature: Sampling temperature (lower = more deterministic)
            top_p: Nucleus sampling parameter

        Returns:
            Generated text
        """
        # Check Ollama availability
        if not self.check_ollama_status():
            logger.warning("Using mock LLM response (Ollama not available)")
            return self._mock_response(prompt)

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_new_tokens,
                        "temperature": temperature,
                        "top_p": top_p,
                    }
                },
                timeout=120  # 2 minute timeout for generation
            )

            if response.status_code == 200:
                result = response.json()
                generated_text = result.get("response", "")

                # Log generation stats
                if "eval_count" in result:
                    tokens = result.get("eval_count", 0)
                    duration = result.get("eval_duration", 0) / 1e9  # nanoseconds to seconds
                    if duration > 0:
                        logger.info(f"Generated {tokens} tokens in {duration:.1f}s ({tokens/duration:.1f} tok/s)")

                return generated_text
            else:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return self._mock_response(prompt)

        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out")
            return self._mock_response(prompt)
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            return self._mock_response(prompt)

    def _mock_response(self, prompt: str) -> str:
        """Generate mock response when Ollama is not available"""
        # Extract state from prompt if possible
        state_match = re.search(r"STATE:\s*(\w+)", prompt)
        state = state_match.group(1) if state_match else "UNKNOWN"

        # Check for common violation keywords and generate appropriate mock responses
        violations = []
        prompt_lower = prompt.lower()

        if "non-compete" in prompt_lower or "competitive" in prompt_lower:
            violations.append({
                "severity": "error",
                "law_citation": f"{state} Employment Law",
                "violation_text": "non-compete clause detected",
                "explanation": "Non-compete agreements may be restricted in this state. Review state-specific regulations.",
                "suggestion": "Consult legal counsel regarding non-compete enforceability",
                "confidence": 0.75,
                "source_url": f"https://{state.lower()}.gov/labor"
            })

        if "salary history" in prompt_lower:
            violations.append({
                "severity": "warning",
                "law_citation": f"{state} Labor Code",
                "violation_text": "salary history inquiry",
                "explanation": "Asking about salary history may be prohibited in this state",
                "suggestion": "Remove salary history questions from the hiring process",
                "confidence": 0.80,
                "source_url": f"https://{state.lower()}.gov/labor"
            })

        if "at-will" in prompt_lower or "at will" in prompt_lower:
            violations.append({
                "severity": "info",
                "law_citation": f"{state} Employment Standards",
                "violation_text": "at-will employment statement",
                "explanation": "At-will employment language detected. Verify compliance with state requirements.",
                "suggestion": "Ensure at-will disclaimer meets state standards",
                "confidence": 0.70,
                "source_url": f"https://{state.lower()}.gov/labor"
            })

        if "arbitration" in prompt_lower:
            violations.append({
                "severity": "warning",
                "law_citation": f"{state} Arbitration Laws",
                "violation_text": "mandatory arbitration clause",
                "explanation": "Mandatory arbitration clauses may have restrictions",
                "suggestion": "Review arbitration requirements for employment agreements",
                "confidence": 0.65,
                "source_url": f"https://{state.lower()}.gov/labor"
            })

        return json.dumps({"violations": violations}, indent=2)

    def analyze_compliance(self,
                          state: str,
                          document_text: str,
                          relevant_laws: List[Dict]) -> Dict[str, Any]:
        """
        Analyze document for compliance violations using LLM + RAG

        Args:
            state: State code (e.g., "CA")
            document_text: Offer letter text
            relevant_laws: Relevant laws from RAG service

        Returns:
            Analysis results with violations
        """
        # Create prompt
        prompt = create_compliance_prompt(state, document_text, relevant_laws)

        logger.info(f"Analyzing compliance for {state}")
        logger.info(f"Document length: {len(document_text)} chars")
        logger.info(f"Using {len(relevant_laws)} relevant laws")

        # Generate LLM response
        response = self.generate(prompt, max_new_tokens=1024, temperature=0.1)

        # Parse JSON response
        try:
            # Extract JSON from response (LLM might add extra text)
            json_match = re.search(r'\{[\s\S]*"violations"[\s\S]*\}', response)
            if json_match:
                response_json = json.loads(json_match.group(0))
            else:
                # Try parsing the whole response
                response_json = json.loads(response)

            violations = response_json.get('violations', [])

            logger.info(f"✅ LLM found {len(violations)} potential violations")

            return {
                "success": True,
                "violations": violations,
                "state": state,
                "model": self.model_name,
                "llm_response": response,
                "laws_used": len(relevant_laws)
            }

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.debug(f"Response: {response[:500]}")

            # Try to extract any useful information
            return {
                "success": False,
                "violations": [],
                "error": "Failed to parse LLM response",
                "raw_response": response,
                "model": self.model_name
            }

    def get_status(self) -> Dict[str, Any]:
        """Get current status of the LLM service"""
        is_available = self.check_ollama_status()

        return {
            "available": is_available,
            "model": self.model_name,
            "server": self.base_url,
            "mode": "ollama" if is_available else "mock"
        }


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

    print("=" * 60)
    print("Testing Ollama LLM Service")
    print("=" * 60)

    # Initialize service
    llm = LLMService()

    # Check status
    print("\n1. Checking Ollama status...")
    status = llm.get_status()
    print(f"   Status: {status}")

    if status["available"]:
        print("\n2. Testing generation...")
        test_prompt = """Analyze this offer letter excerpt for California compliance:

"This offer includes a 2-year non-compete clause preventing you from working for competitors."

Return JSON with any violations found."""

        response = llm.generate(test_prompt, max_new_tokens=512)
        print(f"\n   Response:\n{response}")
    else:
        print("\n⚠️ Ollama not available. To set up:")
        print("   1. Install Ollama: https://ollama.com/download")
        print("   2. Run: ollama pull phi3:mini")
        print("   3. Ollama starts automatically, or run: ollama serve")
