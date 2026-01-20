import os
import logging
import json
import hashlib
import time
from datetime import datetime
from flask import Flask, request, jsonify, make_response, send_file
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

# DocxTPL template service imports (for live rendering)
try:
    from docxtpl_service import extract_template_variables, render_docx_template_live, docxtpl_service
    DOCXTPL_AVAILABLE = True
    logger.info("✅ DocxTPL template service loaded successfully")
except Exception as e:
    logger.error(f"DocxTPL service not available: {e}")
    DOCXTPL_AVAILABLE = False
    extract_template_variables = None
    render_docx_template_live = None
    docxtpl_service = None
# Initialize Flask app
app = Flask(__name__)

# ====== Authentication Configuration ======
# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-this-in-production-min-32-chars')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))  # 1 hour
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 2592000))  # 30 days

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///email_automation.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import and initialize authentication
try:
    from models import db, bcrypt, User
    from auth import auth_bp
    from api_keys_bp import api_keys_bp, analytics_bp
    from websocket_events import init_socketio
    from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    # Initialize WebSocket
    socketio = init_socketio(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_keys_bp)
    app.register_blueprint(analytics_bp)

    # Create database tables
    with app.app_context():
        db.create_all()
        logger.info("✅ Authentication system initialized successfully")
        logger.info("✅ API Keys and Analytics endpoints registered")
        logger.info("✅ WebSocket server initialized for real-time events")

    AUTH_AVAILABLE = True
except Exception as e:
    logger.error(f"⚠️  Authentication system not available: {e}")
    logger.error(traceback.format_exc())
    AUTH_AVAILABLE = False
    jwt_required = lambda *args, **kwargs: lambda f: f  # No-op decorator
    get_jwt_identity = lambda: None
    socketio = None

# ====== Multi-Layer Compliance System (RAG + LLM) ======
try:
    from compliance_bp import compliance_bp
    app.register_blueprint(compliance_bp)
    logger.info("✅ Compliance API v2 (RAG + LLM) registered at /api/v2/*")
except Exception as e:
    logger.warning(f"⚠️  Compliance API v2 not available: {e}")
    logger.warning("   Install dependencies: pip install chromadb sentence-transformers")
    logger.warning("   Then run: python load_all_states.py")

# ONLYOFFICE Configuration
# OnlyOffice server URL - auto-detects for Azure or uses local default
def get_onlyoffice_url():
    """Get OnlyOffice server URL - works for both local and Azure deployment"""
    env_url = os.environ.get('ONLYOFFICE_SERVER_URL')
    if env_url:
        return env_url
    
    # Auto-detect Azure Container Apps
    backend_url = os.environ.get('BACKEND_BASE_URL', '')
    if 'azurecontainerapps.io' in backend_url:
        # Replace backend with onlyoffice in the URL
        onlyoffice_url = backend_url.replace('backend', 'onlyoffice')
        logger.info(f"🌐 Azure deployment detected, using OnlyOffice: {onlyoffice_url}")
        return onlyoffice_url
    
    # Local development default
    return 'http://localhost:8080'

ONLYOFFICE_SERVER_URL = get_onlyoffice_url()
logger.info(f"📄 OnlyOffice Server URL: {ONLYOFFICE_SERVER_URL}")

# Upload folder configuration
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', './uploads')
SESSIONS_FOLDER = os.path.join(UPLOAD_FOLDER, 'sessions')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SESSIONS_FOLDER, exist_ok=True)

# Store for document sessions (persistent on disk using JSON files)
document_sessions = {}

