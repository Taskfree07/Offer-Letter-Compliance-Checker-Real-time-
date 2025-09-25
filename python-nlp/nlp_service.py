import spacy
import json
from typing import Dict, List, Any, Optional
import re
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NLPEntityExtractor:
    """
    Advanced NLP service for entity extraction and text processing
    Specifically designed for email automation and document processing
    """
    
    def __init__(self, model_name: str = "en_core_web_sm"):
        """
        Initialize the NLP service with spaCy model
        
        Args:
            model_name: spaCy model to use (default: en_core_web_sm)
        """
        try:
            self.nlp = spacy.load(model_name)
            logger.info(f"Successfully loaded spaCy model: {model_name}")
        except OSError:
            logger.error(f"Model {model_name} not found. Please install it using: python -m spacy download {model_name}")
            raise
        
        # Custom entity patterns for email automation
        self.custom_patterns = self._setup_custom_patterns()
        
        # Add custom patterns to the NLP pipeline
        if "entity_ruler" not in self.nlp.pipe_names:
            ruler = self.nlp.add_pipe("entity_ruler", before="ner")
            ruler.add_patterns(self.custom_patterns)
    
    def _setup_custom_patterns(self) -> List[Dict]:
        """
        Setup custom entity patterns for offer letter fields
        """
        patterns = [
            # Offer letter specific patterns
            {"label": "CANDIDATE_NAME", "pattern": [{"TEXT": "["}, {"TEXT": "Candidate"}, {"TEXT": "Name"}, {"TEXT": "]"}]},
            {"label": "ADDRESS", "pattern": [{"TEXT": "["}, {"TEXT": "Address"}, {"TEXT": "]"}]},
            {"label": "COMPANY_NAME", "pattern": [{"TEXT": "["}, {"TEXT": "Company"}, {"TEXT": "Name"}, {"TEXT": "]"}]},
            {"label": "JOB_TITLE", "pattern": [{"TEXT": "["}, {"TEXT": "Job"}, {"TEXT": "Title"}, {"TEXT": "]"}]},
            {"label": "CLIENT_NAME", "pattern": [{"TEXT": "["}, {"TEXT": "Client"}, {"TEXT": "/"}, {"TEXT": "Customer"}, {"TEXT": "Name"}, {"TEXT": "]"}]},
            {"label": "START_DATE", "pattern": [{"TEXT": "["}, {"TEXT": "Proposed"}, {"TEXT": "Start"}, {"TEXT": "Date"}, {"TEXT": "]"}]},
            {"label": "SALARY_AMOUNT", "pattern": [{"TEXT": "["}, {"TEXT": "Amount"}, {"TEXT": "]"}]},
            {"label": "PAY_FREQUENCY", "pattern": [{"TEXT": "["}, {"TEXT": "semi-monthly"}, {"TEXT": "]"}]},
            {"label": "SIGNATORY", "pattern": [{"TEXT": "["}, {"TEXT": "Authorized"}, {"TEXT": "Signatory"}, {"TEXT": "]"}]},
            {"label": "SIGNATORY_NAME", "pattern": [{"TEXT": "["}, {"TEXT": "Name"}, {"TEXT": "&"}, {"TEXT": "Designation"}, {"TEXT": "]"}]},
            {"label": "COMPANY_ADDRESS", "pattern": [{"TEXT": "["}, {"TEXT": "Company"}, {"TEXT": "Address"}, {"TEXT": "]"}]},
            
            # Email patterns
            {"label": "EMAIL", "pattern": [{"TEXT": {"REGEX": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"}}]},
            
            # Phone number patterns
            {"label": "PHONE", "pattern": [{"TEXT": {"REGEX": r"\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}"}}]},
            
            # Job title patterns
            {"label": "JOB_TITLE", "pattern": [{"LOWER": "software"}, {"LOWER": "engineer"}]},
            {"label": "JOB_TITLE", "pattern": [{"LOWER": "data"}, {"LOWER": "scientist"}]},
            {"label": "JOB_TITLE", "pattern": [{"LOWER": "product"}, {"LOWER": "manager"}]},
            {"label": "JOB_TITLE", "pattern": [{"LOWER": "marketing"}, {"LOWER": "specialist"}]},
            {"label": "JOB_TITLE", "pattern": [{"LOWER": "sales"}, {"LOWER": "representative"}]},
            
            # Salary patterns
            {"label": "SALARY", "pattern": [{"TEXT": {"REGEX": r"\$[0-9,]+(?:\.[0-9]{2})?"}}]},
            {"label": "SALARY", "pattern": [{"TEXT": {"REGEX": r"[0-9,]+\s*(?:USD|dollars?)"}}]},
            
            # Company patterns
            {"label": "COMPANY", "pattern": [{"TEXT": {"REGEX": r"[A-Z][a-zA-Z\s]+(?:Inc\.?|LLC|Corp\.?|Ltd\.?|Co\.?)"}}]},
            
            # Date patterns (enhanced)
            {"label": "START_DATE", "pattern": [{"LOWER": "start"}, {"LOWER": "date"}, {"TEXT": ":"}, {"ENT_TYPE": "DATE"}]},
            {"label": "END_DATE", "pattern": [{"LOWER": "end"}, {"LOWER": "date"}, {"TEXT": ":"}, {"ENT_TYPE": "DATE"}]},
        ]

        # Add legal/regulatory patterns via EntityRuler (acts and common clauses)
        LEGAL_ACTS = [
            "FLSA", "FMLA", "Title VII", "ADA", "ADEA", "NLRA", "EEOC",
            "HIPAA", "GDPR", "CCPA", "CFRA", "FEHA", "PAGA"
        ]
        CLAUSE_TERMS = [
            "at-will", "non-compete", "noncompetition", "non-solicitation", "nonsolicitation",
            "arbitration", "confidentiality", "intellectual property", "IP assignment",
            "background check", "drug test", "probation period", "severability"
        ]

        for act in LEGAL_ACTS:
            patterns.append({"label": "LEGAL_ACT", "pattern": [{"LOWER": w.lower()} for w in act.split()]})

        for clause in CLAUSE_TERMS:
            patterns.append({"label": "LEGAL_CLAUSE", "pattern": [{"LOWER": w.lower()} for w in clause.split()]})

        return patterns
    
    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract entities from text with enhanced processing for email automation
        
        Args:
            text: Input text to process
            
        Returns:
            Dictionary containing extracted entities and metadata
        """
        if not text or not text.strip():
            return {"entities": [], "processed_text": "", "metadata": {}}
        
        # Process text with spaCy
        doc = self.nlp(text)
        
        # Extract entities
        entities = []
        for ent in doc.ents:
            entity_info = {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
                "confidence": getattr(ent, 'confidence', 0.9),  # Default confidence
                "description": spacy.explain(ent.label_) or ent.label_
            }
            entities.append(entity_info)
        
        # Extract additional patterns
        additional_entities = self._extract_custom_entities(text)
        entities.extend(additional_entities)
        
        # Remove duplicates and sort by position
        entities = self._deduplicate_entities(entities)
        entities.sort(key=lambda x: x['start'])
        
        # Generate metadata
        metadata = self._generate_metadata(doc, entities)
        
        return {
            "entities": entities,
            "processed_text": text,
            "metadata": metadata,
            "entity_count": len(entities),
            "processing_timestamp": datetime.now().isoformat()
        }
    
    def _extract_custom_entities(self, text: str) -> List[Dict]:
        """
        Extract custom entities using regex patterns
        """
        custom_entities = []
        
        # Email addresses (more comprehensive)
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        for match in re.finditer(email_pattern, text):
            custom_entities.append({
                "text": match.group(),
                "label": "EMAIL",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.95,
                "description": "Email address"
            })
        
        # Phone numbers (US format)
        phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
        for match in re.finditer(phone_pattern, text):
            custom_entities.append({
                "text": match.group(),
                "label": "PHONE",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.9,
                "description": "Phone number"
            })
        
        # URLs
        url_pattern = r'https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?'
        for match in re.finditer(url_pattern, text):
            custom_entities.append({
                "text": match.group(),
                "label": "URL",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.95,
                "description": "Website URL"
            })
        
        # AGE (e.g., "Age: 29", "age 30")
        age_pattern = r'\b[Aa]ge\s*[:\-]?\s*(\d{1,2})\b'
        for match in re.finditer(age_pattern, text):
            # The whole phrase span is useful context; entity text as the matched number
            num_span_start = match.start(1)
            num_span_end = match.end(1)
            custom_entities.append({
                "text": match.group(1),
                "label": "AGE",
                "start": num_span_start,
                "end": num_span_end,
                "confidence": 0.9,
                "description": "Age in years"
            })

        # DOB / Date of Birth (various formats)
        dob_pattern = (
            r'\b(?:DOB|Date\s+of\s+Birth)\s*[:\-]?\s*('
            r'(?:[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})'             # Jan 2, 1990
            r'|(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'                  # 01/02/1990 or 1-2-90
            r'|(?:\d{4}[/-]\d{1,2}[/-]\d{1,2})'                    # 1990-01-02
            r')\b'
        )
        for match in re.finditer(dob_pattern, text):
            date_text = match.group(1)
            # Position the entity around the actual date substring
            date_start = match.start(1)
            date_end = match.end(1)
            custom_entities.append({
                "text": date_text,
                "label": "DOB",
                "start": date_start,
                "end": date_end,
                "confidence": 0.9,
                "description": "Date of Birth"
            })

        # LEGAL/Regulatory references
        # Statutory sections (e.g., "Section 7", "Sec. 2870(a)", "§ 8(a)(1)")
        section_pattern = r'\b(?:Section|Sec\.? )\s*\d+[A-Za-z\-]*(?:\([^)]+\))*|\b§\s*\d+[A-Za-z\-\(\)\.]*'
        for match in re.finditer(section_pattern, text):
            custom_entities.append({
                "text": match.group(),
                "label": "LEGAL_SECTION",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.9,
                "description": "Statutory section reference"
            })

        # U.S. Code / CFR citations (e.g., "29 U.S.C. § 201", "14 CFR 25.1309")
        usc_cfr_pattern = r'\b\d+\s*(?:U\.?S\.?C\.?|CFR)\s*(?:§\s*)?\d+[A-Za-z0-9\.\-\(\)]*'
        for match in re.finditer(usc_cfr_pattern, text):
            custom_entities.append({
                "text": match.group(),
                "label": "LEGAL_CITATION",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.92,
                "description": "USC/CFR citation"
            })

        # Example state code citations (extend as needed): "Cal. Lab. Code § 2870"
        state_code_pattern = r'\bCal\.?\s*Lab\.?\s*Code\s*§\s*\d+[A-Za-z0-9\-\(\)]*'
        for match in re.finditer(state_code_pattern, text):
            custom_entities.append({
                "text": match.group(),
                "label": "LEGAL_CITATION_STATE",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.9,
                "description": "State labor code citation"
            })
        
        return custom_entities
    
    def _deduplicate_entities(self, entities: List[Dict]) -> List[Dict]:
        """
        Remove duplicate entities based on text and position
        """
        seen = set()
        unique_entities = []
        
        for entity in entities:
            key = (entity['text'], entity['start'], entity['end'])
            if key not in seen:
                seen.add(key)
                unique_entities.append(entity)
        
        return unique_entities
    
    def _generate_metadata(self, doc, entities: List[Dict]) -> Dict:
        """
        Generate metadata about the processed text
        """
        # Count entity types
        entity_types = {}
        for entity in entities:
            label = entity['label']
            entity_types[label] = entity_types.get(label, 0) + 1
        
        # Text statistics
        sentences = list(doc.sents)
        tokens = [token for token in doc if not token.is_space]
        
        return {
            "sentence_count": len(sentences),
            "token_count": len(tokens),
            "character_count": len(doc.text),
            "entity_types": entity_types,
            "language": doc.lang_,
            "has_entities": len(entities) > 0
        }
    
    def replace_entities_with_variables(self, text: str, entity_mappings: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Replace detected entities with template variables
        
        Args:
            text: Input text
            entity_mappings: Optional mapping of entity labels to variable names
            
        Returns:
            Dictionary with processed text and variable mappings
        """
        if entity_mappings is None:
            entity_mappings = {
                "PERSON": "[CANDIDATE_NAME]",
                "ORG": "[COMPANY_NAME]",
                "EMAIL": "[EMAIL_ADDRESS]",
                "PHONE": "[PHONE_NUMBER]",
                "MONEY": "[SALARY]",
                "DATE": "[DATE]",
                "JOB_TITLE": "[POSITION]",
                "GPE": "[LOCATION]"  # Geopolitical entity (cities, countries)
            }
        
        # Extract entities
        result = self.extract_entities(text)
        entities = result["entities"]
        
        # Sort entities by start position in reverse order to avoid position shifts
        entities.sort(key=lambda x: x['start'], reverse=True)
        
        processed_text = text
        variables_used = {}
        
        for entity in entities:
            label = entity['label']
            if label in entity_mappings:
                variable = entity_mappings[label]
                
                # Replace entity text with variable
                start, end = entity['start'], entity['end']
                processed_text = processed_text[:start] + variable + processed_text[end:]
                
                # Track variables used
                if variable not in variables_used:
                    variables_used[variable] = []
                variables_used[variable].append({
                    "original_text": entity['text'],
                    "entity_type": label,
                    "confidence": entity['confidence']
                })
        
        return {
            "processed_text": processed_text,
            "variables_used": variables_used,
            "original_entities": entities,
            "entity_count": len(entities)
        }
    
    def suggest_template_variables(self, text: str) -> Dict[str, Any]:
        """
        Analyze text and suggest template variables for email automation
        """
        result = self.extract_entities(text)
        entities = result["entities"]
        
        suggestions = {}
        
        for entity in entities:
            label = entity['label']
            text_content = entity['text']
            
            # Generate suggestions based on entity type
            if label == "PERSON":
                suggestions["[CANDIDATE_NAME]"] = {
                    "current_value": text_content,
                    "description": "Candidate's full name",
                    "entity_type": label,
                    "confidence": entity['confidence']
                }
            elif label == "ORG":
                suggestions["[COMPANY_NAME]"] = {
                    "current_value": text_content,
                    "description": "Company or organization name",
                    "entity_type": label,
                    "confidence": entity['confidence']
                }
            elif label == "EMAIL":
                suggestions["[EMAIL_ADDRESS]"] = {
                    "current_value": text_content,
                    "description": "Email address",
                    "entity_type": label,
                    "confidence": entity['confidence']
                }
            elif label in ["MONEY", "SALARY"]:
                suggestions["[SALARY]"] = {
                    "current_value": text_content,
                    "description": "Salary or compensation amount",
                    "entity_type": label,
                    "confidence": entity['confidence']
                }
            elif label == "DATE":
                suggestions["[START_DATE]"] = {
                    "current_value": text_content,
                    "description": "Start date or important date",
                    "entity_type": label,
                    "confidence": entity['confidence']
                }
            elif label == "JOB_TITLE":
                suggestions["[POSITION]"] = {
                    "current_value": text_content,
                    "description": "Job title or position",
                    "entity_type": label,
                    "confidence": entity['confidence']
                }
        
        return {
            "suggestions": suggestions,
            "total_suggestions": len(suggestions),
            "original_entities": entities
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded NLP model
        """
        return {
            "model_name": self.nlp.meta.get("name", "unknown"),
            "model_version": self.nlp.meta.get("version", "unknown"),
            "language": self.nlp.meta.get("lang", "unknown"),
            "pipeline_components": self.nlp.pipe_names,
            "entity_types": list(self.nlp.get_pipe("ner").labels) if "ner" in self.nlp.pipe_names else []
        }
    
    def extract_entities_with_positions(self, text: str) -> Dict[str, Any]:
        """
        Extract entities with their exact character positions in the text
        Specifically designed for offer letter field detection
        """
        doc = self.nlp(text)
        
        entities_with_positions = []
        for ent in doc.ents:
            entities_with_positions.append({
                "text": ent.text,
                "label": ent.label_,
                "start_char": ent.start_char,
                "end_char": ent.end_char,
                "start_token": ent.start,
                "end_token": ent.end
            })
        
        # Also extract custom patterns with regex for offer letter fields
        offer_letter_patterns = {
            "CANDIDATE_NAME": r"\[Candidate Name\]",
            "ADDRESS": r"\[Address\]", 
            "COMPANY_NAME": r"\[Company Name\]",
            "JOB_TITLE": r"\[Job Title\]",
            "CLIENT_NAME": r"\[Client/Customer Name\]",
            "START_DATE": r"\[Proposed Start Date\]",
            "SALARY_AMOUNT": r"\[Amount\]",
            "PAY_FREQUENCY": r"\[semi-monthly\]",
            "SIGNATORY": r"\[Authorized Signatory\]",
            "SIGNATORY_NAME": r"\[Name & Designation\]",
            "COMPANY_ADDRESS": r"\[Company Address\]"
        }
        
        for label, pattern in offer_letter_patterns.items():
            for match in re.finditer(pattern, text):
                entities_with_positions.append({
                    "text": match.group(),
                    "label": label,
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "start_token": -1,  # Not applicable for regex matches
                    "end_token": -1
                })
        
        return {
            "entities": entities_with_positions,
            "text_length": len(text),
            "token_count": len(doc)
        }

# Example usage and testing
if __name__ == "__main__":
    # Initialize the NLP service
    nlp_service = NLPEntityExtractor()
    
    # Test text
    test_text = """
    Dear John Smith,
    
    We are pleased to offer you the position of Senior Software Engineer at TechCorp Inc.
    Your starting salary will be $120,000 per year, and your start date is January 15, 2024.
    
    Please contact us at hr@techcorp.com or call (555) 123-4567 if you have any questions.
    
    Best regards,
    Jane Doe
    HR Manager
    """
    
    # Extract entities
    print("=== Entity Extraction ===")
    result = nlp_service.extract_entities(test_text)
    print(json.dumps(result, indent=2))
    
    # Suggest template variables
    print("\n=== Template Variable Suggestions ===")
    suggestions = nlp_service.suggest_template_variables(test_text)
    print(json.dumps(suggestions, indent=2))
    
    # Replace entities with variables
    print("\n=== Entity Replacement ===")
    replacement_result = nlp_service.replace_entities_with_variables(test_text)
    print(json.dumps(replacement_result, indent=2))
