# Changes Needed to app.py for Authentication

## Step 1: Add imports at the top (after existing imports, around line 10)

```python
# Add these imports after the existing imports
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt

# Load environment variables
load_dotenv()

# Import models and auth blueprint
from models import db, bcrypt, User, Document, Template, DocumentVariable
from auth import auth_bp, get_current_user
```

## Step 2: Configure app (after `app = Flask(__name__)`, around line 70)

```python
# Initialize Flask app
app = Flask(__name__)

# ============ Database and Auth Configuration ============
# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///email_automation.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-this-secret-key-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))  # 1 hour

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Register auth blueprint
app.register_blueprint(auth_bp)

logger.info("✅ Database and authentication configured")
```

## Step 3: Add JWT error handlers (after the app configuration)

```python
# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'success': False,
        'error': 'Token has expired',
        'message': 'Please login again'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'success': False,
        'error': 'Invalid token',
        'message': 'Token verification failed'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'success': False,
        'error': 'Authorization required',
        'message': 'Access token is missing'
    }), 401
```

## Step 4: Add user-specific file storage helper (around line 100)

```python
def get_user_upload_folder(user_id):
    """Get user-specific upload folder"""
    user_folder = os.path.join(UPLOAD_FOLDER, f'user_{user_id}')
    os.makedirs(user_folder, exist_ok=True)
    return user_folder
```

## Step 5: Protect ONLYOFFICE endpoints

For each ONLYOFFICE endpoint, add `@jwt_required()` decorator and user filtering:

### Example for upload endpoint (around line 1288):

**BEFORE:**
```python
@app.route('/api/onlyoffice/upload', methods=['POST'])
def upload_document_onlyoffice():
    """Upload document for ONLYOFFICE editing"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
```

**AFTER:**
```python
@app.route('/api/onlyoffice/upload', methods=['POST'])
@jwt_required()
def upload_document_onlyoffice():
    """Upload document for ONLYOFFICE editing (USER-SPECIFIC)"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            return jsonify({"error": "User not found"}), 404

        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        # ... rest of the code ...

        # Use user-specific folder
        user_folder = get_user_upload_folder(current_user_id)
        file_path = os.path.join(user_folder, f"{doc_id}.docx")

        # Save to database
        new_document = Document(
            user_id=current_user_id,
            filename=file.filename,
            doc_id=doc_id,
            file_path=file_path,
            template_path=template_path
        )
        db.session.add(new_document)

        # Save variables to database
        for var_name, var_data in variables.items():
            var = DocumentVariable(
                document_id=new_document.id,
                variable_name=var_name,
                variable_value=var_data.get('value', ''),
                entity_type=var_data.get('entity_type'),
                suggested_value=var_data.get('suggested_value')
            )
            db.session.add(var)

        db.session.commit()
```

### Similar changes for other endpoints:
- `/api/onlyoffice/config/<doc_id>` - add `@jwt_required()` and verify user owns document
- `/api/onlyoffice/download/<doc_id>` - add `@jwt_required()` and verify user owns document
- `/api/onlyoffice/variables/<doc_id>` - add `@jwt_required()` and verify user owns document
- `/api/onlyoffice/update-variables/<doc_id>` - add `@jwt_required()` and verify user owns document

## Step 6: Document ownership check helper

```python
def check_document_ownership(doc_id, user_id):
    """Check if user owns the document"""
    document = Document.query.filter_by(doc_id=doc_id, user_id=user_id).first()
    if not document:
        return None, jsonify({"error": "Document not found or access denied"}), 403
    return document, None, None
```

## Step 7: Update health check to include database status

```python
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        db_status = "connected"
    except:
        db_status = "disconnected"

    return jsonify({
        "status": "healthy",
        "service": "Email Automation API with Authentication",
        "database": db_status,
        "nlp_service_available": nlp_service is not None,
        "auth_enabled": True
    })
```

## Important Notes:

1. **Don't delete existing code** - just add the new imports and configuration
2. **Keep all existing NLP endpoints** - they work as-is
3. **Only protect user-specific endpoints** like ONLYOFFICE operations
4. **Public endpoints** (health, test) can remain unprotected

## Quick Implementation Guide:

1. Backup your current `app.py`
2. Add imports at the top
3. Add configuration after `app = Flask(__name__)`
4. Add JWT error handlers
5. Add `@jwt_required()` to ONLYOFFICE endpoints one by one
6. Test each endpoint after protection

Would you like me to create a complete `app_with_auth.py` file as a reference?