def get_backend_base_url():
    """
    Dynamically detect backend base URL from request headers.
    Works for both local development and production deployment.

    Special handling for Docker:
    - When OnlyOffice is in Docker and backend is on host, converts localhost to host.docker.internal

    Priority:
    1. BACKEND_BASE_URL environment variable (if set)
    2. X-Forwarded-Host + X-Forwarded-Proto headers (for Azure/reverse proxy)
    3. Host header from request (with Docker localhost conversion)
    """
    # Check if explicitly set via environment variable
    env_backend_url = os.environ.get('BACKEND_BASE_URL')
    if env_backend_url:
        logger.info(f"Using BACKEND_BASE_URL from environment: {env_backend_url}")
        return env_backend_url

    # Try to detect from request headers
    if request:
        # Check for reverse proxy headers (Azure Container Apps, etc.)
        forwarded_proto = request.headers.get('X-Forwarded-Proto', 'http')
        forwarded_host = request.headers.get('X-Forwarded-Host')

        if forwarded_host:
            backend_url = f"{forwarded_proto}://{forwarded_host}"
            logger.info(f"Detected backend URL from X-Forwarded headers: {backend_url}")
            return backend_url

        # Fallback to Host header
        host = request.headers.get('Host')
        if host:
            # Determine protocol from request
            proto = 'https' if request.is_secure else 'http'

            # Docker special handling: OnlyOffice in Docker can't reach localhost on host
            # Convert localhost/127.0.0.1 to host.docker.internal for Docker Desktop (Windows/Mac)
            # or to host's actual IP
            if host.startswith('localhost:') or host.startswith('127.0.0.1:') or host == 'localhost' or host == '127.0.0.1':
                # Check if we're likely being accessed from Docker (OnlyOffice)
                # User-Agent header might contain "python-requests" from OnlyOffice callbacks
                user_agent = request.headers.get('User-Agent', '')

                # Use host.docker.internal for Docker Desktop (Windows/Mac)
                # This is the special DNS name that resolves to the host machine from inside containers
                docker_host = 'host.docker.internal:5000'
                backend_url = f"{proto}://{docker_host}"
                logger.info(f"🐳 Detected localhost access - using Docker host: {backend_url}")
                logger.info(f"   (Original host was: {host}, User-Agent: {user_agent[:50]})")
                return backend_url

            # Normal production or non-localhost development
            backend_url = f"{proto}://{host}"
            logger.info(f"Detected backend URL from Host header: {backend_url}")
            return backend_url

    # Final fallback for local development
    # If no request context, assume Docker and use host.docker.internal
    fallback_url = 'http://host.docker.internal:5000'
    logger.warning(f"Could not detect backend URL, using Docker fallback: {fallback_url}")
    return fallback_url

