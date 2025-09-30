"""
Verify that the Flask backend is running and endpoints are accessible
Run this after starting the Flask app to confirm everything works
"""

import requests
import sys

BASE_URL = "http://127.0.0.1:5000"

def test_endpoint(url, method="GET", description=""):
    """Test an endpoint and report status"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        else:
            response = requests.post(url, timeout=5)
        
        status = response.status_code
        if status == 200:
            print(f"✅ {description}: OK (200)")
            return True
        elif status == 404:
            print(f"❌ {description}: NOT FOUND (404)")
            return False
        elif status == 503:
            print(f"⚠️  {description}: SERVICE UNAVAILABLE (503)")
            print(f"   Response: {response.text[:200]}")
            return False
        else:
            print(f"⚠️  {description}: {status}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {description}: CONNECTION REFUSED")
        print(f"   Is the Flask server running on {BASE_URL}?")
        return False
    except Exception as e:
        print(f"❌ {description}: ERROR - {e}")
        return False

def main():
    print("=" * 70)
    print("Verifying Flask Backend")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print()
    
    # Test basic endpoints
    print("Core Endpoints:")
    print("-" * 70)
    health_ok = test_endpoint(f"{BASE_URL}/health", "GET", "/health")
    routes_ok = test_endpoint(f"{BASE_URL}/api/debug/routes", "GET", "/api/debug/routes")
    
    print()
    
    # Test NLP endpoints
    print("NLP Service Endpoints:")
    print("-" * 70)
    model_info_ok = test_endpoint(f"{BASE_URL}/api/model-info", "GET", "/api/model-info")
    
    print()
    
    # Test Enhanced PDF endpoints
    print("Enhanced PDF Service Endpoints:")
    print("-" * 70)
    pdf_health_ok = test_endpoint(f"{BASE_URL}/api/enhanced-pdf-health", "GET", "/api/enhanced-pdf-health")
    
    # Check if pdf-to-html route exists (will return 400 without file, but not 404)
    try:
        response = requests.post(f"{BASE_URL}/api/pdf-to-html", timeout=5)
        if response.status_code == 404:
            print(f"❌ /api/pdf-to-html: NOT FOUND (404)")
            print(f"   The route is not registered. Check if enhanced_pdf_service loaded.")
            pdf_to_html_ok = False
        elif response.status_code == 503:
            print(f"⚠️  /api/pdf-to-html: SERVICE UNAVAILABLE (503)")
            print(f"   Enhanced PDF dependencies missing (PyMuPDF, pdfplumber, etc.)")
            pdf_to_html_ok = False
        elif response.status_code == 400:
            print(f"✅ /api/pdf-to-html: ROUTE EXISTS (400 - no file provided)")
            pdf_to_html_ok = True
        else:
            print(f"⚠️  /api/pdf-to-html: {response.status_code}")
            pdf_to_html_ok = False
    except requests.exceptions.ConnectionError:
        print(f"❌ /api/pdf-to-html: CONNECTION REFUSED")
        pdf_to_html_ok = False
    except Exception as e:
        print(f"❌ /api/pdf-to-html: ERROR - {e}")
        pdf_to_html_ok = False
    
    print()
    print("=" * 70)
    print("Summary:")
    print("=" * 70)
    
    if health_ok and pdf_to_html_ok:
        print("🎉 Backend is running and all required endpoints are accessible!")
        print()
        print("Next steps:")
        print("1. Start your React frontend (npm start)")
        print("2. Try importing a PDF in the UI")
        print("3. If preview fails, check WeasyPrint installation")
    elif health_ok and not pdf_to_html_ok:
        print("⚠️  Backend is running but /api/pdf-to-html is not available.")
        print()
        print("Possible causes:")
        print("1. Enhanced PDF dependencies not installed (PyMuPDF, pdfplumber)")
        print("2. Import error in enhanced_pdf_service.py")
        print()
        print("Run: python python-nlp/check_dependencies.py")
        print("Then: pip install PyMuPDF pdfplumber beautifulsoup4 weasyprint")
    else:
        print("❌ Backend is not responding.")
        print()
        print("Make sure the Flask server is running:")
        print("  cd python-nlp")
        print("  python app.py")
    
    print()

if __name__ == "__main__":
    main()
