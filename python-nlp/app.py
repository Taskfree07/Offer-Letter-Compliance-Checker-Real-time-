import os
import logging
import json
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from typing import Dict, Any
import traceback

# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from nlp_service import NLPEntityExtractor
from pdf_service import pdf_service

# GLiNER imports - optional, will fallback gracefully if not available
try:
    from gliner_service import extract_entities_with_gliner, get_gliner_service
    GLINER_AVAILABLE = True
    logger.info("GLiNER service loaded successfully")
except ImportError as e:
    logger.warning(f"GLiNER not available: {e}")
    GLINER_AVAILABLE = False
    extract_entities_with_gliner = None
    get_gliner_service = None

# Enhanced PDF service imports
try:
    from enhanced_pdf_service import extract_pdf_variables, create_editable_pdf, generate_pdf_html, html_to_pdf, enhanced_pdf_service
    ENHANCED_PDF_AVAILABLE = True
    logger.info("Enhanced PDF service loaded successfully")
except Exception as e:
    logger.error(f"Enhanced PDF service not available: {e}")
    logger.error(f"Exception type: {type(e).__name__}")
    import traceback
    logger.error(traceback.format_exc())
    ENHANCED_PDF_AVAILABLE = False
    extract_pdf_variables = None
    create_editable_pdf = None
    generate_pdf_html = None
    html_to_pdf = None
    enhanced_pdf_service = None

# Word document service imports
try:
    from docx_service import extract_docx_variables, replace_docx_variables, docx_service, DOCX_AVAILABLE
    logger.info("Word document service loaded successfully")
except Exception as e:
    logger.error(f"Word document service not available: {e}")
    DOCX_AVAILABLE = False
    extract_docx_variables = None
    replace_docx_variables = None
    docx_service = None
# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes (allows JavaScript frontend to access the API)
# Allow common dev ports 3000/3001 on localhost and 127.0.0.1, and handle preflight (OPTIONS)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://0.0.0.0:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"]
    }
})

# Extra safety: ensure CORS headers on every response and handle preflight
ALLOWED_ORIGINS = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
}

@app.after_request
def apply_cors(response):
    origin = request.headers.get('Origin')
    if origin and origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# Removed problematic catch-all OPTIONS route that was blocking POST requests
# CORS is already handled by flask-cors and @app.after_request decorator

# Test endpoint to verify Flask routing is working
@app.route('/api/test', methods=['GET', 'POST'])
def test_endpoint():
    """Simple test endpoint to verify Flask routing"""
    return jsonify({"success": True, "message": "Flask routing is working!", "method": request.method})

# Debug endpoint to list all routes
@app.route('/api/debug/routes', methods=['GET'])
def debug_routes():
    """Debug endpoint to list all registered routes"""
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            "rule": rule.rule,
            "methods": list(rule.methods),
            "endpoint": rule.endpoint
        })
    return jsonify({"routes": routes})

# Initialize NLP service

# Initialize NLP service

# Initialize NLP service
try:
    nlp_service = NLPEntityExtractor()
    logger.info("NLP service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize NLP service: {e}")
    nlp_service = None

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "service": "NLP Entity Extraction API",
        "nlp_service_available": nlp_service is not None
    })

@app.route('/favicon.ico')
def favicon():
    # Return empty 204 so browsers don't log 404 errors for favicon
    return ('', 204)

