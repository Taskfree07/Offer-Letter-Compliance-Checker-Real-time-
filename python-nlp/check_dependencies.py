"""
Diagnostic script to check which dependencies are installed and working
Run this before starting the Flask app to identify missing packages
"""

import sys

def check_import(module_name, package_name=None):
    """Try to import a module and report status"""
    if package_name is None:
        package_name = module_name
    
    try:
        __import__(module_name)
        print(f"✅ {package_name}: installed")
        return True
    except ImportError as e:
        print(f"❌ {package_name}: NOT installed - {str(e)[:100]}")
        return False
    except Exception as e:
        # Handle other errors (e.g., WeasyPrint GTK errors)
        print(f"⚠️  {package_name}: installed but has runtime error - {str(e)[:100]}")
        return True  # Package is installed, just has runtime issues

def main():
    print("=" * 60)
    print("Checking Python dependencies for Email Automation MVP")
    print("=" * 60)
    print()
    
    # Core dependencies
    print("Core Dependencies:")
    print("-" * 60)
    flask_ok = check_import("flask", "Flask")
    flask_cors_ok = check_import("flask_cors", "Flask-CORS")
    spacy_ok = check_import("spacy", "spaCy")
    
    # Check if spaCy model is downloaded
    if spacy_ok:
        try:
            import spacy
            nlp = spacy.load("en_core_web_sm")
            print(f"✅ spaCy model 'en_core_web_sm': installed")
        except OSError:
            print(f"❌ spaCy model 'en_core_web_sm': NOT downloaded")
            print(f"   Run: python -m spacy download en_core_web_sm")
    
    print()
    
    # Enhanced PDF dependencies (required for /api/pdf-to-html)
    print("Enhanced PDF Service Dependencies (required for PDF-to-HTML):")
    print("-" * 60)
    pymupdf_ok = check_import("fitz", "PyMuPDF")
    pdfplumber_ok = check_import("pdfplumber", "pdfplumber")
    bs4_ok = check_import("bs4", "beautifulsoup4")
    weasyprint_ok = check_import("weasyprint", "weasyprint")
    
    print()
    
    # Optional dependencies
    print("Optional Dependencies (for enhanced features):")
    print("-" * 60)
    gliner_ok = check_import("gliner", "gliner")
    pypdf2_ok = check_import("PyPDF2", "PyPDF2")
    
    print()
    print("=" * 60)
    print("Summary:")
    print("=" * 60)
    
    core_ok = flask_ok and flask_cors_ok and spacy_ok
    enhanced_pdf_ok = pymupdf_ok and pdfplumber_ok and bs4_ok and weasyprint_ok
    
    if core_ok:
        print("✅ Core NLP service: READY")
    else:
        print("❌ Core NLP service: MISSING DEPENDENCIES")
        print("   Install: pip install flask flask-cors spacy")
        print("   Then: python -m spacy download en_core_web_sm")
    
    if enhanced_pdf_ok:
        print("✅ Enhanced PDF service: READY")
    else:
        print("❌ Enhanced PDF service: MISSING DEPENDENCIES")
        print("   Install: pip install PyMuPDF pdfplumber beautifulsoup4 weasyprint")
    
    if gliner_ok:
        print("✅ GLiNER (optional): AVAILABLE")
    else:
        print("⚠️  GLiNER (optional): NOT AVAILABLE")
        print("   Install: pip install gliner")
        print("   Note: Service will work without GLiNER, but with reduced entity suggestions")
    
    print()
    
    if core_ok and enhanced_pdf_ok:
        print("🎉 All required dependencies are installed!")
        print("   You can start the server with: python app.py")
    else:
        print("⚠️  Some required dependencies are missing.")
        print("   Install them with: pip install -r requirements.txt")
    
    print()

if __name__ == "__main__":
    main()
