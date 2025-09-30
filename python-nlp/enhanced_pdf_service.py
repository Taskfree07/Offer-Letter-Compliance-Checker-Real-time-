"""
Enhanced PDF Service for clean variable extraction and editing
Uses PyMuPDF (fitz), pdfplumber, and GLiNER for advanced PDF processing
"""

import fitz  # PyMuPDF
import pdfplumber
import re
import json
import logging
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Make GLiNER optional - service will work without it
try:
    from gliner_service import get_gliner_service
    GLINER_AVAILABLE = True
except ImportError as e:
    logger.warning(f"GLiNER service not available: {e}")
    GLINER_AVAILABLE = False
    get_gliner_service = None

@dataclass
class VariablePosition:
    """Represents a variable's position in the PDF"""
    page_num: int
    x0: float
    y0: float
    x1: float
    y1: float
    text: str
    variable_name: str
    bbox: Tuple[float, float, float, float]

@dataclass
class PDFVariable:
    """Represents an extracted variable from PDF"""
    name: str
    original_text: str
    positions: List[VariablePosition]
    suggested_value: str = ""
    confidence: float = 0.0

class EnhancedPDFService:
    """Enhanced PDF service for variable extraction and editing"""
    
    def __init__(self):
        # More comprehensive bracket patterns
        self.bracket_patterns = [
            re.compile(r'\[([^\]]+)\]'),  # Standard [Variable Name]
            re.compile(r'\{([^}]+)\}'),   # Curly braces {Variable Name}
            re.compile(r'<([^>]+)>'),     # Angle brackets <Variable Name>
            re.compile(r'<<([^>]+)>>'),   # Double angle brackets <<Variable Name>>
        ]
        self.gliner_available = GLINER_AVAILABLE
        self.gliner_service = None
        if GLINER_AVAILABLE:
            try:
                self.gliner_service = get_gliner_service()
            except Exception as e:
                logger.warning(f"GLiNER not available: {e}")
                self.gliner_available = False
                self.gliner_service = None
    
    def extract_bracketed_variables(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract all bracketed variables from PDF with their positions
        
        Args:
            pdf_bytes: PDF file as bytes
            
        Returns:
            Dictionary with variables and their positions
        """
        pdf_doc = None
        try:
            # Ensure we have bytes, not a buffer that might get detached
            if hasattr(pdf_bytes, 'read'):
                pdf_bytes = pdf_bytes.read()
            elif not isinstance(pdf_bytes, bytes):
                pdf_bytes = bytes(pdf_bytes)
            
            # Open PDF with PyMuPDF for precise positioning
            pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            variables = {}
            all_text = ""
            total_pages = len(pdf_doc)
            
            for page_num in range(total_pages):
                page = pdf_doc[page_num]
                
                # Extract text blocks with positions
                text_blocks = page.get_text("dict")
                
                for block in text_blocks.get("blocks", []):
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                text = span["text"]
                                bbox = span["bbox"]  # (x0, y0, x1, y1)
                                
                                # Find bracketed variables using all patterns
                                for pattern in self.bracket_patterns:
                                    matches = pattern.finditer(text)
                                    for match in matches:
                                        var_name = match.group(1).strip()
                                        full_match = match.group(0)  # [Variable Name]
                                        
                                        # Calculate position of the variable within the span
                                        start_pos = match.start()
                                        end_pos = match.end()
                                        
                                        # Estimate character-level positioning
                                        char_width = (bbox[2] - bbox[0]) / len(text) if len(text) > 0 else 0
                                        var_x0 = bbox[0] + (start_pos * char_width)
                                        var_x1 = bbox[0] + (end_pos * char_width)
                                        
                                        position = VariablePosition(
                                            page_num=page_num,
                                            x0=var_x0,
                                            y0=bbox[1],
                                            x1=var_x1,
                                            y1=bbox[3],
                                            text=full_match,
                                            variable_name=var_name,
                                            bbox=(var_x0, bbox[1], var_x1, bbox[3])
                                        )
                                        
                                        if var_name not in variables:
                                            variables[var_name] = PDFVariable(
                                                name=var_name,
                                                original_text=full_match,
                                                positions=[position]
                                            )
                                        else:
                                            variables[var_name].positions.append(position)
                                
                                all_text += text + " "
            
            # Debug logging
            logger.info(f"Extracted text length: {len(all_text)}")
            logger.info(f"Variables found: {len(variables)}")
            if variables:
                logger.info(f"Variable names: {list(variables.keys())}")
            
            # If no variables found with detailed extraction, try simple text extraction
            if not variables and all_text.strip():
                logger.info("No variables found with detailed extraction, trying simple text extraction...")
                variables = self._extract_variables_from_text(all_text)
                logger.info(f"Simple extraction found: {len(variables)} variables")
            
            # Use GLiNER to suggest values for variables
            if self.gliner_available and all_text.strip():
                self._enhance_variables_with_gliner(variables, all_text)
            
            # Convert to serializable format
            result = {
                "variables": {},
                "positions": {},
                "total_variables": len(variables),
                "pages_processed": total_pages
            }
            
            for var_name, var_data in variables.items():
                result["variables"][var_name] = {
                    "name": var_name,
                    "original_text": var_data.original_text,
                    "suggested_value": var_data.suggested_value,
                    "confidence": var_data.confidence,
                    "occurrences": len(var_data.positions)
                }
                
                result["positions"][var_name] = [
                    {
                        "page": pos.page_num,
                        "x0": pos.x0,
                        "y0": pos.y0,
                        "x1": pos.x1,
                        "y1": pos.y1,
                        "bbox": pos.bbox,
                        "text": pos.text
                    }
                    for pos in var_data.positions
                ]
            
            return result
            
        except Exception as e:
            logger.error(f"Error extracting bracketed variables: {e}")
            return {
                "variables": {},
                "positions": {},
                "total_variables": 0,
                "pages_processed": 0,
                "error": str(e)
            }
        finally:
            # Always close the PDF document
            if pdf_doc is not None:
                try:
                    pdf_doc.close()
                except:
                    pass
    
    def _extract_variables_from_text(self, text: str) -> Dict[str, PDFVariable]:
        """Simple text-based variable extraction as fallback"""
        variables = {}
        
        for pattern in self.bracket_patterns:
            matches = pattern.finditer(text)
            for match in matches:
                var_name = match.group(1).strip()
                full_match = match.group(0)
                
                # Create a simple position (we don't have exact coordinates)
                position = VariablePosition(
                    page_num=0,
                    x0=0,
                    y0=0,
                    x1=100,
                    y1=20,
                    text=full_match,
                    variable_name=var_name,
                    bbox=(0, 0, 100, 20)
                )
                
                if var_name not in variables:
                    variables[var_name] = PDFVariable(
                        name=var_name,
                        original_text=full_match,
                        positions=[position]
                    )
                else:
                    variables[var_name].positions.append(position)
        
        return variables
    
    def _enhance_variables_with_gliner(self, variables: Dict[str, PDFVariable], full_text: str):
        """Use GLiNER to suggest values for variables"""
        try:
            # Extract entities using GLiNER
            gliner_result = self.gliner_service.extract_offer_letter_entities(full_text)
            
            if gliner_result.get("success") and "entities" in gliner_result:
                entities = gliner_result["entities"]
                
                # Map GLiNER entities to our variables
                for var_name, var_data in variables.items():
                    var_lower = var_name.lower()
                    
                    # Try to match variable names to GLiNER entities
                    for entity in entities:
                        entity_label = entity.get("label", "").lower()
                        entity_text = entity.get("text", "")
                        confidence = entity.get("score", 0.0)
                        
                        # Simple matching logic - can be enhanced
                        if (var_lower in entity_label or 
                            entity_label in var_lower or
                            self._fuzzy_match(var_lower, entity_label)):
                            
                            if confidence > var_data.confidence:
                                var_data.suggested_value = entity_text
                                var_data.confidence = confidence
                                
        except Exception as e:
            logger.warning(f"GLiNER enhancement failed: {e}")
    
    def _fuzzy_match(self, var_name: str, entity_label: str) -> bool:
        """Simple fuzzy matching for variable names"""
        # Remove common words and check for overlap
        common_words = {"name", "title", "date", "salary", "company", "position"}
        
        var_words = set(var_name.replace("_", " ").split()) - common_words
        entity_words = set(entity_label.replace("_", " ").split()) - common_words
        
        if not var_words or not entity_words:
            return False
            
        # Check if there's any word overlap
        return len(var_words & entity_words) > 0

    def generate_structured_html(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Generate structured HTML from PDF while preserving layout as much as possible

        Returns:
            {
                "html": "<html>...</html>"  # Full HTML document
                "variables": {var_name: {original: "...", positions: [...]}},
                "metadata": {page_count: ..., total_text: ...}
            }
        """
        try:
            import io
            from bs4 import BeautifulSoup  # Need to add to requirements if not present

            html_output = '''
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>PDF Editor</title>
                <style>
                    body {
                       'Tmes New Romn'
                       
                       2px
                       6;
                        background-color: #f5f5f
                   
                     document-cont infron
          t             max--family: 'Tim
                eo      serif;
                       
                       2
                       border-radius: 8x;
                        overflw: hidden;
                    }
                    .page {
                        width: 100%;
                        min-height: 11in;
                        background: white;
                        po
                       1in
                       
                       page-break-after: always;
                    
                        margi
     n                  : 0;
                       
                       gin-bottom: 20pt;
                        text-alin: center;
                        color: #2c3e50;
                        border-bottom: 2px solid #3498db;
                        paddg0
                   
                        paddin
                       g: 20px;: 24pt;
                        padding2 0
                   
                        line-hei
g                       ht: 1.6;
                       ;
                        font-size: 12pt;
                        line-height: 1.5
                   
                        backgro
u                       nd-color: : fineaf-gradient(135deg,; 0%, #ffeaa7 100%)
                       48
                       4
                       
                       239c12;
                        ont-wight: bold;
                        color: #d68910;
                        transition: all 0.3s ese;
                        disply: inline-block;
                        min-width: 100px;
                        text-align: center;
                        position: relative;
                    }
                    .variable:hover {
                        background: linear-gradient(135deg, #f39c12 0%, #e6e22 100%);
                        color: white
                       transrm: traslaeY(2px);
                        box-shado: 0 4px 8px rgba(0,0,0,0.2);
                    }
                    .variable::after {
                        contnt: '✏️';
                        positon: absolute;
                        rit: -20px;
                        top: 50%;
                        transform: translateY(-50%);
                        opacity: 0;
                        ransition opacity 0.3s ease;
                   }
                    .variale:hver::after {
                        opacity: 1
                   
                    }
                       
                       0 0
                       
                       border: 2px solid #34495e;
                        border-radius: 8px;
                        overflow: hidden;
                    
                    .documen
 t                      -container {bc3c7
                       12
                       
                        font-size: 11pt;
                   
                        max-wider th {
                        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                        color: white;
                        font-weight: bold;
                        ttxt-thansform: uppercase;
                :       le ter-spacing: 1px;
                    }
                    tr:nth-c8ild(even).5
                i       n;
                    }
                    tr:hover {
                       background-color: #e8f4fd;
                    }
                    .editable-content {
                        position: relative;
                    }
                    .variable-tooltip {
                        position: absolute;
                        background: #2c3e50;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        t-size: 10pt;
                        whiespace: norap;
                        z-index: 1000;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s ease;
                    }
                    .variable:hover .variable-tooltip {
                        opacity: 1;
                    }
                    @mda print {
                        body { backround: wie; }
                        .document-container { box-shadow none; }
                       .variable { rder: 1px soid #ccc; backgroun: #f9f9f9 }
                   
                        margin: 0 auto;
                        background: white;
                 >
                <div class="document-container"       box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .page {
                        width: 100%;
                        min-height: 11in;
                        background: white;
                        position: relative;
                        padding: 1in;
                        box-sizing: border-box;
                        page-break-after: always;
                    }
                    .header {
                        font-size: 18pt;
                        font-weight: bold;
                        margin-bottom: 20pt;
                        text-align: center;
                        color: #2c3e50;
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 10pt;
                    }
                    .section {
                        margin-bottom: 24pt;
                        padding: 12pt 0;
                    }
                    .paragraph {
                        margin-bottom: 12pt;
                        text-align: justify;
                        font-size: 12pt;
                        line-height: 1.5;
                    }
                    .variable {
                        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        border: 2px solid #f39c12;
                        font-weight: bold;
                        color: #d68910;
                        transition: all 0.3s ease;
                        display: inline-block;
                        min-width: 100px;
                        text-align: center;
                        position: relative;
                    }
                    .variable:hover {
                        background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                        color: white;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    }
                    .variable::after {
                        content: '✏️';
                        position: absolute;
                        right: -20px;
                        top: 50%;
                        transform: translateY(-50%);
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    .variable:hover::after {
                        opacity: 1;
                    }
                    table {
                        border-collapse: collapse;
                        margin: 20pt 0;
                        width: 100%;
                        border: 2px solid #34495e;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    td, th {
                        border: 1px solid #bdc3c7;
                        padding: 12px;
                        text-align: left;
                        font-size: 11pt;
                    }
                    .table-header th {
                        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                        color: white;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    tr:hover {
                        background-color: #e8f4fd;
                    }
                    .editable-content {
                        position: relative;
                    }
                    .variable-tooltip {
                        position: absolute;
                        background: #2c3e50;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-size: 10pt;
                        white-space: nowrap;
                        z-index: 1000;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s ease;
                    }
                    .variable:hover .variable-tooltip {
                        opacity: 1;
                    }
                    @media print {
                        body { background: white; }
                        .document-container { box-shadow: none; }
                        .variable { border: 1px solid #ccc; background: #f9f9f9; }
                    }
                </style>
            </head>
            <body>
                <div class="document-container">
            '''
            
            variables = {}
            page_count = 0
            total_text_length = 0
            
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    if not page.extract_text():
                        continue
                    
                    page_html = '<div class="page">'
                    page_text_blocks = []
                    
                    # Extract words with positions for layout-aware processing
                    words = page.extract_words(keep_blank_chars=True, use_text_flow=True)
                    
                    # Group words into lines based on y0 proximity (within 5pt tolerance)
                    lines = {}
                    for word in words:
                        y_key = round(word['y0'], 1)  # Round to nearest 0.1pt for grouping
                        if y_key not in lines:
                            lines[y_key] = []
                        lines[y_key].append(word)
                    
                    # Sort lines by y0 (top to bottom)
                    sorted_lines = sorted(lines.items(), key=lambda x: x[0])
                    
                    # Process each line
                    for y_pos, line_words in sorted_lines:
                        # Sort words by x0 for reading order
                        sorted_words = sorted(line_words, key=lambda w: w['x0'])
                        
                        line_text = ' '.join(w['text'] for w in sorted_words)
                        line_text = line_text.strip()
                        
                        if not line_text:
                            continue
                        
                        total_text_length += len(line_text)
                        
                        # Detect variables in line
                        line_with_vars, line_vars = self._process_line_for_variables(line_text)
                        
                        # Add detected variables to global dict
                        for var_name, var_data in line_vars.items():
                            if var_name not in variables:
                                variables[var_name] = {
                                    'original_text': var_data['original_text'],
                                    'positions': [],
                                    'occurrences': 0
                                }
                            variables[var_name]['positions'].append({
                                'page': page_num,
                                'y0': y_pos,
                                'x0': sorted_words[0]['x0'] if sorted_words else 0,
                                'text': var_data['original_text']
                            })
                            variables[var_name]['occurrences'] += 1
                        
                        # Layout detection: header if top 10%, small font if y0 high, etc.
                        page_height = page.height
                        if y_pos < page_height * 0.1:  # Top 10% - likely header
                            page_html += f'<div class="header">{line_with_vars}</div>'
                        else:
                            # Check if it's a table row or paragraph
                            page_html += f'<p class="paragraph">{line_with_vars}</p>'
                    
                    # Extract tables
                    tables = page.extract_tables()
                    for table_num, table in enumerate(tables):
                        if table and len(table) > 1:  # Has rows and headers
                            page_html += '<table class="document-table">'
                            for row_num, row in enumerate(table):
                                page_html += '<tr>'
                                is_header = row_num == 0
                                classes = 'table-header' if is_header else ''
                                for cell in row:
                                    if cell:
                                        cell_text, cell_vars = self._process_line_for_variables(cell)
                                        for var_name, _ in cell_vars.items():
                                            if var_name in variables:
                                                variables[var_name]['occurrences'] += 1
                                        page_html += f'<{"th" if is_header else "td"} class="{classes}">{cell_text}</{"th" if is_header else "td"}>'
                                    else:
                                        page_html += f'<{"th" if is_header else "td"} class="{classes}"></{"th" if is_header else "td"}>'
                                page_html += '</tr>'
                            page_html += '</table>'
                    
            page_html += '</div>'
            html_output += page_html
            page_count += 1

            html_output += '''
                </div> <!-- document-container -->
            </body>
            </html>
            '''

            return {
                'html': html_output,
                'variables': variables,
                'metadata': {
                    'page_count': page_count,
                    'total_text_length': total_text_length,
                    'extracted_at': str(self)
                }
            }
        except ImportError:
            logger.error('BeautifulSoup or pdfplumber not available for HTML generation')
            return {'html': '<p>HTML generation requires additional libraries (BeautifulSoup, pdfplumber)</p>', 'variables': {}, 'metadata': {'error': 'Missing dependencies'}}
        except Exception as e:
            logger.error(f'Error generating structured HTML: {e}')
            return {'html': f'<p>Error generating HTML: {str(e)}</p>', 'variables': {}, 'metadata': {'error': str(e)}}

    def _process_line_for_variables(self, line_text: str) -> Tuple[str, Dict[str, Any]]:
        """Process a line of text to identify and mark variables as editable spans"""
        variables_in_line = {}

        for pattern in self.bracket_patterns:
            matches = list(pattern.finditer(line_text))
            if matches:
                html_parts = []
                last_end = 0

                for match in matches:
                    start, end = match.span()
                    var_name = match.group(1).strip()

                    # Text before variable
                    if start > last_end:
                        html_parts.append(line_text[last_end:start])

                    # Enhanced variable span with tooltip and data attributes
                    original_match = match.group(0)
                    # Create a more descriptive field title
                    field_title = var_name.replace('_', ' ').title()

                    variable_html = f'''<span class="variable"
                        data-var="{var_name}"
                        data-original="{original_match}"
                        data-field-title="{field_title}"
                        title="Click to edit {field_title}"
                        contenteditable="false"
                        onclick="editVariable(this)">
                        {original_match}
                        <span class="variable-tooltip">Click to edit {field_title}</span>
                    </span>'''

                    html_parts.append(variable_html)

                    last_end = end
                    variables_in_line[var_name] = {
                        'original_text': original_match,
                        'field_title': field_title,
                        'suggested_value': self._suggest_variable_value(var_name)
                    }

                # Remaining text
                if last_end < len(line_text):
                    html_parts.append(line_text[last_end:])

                return ''.join(html_parts), variables_in_line

        # No variables found, return plain text
        return line_text, {}

    def _suggest_variable_value(self, var_name: str) -> str:
        """Suggest a default value for a variable based on its name"""
        var_lower = var_name.lower()

        # Common variable suggestions
        suggestions = {
            'candidate_name': 'John Doe',
            'employee_name': 'John Doe',
            'first_name': 'John',
            'last_name': 'Doe',
            'company_name': 'Your Company',
            'position': 'Software Engineer',
            'job_title': 'Software Engineer',
            'salary': '$75,000',
            'start_date': '2024-01-15',
            'date': '2024-01-01',
            'manager_name': 'Jane Smith',
            'department': 'Engineering',
            'location': 'San Francisco, CA',
            'email': 'john.doe@company.com',
            'phone': '(555) 123-4567'
        }

        # Try exact match first
        if var_lower in suggestions:
            return suggestions[var_lower]

        # Try partial matches
        for key, value in suggestions.items():
            if key in var_lower or var_lower in key:
                return value

        # Default suggestion based on variable type
        if 'name' in var_lower:
            return 'John Doe'
        elif 'date' in var_lower:
            return '2024-01-01'
        elif 'salary' in var_lower or 'pay' in var_lower:
            return '$75,000'
        elif 'email' in var_lower:
            return 'example@company.com'
        elif 'phone' in var_lower:
            return '(555) 123-4567'
        elif 'company' in var_lower:
            return 'Your Company'
        else:
            return f'[{var_name}]'

    def convert_html_to_pdf(self, html_content: str, variables: Dict[str, str] = {}) -> bytes:
        """
        Convert HTML content to PDF using WeasyPrint with variable substitution
        
        Args:
            html_content: HTML string with variable placeholders
            variables: Dictionary of variable values to substitute
            
        Returns:
            PDF bytes
        """
        try:
            from weasyprint import HTML
            
            # Substitute variables in HTML
            substituted_html = self._substitute_variables_in_html(html_content, variables)
            
            # Create HTML object and render to PDF
            html = HTML(string=substituted_html, base_url='.')
            pdf_bytes = html.write_pdf()
            
            logger.info(f"Successfully converted HTML to PDF: {len(pdf_bytes)} bytes")
            return pdf_bytes
            
        except ImportError:
            logger.error("WeasyPrint not available for HTML to PDF conversion")
            raise ImportError("Please install weasyprint: pip install weasyprint")
        except Exception as e:
            logger.error(f"Error converting HTML to PDF: {e}")
            raise Exception(f"HTML to PDF conversion failed: {str(e)}")

    def _substitute_variables_in_html(self, html: str, variables: Dict[str, str]) -> str:
        """Replace variable spans in HTML with actual values"""
        from bs4 import BeautifulSoup
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find all variable spans
        var_spans = soup.find_all('span', class_='variable')
        
        for span in var_spans:
            var_name = span.get('data-var', '')
            if var_name in variables and variables[var_name]:
                # Replace the span content with the variable value
                # Keep the span for styling but update text
                span.string = variables[var_name].strip()
                # Optionally change class to indicate it's filled
                span['class'] = 'variable-filled'
            else:
                # If no value, keep placeholder but style as unfilled
                span['title'] = f'Variable {var_name} needs a value'
        
        return str(soup)
    
    def extract_structured_content(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract structured content using pdfplumber for better layout understanding
        """
        try:
            import io
            
            # Use pdfplumber for structured extraction
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                structured_data = {
                    "pages": [],
                    "tables": [],
                    "text_blocks": []
                }
                
                for page_num, page in enumerate(pdf.pages):
                    page_data = {
                        "page_num": page_num,
                        "width": page.width,
                        "height": page.height,
                        "text": page.extract_text() or "",
                        "words": []
                    }
                    
                    # Extract words with positions
                    words = page.extract_words()
                    for word in words:
                        page_data["words"].append({
                            "text": word["text"],
                            "x0": word["x0"],
                            "y0": word["y0"],
                            "x1": word["x1"],
                            "y1": word["y1"]
                        })
                    
                    # Extract tables if any
                    tables = page.extract_tables()
                    for table in tables:
                        structured_data["tables"].append({
                            "page": page_num,
                            "data": table
                        })
                    
                    structured_data["pages"].append(page_data)
                
                return structured_data
                
        except Exception as e:
            logger.error(f"Error extracting structured content: {e}")
            return {"pages": [], "tables": [], "text_blocks": [], "error": str(e)}
    
    def create_editable_pdf_overlay(self, pdf_bytes: bytes, variables: Dict[str, str]) -> bytes:
        """
        Create an editable PDF overlay with form fields for variables
        """
        try:
            # Open PDF with PyMuPDF
            pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            # Extract variable positions first
            var_positions = self.extract_bracketed_variables(pdf_bytes)
            
            for page_num in range(len(pdf_doc)):
                page = pdf_doc[page_num]
                
                # Add form fields for each variable on this page
                for var_name, positions in var_positions.get("positions", {}).items():
                    for pos in positions:
                        if pos["page"] == page_num:
                            # Create a text field widget
                            rect = fitz.Rect(pos["x0"], pos["y0"], pos["x1"], pos["y1"])
                            
                            # Add text widget
                            widget = fitz.Widget()
                            widget.field_name = f"var_{var_name}_{page_num}"
                            widget.field_type = fitz.PDF_WIDGET_TYPE_TEXT
                            widget.rect = rect
                            widget.field_value = variables.get(var_name, "")
                            widget.text_font = "helv"
                            widget.text_fontsize = 11
                            widget.fill_color = (1, 1, 1)  # White background
                            widget.border_color = (0.8, 0.8, 0.8)  # Light gray border
                            widget.border_width = 1
                            
                            page.add_widget(widget)
            
            # Save the modified PDF
            output_bytes = pdf_doc.write()
            pdf_doc.close()
            
            return output_bytes
            
        except Exception as e:
            logger.error(f"Error creating editable PDF overlay: {e}")
            return pdf_bytes  # Return original if failed

# Global service instance
enhanced_pdf_service = EnhancedPDFService()

def extract_pdf_variables(pdf_bytes: bytes) -> Dict[str, Any]:
    """Extract variables from PDF using enhanced service"""
    return enhanced_pdf_service.extract_bracketed_variables(pdf_bytes)

def generate_pdf_html(pdf_bytes: bytes) -> Dict[str, Any]:
    """Generate structured HTML from PDF"""
    return enhanced_pdf_service.generate_structured_html(pdf_bytes)

def create_editable_pdf(pdf_bytes: bytes, variables: Dict[str, str]) -> bytes:
    """Create editable PDF with form fields"""
    return enhanced_pdf_service.create_editable_pdf_overlay(pdf_bytes, variables)

def html_to_pdf(html: str, variables: Dict[str, str] = {}) -> bytes:
    """Convert HTML to PDF using weasyprint with variable replacement"""
    return enhanced_pdf_service.convert_html_to_pdf(html, variables)
