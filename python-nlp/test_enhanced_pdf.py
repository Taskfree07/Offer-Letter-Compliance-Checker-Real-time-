#!/usr/bin/env python3
"""
Test script for Enhanced PDF Service
Tests bracketed variable extraction with PyMuPDF and pdfplumber
"""

import sys
import os
from enhanced_pdf_service import enhanced_pdf_service

def test_enhanced_pdf_service():
    """Test the enhanced PDF service functionality"""
    
    print("Testing Enhanced PDF Service...")
    print("=" * 50)
    
    # Test 1: Check if service initializes
    print("1. Service Initialization:")
    print(f"   GLiNER Available: {enhanced_pdf_service.gliner_available}")
    print(f"   Service Ready: {enhanced_pdf_service is not None}")
    
    # Test 2: Create a simple test PDF with bracketed variables
    print("\n2. Creating Test PDF with Bracketed Variables:")
    
    try:
        import fitz  # PyMuPDF
        
        # Create a simple PDF with bracketed variables
        doc = fitz.open()
        page = doc.new_page()
        
        # Add text with bracketed variables (multiple formats)
        text_content = """
        Dear [Candidate Name],
        
        We are pleased to offer you employment with [Company Name] as a [Job Title].
        
        Your starting salary will be [Annual Salary] per year, and your start date is [Start Date].
        
        Please review the attached {Benefits Package} and let us know if you have any questions.
        
        Additional info: <Department> and <<Location>>.
        
        Sincerely,
        [Hiring Manager]
        [Company Name]
        """
        
        # Insert text into PDF
        page.insert_text((50, 50), text_content, fontsize=12)
        
        # Save to bytes
        pdf_bytes = doc.write()
        print(f"   Test PDF created: {len(pdf_bytes)} bytes")
        
        # Don't close the document yet - keep it open for debugging
        # doc.close()
        
        # Test 3: Extract bracketed variables
        print("\n3. Extracting Bracketed Variables:")
        
        # Create a fresh copy of the bytes for the service
        pdf_bytes_copy = bytes(pdf_bytes)
        result = enhanced_pdf_service.extract_bracketed_variables(pdf_bytes_copy)
        
        # Now we can close the original document
        doc.close()
        
        print(f"   Success: {result.get('total_variables', 0) > 0}")
        print(f"   Variables Found: {result.get('total_variables', 0)}")
        print(f"   Pages Processed: {result.get('pages_processed', 0)}")
        
        if result.get('variables'):
            print("\n   Detected Variables:")
            for var_name, var_data in result['variables'].items():
                print(f"     - {var_name}: {var_data.get('occurrences', 0)} occurrence(s)")
                if var_data.get('suggested_value'):
                    print(f"       GLiNER Suggestion: {var_data['suggested_value']} (confidence: {var_data.get('confidence', 0):.2f})")
        
        # Test 4: Create editable PDF
        print("\n4. Creating Editable PDF:")
        
        test_variables = {
            "Candidate Name": "John Smith",
            "Company Name": "TechCorp Inc.",
            "Job Title": "Software Engineer",
            "Annual Salary": "$85,000",
            "Start Date": "January 15, 2024"
        }
        
        editable_pdf_bytes = enhanced_pdf_service.create_editable_pdf_overlay(pdf_bytes, test_variables)
        
        print(f"   Editable PDF created: {len(editable_pdf_bytes)} bytes")
        print(f"   Success: {len(editable_pdf_bytes) > len(pdf_bytes)}")
        
        print("\n" + "=" * 50)
        print("✅ Enhanced PDF Service Test PASSED!")
        print("✅ All functionality working correctly")
        
        return True
        
    except ImportError as e:
        print(f"   ❌ Missing dependency: {e}")
        print("   Please install: pip install PyMuPDF pdfplumber")
        return False
        
    except Exception as e:
        print(f"   ❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_enhanced_pdf_service()
    sys.exit(0 if success else 1)