@app.route('/api/load-legal-dictionary', methods=['POST'])
def load_legal_dictionary():
    """
    Load legal/compliance phrases into the spaCy EntityRuler dynamically.
    Expected JSON payload:
    {
      "phrases": ["non-compete", "arbitration", ...],
      "label": "LEGAL_POLICY"  # optional; defaults to LEGAL_POLICY
    }
    """
    try:
        if not nlp_service:
            return jsonify({"success": False, "error": "NLP service not available"}), 500

        data = request.get_json() or {}
        phrases = data.get('phrases', [])
        label = data.get('label', 'LEGAL_POLICY')

        if not isinstance(phrases, list) or not phrases:
            return jsonify({"success": False, "error": "No phrases provided"}), 400

        # Ensure entity_ruler exists
        if 'entity_ruler' not in nlp_service.nlp.pipe_names:
            ruler = nlp_service.nlp.add_pipe('entity_ruler', before='ner')
        else:
            ruler = nlp_service.nlp.get_pipe('entity_ruler')

        patterns = []
        for p in phrases:
            if not p or not isinstance(p, str):
                continue
            tokens = [{"LOWER": w.lower()} for w in p.split()]
            patterns.append({"label": label, "pattern": tokens})

        if not patterns:
            return jsonify({"success": False, "error": "No valid phrases"}), 400

        ruler.add_patterns(patterns)
        logger.info(f"Loaded {len(patterns)} legal phrases into EntityRuler with label {label}")
        return jsonify({"success": True, "count": len(patterns), "label": label})
    except Exception as e:
        logger.error(f"Error in load_legal_dictionary: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/extract-entities', methods=['POST'])
def extract_entities():
    """
    Extract entities from text
    
    Expected JSON payload:
    {
        "text": "Your text here"
    }
    """
    try:
        if not nlp_service:
            return jsonify({
                "error": "NLP service not available",
                "message": "The NLP service failed to initialize"
            }), 500
        
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Invalid request",
                "message": "Request must contain 'text' field"
            }), 400
        
        text = data['text']
        
        if not text or not text.strip():
            return jsonify({
                "error": "Empty text",
                "message": "Text field cannot be empty"
            }), 400
        
        # Extract entities
        result = nlp_service.extract_entities(text)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in extract_entities: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/suggest-variables', methods=['POST'])
def suggest_template_variables():
    """
    Suggest template variables based on extracted entities
    
    Expected JSON payload:
    {
        "text": "Your text here"
    }
    """
    try:
        if not nlp_service:
            return jsonify({
                "error": "NLP service not available",
                "message": "The NLP service failed to initialize"
            }), 500
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Invalid request",
                "message": "Request must contain 'text' field"
            }), 400
        
        text = data['text']
        
        if not text or not text.strip():
            return jsonify({
                "error": "Empty text",
                "message": "Text field cannot be empty"
            }), 400
        
        # Get suggestions
        result = nlp_service.suggest_template_variables(text)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in suggest_template_variables: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/replace-entities', methods=['POST'])
def replace_entities():
    """
    Replace entities in text with template variables
    
    Expected JSON payload:
    {
        "text": "Your text here",
        "entity_mappings": {  // Optional
            "PERSON": "[CANDIDATE_NAME]",
            "ORG": "[COMPANY_NAME]"
        }
    }
    """
    try:
        if not nlp_service:
            return jsonify({
                "error": "NLP service not available",
                "message": "The NLP service failed to initialize"
            }), 500
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Invalid request",
                "message": "Request must contain 'text' field"
            }), 400
        
        text = data['text']
        entity_mappings = data.get('entity_mappings', None)
        
        if not text or not text.strip():
            return jsonify({
                "error": "Empty text",
                "message": "Text field cannot be empty"
            }), 400
        
        # Replace entities
        result = nlp_service.replace_entities_with_variables(text, entity_mappings)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in replace_entities: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """
    Get information about the loaded NLP model
    """
    try:
        if not nlp_service:
            return jsonify({
                "error": "NLP service not available",
                "message": "The NLP service failed to initialize"
            }), 500
        
        result = nlp_service.get_model_info()
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in get_model_info: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/extract-entities-with-positions', methods=['POST'])
def extract_entities_with_positions():
    """
    Extract entities with their exact character positions in the text
    Specifically designed for offer letter field detection
    
    Expected JSON payload:
    {
        "text": "Your text here"
    }
    """
    try:
        if not nlp_service:
            return jsonify({
                "error": "NLP service not available",
                "message": "The NLP service failed to initialize"
            }), 500
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Invalid request",
                "message": "Request must contain 'text' field"
            }), 400
        
        text = data['text']
        
        if not text or not text.strip():
            return jsonify({
                "error": "Empty text",
                "message": "Text field cannot be empty"
            }), 400
        
        # Extract entities with positions
        result = nlp_service.extract_entities_with_positions(text)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in extract_entities_with_positions: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/process-document', methods=['POST'])
