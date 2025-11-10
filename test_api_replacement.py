"""
Test the API endpoint for variable replacement
"""
import requests
import json

# First, list sessions to find a document ID
print("🔍 Checking for active document sessions...")
response = requests.get('http://127.0.0.1:5000/health')
print(f"Backend health: {response.json()}")
print()

# You'll need to paste your actual document ID here after importing a document
# Look in the browser console after importing a document
doc_id = input("Enter your document ID (from browser console after importing): ").strip()

if not doc_id:
    print("❌ No document ID provided. Please:")
    print("1. Go to your app and import a document")
    print("2. Open browser console (F12)")
    print("3. Look for 'document_id' in the logs")
    print("4. Run this script again with that ID")
    exit(1)

# Test variables to replace
test_variables = {
    "Candidate_Name": "TEST_USER_123",
    "Company_Name": "TEST_COMPANY_456",
    "Start_Date": "TEST_DATE_789"
}

print(f"📝 Testing variable replacement for document: {doc_id}")
print(f"Variables to replace: {list(test_variables.keys())}")
print()

# Call the update-variables endpoint
print("🔄 Calling /api/onlyoffice/update-variables...")
response = requests.post(
    f'http://127.0.0.1:5000/api/onlyoffice/update-variables/{doc_id}',
    headers={'Content-Type': 'application/json'},
    json={'variables': test_variables}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print()

if response.status_code == 200:
    print("✅ API call successful!")
    print()
    print("Now check your backend terminal logs for:")
    print("  🔄 Updating variables for document...")
    print("  📝 Variables to replace: [...]")
    print("  ✅ Variables replaced...")
    print("  💾 Saved modified document...")
    print()
    print("Then go to your browser and click the Replace button to see if it reloads.")
else:
    print(f"❌ API call failed: {response.text}")
