import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Upload, Download, Edit3, Save, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import './StructuralPDFEditor.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StructuralPDFEditor = () => {
  // Core state
  const [pdfDocument, setPdfDocument] = useState(null);
  const [originalPdfBytes, setOriginalPdfBytes] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Editor state
  const [isEditMode, setIsEditMode] = useState(false);
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(1);
  
  // Canvas and fabric references
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Initialize Fabric.js canvas for editing
  useEffect(() => {
    if (canvasRef.current && isEditMode && !fabricCanvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 1000,
        backgroundColor: 'white',
        selection: true,
        preserveObjectStacking: true
      });
      
      fabricCanvasRef.current = fabricCanvas;
      
      // Handle text selection
      fabricCanvas.on('selection:created', (e) => {
        if (e.selected[0] && e.selected[0].type === 'textbox') {
          setSelectedElement(e.selected[0]);
        }
      });
      
      fabricCanvas.on('selection:cleared', () => {
        setSelectedElement(null);
      });
      
      return () => {
        fabricCanvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, [isEditMode]);

  // Extract text with precise positioning from PDF
  const extractTextWithPositions = async (page) => {
    try {
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 2 }); // High resolution for accuracy
      
      const textElements = [];
      
      for (const item of textContent.items) {
        if (item.str && item.str.trim()) {
          // Calculate precise positioning
          const transform = item.transform;
          const x = transform[4];
          const y = viewport.height - transform[5]; // Flip Y coordinate
          const fontSize = Math.abs(transform[0]); // Font size from transform matrix
          
          textElements.push({
            id: `text_${textElements.length}`,
            text: item.str,
            x: x * (zoom || 1),
            y: y * (zoom || 1),
            fontSize: fontSize * (zoom || 1),
            fontFamily: item.fontName || 'Arial',
            width: item.width * (zoom || 1),
            height: item.height * (zoom || 1),
            original: { ...item, viewport }
          });
        }
      }
      
      return textElements;
    } catch (error) {
      console.error('Error extracting text positions:', error);
      return [];
    }
  };

  // Render PDF page as background image
  const renderPDFPage = async (page, canvas) => {
    try {
      const viewport = page.getViewport({ scale: zoom * 2 }); // High DPI
      const context = canvas.getContext('2d');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / 2}px`;
      canvas.style.height = `${viewport.height / 2}px`;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      return { width: viewport.width / 2, height: viewport.height / 2 };
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw error;
    }
  };

  // Load and process PDF file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setOriginalPdfBytes(arrayBuffer);
      
      // Load with PDF.js for text extraction and rendering
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDocument(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);
      
      // Process first page
      await processPage(pdfDoc, 1);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      setError('Failed to load PDF: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Process a specific page
  const processPage = async (pdfDoc, pageNum) => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      
      if (isEditMode && fabricCanvasRef.current) {
        // Clear existing content
        fabricCanvasRef.current.clear();
        
        // Render PDF as background
        const backgroundCanvas = document.createElement('canvas');
        const dimensions = await renderPDFPage(page, backgroundCanvas);
        
        // Set fabric canvas size
        fabricCanvasRef.current.setDimensions({
          width: dimensions.width,
          height: dimensions.height
        });
        
        // Add PDF as background image
        const backgroundImage = new fabric.Image(backgroundCanvas, {
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          opacity: 0.8 // Slightly transparent to see text overlays
        });
        
        fabricCanvasRef.current.add(backgroundImage);
        fabricCanvasRef.current.sendToBack(backgroundImage);
        
        // Extract and add editable text elements
        const texts = await extractTextWithPositions(page);
        setTextElements(texts);
        
        // Add text elements to fabric canvas
        texts.forEach((textEl) => {
          const fabricText = new fabric.Textbox(textEl.text, {
            left: textEl.x,
            top: textEl.y,
            fontSize: textEl.fontSize,
            fontFamily: textEl.fontFamily,
            fill: 'black',
            // Make textbox fully transparent to avoid any background box overlap
            backgroundColor: 'transparent',
            textBackgroundColor: '',
            // Hide borders by default to prevent visual boxes
            borderColor: 'transparent',
            strokeWidth: 0,
            cornerColor: '#3b82f6',
            cornerSize: 6,
            transparentCorners: true,
            padding: 0,
            lineHeight: 1.0,
            width: textEl.width,
            textAlign: 'left',
            id: textEl.id
          });
          
          fabricCanvasRef.current.add(fabricText);
        });
        
        fabricCanvasRef.current.renderAll();
      } else {
        // Regular view mode - render to display canvas
        if (canvasRef.current) {
          await renderPDFPage(page, canvasRef.current);
        }
      }
    } catch (error) {
      console.error('Error processing page:', error);
      setError('Failed to process page: ' + error.message);
    }
  };

  // Toggle edit mode
  const toggleEditMode = useCallback(async () => {
    if (!pdfDocument) return;
    
    setIsEditMode(!isEditMode);
    
    // Re-process current page with new mode
    setTimeout(() => {
      processPage(pdfDocument, currentPage);
    }, 100);
  }, [pdfDocument, currentPage, isEditMode]);

  // Navigate pages
  const goToPage = useCallback(async (pageNum) => {
    if (!pdfDocument || pageNum < 1 || pageNum > totalPages) return;
    
    setCurrentPage(pageNum);
    await processPage(pdfDocument, pageNum);
  }, [pdfDocument, totalPages]);

  // Export edited PDF
  const exportPDF = async () => {
    if (!originalPdfBytes || !fabricCanvasRef.current) {
      setError('No PDF loaded or not in edit mode');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create new PDF document
      const pdfDoc = await PDFDocument.load(originalPdfBytes);
      const pages = pdfDoc.getPages();
      const currentPdfPage = pages[currentPage - 1];
      
      // Get edited text elements from fabric canvas
      const objects = fabricCanvasRef.current.getObjects();
      const textObjects = objects.filter(obj => obj.type === 'textbox');
      
      // Clear existing text (this is simplified - in production you'd want more sophisticated text replacement)
      // For now, we'll overlay new text on top
      
      // Embed font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Add edited text to PDF
      textObjects.forEach((textObj) => {
        const { left, top, fontSize, text } = textObj;
        const { width: pageWidth, height: pageHeight } = currentPdfPage.getSize();
        
        // Convert fabric coordinates to PDF coordinates
        const pdfX = left;
        const pdfY = pageHeight - top - fontSize; // Flip Y coordinate
        
        currentPdfPage.drawText(text || '', {
          x: pdfX,
          y: pdfY,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      });
      
      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited-offer-letter.pdf';
      a.click();
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export PDF: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Zoom controls
  const handleZoom = (delta) => {
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    setZoom(newZoom);
    if (pdfDocument) {
      processPage(pdfDocument, currentPage);
    }
  };

  // Reset to original
  const resetToOriginal = () => {
    if (pdfDocument) {
      processPage(pdfDocument, currentPage);
    }
  };

  return (
    <div className="structural-pdf-editor">
      <div className="editor-header">
        <h2>Structure-Preserving PDF Editor</h2>
        <div className="editor-controls">
          <label className="upload-btn">
            <Upload size={16} />
            Import PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          
          {pdfDocument && (
            <>
              <button
                className={`btn ${isEditMode ? 'btn-primary' : 'btn-secondary'}`}
                onClick={toggleEditMode}
                disabled={isLoading}
              >
                <Edit3 size={16} />
                {isEditMode ? 'View Mode' : 'Edit Mode'}
              </button>
              
              {isEditMode && (
                <>
                  <button className="btn btn-secondary" onClick={resetToOriginal}>
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  
                  <button className="btn btn-primary" onClick={exportPDF}>
                    <Save size={16} />
                    Export PDF
                  </button>
                </>
              )}
              
              <div className="zoom-controls">
                <button className="btn btn-sm" onClick={() => handleZoom(-0.25)}>
                  <ZoomOut size={14} />
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button className="btn btn-sm" onClick={() => handleZoom(0.25)}>
                  <ZoomIn size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing PDF...</p>
        </div>
      )}

      <div className="editor-content" ref={containerRef}>
        {pdfDocument && (
          <div className="page-navigation">
            <button
              className="btn btn-sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        )}

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            className={`pdf-canvas ${isEditMode ? 'edit-mode' : 'view-mode'}`}
            style={{ display: isEditMode ? 'none' : 'block' }}
          />
          
          {isEditMode && (
            <canvas
              ref={canvasRef}
              className="fabric-canvas"
            />
          )}
        </div>

        {isEditMode && selectedElement && (
          <div className="text-editor-panel">
            <h3>Edit Text</h3>
            <textarea
              value={selectedElement.text || ''}
              onChange={(e) => {
                selectedElement.set('text', e.target.value);
                fabricCanvasRef.current.renderAll();
              }}
              placeholder="Edit text content..."
              rows={4}
            />
            <div className="text-formatting">
              <label>
                Font Size:
                <input
                  type="number"
                  value={selectedElement.fontSize || 12}
                  onChange={(e) => {
                    selectedElement.set('fontSize', parseInt(e.target.value));
                    fabricCanvasRef.current.renderAll();
                  }}
                  min="8"
                  max="72"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {!pdfDocument && !isLoading && (
        <div className="upload-prompt">
          <div className="upload-area">
            <Upload size={48} />
            <h3>Import Your Offer Letter PDF</h3>
            <p>Upload a PDF to preserve its exact structure while making text editable</p>
            <label className="upload-btn-large">
              Choose PDF File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructuralPDFEditor;