def process_document():
    """
    Process a document for entity extraction and template variable suggestions
    This is a comprehensive endpoint that combines multiple NLP operations
    
    Expected JSON payload:
    {
        "text": "Your document text here",
        "options": {
            "extract_entities": true,
            "suggest_variables": true,
            "replace_entities": false,
            "entity_mappings": {}  // Optional custom mappings
        }
    }
    """
    try:
        if not nlp_service:
            return jsonify({
                "error": "NLP service not available",
                "message": "The NLP service failed to initialize"
            }), 500
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Invalid request",
                "message": "Request must contain 'text' field"
            }), 400
        
        text = data['text']
        options = data.get('options', {})
        
        if not text or not text.strip():
            return jsonify({
                "error": "Empty text",
                "message": "Text field cannot be empty"
            }), 400
        
        result = {}
        
        # Extract entities if requested
        if options.get('extract_entities', True):
            result['entities'] = nlp_service.extract_entities(text)
        
        # Suggest variables if requested
        if options.get('suggest_variables', True):
            result['variable_suggestions'] = nlp_service.suggest_template_variables(text)
        
        # Replace entities if requested
        if options.get('replace_entities', False):
            entity_mappings = options.get('entity_mappings', None)
            result['entity_replacement'] = nlp_service.replace_entities_with_variables(text, entity_mappings)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in process_document: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Not found",
        "message": "The requested endpoint does not exist"
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "error": "Method not allowed",
        "message": "The requested method is not allowed for this endpoint"
    }), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }), 500

@app.route('/api/extract-entities-gliner', methods=['POST'])
def extract_entities_gliner():
    """
    Extract entities using GLiNER model
    
    Expected JSON payload:
    {
        "text": "Your text here",
        "entity_type": "offer_letter" | "compliance"  // Optional, defaults to "offer_letter"
    }
    """
    try:
        if not GLINER_AVAILABLE:
            return jsonify({
                "error": "GLiNER not available",
                "message": "GLiNER service is not installed or failed to load"
            }), 503
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Invalid request",
                "message": "Request must contain 'text' field"
            }), 400
        
        text = data['text']
        entity_type = data.get('entity_type', 'offer_letter')
        
        if not text or not text.strip():
            return jsonify({
                "error": "Empty text",
                "message": "Text field cannot be empty"
            }), 400
        
        # Extract entities using GLiNER
        result = extract_entities_with_gliner(text, entity_type)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in extract_entities_gliner: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/extract-pdf-entities-gliner', methods=['POST'])
def extract_pdf_entities_gliner():
    """
    Extract entities from PDF using GLiNER
    
    Expected form data:
    - file: PDF file
    - entity_type: "offer_letter" | "compliance" (optional)
    """
    try:
        if not GLINER_AVAILABLE:
            return jsonify({
                "error": "GLiNER not available",
                "message": "GLiNER service is not installed or failed to load"
            }), 503
        if 'file' not in request.files:
            return jsonify({
                "error": "No file provided",
                "message": "Please upload a PDF file"
            }), 400
        
        file = request.files['file']
        entity_type = request.form.get('entity_type', 'offer_letter')
        
        if file.filename == '':
            return jsonify({
                "error": "No file selected",
                "message": "Please select a PDF file"
            }), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({
                "error": "Invalid file type",
                "message": "Please upload a PDF file"
            }), 400
        
        # Extract text from PDF
        pdf_text = pdf_service.extract_text_from_pdf(file)
        
        if not pdf_text or not pdf_text.strip():
            return jsonify({
                "error": "No text extracted",
                "message": "Could not extract text from the PDF"
            }), 400
        
        # Extract entities using GLiNER
        gliner_result = extract_entities_with_gliner(pdf_text, entity_type)
        
        return jsonify({
            "success": True,
            "data": {
                "text": pdf_text,
                "gliner_entities": gliner_result,
                "text_length": len(pdf_text)
            }
        })
        
    except Exception as e:
        logger.error(f"Error in extract_pdf_entities_gliner: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/gliner-health', methods=['GET'])
def gliner_health():
    """Check GLiNER service health"""
    try:
        if not GLINER_AVAILABLE:
            return jsonify({
                "success": False,
                "available": False,
                "error": "GLiNER not installed or failed to load"
            })
        
        service = get_gliner_service()
        return jsonify({
            "success": True,
            "available": True,
            "model_name": service.model_name,
            "model_loaded": service.model is not None
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "available": False,
            "error": str(e)
        }), 500

@app.route('/api/extract-pdf-variables', methods=['POST'])
def extract_pdf_variables_endpoint():
    """
    Extract bracketed variables from PDF with precise positioning
    """
    try:
        if not ENHANCED_PDF_AVAILABLE:
            return jsonify({
                "error": "Enhanced PDF service not available",
                "message": "Required libraries (PyMuPDF, pdfplumber) not installed"
            }), 503
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "File must be a PDF"}), 400
        
        # Read PDF bytes
        pdf_bytes = file.read()
        
        # Extract variables with positions
        result = extract_pdf_variables(pdf_bytes)
        
        return jsonify({
            "success": True,
            "data": result,
            "message": f"Extracted {result.get('total_variables', 0)} variables from {result.get('pages_processed', 0)} pages"
        })
        
    except Exception as e:
        logger.error(f"Error in extract_pdf_variables_endpoint: {e}")
        return jsonify({
            "error": "Failed to extract PDF variables",
            "message": str(e)
        }), 500

