"""
Simple PDF text extraction service
"""

import PyPDF2
import io
import logging

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        pass
    
    def extract_text_from_pdf(self, file):
        """
        Extract text from PDF file
        
        Args:
            file: File object (Flask file upload)
            
        Returns:
            str: Extracted text
        """
        try:
            # Read the file content
            file_content = file.read()
            file.seek(0)  # Reset file pointer
            
            # Create a PDF reader
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            
            # Extract text from all pages
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")

# Global instance
pdf_service = PDFService()
