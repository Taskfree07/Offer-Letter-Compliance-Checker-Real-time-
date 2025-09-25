from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
from nlp_service import NLPEntityExtractor
import os
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

@app.route('/api/<path:any_path>', methods=['OPTIONS'])
def cors_preflight(any_path):
    # Unified preflight handler for /api/*
    resp = jsonify({"success": True})
    origin = request.headers.get('Origin')
    if origin and origin in ALLOWED_ORIGINS:
        resp.headers['Access-Control-Allow-Origin'] = origin
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return resp, 200

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

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Get host from environment variable or default to localhost
    host = os.environ.get('HOST', '127.0.0.1')
    
    # Get debug mode from environment variable
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting NLP API server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"NLP service available: {nlp_service is not None}")
    
    # Start the Flask development server
    app.run(host=host, port=port, debug=debug)
