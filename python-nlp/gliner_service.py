"""
GLiNER service for extracting structured entities from PDF text
Uses GLiNER model for flexible named entity recognition
"""

from gliner import GLiNER
import json
import logging
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GLiNERService:
    def __init__(self, model_name: str = "urchade/gliner_small-v2.1"):
        """
        Initialize GLiNER service with specified model
        
        Args:
            model_name: HuggingFace model name for GLiNER
        """
        self.model = None
        self.model_name = model_name
        self._load_model()
    
    def _load_model(self):
        """Load GLiNER model with proper error handling"""
        try:
            import os
            import torch
            
            logger.info(f"Loading GLiNER model: {self.model_name}")
            logger.info("This may take a few minutes on first run to download the model...")
            
            # Try loading the model
            try:
                self.model = GLiNER.from_pretrained(
                    self.model_name,
                    local_files_only=False,  # Allow downloading if not cached
                )
                logger.info("GLiNER model loaded successfully")
            except Exception as load_error:
                logger.warning(f"Standard loading failed: {load_error}")
                logger.info("Attempting alternative loading method...")
                
                # Try with trust_remote_code if available
                try:
                    self.model = GLiNER.from_pretrained(
                        self.model_name,
                        local_files_only=False,
                        trust_remote_code=True
                    )
                    logger.info("GLiNER model loaded successfully with alternative method")
                except Exception as alt_error:
                    logger.error(f"Alternative loading also failed: {alt_error}")
                    raise load_error  # Raise the original error
                    
        except KeyboardInterrupt:
            logger.warning("GLiNER model loading interrupted by user")
            raise
        except Exception as e:
            logger.error(f"Failed to load GLiNER model: {e}")
            logger.error("The service will continue without GLiNER support")
            logger.error("Some advanced features may be limited")
            raise
    
    def extract_offer_letter_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract offer letter specific entities from text
        
        Args:
            text: Input text from PDF
            
        Returns:
            Dictionary with extracted entities and their positions
        """
        if not self.model:
            raise RuntimeError("GLiNER model not loaded")
        
        # Define entity labels for offer letters
        entity_labels = [
            "candidate_name", "job_title", "company_name", "department",
            "start_date", "salary", "annual_salary", "compensation", "amount",
            "address", "mailing_address", "work_location",
            "employment_type", "position_type", "full_time", "part_time", "contract",
            "benefits", "health_insurance", "retirement_plan", "vacation_days",
            "reporting_manager", "supervisor", "manager_name",
            "contact_person", "hr_contact", "phone_number", "email_address",
            "document_date", "offer_date", "expiration_date", "response_deadline"
        ]
        
        try:
            # Extract entities using GLiNER
            entities = self.model.predict_entities(text, entity_labels, threshold=0.3)
            
            # Process and structure the results
            structured_entities = self._structure_entities(entities, text)
            
            return {
                "entities": structured_entities,
                "raw_entities": entities,
                "entity_count": len(entities),
                "text_length": len(text)
            }
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return {
                "entities": {},
                "raw_entities": [],
                "entity_count": 0,
                "text_length": len(text),
                "error": str(e)
            }
    
    def _structure_entities(self, entities: List[Dict], text: str) -> Dict[str, Any]:
        """
        Structure extracted entities into a more usable format
        
        Args:
            entities: Raw entities from GLiNER
            text: Original text
            
        Returns:
            Structured dictionary of entities
        """
        structured = {}
        
        # Group entities by label and pick the best ones
        entity_groups = {}
        for entity in entities:
            label = entity['label']
            if label not in entity_groups:
                entity_groups[label] = []
            entity_groups[label].append(entity)
        
        # Map GLiNER labels to our canonical field names
        label_mapping = {
            "candidate_name": "Candidate Name",
            "job_title": "Job Title", 
            "company_name": "Company Name",
            "department": "Department",
            "start_date": "Start Date",
            "salary": "Amount",
            "annual_salary": "Amount", 
            "compensation": "Amount",
            "amount": "Amount",
            "address": "Address",
            "mailing_address": "Address",
            "work_location": "Address",
            "document_date": "Insert Date",
            "offer_date": "Insert Date",
            "employment_type": "Period",
            "position_type": "Period"
        }
        
        for label, entity_list in entity_groups.items():
            if not entity_list:
                continue
                
            # Sort by confidence and take the best one
            best_entity = max(entity_list, key=lambda x: x.get('score', 0))
            
            # Map to canonical field name
            canonical_name = label_mapping.get(label, label.replace('_', ' ').title())
            
            structured[canonical_name] = {
                "value": best_entity['text'].strip(),
                "confidence": best_entity.get('score', 0),
                "start": best_entity.get('start', 0),
                "end": best_entity.get('end', 0),
                "original_label": label
            }
        
        return structured
    
    def extract_compliance_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract compliance-related entities from legal documents
        
        Args:
            text: Input text from compliance PDF
            
        Returns:
            Dictionary with compliance entities
        """
        if not self.model:
            raise RuntimeError("GLiNER model not loaded")
        
        # Define compliance-specific entity labels
        compliance_labels = [
            "legal_requirement", "mandatory_clause", "prohibition", "violation",
            "penalty", "fine", "legal_reference", "statute", "regulation",
            "compliance_deadline", "filing_requirement", "disclosure_requirement",
            "state_law", "federal_law", "labor_law", "employment_law",
            "minimum_wage", "overtime_requirement", "break_requirement",
            "termination_clause", "at_will_employment", "notice_period"
        ]
        
        try:
            entities = self.model.predict_entities(text, compliance_labels, threshold=0.4)
            
            # Structure compliance entities
            compliance_rules = self._extract_compliance_rules(entities, text)
            
            return {
                "compliance_entities": entities,
                "extracted_rules": compliance_rules,
                "rule_count": len(compliance_rules)
            }
            
        except Exception as e:
            logger.error(f"Error extracting compliance entities: {e}")
            return {
                "compliance_entities": [],
                "extracted_rules": {},
                "rule_count": 0,
                "error": str(e)
            }
    
    def _extract_compliance_rules(self, entities: List[Dict], text: str) -> Dict[str, Dict]:
        """
        Convert compliance entities into structured rules
        
        Args:
            entities: Compliance entities from GLiNER
            text: Original text
            
        Returns:
            Dictionary of structured compliance rules
        """
        rules = {}
        
        for i, entity in enumerate(entities):
            rule_name = f"gliner_rule_{i + 1}"
            
            # Determine severity based on entity type
            severity = "error" if entity['label'] in ['prohibition', 'violation', 'mandatory_clause'] else "warning"
            
            # Extract surrounding context for better rule description
            start = max(0, entity.get('start', 0) - 100)
            end = min(len(text), entity.get('end', 0) + 100)
            context = text[start:end].strip()
            
            rules[rule_name] = {
                "severity": severity,
                "message": entity['text'].strip(),
                "context": context,
                "lawReference": f"GLiNER extracted {entity['label']}",
                "flaggedPhrases": [entity['text'].lower().strip()],
                "confidence": entity.get('score', 0),
                "entity_type": entity['label']
            }
        
        return rules

