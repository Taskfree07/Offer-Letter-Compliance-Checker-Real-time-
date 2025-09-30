#!/usr/bin/env python3
"""
Quick test script to verify GLiNER is working
"""

import requests
import json

def test_gliner_health():
    """Test GLiNER health endpoint"""
    try:
        response = requests.get('http://127.0.0.1:5000/api/gliner-health')
        print("GLiNER Health Check:")
        print(json.dumps(response.json(), indent=2))
        return response.json().get('success', False)
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_gliner_extraction():
    """Test GLiNER entity extraction"""
    test_text = """
    Dear John Smith,
    
    We are pleased to offer you the position of Senior Software Engineer at TechCorp Inc.
    Your starting salary will be $120,000 annually. Your start date is January 15, 2024.
    You will be reporting to the Engineering Department.
    
    Please respond by December 20, 2023.
    
    Best regards,
    HR Team
    """
    
    try:
        response = requests.post('http://127.0.0.1:5000/api/extract-entities-gliner', 
                               json={'text': test_text, 'entity_type': 'offer_letter'})
        print("\nGLiNER Entity Extraction:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Entity extraction failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing GLiNER Integration...")
    
    # Test health
    health_ok = test_gliner_health()
    
    # Test extraction if health is OK
    if health_ok:
        extraction_ok = test_gliner_extraction()
        print(f"\nResults: Health={health_ok}, Extraction={extraction_ok}")
    else:
        print("\nSkipping extraction test due to health check failure")
