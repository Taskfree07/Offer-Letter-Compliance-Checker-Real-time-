"""
Word Document (.docx) Service for variable extraction and editing
Uses python-docx for reading and writing Word documents
"""

import re
import logging
from typing import Dict, List, Any, Tuple
from io import BytesIO

logger = logging.getLogger(__name__)

try:
    from docx import Document
    from docx.shared import Pt, RGBColor, Inches
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    DOCX_AVAILABLE = True
except ImportError as e:
    logger.warning(f"python-docx not available: {e}")
    DOCX_AVAILABLE = False
    Document = None

class DocxService:
    """Service for handling Word document operations"""
    
    def __init__(self):
        # Bracket patterns for variable detection
        self.bracket_patterns = [
            re.compile(r'\[([^\]]+)\]'),  # Standard [Variable Name]
            re.compile(r'\{([^}]+)\}'),   # Curly braces {Variable Name}
            re.compile(r'<<([^>]+)>>'),   # Double angle brackets <<Variable Name>>
        ]
    
    def extract_variables_from_docx(self, docx_bytes: bytes) -> Dict[str, Any]:
        """
        Extract all bracketed variables from a Word document
        
        Args:
            docx_bytes: Word document as bytes
            
        Returns:
            Dictionary with variables and metadata
        """
        if not DOCX_AVAILABLE:
            return {
                "success": False,
                "error": "python-docx not installed",
                "variables": {},
                "text": ""
            }
        
        try:
            # Load document from bytes
            doc = Document(BytesIO(docx_bytes))
            
            # Extract all text
            full_text = []
            variables = {}
            
            # Process paragraphs
            for para in doc.paragraphs:
                text = para.text
                full_text.append(text)
                
                # Find variables in paragraph
                for pattern in self.bracket_patterns:
                    matches = pattern.finditer(text)
                    for match in matches:
                        var_name = match.group(1).strip()
                        full_match = match.group(0)
                        
                        if var_name not in variables:
                            variables[var_name] = {
                                "name": var_name,
                                "original_text": full_match,
                                "occurrences": 0,
                                "suggested_value": ""
                            }
                        variables[var_name]["occurrences"] += 1
            
            # Process tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        text = cell.text
                        full_text.append(text)
                        
                        # Find variables in cell
                        for pattern in self.bracket_patterns:
                            matches = pattern.finditer(text)
                            for match in matches:
                                var_name = match.group(1).strip()
                                full_match = match.group(0)
                                
                                if var_name not in variables:
                                    variables[var_name] = {
                                        "name": var_name,
                                        "original_text": full_match,
                                        "occurrences": 0,
                                        "suggested_value": ""
                                    }
                                variables[var_name]["occurrences"] += 1
            
            combined_text = "\n".join(full_text)
            
            return {
                "success": True,
                "variables": variables,
                "text": combined_text,
                "paragraph_count": len(doc.paragraphs),
                "table_count": len(doc.tables),
                "total_variables": len(variables)
            }
            
        except Exception as e:
            logger.error(f"Error extracting variables from docx: {e}")
            return {
                "success": False,
                "error": str(e),
                "variables": {},
                "text": ""
            }
    
    def replace_variables_in_docx(self, docx_bytes: bytes, variables: Dict[str, str]) -> bytes:
        """
        Replace variables in a Word document with provided values
        
        Args:
            docx_bytes: Original Word document as bytes
            variables: Dictionary of variable names to values
            
        Returns:
            Modified Word document as bytes
        """
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx not installed")
        
        try:
            # Load document from bytes
            doc = Document(BytesIO(docx_bytes))
            
            # Replace in paragraphs
            for para in doc.paragraphs:
                for run in para.runs:
                    text = run.text
                    modified = False
                    
                    # Replace each variable pattern
                    for pattern in self.bracket_patterns:
                        matches = list(pattern.finditer(text))
                        if matches:
                            for match in reversed(matches):  # Reverse to maintain positions
                                var_name = match.group(1).strip()
                                if var_name in variables and variables[var_name]:
                                    # Replace the bracketed variable with its value
                                    start, end = match.span()
                                    text = text[:start] + variables[var_name] + text[end:]
                                    modified = True
                    
                    if modified:
                        run.text = text
            
            # Replace in tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        for para in cell.paragraphs:
                            for run in para.runs:
                                text = run.text
                                modified = False
                                
                                for pattern in self.bracket_patterns:
                                    matches = list(pattern.finditer(text))
                                    if matches:
                                        for match in reversed(matches):
                                            var_name = match.group(1).strip()
                                            if var_name in variables and variables[var_name]:
                                                start, end = match.span()
                                                text = text[:start] + variables[var_name] + text[end:]
                                                modified = True
                                
                                if modified:
                                    run.text = text
            
            # Save to bytes
            output = BytesIO()
            doc.save(output)
            output.seek(0)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error replacing variables in docx: {e}")
            raise

# Global service instance
docx_service = DocxService()

def extract_docx_variables(docx_bytes: bytes) -> Dict[str, Any]:
    """Extract variables from Word document"""
    return docx_service.extract_variables_from_docx(docx_bytes)

def replace_docx_variables(docx_bytes: bytes, variables: Dict[str, str]) -> bytes:
    """Replace variables in Word document"""
    return docx_service.replace_variables_in_docx(docx_bytes, variables)