# Global GLiNER service instance
gliner_service = None

def get_gliner_service() -> GLiNERService:
    """Get or create GLiNER service instance"""
    global gliner_service
    if gliner_service is None:
        try:
            logger.info("Initializing GLiNER service...")
            gliner_service = GLiNERService()
            logger.info("GLiNER service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize GLiNER service: {e}")
            raise
    return gliner_service

def extract_entities_with_gliner(text: str, entity_type: str = "offer_letter") -> Dict[str, Any]:
    """
    Extract entities using GLiNER
    
    Args:
        text: Input text
        entity_type: Type of extraction ("offer_letter" or "compliance")
        
    Returns:
        Extracted entities
    """
    service = get_gliner_service()
    
    if entity_type == "offer_letter":
        return service.extract_offer_letter_entities(text)
    elif entity_type == "compliance":
        return service.extract_compliance_entities(text)
    else:
        raise ValueError(f"Unknown entity type: {entity_type}")

if __name__ == "__main__":
    # Test the service
    test_text = """
    Dear John Smith,
    
    We are pleased to offer you the position of Senior Software Engineer at TechCorp Inc.
    Your starting salary will be $120,000 annually. Your start date is January 15, 2024.
    You will be reporting to the Engineering Department.
    
    Please respond by December 20, 2023.
    
    Best regards,
    HR Team
    """
    
    result = extract_entities_with_gliner(test_text, "offer_letter")
    print(json.dumps(result, indent=2))
