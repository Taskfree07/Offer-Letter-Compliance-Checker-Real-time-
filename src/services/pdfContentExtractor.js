import pdfjs from '../utils/pdfWorker';

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjs.getDocument(arrayBuffer).promise;
    let text = '';

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map(item => item.str).join(' ') + '\\n';
    }

    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}