def load_session(doc_id):
    """Load session data from disk"""
    session_file = os.path.join(SESSIONS_FOLDER, f"{doc_id}.json")
    if os.path.exists(session_file):
        try:
            with open(session_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading session {doc_id}: {e}")
    return None

def save_session(doc_id, session_data):
    """Save session data to disk"""
    session_file = os.path.join(SESSIONS_FOLDER, f"{doc_id}.json")
    try:
        with open(session_file, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2)
        logger.info(f"Session {doc_id} saved to disk")
    except Exception as e:
        logger.error(f"Error saving session {doc_id}: {e}")

def get_session(doc_id):
    """Get session from memory or load from disk"""
    if doc_id in document_sessions:
        return document_sessions[doc_id]

    # Try loading from disk
    session = load_session(doc_id)
    if session:
        # Normalize the file path (handle relative paths and mixed separators)
        file_path = session.get('file_path', '')
        if file_path:
            # Convert to absolute path if relative
            if not os.path.isabs(file_path):
                file_path = os.path.abspath(file_path)

            # Normalize path separators
            file_path = os.path.normpath(file_path)

            # Update session with normalized path
            session['file_path'] = file_path

            logger.info(f"Checking file existence: {file_path}")

            # Verify the file still exists
            if os.path.exists(file_path):
                document_sessions[doc_id] = session
                logger.info(f"Session {doc_id} restored from disk (file verified)")
                return session
            else:
                logger.warning(f"Session {doc_id} found but file is missing at: {file_path}")
    return None

# Load all existing sessions on startup
def load_all_sessions():
    """Load all existing sessions from disk on startup"""
    if not os.path.exists(SESSIONS_FOLDER):
        return

    count = 0
    for filename in os.listdir(SESSIONS_FOLDER):
        if filename.endswith('.json'):
            doc_id = filename[:-5]  # Remove .json extension
            session = load_session(doc_id)
            if session:
                # Normalize the file path
                file_path = session.get('file_path', '')
                if file_path:
                    # Convert to absolute path if relative
                    if not os.path.isabs(file_path):
                        file_path = os.path.abspath(file_path)
                    # Normalize path separators
                    file_path = os.path.normpath(file_path)
                    session['file_path'] = file_path

                    if os.path.exists(file_path):
                        document_sessions[doc_id] = session
                        count += 1
                        logger.info(f"Loaded session {doc_id}: {file_path}")

    if count > 0:
        logger.info(f"✅ Loaded {count} existing document sessions from disk")

# Load sessions on startup
load_all_sessions()

# Dynamic CORS configuration for Azure deployment
# Read allowed origins from environment variable or use defaults
ALLOWED_ORIGINS_STR = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
ALLOWED_ORIGINS = set(ALLOWED_ORIGINS_STR.split(','))

# Always include localhost for local development
ALLOWED_ORIGINS.update([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
])

# Auto-detect Azure Container Apps frontend URL (both http and https)
backend_host = os.environ.get('BACKEND_BASE_URL', '')
if 'azurecontainerapps.io' in backend_host:
    # Extract the base domain and add frontend
    frontend_url_https = backend_host.replace('backend', 'frontend')
    frontend_url_http = frontend_url_https.replace('https://', 'http://')
    ALLOWED_ORIGINS.add(frontend_url_https)
    ALLOWED_ORIGINS.add(frontend_url_http)
    logger.info(f"🌐 Azure deployment detected, added frontend URLs: {frontend_url_https}, {frontend_url_http}")

logger.info(f"CORS Allowed Origins: {ALLOWED_ORIGINS}")

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": list(ALLOWED_ORIGINS),
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

@app.after_request
def apply_cors(response):
    origin = request.headers.get('Origin')
    if origin and origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        # Allow requests without Origin header (like from curl/Postman)
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    
    response.headers['Vary'] = 'Origin'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
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

@app.route('/api/docx-to-pdf', methods=['POST'])
def docx_to_pdf_endpoint():
    """Convert Word document with replaced variables to PDF"""
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
        
        # Convert to PDF using LibreOffice
        try:
            pdf_bytes = convert_docx_to_pdf_libreoffice(modified_docx_bytes)
            
            # Return the PDF
            response = make_response(pdf_bytes)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=offer_letter.pdf'
            response.headers['Content-Length'] = len(pdf_bytes)
            
            return response
            
        except Exception as conv_error:
            logger.error(f"PDF conversion failed: {conv_error}")
            return jsonify({
                "error": "PDF conversion failed",
                "message": "LibreOffice not installed or conversion error. Download as .docx instead.",
                "details": str(conv_error)
            }), 500
        
    except Exception as e:
        logger.error(f"Error in docx_to_pdf_endpoint: {e}")
        return jsonify({
            "error": "Failed to process document",
            "message": str(e)
        }), 500

def convert_docx_to_pdf_libreoffice(docx_bytes: bytes) -> bytes:
    """Convert DOCX to PDF using LibreOffice for perfect formatting"""
    import subprocess
    import tempfile
    import os
    
    # Create temporary files
    with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as docx_temp:
        docx_temp.write(docx_bytes)
        docx_path = docx_temp.name
    
    pdf_path = docx_path.replace('.docx', '.pdf')
    temp_dir = os.path.dirname(docx_path)
    
    try:
        # Convert using LibreOffice
        result = subprocess.run([
            'soffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', temp_dir,
            docx_path
        ], check=True, capture_output=True, timeout=30)
        
        # Check if PDF was created
        if not os.path.exists(pdf_path):
            raise Exception("PDF file was not created")
        
        # Read PDF bytes
        with open(pdf_path, 'rb') as pdf_file:
            pdf_bytes = pdf_file.read()
        
        return pdf_bytes
        
    except subprocess.TimeoutExpired:
        raise Exception("PDF conversion timed out (>30s)")
    except FileNotFoundError:
        raise Exception("LibreOffice not found. Please install LibreOffice: https://www.libreoffice.org/download/")
    except subprocess.CalledProcessError as e:
        raise Exception(f"LibreOffice conversion failed: {e.stderr.decode() if e.stderr else 'Unknown error'}")
    finally:
        # Clean up temporary files
        if os.path.exists(docx_path):
            os.remove(docx_path)
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

# ====== ONLYOFFICE Integration Endpoints ======

@app.route('/api/onlyoffice/upload', methods=['POST'])
def upload_document_onlyoffice():
    """Upload document for ONLYOFFICE editing"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.lower().endswith('.docx'):
            return jsonify({"error": "Only .docx files are supported"}), 400

        # Generate unique document ID
        timestamp = str(int(time.time() * 1000))
        doc_id = hashlib.md5(f"{file.filename}{timestamp}".encode()).hexdigest()

        # Read document bytes first
        docx_bytes = file.read()

        # Extract variables using existing service (with GLiNER enrichment)
        variables = {}
        variables_metadata = {}
        if DOCX_AVAILABLE:
            var_result = extract_docx_variables(docx_bytes)
            if var_result.get("success"):
                variables = var_result.get("variables", {})
                variables_metadata = variables  # For Content Controls conversion
                logger.info(f"Extracted {len(variables)} variables from document (GLiNER enabled: {var_result.get('gliner_enabled', False)})")

        # Convert bracketed variables to Content Controls (protected fields)
        # This prevents users from deleting [Variable_Name] placeholders
        if DOCX_AVAILABLE and docx_service:
            logger.info("Converting bracketed variables to Content Controls for protection...")
            docx_bytes = docx_service.convert_variables_to_content_controls(docx_bytes, variables_metadata)

        # Save processed file (this is the working copy)
        file_path = os.path.join(UPLOAD_FOLDER, f"{doc_id}.docx")
        with open(file_path, 'wb') as f:
            f.write(docx_bytes)

        # ALSO save original template (for docxtpl rendering)
        template_path = os.path.join(UPLOAD_FOLDER, f"{doc_id}_template.docx")
        with open(template_path, 'wb') as f:
            f.write(docx_bytes)
        logger.info(f"💾 Saved original template to: {template_path}")

        # Store session info
        session_data = {
            "filename": file.filename,
            "file_path": file_path,
            "template_path": template_path,  # Original template for rendering
            "created_at": datetime.now().isoformat(),
            "variables": variables,
            "modified": False
        }
        document_sessions[doc_id] = session_data
        save_session(doc_id, session_data)

        return jsonify({
            "success": True,
            "document_id": doc_id,
            "filename": file.filename,
            "variables": variables,
            "message": f"Document uploaded successfully"
        })

    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/onlyoffice/config/<doc_id>', methods=['GET'])
def get_onlyoffice_config(doc_id):
    """Generate ONLYOFFICE editor configuration"""
    try:
        session = get_session(doc_id)
        if not session:
            return jsonify({"error": "Document not found"}), 404

        # Dynamically detect backend URL (works for both local and production)
        backend_url = get_backend_base_url()

        logger.info(f"📍 ONLYOFFICE will use backend: {backend_url}")
        logger.info(f"📍 Request Host: {request.headers.get('Host')}")
        logger.info(f"📍 X-Forwarded-Host: {request.headers.get('X-Forwarded-Host')}")

        # Generate a unique key that changes when document is modified
        # This forces ONLYOFFICE to fetch the updated file instead of using cache
        base_key = doc_id
        last_modified = session.get("last_modified", session.get("created_at", ""))
        timestamp_clean = last_modified.replace(':', '').replace('.', '').replace('-', '').replace('T', '')
        document_key = f"{base_key}_{timestamp_clean}"

        # Also add timestamp to download URL to bust ALL caches
        download_url = f"{backend_url}/api/onlyoffice/download/{doc_id}?t={timestamp_clean}"

        logger.info(f"📋 Generated document key: {document_key}")
        logger.info(f"📥 Download URL: {download_url}")

        config = {
            "document": {
                "fileType": "docx",
                "key": document_key,  # Use modified timestamp in key to bust cache
                "title": session["filename"],
                "url": download_url,  # Add timestamp parameter
                "permissions": {
                    "edit": True,
                    "download": True,
                    "review": True
                }
            },
            "documentType": "word",
            "editorConfig": {
                "callbackUrl": f"{backend_url}/api/onlyoffice/callback/{doc_id}",
                "customization": {
                    "autosave": True,
                    "forcesave": True,
                    "plugins": True  # Enable plugins support for connector API
                },
                "plugins": {
                    "autostart": [],
                    "pluginsData": []
                }
            }
        }

        return jsonify({
            "success": True,
            "config": config,
            "documentServerUrl": ONLYOFFICE_SERVER_URL
        })

    except Exception as e:
        logger.error(f"Error generating config: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/onlyoffice/download/<doc_id>', methods=['GET'])
def download_document_onlyoffice(doc_id):
    """Serve document file for ONLYOFFICE"""
    try:
        session = get_session(doc_id)
        if not session:
            return jsonify({"error": "Document not found"}), 404
        return send_file(
            session["file_path"],
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=False
        )

    except Exception as e:
        logger.error(f"Error downloading document: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/onlyoffice/callback/<doc_id>', methods=['POST'])
def onlyoffice_callback(doc_id):
    """Handle ONLYOFFICE save callback"""
    try:
        session = get_session(doc_id)
        if not session:
            return jsonify({"error": 0})

        data = request.get_json()
        status = data.get('status')

        # Status: 2 = ready for saving, 6 = saving
        if status == 2 or status == 6:
            download_url = data.get('url')
            if download_url:
                import requests
                response = requests.get(download_url)
                if response.status_code == 200:
                    with open(session["file_path"], 'wb') as f:
                        f.write(response.content)

                    # Re-extract variables from updated document
                    if DOCX_AVAILABLE:
                        var_result = extract_docx_variables(response.content)
                        if var_result.get("success"):
                            session["variables"] = var_result.get("variables", {})

                    session["modified"] = True
                    document_sessions[doc_id] = session
                    save_session(doc_id, session)
                    logger.info(f"Document {doc_id} saved successfully")

        return jsonify({"error": 0})

    except Exception as e:
        logger.error(f"Error in callback: {e}")
        return jsonify({"error": 1})

@app.route('/api/onlyoffice/variables/<doc_id>', methods=['GET'])
def get_document_variables_onlyoffice(doc_id):
    """Get current variables from document"""
    try:
        session = get_session(doc_id)
        if not session:
            return jsonify({"error": "Document not found"}), 404
        return jsonify({
            "success": True,
            "variables": session.get("variables", {}),
            "modified": session.get("modified", False)
        })

    except Exception as e:
        logger.error(f"Error getting variables: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/onlyoffice/update-variables/<doc_id>', methods=['POST'])
def update_document_variables_onlyoffice(doc_id):
    """Update variables in document using LIVE docxtpl rendering"""
    try:
        session = get_session(doc_id)
        if not session:
            logger.error(f"❌ Session not found for doc_id: {doc_id}")
            return jsonify({"error": "Document not found"}), 404

        if not DOCXTPL_AVAILABLE:
            logger.error("❌ DocxTPL service not available")
            return jsonify({"error": "DocxTPL service not available"}), 503

        data = request.get_json()
        variables = data.get('variables', {})

        logger.info(f"🎨 LIVE RENDERING for document {doc_id}")
        logger.info(f"📝 Variables to render: {list(variables.keys())}")

        # Read original template (with [Variable] or {{Variable}} syntax)
        template_path = session.get("template_path", session["file_path"])
        with open(template_path, 'rb') as f:
            template_bytes = f.read()

        logger.info(f"📄 Read template from: {template_path} ({len(template_bytes)} bytes)")

        # Convert variable format to simple strings (docxtpl expects plain values)
        # IMPORTANT: Sanitize keys to match the converted variable names in template
        render_context = {}
        for key, value in variables.items():
            # Sanitize key name (same as in docxtpl_service)
            sanitized_key = docxtpl_service.sanitize_variable_name(key)

            # Handle both string values and dict values
            if isinstance(value, dict):
                render_context[sanitized_key] = value.get('value', '') or value.get('suggested_value', '')
            else:
                render_context[sanitized_key] = value or ''

        logger.info(f"🎨 Render context: {render_context}")
        logger.info(f"🔑 Variable name mapping: {dict(zip(variables.keys(), render_context.keys()))}")

        # LIVE RENDER using docxtpl - this shows changes immediately!
        rendered_bytes = render_docx_template_live(template_bytes, render_context)
        logger.info(f"✅ Template rendered LIVE, new size: {len(rendered_bytes)} bytes")

        # Save rendered document
        with open(session["file_path"], 'wb') as f:
            f.write(rendered_bytes)
        logger.info(f"💾 Saved rendered document to: {session['file_path']}")

        # Extract variables from rendered document
        var_result = extract_template_variables(rendered_bytes)
        if var_result.get("success"):
            session["variables"] = var_result.get("variables", {})
            logger.info(f"🔍 Extracted {len(session['variables'])} remaining variables")

        session["modified"] = True
        session["last_modified"] = datetime.now().isoformat()
        document_sessions[doc_id] = session
        save_session(doc_id, session)

        logger.info(f"✅ Successfully rendered document {doc_id} with docxtpl")

        return jsonify({
            "success": True,
            "variables": session["variables"],
            "replacements_made": len(variables),
            "method": "docxtpl_live_rendering",
            "message": "Variables rendered successfully. Document will reload automatically."
        })

    except Exception as e:
        logger.error(f"❌ Error rendering template: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/onlyoffice/extract-realtime/<doc_id>', methods=['POST'])
def extract_realtime_variables(doc_id):
    """
    Real-time extraction endpoint - extracts variables from document using GLiNER
    This is called automatically when document is loaded, without refresh
    """
    try:
        session = get_session(doc_id)
        if not session:
            return jsonify({"error": "Document not found"}), 404

        if not DOCX_AVAILABLE:
            return jsonify({"error": "DOCX service not available"}), 503

        # Read current document
        with open(session["file_path"], 'rb') as f:
            docx_bytes = f.read()

        # Extract variables with GLiNER enrichment
        var_result = extract_docx_variables(docx_bytes)

        if not var_result.get("success"):
            return jsonify({
                "success": False,
                "error": var_result.get("error", "Extraction failed")
            }), 500

        # Update session with fresh variables
        variables = var_result.get("variables", {})
        session["variables"] = variables
        document_sessions[doc_id] = session
        save_session(doc_id, session)

        logger.info(f"🔍 Real-time extraction for {doc_id}: {len(variables)} variables found (GLiNER: {var_result.get('gliner_enabled', False)})")

        return jsonify({
            "success": True,
            "variables": variables,
            "gliner_enabled": var_result.get('gliner_enabled', False),
            "extraction_method": "GLiNER + Regex" if var_result.get('gliner_enabled') else "Regex",
            "total_variables": len(variables),
            "message": f"Extracted {len(variables)} variables in real-time"
        })

    except Exception as e:
        logger.error(f"Error in real-time extraction: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ====== ONLYOFFICE Form Data API Endpoints ======

@app.route('/api/onlyoffice/extract-forms/<doc_id>', methods=['POST'])
def extract_forms_onlyoffice(doc_id):
    """
    Extract form fields from ONLYOFFICE document using getFormsData
    This endpoint would be called from a custom ONLYOFFICE plugin
    For now, we extract bracketed fields from the document
    """
    try:
        session = get_session(doc_id)
        if not session:
            return jsonify({"error": "Document not found"}), 404

        if not DOCX_AVAILABLE:
            return jsonify({"error": "DOCX service not available"}), 503

        # Read current document
        with open(session["file_path"], 'rb') as f:
            docx_bytes = f.read()

        # Extract variables (these are our form fields)
        var_result = extract_docx_variables(docx_bytes)

        if not var_result.get("success"):
            return jsonify({
                "success": False,
                "error": var_result.get("error", "Extraction failed")
            }), 500

        # Convert variables to form field format
        variables = var_result.get("variables", {})
        fields = []
        for key, var_data in variables.items():
            field = {
                "key": key,
                "name": key,
                "type": "text",  # Default to text for now
                "value": var_data.get("suggested_value", "") if isinstance(var_data, dict) else "",
                "original_value": var_data.get("suggested_value", "") if isinstance(var_data, dict) else ""
            }
            fields.append(field)

        logger.info(f"📋 Extracted {len(fields)} form fields from document {doc_id}")

        return jsonify({
            "success": True,
            "fields": fields,
            "count": len(fields),
            "message": f"Extracted {len(fields)} form fields"
        })

    except Exception as e:
        logger.error(f"Error extracting forms: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analyze-form-fields', methods=['POST'])
def analyze_form_fields():
    """
    Analyze form fields using NLP to provide better suggestions
    This is called after extracting form data
    """
    try:
        data = request.get_json()
        if not data or 'fields' not in data:
            return jsonify({"error": "fields array required"}), 400

        fields = data['fields']
        analyzed_fields = []

        for field in fields:
            field_name = field.get('key') or field.get('name', '')
            field_value = field.get('value', '')
            field_type = field.get('type', 'text')

            # Analyze field name with NLP to categorize it
            nlp_category = None
            suggested_value = field_value

            if nlp_service:
                # Extract entities from field name to understand what it represents
                name_analysis = nlp_service.extract_entities(field_name)
                entities = name_analysis.get('entities', [])

                if entities:
                    # Use first entity label as category
                    nlp_category = entities[0].get('label', None)

                # If we have GLiNER, use it for better field understanding
                if GLINER_AVAILABLE and field_value:
                    try:
                        gliner_result = extract_entities_with_gliner(
                            f"{field_name}: {field_value}",
                            entity_type="offer_letter"
                        )
                        if gliner_result.get('entities'):
                            # Use GLiNER suggestion if available
                            suggested_value = gliner_result['entities'][0].get('text', field_value)
                    except Exception as e:
                        logger.warning(f"GLiNER analysis failed for field {field_name}: {e}")

            analyzed_field = {
                "key": field_name,
                "name": field_name,
                "type": field_type,
                "original_value": field_value,
                "suggested_value": suggested_value,
                "nlp_category": nlp_category
            }
            analyzed_fields.append(analyzed_field)

        logger.info(f"🔬 Analyzed {len(analyzed_fields)} form fields with NLP")

        return jsonify({
            "success": True,
            "analyzed_fields": analyzed_fields,
            "count": len(analyzed_fields),
            "gliner_enabled": GLINER_AVAILABLE,
            "message": f"Analyzed {len(analyzed_fields)} fields"
        })

    except Exception as e:
        logger.error(f"Error analyzing form fields: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/onlyoffice/update-forms/<doc_id>', methods=['POST'])
def update_forms_onlyoffice(doc_id):
    """
    Update form fields in ONLYOFFICE document using setFormsData
    This endpoint would communicate with a custom ONLYOFFICE plugin
    For now, we replace variables in the document
    """
    try:
        session = get_session(doc_id)
        if not session:
            return jsonify({"error": "Document not found"}), 404

        if not DOCX_AVAILABLE:
            return jsonify({"error": "DOCX service not available"}), 503

        data = request.get_json()
        fields = data.get('fields', [])

        if not fields:
            return jsonify({"error": "No fields provided"}), 400

        # Convert fields to variables format
        variables = {}
        for field in fields:
            key = field.get('key') or field.get('name')
            value = field.get('suggested_value') or field.get('value', '')
            if key:
                variables[key] = value

        # Read current document
        with open(session["file_path"], 'rb') as f:
            docx_bytes = f.read()

        # Replace variables in document
        modified_bytes = replace_docx_variables(docx_bytes, variables)

        # Save modified document
        with open(session["file_path"], 'wb') as f:
            f.write(modified_bytes)

        # Update session
        session["variables"] = variables
        session["modified"] = True
        document_sessions[doc_id] = session
        save_session(doc_id, session)

        logger.info(f"✅ Updated {len(variables)} form fields in document {doc_id}")

        return jsonify({
            "success": True,
            "updated_count": len(variables),
            "message": f"Updated {len(variables)} form fields successfully. Reload to see changes."
        })

    except Exception as e:
        logger.error(f"Error updating forms: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Always run on port 5000 to match frontend expectations
    port = 5000

    # Get host from environment variable or default to 0.0.0.0 for Docker connectivity
    host = os.environ.get('HOST', '0.0.0.0')

    # Get debug mode from environment variable
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'

    logger.info(f"Starting NLP API server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"NLP service available: {nlp_service is not None}")

    # Start the server with WebSocket support
    if socketio:
        logger.info("Starting server with WebSocket support (SocketIO)")
        socketio.run(app, host=host, port=port, debug=debug, allow_unsafe_werkzeug=True)
    else:
        logger.warning("Starting server without WebSocket support")
        app.run(host=host, port=port, debug=debug)
