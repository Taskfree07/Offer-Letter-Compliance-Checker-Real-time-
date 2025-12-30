"""
Start the Flask app without GLiNER service (which requires downloading large models)
This is useful when you just need authentication and basic features.
"""
import sys
import os

# Mock the gliner_service module to avoid loading it
class MockGLiNERService:
    def __init__(self):
        pass
    
    def extract_entities(self, *args, **kwargs):
        return []

def get_gliner_service():
    return None

def extract_entities_with_gliner(*args, **kwargs):
    return []

# Create a mock module
import types
mock_gliner = types.ModuleType('gliner_service')
mock_gliner.get_gliner_service = get_gliner_service
mock_gliner.extract_entities_with_gliner = extract_entities_with_gliner
mock_gliner.GLiNERService = MockGLiNERService
mock_gliner.GLINER_AVAILABLE = False

# Insert into sys.modules before app imports it
sys.modules['gliner_service'] = mock_gliner

# Now import and run the app
if __name__ == "__main__":
    from app import app
    print("=" * 80)
    print("Starting Flask app WITHOUT GLiNER service")
    print("This mode is suitable for authentication and basic document processing")
    print("=" * 80)
    app.run(host='0.0.0.0', port=5000, debug=False)