@app.route('/api/create-editable-pdf', methods=['POST'])
def create_editable_pdf_endpoint():
    """
    Create an editable PDF with form fields for variables
    """
    try:
        if not ENHANCED_PDF_AVAILABLE:
            return jsonify({
                "error": "Enhanced PDF service not available",
                "message": "Required libraries (PyMuPDF, pdfplumber) not installed"
            }), 503
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        variables = request.form.get('variables', '{}')
        
        try:
            variables_dict = json.loads(variables)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid variables JSON"}), 400
        
        # Read PDF bytes
        pdf_bytes = file.read()
        
        # Create editable PDF
        editable_pdf_bytes = create_editable_pdf(pdf_bytes, variables_dict)
        
        # Return the editable PDF
        response = make_response(editable_pdf_bytes)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=editable_offer_letter.pdf'
        
        return response
        
    except Exception as e:
        logger.error(f"Error in create_editable_pdf_endpoint: {e}")
        return jsonify({
            "error": "Failed to create editable PDF",
            "message": str(e)
        }), 500

@app.route('/api/enhanced-pdf-health', methods=['GET'])
def enhanced_pdf_health():
    """Check if enhanced PDF service is available"""
    return jsonify({
        "available": ENHANCED_PDF_AVAILABLE,
        "services": {
            "pymupdf": ENHANCED_PDF_AVAILABLE,
            "pdfplumber": ENHANCED_PDF_AVAILABLE,
            "gliner_integration": ENHANCED_PDF_AVAILABLE and GLINER_AVAILABLE,
            "html_conversion": ENHANCED_PDF_AVAILABLE,
            "weasyprint": True  # Check if importable
        }
    })

