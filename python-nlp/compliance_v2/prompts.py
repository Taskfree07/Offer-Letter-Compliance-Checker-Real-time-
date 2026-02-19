"""
Prompt templates for LLM-based compliance analysis
"""

COMPLIANCE_ANALYSIS_PROMPT = """You are a legal compliance expert specializing in US employment law. Your task is to analyze an offer letter for potential violations of state employment laws.

STATE: {state}

RELEVANT STATE LAWS:
{retrieved_laws}

OFFER LETTER SECTION:
{document_section}

INSTRUCTIONS:
1. Carefully review the offer letter text against ONLY the state laws provided above
2. Identify any clear violations or compliance issues
3. Be conservative - only flag issues you are confident about
4. Provide specific citations from the laws above
5. Quote the exact problematic text from the offer letter
6. Provide a SPECIFIC, ACTIONABLE suggestion for each issue (see below)
7. Assign a confidence score (0.0 to 1.0) for each violation

SUGGESTION GUIDELINES - Make suggestions specific and actionable:
- For violations: Provide exact alternative language they should use instead
- For warnings: Explain what to review or add to the clause
- For acceptable clauses (info): Confirm it's acceptable but note any caveats
- Include specific actions like "Remove this clause", "Add the following language...", "Modify to state..."
- Reference the specific state requirement when suggesting changes

IMPORTANT RULES:
- Only flag ACTUAL violations based on the laws provided
- Do NOT make up laws or violations not mentioned in the provided laws
- Do NOT flag issues if you're uncertain (confidence < 0.7)
- Always provide the exact law citation
- Quote the specific problematic text from the offer letter
- ALWAYS provide a helpful, specific suggestion - never leave it generic

OUTPUT FORMAT (JSON only, no other text):
{{
  "violations": [
    {{
      "severity": "error|warning|info",
      "law_citation": "exact statute reference from laws above",
      "violation_text": "exact quote from offer letter",
      "explanation": "clear explanation of why this violates the law",
      "suggestion": "SPECIFIC actionable recommendation - include alternative language if applicable",
      "confidence": 0.85,
      "source_url": "official government URL if available"
    }}
  ]
}}

If no violations are found, return: {{"violations": []}}

OUTPUT (JSON only):"""


COMPLIANCE_SUMMARY_PROMPT = """You are a legal compliance expert. Provide a brief summary of compliance findings.

VIOLATIONS FOUND:
{violations_json}

STATE: {state}

Provide a 2-3 sentence executive summary of the compliance status:
- If there are errors: "This offer letter contains [X] critical violations..."
- If there are warnings: "This offer letter has [X] warnings that should be reviewed..."
- If compliant: "This offer letter appears compliant with {state} employment laws..."

SUMMARY:"""


CONFIDENCE_EXPLANATION_PROMPT = """Explain why this violation has a confidence score of {confidence:.0%}.

VIOLATION:
Topic: {topic}
Law: {law_citation}
Issue: {explanation}

Provide a brief (1-2 sentences) explanation of the confidence level:
- High confidence (>80%): Clear violation with explicit law
- Medium confidence (60-80%): Likely violation but some interpretation needed
- Low confidence (<60%): Potential issue requiring legal review

EXPLANATION:"""


def format_laws_for_prompt(laws: list) -> str:
    """
    Format retrieved laws into readable text for LLM prompt

    Args:
        laws: List of law dictionaries from RAG service

    Returns:
        Formatted string of laws
    """
    if not laws:
        return "No specific state laws retrieved for this analysis."

    formatted = []

    for idx, law in enumerate(laws, 1):
        metadata = law.get('metadata', {})

        law_text = f"""
Law {idx}:
Topic: {metadata.get('topic', 'Unknown')}
Citation: {metadata.get('law_citation', 'No citation')}
Severity: {metadata.get('severity', 'warning')}
Summary: {metadata.get('summary', 'No summary available')}
Full Text: {law.get('document', 'No full text available')}
Relevance Score: {law.get('similarity', 0.0):.0%}
---
        """.strip()

        formatted.append(law_text)

    return "\n\n".join(formatted)


def create_compliance_prompt(state: str,
                            document_text: str,
                            relevant_laws: list) -> str:
    """
    Create full compliance analysis prompt

    Args:
        state: State code (e.g., "CA")
        document_text: Offer letter text
        relevant_laws: List of laws from RAG

    Returns:
        Formatted prompt string
    """
    laws_text = format_laws_for_prompt(relevant_laws)

    return COMPLIANCE_ANALYSIS_PROMPT.format(
        state=state,
        retrieved_laws=laws_text,
        document_section=document_text[:2000]  # Limit document length
    )
