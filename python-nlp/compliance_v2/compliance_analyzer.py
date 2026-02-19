"""
Multi-Layer Compliance Analyzer
Combines Pattern Matching + RAG + LLM for maximum accuracy
"""

import logging
from typing import Dict, Any, List, Optional
import re

from .rag_service import get_rag_service
from .llm_service import get_llm_service

logger = logging.getLogger(__name__)


class ComplianceAnalyzer:
    """
    Multi-layer compliance analyzer combining:
    - Layer 1: Pattern matching (fast, baseline)
    - Layer 2: RAG + LLM (accurate, contextual)
    - Layer 3: Confidence scoring (cross-validation)
    """

    def __init__(self,
                 use_rag: bool = True,
                 use_llm: bool = True,
                 pattern_rules: Optional[Dict] = None):
        """
        Initialize compliance analyzer

        Args:
            use_rag: Enable RAG retrieval
            use_llm: Enable LLM analysis
            pattern_rules: Optional custom pattern rules (if None, uses defaults)
        """
        self.use_rag = use_rag
        self.use_llm = use_llm

        # Initialize services
        if self.use_rag:
            self.rag_service = get_rag_service()
            logger.info("✅ RAG service initialized")
        else:
            self.rag_service = None

        if self.use_llm:
            self.llm_service = get_llm_service()
            logger.info("✅ LLM service initialized")
        else:
            self.llm_service = None

        # Pattern rules (simple patterns for Layer 1)
        self.pattern_rules = pattern_rules or self._default_pattern_rules()

    def _default_pattern_rules(self) -> Dict[str, Dict]:
        """Default pattern matching rules (simple baseline)"""
        return {
            "non_compete": {
                "patterns": [
                    r"non-compete",
                    r"noncompete",
                    r"competitive activities",
                    r"restraint of trade",
                    r"covenant not to compete"
                ],
                "severity": "error",
                "topic": "Non-Compete Restrictions",
                "message": "Document may contain non-compete language"
            },
            "salary_history": {
                "patterns": [
                    r"salary history",
                    r"previous salary",
                    r"prior wages",
                    r"compensation at previous",
                    r"what did you earn"
                ],
                "severity": "warning",
                "topic": "Salary History Inquiry",
                "message": "Document may ask about salary history"
            },
            "background_check": {
                "patterns": [
                    r"criminal history",
                    r"background check before",
                    r"prior to offer"
                ],
                "severity": "warning",
                "topic": "Background Check Timing",
                "message": "Background check timing may be problematic"
            },
            "arbitration": {
                "patterns": [
                    r"mandatory arbitration",
                    r"disputes.*arbitration",
                    r"exclusive remedy"
                ],
                "severity": "info",
                "topic": "Arbitration Clause",
                "message": "Contains arbitration language"
            }
        }

    def _pattern_match(self, text: str, state: str) -> List[Dict[str, Any]]:
        """
        Layer 1: Simple pattern matching (fast baseline)

        Args:
            text: Document text
            state: State code

        Returns:
            List of violations found by pattern matching
        """
        violations = []
        text_lower = text.lower()

        for rule_key, rule in self.pattern_rules.items():
            for pattern in rule['patterns']:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    violations.append({
                        "type": rule_key,
                        "topic": rule['topic'],
                        "severity": rule['severity'],
                        "message": rule['message'],
                        "method": "pattern_matching",
                        "confidence": 0.60,  # Baseline confidence
                        "matched_pattern": pattern
                    })
                    break  # Only add once per rule type

        logger.info(f"Pattern matching found {len(violations)} potential issues")
        return violations

    def _rag_llm_analyze(self, text: str, state: str) -> List[Dict[str, Any]]:
        """
        Layer 2: RAG + LLM analysis (accurate, contextual)

        Args:
            text: Document text
            state: State code

        Returns:
            List of violations found by LLM
        """
        if not self.use_rag or not self.use_llm:
            logger.warning("RAG or LLM disabled, skipping Layer 2")
            return []

        try:
            # Step 1: Retrieve relevant laws using RAG
            relevant_laws = self.rag_service.query_relevant_laws(
                state=state,
                document_text=text,
                top_k=10,
                min_similarity=0.05  # Very permissive for testing - adjust based on results
            )

            if not relevant_laws:
                logger.warning(f"No relevant laws found for {state}")
                return []

            # Step 2: Analyze with LLM
            analysis = self.llm_service.analyze_compliance(
                state=state,
                document_text=text,
                relevant_laws=relevant_laws
            )

            if not analysis.get('success'):
                logger.error(f"LLM analysis failed: {analysis.get('error')}")
                return []

            violations = analysis.get('violations', [])

            # Add method tracking
            for v in violations:
                v['method'] = 'rag_llm'
                v['laws_retrieved'] = len(relevant_laws)

            logger.info(f"RAG + LLM found {len(violations)} violations")
            return violations

        except Exception as e:
            logger.error(f"RAG + LLM analysis failed: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return []

    def _cross_validate(self,
                       pattern_violations: List[Dict],
                       llm_violations: List[Dict]) -> List[Dict[str, Any]]:
        """
        Layer 3: Cross-validation and confidence scoring

        Args:
            pattern_violations: Violations from pattern matching
            llm_violations: Violations from LLM

        Returns:
            Final list of violations with adjusted confidence scores
        """
        final_violations = []

        # Process LLM violations (primary source of truth)
        for llm_v in llm_violations:
            # Check if pattern matching also caught it
            topic = llm_v.get('topic', llm_v.get('type', '')).lower()

            pattern_confirmed = any(
                topic in pv.get('topic', '').lower() or
                topic in pv.get('type', '').lower()
                for pv in pattern_violations
            )

            # Boost confidence if both methods agree
            original_confidence = llm_v.get('confidence', 0.75)

            if pattern_confirmed:
                llm_v['confidence'] = min(original_confidence * 1.2, 0.99)
                llm_v['validation'] = 'cross_validated'
                llm_v['validation_method'] = 'pattern + LLM'
            else:
                llm_v['validation'] = 'llm_only'
                llm_v['validation_method'] = 'LLM only'

            # Only include high-confidence violations
            if llm_v['confidence'] >= 0.70:
                final_violations.append(llm_v)

        # Add pattern-only violations that LLM didn't catch (low confidence)
        for pv in pattern_violations:
            topic = pv.get('topic', pv.get('type', '')).lower()

            already_included = any(
                topic in fv.get('topic', '').lower() or
                topic in fv.get('type', '').lower()
                for fv in final_violations
            )

            if not already_included:
                pv['confidence'] = 0.50  # Low confidence for pattern-only
                pv['validation'] = 'pattern_only'
                pv['validation_method'] = 'Pattern matching only - needs review'
                # Only include if specifically flagged as severe
                if pv.get('severity') == 'error':
                    final_violations.append(pv)

        logger.info(f"Cross-validation: {len(final_violations)} final violations")
        return final_violations

    def analyze(self, text: str, state: str) -> Dict[str, Any]:
        """
        Run full multi-layer compliance analysis

        Args:
            text: Document text to analyze
            state: State code (e.g., "CA")

        Returns:
            Complete analysis results
        """
        logger.info(f"Starting multi-layer analysis for {state}")
        logger.info(f"Document length: {len(text)} characters")

        results = {
            "state": state,
            "document_length": len(text),
            "violations": [],
            "layers_used": [],
            "confidence_avg": 0.0,
            "method": "multi_layer"
        }

        # Layer 1: Pattern matching
        logger.info("🔍 Layer 1: Pattern matching...")
        pattern_violations = self._pattern_match(text, state)
        results["layers_used"].append("pattern_matching")
        results["pattern_matches"] = len(pattern_violations)

        # Layer 2: RAG + LLM
        llm_violations = []
        if self.use_rag and self.use_llm:
            logger.info("🤖 Layer 2: RAG + LLM analysis...")
            llm_violations = self._rag_llm_analyze(text, state)
            results["layers_used"].append("rag_llm")
            results["llm_findings"] = len(llm_violations)

        # Layer 3: Cross-validation
        logger.info("✅ Layer 3: Cross-validation...")
        final_violations = self._cross_validate(pattern_violations, llm_violations)
        results["violations"] = final_violations

        # Calculate average confidence
        if final_violations:
            avg_confidence = sum(v.get('confidence', 0.0) for v in final_violations) / len(final_violations)
            results["confidence_avg"] = round(avg_confidence, 2)

        # Summary stats
        results["total_violations"] = len(final_violations)
        results["errors"] = len([v for v in final_violations if v.get('severity') == 'error'])
        results["warnings"] = len([v for v in final_violations if v.get('severity') == 'warning'])
        results["info"] = len([v for v in final_violations if v.get('severity') == 'info'])

        logger.info(f"✅ Analysis complete: {results['total_violations']} violations found")
        logger.info(f"   Errors: {results['errors']}, Warnings: {results['warnings']}, Info: {results['info']}")
        logger.info(f"   Average confidence: {results['confidence_avg']:.0%}")

        return results

    def get_supported_states(self) -> List[str]:
        """Get list of states supported by the analyzer"""
        if self.rag_service:
            coverage = self.rag_service.get_state_coverage()
            return coverage['states_loaded']
        return []


# Singleton instance
_analyzer_instance = None

def get_compliance_analyzer(use_rag: bool = True,
                           use_llm: bool = True) -> ComplianceAnalyzer:
    """Get singleton compliance analyzer instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = ComplianceAnalyzer(use_rag=use_rag, use_llm=use_llm)
    return _analyzer_instance


# Test function
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Multi-Layer Compliance Analyzer...")

    # Initialize analyzer
    analyzer = ComplianceAnalyzer(use_rag=True, use_llm=True)

    # Test document
    test_document = """
    This employment agreement includes the following terms:

    1. You agree not to engage in any competitive activities for a period of 2 years.

    2. Please provide your salary history from your previous employer.

    3. Employment is at-will and may be terminated at any time.

    4. All disputes shall be resolved through mandatory arbitration.
    """

    # Run analysis (will use mock LLM if GPU not available)
    results = analyzer.analyze(test_document, "CA")

    print(f"\n📊 ANALYSIS RESULTS:")
    print(f"State: {results['state']}")
    print(f"Total Violations: {results['total_violations']}")
    print(f"Average Confidence: {results['confidence_avg']:.0%}")
    print(f"\nViolations Found:")

    for idx, v in enumerate(results['violations'], 1):
        print(f"\n{idx}. {v.get('topic', v.get('type', 'Unknown'))}")
        print(f"   Severity: {v.get('severity')}")
        print(f"   Confidence: {v.get('confidence', 0):.0%}")
        print(f"   Method: {v.get('validation_method', v.get('method'))}")
        print(f"   Message: {v.get('message', v.get('explanation', 'No details'))[:100]}...")
