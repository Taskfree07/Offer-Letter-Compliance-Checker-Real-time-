"""
Minimal test app to verify authentication system
Run this to test database and auth endpoints before integrating into main app
"""
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///email_automation.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'test-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

# Initialize extensions
from models import db, bcrypt
from flask_jwt_extended import JWTManager

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Register auth blueprint
from auth import auth_bp
app.register_blueprint(auth_bp)

# CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"]
    }
})

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    try:
        db.session.execute('SELECT 1')
        db_status = "connected"
    except:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "service": "Email Automation Auth Test",
        "database": db_status,
        "auth_enabled": True
    }

@app.route('/')
def index():
    """Root endpoint"""
    return {
        "message": "Email Automation Auth API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "register": "/api/auth/register",
            "login": "/api/auth/login",
            "microsoft_verify": "/api/auth/microsoft/verify",
            "me": "/api/auth/me (requires token)",
            "refresh": "/api/auth/refresh (requires refresh token)"
        }
    }

if __name__ == '__main__':
    # Create tables
    with app.app_context():
        print("[DB] Creating database tables...")
        db.create_all()
        print("[OK] Database tables created!")

        # Create system templates
        from models import create_system_templates
        print("\n[TEMPLATES] Creating system templates...")
        create_system_templates()
        print("[OK] System templates created!")

    # Run the app
    print("\n[SERVER] Starting test authentication server...")
    print("[INFO] Server running at: http://localhost:5000")
    print("\n[ENDPOINTS] Test endpoints:")
    print("   GET  http://localhost:5000/health")
    print("   POST http://localhost:5000/api/auth/register")
    print("   POST http://localhost:5000/api/auth/login")
    print("   POST http://localhost:5000/api/auth/microsoft/verify")
    print("\n")

    app.run(host='0.0.0.0', port=5000, debug=True)
