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
        
        # Specific field names to detect as editable sections
        self.section_field_names = [
            "Confidentiality and Intellectual Property",
            "Pre-Employment Conditions",
            "Employment Agreement",
            "Compliance with Policies",
            "Governing Law and Dispute Resolution"
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
            section_contents = {}  # Store content for each section
            current_section = None
            section_start_index = -1
            
            # Process paragraphs
            for idx, para in enumerate(doc.paragraphs):
                text = para.text.strip()
                full_text.append(para.text)
                
                # Check if this paragraph is one of our section headings
                for section_name in self.section_field_names:
                    if section_name.lower() in text.lower() and len(text) < 200:  # Likely a heading
                        # Save previous section content if exists
                        if current_section and section_start_index >= 0:
                            section_contents[current_section] = {
                                "start_index": section_start_index,
                                "end_index": idx - 1
                            }
                        
                        # Start new section
                        current_section = section_name
                        section_start_index = idx
                        
                        # Add as a variable
                        if section_name not in variables:
                            variables[section_name] = {
                                "name": section_name,
                                "original_text": text,
                                "occurrences": 0,
                                "suggested_value": "",
                                "type": "section_heading",
                                "is_section": True
                            }
                        variables[section_name]["occurrences"] += 1
                        break
                
                # Find bracketed variables in paragraph
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
                                "suggested_value": "",
                                "type": "bracketed_variable"
                            }
                        variables[var_name]["occurrences"] += 1
            
            # Save last section if exists
            if current_section and section_start_index >= 0:
                section_contents[current_section] = {
                    "start_index": section_start_index,
                    "end_index": len(doc.paragraphs) - 1
                }
            
            # Extract content for each section
            for section_name, indices in section_contents.items():
                content_lines = []
                for i in range(indices["start_index"] + 1, min(indices["end_index"] + 1, len(doc.paragraphs))):
                    content_lines.append(doc.paragraphs[i].text)
                
                if section_name in variables:
                    variables[section_name]["content"] = "\n".join(content_lines).strip()
                    variables[section_name]["suggested_value"] = "\n".join(content_lines).strip()
            
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
            
            # Track section headings and their content for replacement
            section_paragraphs = {}
            current_section = None
            section_start_idx = -1
            
            # First pass: identify section headings and their content ranges
            for idx, para in enumerate(doc.paragraphs):
                text = para.text.strip()
                
                # Check if this is a section heading we're tracking
                for section_name in self.section_field_names:
                    if section_name.lower() in text.lower() and len(text) < 200:
                        # Save previous section range
                        if current_section and section_start_idx >= 0:
                            section_paragraphs[current_section] = {
                                "heading_idx": section_start_idx,
                                "content_start": section_start_idx + 1,
                                "content_end": idx - 1
                            }
                        
                        current_section = section_name
                        section_start_idx = idx
                        break
            
            # Save last section
            if current_section and section_start_idx >= 0:
                section_paragraphs[current_section] = {
                    "heading_idx": section_start_idx,
                    "content_start": section_start_idx + 1,
                    "content_end": len(doc.paragraphs) - 1
                }
            
            # Second pass: Replace section content if provided in variables
            paragraphs_to_delete = set()
            for section_name, indices in section_paragraphs.items():
                if section_name in variables and variables[section_name]:
                    new_content = variables[section_name]
                    
                    # Mark old content paragraphs for deletion
                    for i in range(indices["content_start"], indices["content_end"] + 1):
                        if i < len(doc.paragraphs):
                            paragraphs_to_delete.add(i)
                    
                    # Insert new content after heading
                    heading_para = doc.paragraphs[indices["heading_idx"]]
                    new_lines = new_content.split('\n')
                    
                    # Add new paragraphs after the heading
                    for line in new_lines:
                        if line.strip():
                            new_para = heading_para.insert_paragraph_before(line)
                            # Move it after the heading
                            heading_para._element.addnext(new_para._element)
            
            # Delete old content paragraphs (in reverse to maintain indices)
            for idx in sorted(paragraphs_to_delete, reverse=True):
                if idx < len(doc.paragraphs):
                    p = doc.paragraphs[idx]._element
                    p.getparent().remove(p)
            
            # Third pass: Replace bracketed variables in remaining paragraphs
            for para in doc.paragraphs:
                # Combine all runs in paragraph to handle split variables
                full_text = ''.join([run.text for run in para.runs])
                modified_text = full_text
                
                # Replace each variable pattern
                for pattern in self.bracket_patterns:
                    matches = list(pattern.finditer(modified_text))
                    if matches:
                        for match in reversed(matches):  # Reverse to maintain positions
                            var_name = match.group(1).strip()
                            if var_name in variables and variables[var_name]:
                                # Replace the bracketed variable with its value
                                start, end = match.span()
                                modified_text = modified_text[:start] + variables[var_name] + modified_text[end:]
                
                # If text was modified, update the paragraph
                if modified_text != full_text:
                    # Clear all runs and add new text
                    for run in para.runs:
                        run.text = ''
                    if para.runs:
                        para.runs[0].text = modified_text
                    else:
                        para.add_run(modified_text)
            
            # Replace in tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        for para in cell.paragraphs:
                            # Combine all runs in cell paragraph
                            full_text = ''.join([run.text for run in para.runs])
                            modified_text = full_text
                            
                            # Replace each variable pattern
                            for pattern in self.bracket_patterns:
                                matches = list(pattern.finditer(modified_text))
                                if matches:
                                    for match in reversed(matches):
                                        var_name = match.group(1).strip()
                                        if var_name in variables and variables[var_name]:
                                            start, end = match.span()
                                            modified_text = modified_text[:start] + variables[var_name] + modified_text[end:]
                            
                            # If text was modified, update the paragraph
                            if modified_text != full_text:
                                for run in para.runs:
                                    run.text = ''
                                if para.runs:
                                    para.runs[0].text = modified_text
                                else:
                                    para.add_run(modified_text)
            
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