@app.route('/api/html-to-pdf', methods=['POST'])
def html_to_pdf_endpoint():
    """Convert edited HTML to PDF with variable substitution"""
    try:
        if not ENHANCED_PDF_AVAILABLE:
            return jsonify({"error": "Enhanced PDF service not available"}), 503
        
        data = request.get_json()
        if not data or 'html' not in data:
            return jsonify({"error": "HTML content required"}), 400
        
        html_content = data['html']
        variables = data.get('variables', {})
        
        if not html_content or html_content.strip() == '':
            return jsonify({"error": "Empty HTML content"}), 400
        
        # Convert HTML to PDF
        pdf_bytes = html_to_pdf(html_content, variables)
        
        # Return PDF as binary response
        response = make_response(pdf_bytes)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=edited_document.pdf'
        response.headers['Content-Length'] = len(pdf_bytes)
        
        return response
        
    except Exception as e:
        logger.error(f"Error in html_to_pdf_endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/debug-pdf-text', methods=['POST'])
def debug_pdf_text():
    """Debug endpoint to see raw text extraction from PDF"""
    try:
        if not ENHANCED_PDF_AVAILABLE:
            return jsonify({"error": "Enhanced PDF service not available"}), 503
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        pdf_bytes = file.read()
        
        # Extract raw text using PyMuPDF
        import fitz
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        pages_text = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            pages_text.append({
                "page": page_num + 1,
                "text": text,
                "length": len(text)
            })
        
        doc.close()
        
        # Test bracket patterns
        from enhanced_pdf_service import enhanced_pdf_service
        all_text = " ".join([p["text"] for p in pages_text])
        
        found_variables = []
        for i, pattern in enumerate(enhanced_pdf_service.bracket_patterns):
            matches = pattern.findall(all_text)
            if matches:
                found_variables.append({
                    "pattern_index": i,
                    "pattern": pattern.pattern,
                    "matches": matches
                })
        
        return jsonify({
            "success": True,
            "pages": pages_text,
            "total_text_length": len(all_text),
            "bracket_patterns_tested": len(enhanced_pdf_service.bracket_patterns),
            "variables_found": found_variables,
            "total_variables": sum(len(v["matches"]) for v in found_variables)
        })

    except Exception as e:
        logger.error(f"Debug PDF text extraction failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/pdf-to-html', methods=['POST'])
def pdf_to_html():
    """Convert PDF to HTML with variable detection - main endpoint for frontend"""
    try:
        if not ENHANCED_PDF_AVAILABLE:
            return jsonify({"error": "Enhanced PDF service not available"}), 503

        if 'file' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "File must be a PDF"}), 400

        # Read PDF bytes
        pdf_bytes = file.read()

        # Generate structured HTML with enhanced features
        result = generate_pdf_html(pdf_bytes)

        if 'error' in result.get('metadata', {}):
            return jsonify({"success": False, "error": result['metadata']['error']}), 500

        # Format response to match expected frontend format
        response_data = {
            "success": True,
            "data": {
                "html": result['html'],
                "variables": result['variables'],
                "metadata": result['metadata']
            },
            "message": f"PDF converted to HTML successfully with {len(result['variables'])} variables detected"
        }

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error in pdf_to_html: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/docx-extract-variables', methods=['POST'])
def docx_extract_variables_endpoint():
    """Extract variables from Word document"""
    try:
        if not DOCX_AVAILABLE:
            return jsonify({
                "error": "Word document service not available",
                "message": "python-docx not installed"
            }), 503
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.lower().endswith('.docx'):
            return jsonify({"error": "File must be a Word document (.docx)"}), 400
        
        # Read document bytes
        docx_bytes = file.read()
        
        # Extract variables
        result = extract_docx_variables(docx_bytes)
        
        if not result.get("success"):
            return jsonify({
                "success": False,
                "error": result.get("error", "Unknown error")
            }), 500
        
        return jsonify({
            "success": True,
            "data": {
                "variables": result["variables"],
                "text": result["text"],
                "metadata": {
                    "paragraph_count": result.get("paragraph_count", 0),
                    "table_count": result.get("table_count", 0),
                    "total_variables": result.get("total_variables", 0)
                }
            },
            "message": f"Extracted {result.get('total_variables', 0)} variables from Word document"
        })
        
    except Exception as e:
        logger.error(f"Error in docx_extract_variables_endpoint: {e}")
        return jsonify({
            "error": "Failed to extract variables from Word document",
            "message": str(e)
        }), 500

@app.route('/api/docx-replace-variables', methods=['POST'])
def docx_replace_variables_endpoint():
    """Replace variables in Word document and return modified document"""
    try:
        if not DOCX_AVAILABLE:
            return jsonify({
                "error": "Word document service not available",
                "message": "python-docx not installed"
            }), 503
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        variables_json = request.form.get('variables', '{}')
        
        try:
            variables = json.loads(variables_json)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid variables JSON"}), 400
        
        # Read document bytes
        docx_bytes = file.read()
        
        # Replace variables
        modified_docx_bytes = replace_docx_variables(docx_bytes, variables)
        
        # Return the modified document
        response = make_response(modified_docx_bytes)
        response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        response.headers['Content-Disposition'] = 'attachment; filename=edited_document.docx'
        response.headers['Content-Length'] = len(modified_docx_bytes)
        
        return response
        
    except Exception as e:
        logger.error(f"Error in docx_replace_variables_endpoint: {e}")
        return jsonify({
            "error": "Failed to replace variables in Word document",
            "message": str(e)
        }), 500

@app.route('/api/docx-health', methods=['GET'])
def docx_health():
    """Check if Word document service is available"""
    return jsonify({
        "available": DOCX_AVAILABLE,
        "message": "Word document service ready" if DOCX_AVAILABLE else "python-docx not installed"
    })

if __name__ == '__main__':
    # Always run on port 5000 to match frontend expectations
    port = 5000

    # Get host from environment variable or default to localhost
    host = os.environ.get('HOST', '127.0.0.1')

    # Get debug mode from environment variable
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'

    logger.info(f"Starting NLP API server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"NLP service available: {nlp_service is not None}")

    # Start the Flask development server
    app.run(host=host, port=port, debug=debug)
