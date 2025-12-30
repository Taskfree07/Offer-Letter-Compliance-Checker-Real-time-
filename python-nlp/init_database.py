"""
Simple database initialization for production
Creates tables if they don't exist
"""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

def init_db():
    """Initialize database tables"""
    try:
        from app import app, db

        with app.app_context():
            print("🗄️  Initializing database...")
            db.create_all()
            print("✅ Database tables created/verified successfully!")
            return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = init_db()
    sys.exit(0 if success else 1)
