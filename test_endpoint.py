import requests
import os

# Test the PDF to HTML endpoint
def test_pdf_to_html():
    url = "http://127.0.0.1:5000/api/pdf-to-html"

    # Check if there's a test PDF file
    pdf_files = [
        "public/letterhead.pdf",
        "pdf/letterhead - TG.pdf",
        "Offer Letter Template.pdf"
    ]

    test_file = None
    for pdf_file in pdf_files:
        if os.path.exists(pdf_file):
            test_file = pdf_file
            break
    
    if not test_file:
        print("No test PDF file found")
        return
    
    print(f"Testing with file: {test_file}")
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': f}
            response = requests.post(url, files=files)
            
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ PDF to HTML conversion successful!")
                print(f"Variables found: {len(result.get('data', {}).get('variables', {}))}")
            else:
                print(f"❌ Conversion failed: {result.get('error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_pdf_to_html()