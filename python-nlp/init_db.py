"""
Database initialization script
Run this once to create the database and tables
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app import app, db
from models import User

def init_database():
    """Initialize the database"""
    with app.app_context():
        print("🗄️  Creating database tables...")
        db.create_all()
        print("✅ Database tables created successfully!")

        print("\n🎉 Database initialization complete!")
        print(f"📍 Database location: {app.config['SQLALCHEMY_DATABASE_URI']}")

if __name__ == '__main__':
    init_database()
