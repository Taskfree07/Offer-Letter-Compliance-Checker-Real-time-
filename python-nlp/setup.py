#!/usr/bin/env python3
"""
Setup script for NLP Entity Extraction Service
Installs dependencies and downloads required models
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"🔄 {description}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    print("🔍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} is not supported. Please use Python 3.8 or higher.")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_requirements():
    """Install Python requirements"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    command = f"{sys.executable} -m pip install -r {requirements_file}"
    return run_command(command, "Installing Python dependencies")

def download_spacy_model():
    """Download spaCy English model"""
    command = f"{sys.executable} -m spacy download en_core_web_sm"
    return run_command(command, "Downloading spaCy English model")

def create_env_file():
    """Create .env file with default configuration"""
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    env_content = """# NLP Service Configuration
HOST=127.0.0.1
PORT=5000
DEBUG=False

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://0.0.0.0:3000

# Logging Level
LOG_LEVEL=INFO
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with default configuration")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def test_installation():
    """Test if the installation works"""
    print("\n🧪 Testing installation...")
    
    try:
        # Test imports
        import spacy
        import flask
        from nlp_service import NLPEntityExtractor
        
        # Test spaCy model
        nlp_service = NLPEntityExtractor()
        test_text = "Hello, my name is John Smith and I work at Google Inc."
        result = nlp_service.extract_entities(test_text)
        
        if result and 'entities' in result:
            print(f"✅ Installation test passed! Found {len(result['entities'])} entities.")
            return True
        else:
            print("❌ Installation test failed: No entities extracted")
            return False
            
    except ImportError as e:
        print(f"❌ Installation test failed: Missing dependency - {e}")
        return False
    except Exception as e:
        print(f"❌ Installation test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 NLP Entity Extraction Service Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("\n❌ Setup failed during dependency installation")
        sys.exit(1)
    
    # Download spaCy model
    if not download_spacy_model():
        print("\n❌ Setup failed during spaCy model download")
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        print("\n⚠️  Warning: Failed to create .env file, but continuing...")
    
    # Test installation
    if not test_installation():
        print("\n❌ Setup completed but installation test failed")
        print("You may need to restart your terminal or check for errors above")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Start the NLP service: python app.py")
    print("2. The service will be available at http://127.0.0.1:5000")
    print("3. Test the service: curl http://127.0.0.1:5000/health")
    print("\nFor development:")
    print("- Set DEBUG=True in .env file for debug mode")
    print("- Modify HOST and PORT in .env file if needed")
    print("\nTroubleshooting:")
    print("- If spaCy model download fails, try: python -m spacy download en_core_web_sm")
    print("- Check firewall settings if connection issues occur")

if __name__ == "__main__":
    main()
