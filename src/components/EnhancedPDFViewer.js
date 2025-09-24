import React, { useRef, useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configure PDF.js worker - use a more reliable approach
try {
  // Try to disable worker entirely - this often resolves loading issues
  console.log('EnhancedPDFViewer: Attempting to disable PDF.js worker...');
  pdfjs.GlobalWorkerOptions.workerSrc = undefined;
  pdfjs.GlobalWorkerOptions.disableWorker = true;

  console.log('EnhancedPDFViewer: Worker disabled successfully');
} catch (error) {
  console.error('EnhancedPDFViewer: Failed to disable worker:', error);
  try {
    // Fallback: try a specific CDN version
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('EnhancedPDFViewer: Using CDN worker as fallback');
  } catch (error2) {
    console.error('EnhancedPDFViewer: All worker configuration attempts failed:', error2);
  }
}

const EnhancedPDFViewer = React.forwardRef(({ 
  pdfBytes, 
  variables = {}, 
  currentPage = 1, 
  onPageChange,
  onVariablesDetected 
}, ref) => {
  const canvasRef = useRef(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [variablePositions, setVariablePositions] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Debug props
  console.log('EnhancedPDFViewer: Component rendered with props', {
    hasPdfBytes: !!pdfBytes,
    pdfBytesLength: pdfBytes?.byteLength || 0,
    variablesCount: Object.keys(variables).length,
    currentPage
  });

  // Load PDF and extract structure
  useEffect(() => {
    const loadPDF = async () => {
      console.log('EnhancedPDFViewer: loadPDF called', {
        hasPdfBytes: !!pdfBytes,
        pdfBytesLength: pdfBytes?.byteLength || 0
      });

      if (!pdfBytes) {
        console.log('EnhancedPDFViewer: No PDF bytes provided');
        return;
      }

      // Normalize input into Uint8Array for safe cloning
      let pdfByteArray = null;
      if (pdfBytes instanceof Uint8Array) {
        pdfByteArray = pdfBytes;
      } else if (pdfBytes instanceof ArrayBuffer) {
        pdfByteArray = new Uint8Array(pdfBytes);
      } else {
        console.error('EnhancedPDFViewer: Unsupported pdfBytes type:', typeof pdfBytes);
        return;
      }

      if (pdfByteArray.byteLength === 0) {
        console.error('EnhancedPDFViewer: Empty ArrayBuffer - might be detached');
        return;
      }

      // Check PDF signature
      try {
        const signatureBytes = pdfByteArray.subarray(0, 4);
        const firstBytes = new Uint8Array(signatureBytes);
        const signature = String.fromCharCode(...firstBytes);
        console.log('EnhancedPDFViewer: PDF signature check:', signature);

        if (!signature.startsWith('%PDF')) {
          console.error('EnhancedPDFViewer: Invalid PDF signature:', signature);
          return;
        }
      } catch (error) {
        console.error('EnhancedPDFViewer: Error checking PDF signature:', error);
        return;
      }

      setIsLoading(true);
      try {
        console.log('EnhancedPDFViewer: Loading PDF with pdfjs...');
        console.log('EnhancedPDFViewer: Current worker src:', pdfjs.GlobalWorkerOptions.workerSrc);

        // Clone byte array to avoid buffer detachment when pdf.js transfers ownership
        const pdfDataClone = pdfByteArray.slice();
        const pdfDoc = await pdfjs.getDocument({ data: pdfDataClone }).promise;
        console.log('EnhancedPDFViewer: PDF loaded successfully', {
          numPages: pdfDoc.numPages
        });

        setPdfDocument(pdfDoc);
        setTotalPages(pdfDoc.numPages);

        // Extract variables from all pages
        await extractVariablesFromAllPages(pdfDoc);

        if (onPageChange) {
          onPageChange(1, pdfDoc.numPages);
        }
      } catch (error) {
        console.error('EnhancedPDFViewer: Error loading PDF:', error);
        console.error('EnhancedPDFViewer: Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });

        // Try without worker as fallback
        if (error.message.includes('worker') || error.message.includes('Failed to load resource')) {
          console.log('EnhancedPDFViewer: Trying without worker...');
          const originalWorkerSrc = pdfjs.GlobalWorkerOptions.workerSrc;
          try {
            // Disable worker
            pdfjs.GlobalWorkerOptions.workerSrc = undefined;

            const fallbackClone = pdfByteArray.slice();
            const pdfDoc = await pdfjs.getDocument({ data: fallbackClone, disableWorker: true }).promise;
            console.log('EnhancedPDFViewer: PDF loaded without worker successfully', {
              numPages: pdfDoc.numPages
            });

            setPdfDocument(pdfDoc);
            setTotalPages(pdfDoc.numPages);

            // Extract variables from all pages
            await extractVariablesFromAllPages(pdfDoc);

            if (onPageChange) {
              onPageChange(1, pdfDoc.numPages);
            }

            // Restore worker setting
            pdfjs.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
          } catch (fallbackError) {
            console.error('EnhancedPDFViewer: Fallback also failed:', fallbackError);
            // Restore worker setting
            pdfjs.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfBytes]);

  // Extract variables from all pages
  const extractVariablesFromAllPages = async (pdfDoc) => {
    const allVariables = {};
    const allPositions = new Map();

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 2.0 });
        
        const pagePositions = [];
        
        textContent.items.forEach((item, index) => {
          if (!item.str || !item.str.trim()) return;

          // Check for variable patterns: [Name], {{Name}}, ${Name}, <Name>
          const variableMatches = item.str.match(/\[([^\]]+)\]|\{\{([^}]+)\}\}|\$\{([^}]+)\}|<([^>]+)>/g);
          
          if (variableMatches) {
            variableMatches.forEach(match => {
              const variableName = match.replace(/[\[\]{}$<>]/g, '').trim();
              if (variableName) {
                // Store variable
                allVariables[variableName] = '';
                
                // Store position for rendering
                const transform = item.transform;
                const x = transform[4];
                const y = viewport.height - transform[5];
                const fontSize = Math.abs(transform[0]);
                
                pagePositions.push({
                  variableName,
                  originalText: item.str,
                  variablePattern: match,
                  x,
                  y,
                  fontSize,
                  fontName: item.fontName || 'Arial',
                  width: item.width || (item.str.length * fontSize * 0.6),
                  height: item.height || fontSize
                });
              }
            });
          }
        });
        
        allPositions.set(pageNum, pagePositions);
      } catch (error) {
        console.error(`Error extracting variables from page ${pageNum}:`, error);
      }
    }

    setVariablePositions(allPositions);
    
    // Notify parent component about detected variables
    if (onVariablesDetected && Object.keys(allVariables).length > 0) {
      onVariablesDetected(allVariables);
    }
  };

  // Render PDF page with variable overlays
  useEffect(() => {
    const renderPage = async () => {
      console.log('EnhancedPDFViewer: renderPage called', {
        hasPdfDocument: !!pdfDocument,
        hasCanvas: !!canvasRef.current,
        currentPage
      });
      
      if (!pdfDocument || !canvasRef.current) {
        console.log('EnhancedPDFViewer: Missing requirements for rendering');
        return;
      }

      try {
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions for high DPI
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / 2}px`;
        canvas.style.height = `${viewport.height / 2}px`;

        // Render original PDF
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;

        // Overlay variable substitutions
        const pageVariables = variablePositions.get(currentPage) || [];
        pageVariables.forEach(varInfo => {
          const variableValue = variables[varInfo.variableName];
          if (variableValue !== undefined && variableValue !== '') {
            // Clear original text area
            context.fillStyle = 'white';
            context.fillRect(
              varInfo.x - 2,
              varInfo.y - varInfo.fontSize - 2,
              varInfo.width + 4,
              varInfo.fontSize + 4
            );

            // Draw updated text
            context.fillStyle = 'black';
            context.font = `${varInfo.fontSize}px ${getFontFamily(varInfo.fontName)}`;
            context.textBaseline = 'bottom';
            
            // Replace variable in original text
            const updatedText = varInfo.originalText.replace(
              varInfo.variablePattern,
              variableValue
            );
            
            context.fillText(updatedText, varInfo.x, varInfo.y);
          }
        });

      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, variables, variablePositions]);

  // Map PDF font names to web-safe fonts
  const getFontFamily = (pdfFontName) => {
    const fontMap = {
      'Times': 'Times, serif',
      'TimesRoman': 'Times, serif',
      'Times-Roman': 'Times, serif',
      'Times-Bold': 'Times, serif',
      'Times-Italic': 'Times, serif',
      'Helvetica': 'Arial, sans-serif',
      'Helvetica-Bold': 'Arial, sans-serif',
      'Helvetica-Oblique': 'Arial, sans-serif',
      'Arial': 'Arial, sans-serif',
      'Arial-Bold': 'Arial, sans-serif',
      'Courier': 'Courier New, monospace'
    };
    return fontMap[pdfFontName] || 'Arial, sans-serif';
  };

  // Export PDF with variable substitutions
  const exportPDF = async () => {
    if (!pdfBytes) {
      throw new Error('No PDF loaded');
    }

    try {
      // Load original PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      // Embed fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      // Process each page
      for (let pageNum = 1; pageNum <= pages.length; pageNum++) {
        const page = pages[pageNum - 1];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const pageVariables = variablePositions.get(pageNum) || [];

        pageVariables.forEach(varInfo => {
          const variableValue = variables[varInfo.variableName];
          if (variableValue !== undefined && variableValue !== '') {
            // Convert coordinates from canvas to PDF space
            const pdfX = varInfo.x / 2; // Scale down from high DPI
            const pdfY = pageHeight - (varInfo.y / 2);

            // Choose appropriate font
            let font = helvetica;
            if (varInfo.fontName.includes('Bold')) {
              font = helveticaBold;
            } else if (varInfo.fontName.includes('Times')) {
              font = timesRoman;
            }

            // Clear original area
            page.drawRectangle({
              x: pdfX - 2,
              y: pdfY - 2,
              width: (varInfo.width / 2) + 4,
              height: (varInfo.fontSize / 2) + 4,
              color: rgb(1, 1, 1), // White
            });

            // Draw updated text
            const updatedText = varInfo.originalText.replace(
              varInfo.variablePattern,
              variableValue
            );

            page.drawText(updatedText, {
              x: pdfX,
              y: pdfY,
              size: varInfo.fontSize / 2,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
        });
      }

      // Generate and return PDF bytes
      const pdfBytesOutput = await pdfDoc.save();
      return pdfBytesOutput;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  };

  // Expose export function to parent
  React.useImperativeHandle(ref, () => ({
    exportPDF
  }), [pdfBytes, variables, variablePositions]);

  if (isLoading) {
    return (
      <div className="pdf-loading">
        <div className="spinner"></div>
        <p>Loading PDF...</p>
      </div>
    );
  }

  if (!pdfDocument) {
    return (
      <div className="pdf-placeholder">
        <p>No PDF loaded</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Debug: pdfBytes={!!pdfBytes}, loading={isLoading}
        </p>
      </div>
    );
  }

  return (
    <div className="enhanced-pdf-viewer">
      <canvas
        ref={canvasRef}
        className="pdf-canvas-enhanced"
        style={{
          maxWidth: '100%',
          height: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
      {totalPages > 1 && (
        <div className="page-navigation">
          <button
            onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1), totalPages)}
            disabled={currentPage <= 1}
            className="btn btn-sm"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1), totalPages)}
            disabled={currentPage >= totalPages}
            className="btn btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
});

export default EnhancedPDFViewer;
