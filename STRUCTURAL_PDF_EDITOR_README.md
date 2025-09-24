# Structure-Preserving PDF Editor

A comprehensive React-based solution for importing PDF offer letters, preserving their exact visual structure, making text editable in-place, and exporting back to PDF format.

## Features

- **Exact Structure Preservation**: Maintains fonts, spacing, tables, and layout exactly as in the original PDF
- **In-Place Text Editing**: Click and edit text directly on the PDF while preserving positioning
- **Multi-Page Support**: Navigate and edit multi-page documents
- **Professional Export**: Save edited documents back to PDF with original formatting
- **Compliance Integration**: Built-in compliance checking for HR use
- **Zoom Controls**: Precise viewing at different zoom levels
- **Responsive Design**: Works on desktop and tablet devices

## Technology Stack

### Core Libraries
- **React 18.2.0**: Main UI framework
- **PDF.js (pdfjs-dist)**: PDF parsing and rendering
- **pdf-lib**: PDF generation and manipulation
- **Fabric.js**: Canvas-based text editing
- **@react-pdf-viewer**: Enhanced PDF viewing components

### Additional Dependencies
- **html2canvas**: High-quality canvas rendering
- **tesseract.js**: OCR capabilities for text extraction
- **react-draggable**: Draggable text elements
- **react-resizable**: Resizable text boxes

## Installation Instructions

### Step 1: Install Dependencies

```bash
# Navigate to your project directory
cd "d:\Email Automation\Email-Clean-Master-main\Email-Clean-Master-main"

# Install all required packages
npm install @react-pdf-viewer/core@^3.12.0 @react-pdf-viewer/default-layout@^3.12.0 fabric@^5.3.0 html2canvas@^1.4.1 pdf-parse@^1.1.1 pdf2pic@^2.1.4 react-pdf@^7.5.1 tesseract.js@^4.1.4
```

### Step 2: Configure PDF.js Worker

The PDF.js worker is automatically configured in the component, but you may need to adjust the CDN path based on your deployment:

```javascript
// In StructuralPDFEditor.js, the worker is set to:
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
```

### Step 3: Start Development Server

```bash
npm start
```

## Usage Guide

### Basic Workflow

1. **Access the Editor**: Click "Structural Editor" button in the main interface
2. **Import PDF**: Click "Import PDF" and select your offer letter
3. **Switch to Edit Mode**: Click "Edit Mode" to make text editable
4. **Edit Content**: Click on any text to edit it in-place
5. **Export**: Click "Export PDF" to save your changes

### Detailed Steps

#### 1. Importing a PDF

```javascript
// The component automatically handles PDF import
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  // Preserves exact structure while extracting text positions
};
```

#### 2. Text Editing

- **View Mode**: Shows the PDF exactly as it appears in Windows
- **Edit Mode**: Overlays editable text boxes on the original layout
- **Text Selection**: Click any text to select and edit
- **Formatting**: Adjust font size while preserving position

#### 3. Exporting

The export process:
1. Takes the original PDF structure
2. Overlays your edited text at exact positions
3. Generates a new PDF maintaining visual fidelity

## Code Architecture

### Main Components

#### StructuralPDFEditor.js
```javascript
// Core component handling PDF import, editing, and export
const StructuralPDFEditor = () => {
  // State management for PDF document, text elements, editing mode
  const [pdfDocument, setPdfDocument] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fabric.js canvas for text editing
  const fabricCanvasRef = useRef(null);
};
```

#### AdvancedPdfProcessor.js
```javascript
// Service for precise text extraction and positioning
class AdvancedPdfProcessor {
  async extractPageStructure(pageNumber) {
    // Extracts text with pixel-perfect positioning
    // Maintains font information and spacing
  }
  
  async exportEditedPDF(editedElements) {
    // Generates new PDF with edited content
    // Preserves original layout and formatting
  }
}
```

### Key Functions

#### Text Extraction with Positioning
```javascript
const extractTextWithPositions = async (page) => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 2 });
  
  const textElements = [];
  for (const item of textContent.items) {
    const transform = item.transform;
    const x = transform[4];
    const y = viewport.height - transform[5]; // Flip Y coordinate
    const fontSize = Math.abs(transform[0]);
    
    textElements.push({
      text: item.str,
      x, y, fontSize,
      fontFamily: item.fontName,
      // Preserve exact positioning data
    });
  }
  return textElements;
};
```

#### Canvas-Based Editing
```javascript
// Initialize Fabric.js canvas for editing
useEffect(() => {
  if (canvasRef.current && isEditMode) {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1000,
      backgroundColor: 'white',
      selection: true,
      preserveObjectStacking: true
    });
    
    // Add text elements as editable objects
    textElements.forEach((textEl) => {
      const fabricText = new fabric.Textbox(textEl.text, {
        left: textEl.x,
        top: textEl.y,
        fontSize: textEl.fontSize,
        fontFamily: textEl.fontFamily,
        // Maintain exact positioning
      });
      fabricCanvas.add(fabricText);
    });
  }
}, [isEditMode]);
```

## Advanced Features

### Table Detection
```javascript
const detectTables = (textElements) => {
  // Groups text elements by position to identify table structures
  // Maintains column alignment and row spacing
};
```

### Font Analysis
```javascript
const analyzeTextFormatting = (textElements) => {
  // Analyzes fonts, sizes, and formatting in the document
  // Preserves typography hierarchy
};
```

### Multi-Page Support
```javascript
const processPage = async (pdfDoc, pageNum) => {
  // Handles navigation between pages
  // Maintains editing state per page
};
```

## Troubleshooting

### Common Issues

1. **PDF.js Worker Error**
   ```javascript
   // Ensure worker is properly configured
   pdfjs.GlobalWorkerOptions.workerSrc = 'correct-path-to-worker';
   ```

2. **Canvas Rendering Issues**
   ```javascript
   // Check canvas dimensions and scaling
   canvas.width = viewport.width;
   canvas.height = viewport.height;
   ```

3. **Text Positioning Accuracy**
   ```javascript
   // Use high-resolution rendering for precision
   const viewport = page.getViewport({ scale: 2.0 });
   ```

### Performance Optimization

1. **Large PDFs**: Process pages on-demand rather than all at once
2. **Memory Management**: Clean up canvas objects when switching pages
3. **Rendering**: Use requestAnimationFrame for smooth updates

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may need polyfills for some features)
- **Edge**: Full support

## Security Considerations

- PDFs are processed client-side only
- No data is sent to external servers
- Original files remain on user's device

## Future Enhancements

1. **Advanced OCR**: Better text recognition for scanned PDFs
2. **Form Field Support**: Handle interactive PDF forms
3. **Annotation Tools**: Add comments and markup
4. **Collaboration**: Real-time editing features
5. **Template Library**: Pre-built offer letter templates

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure all dependencies are properly installed
3. Verify PDF.js worker configuration
4. Test with different PDF files to isolate issues

## License

This implementation uses open-source libraries and is designed for professional HR use in offer letter management.
