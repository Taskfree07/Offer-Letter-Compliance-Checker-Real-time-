import React, { useRef, useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { 
  findVariableForBracketedText, 
  extractBracketedPlaceholders,
  debugVariableMatching 
} from '../utils/dynamicPdfVariableReplacer';

// Configure PDF.js worker
try {
  pdfjs.GlobalWorkerOptions.workerSrc = undefined;
  pdfjs.GlobalWorkerOptions.disableWorker = true;
} catch (error) {
  console.error('Failed to disable worker:', error);
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

/**
 * DynamicPDFViewer - Enhanced PDF viewer with dynamic variable replacement
 * This component properly handles any bracketed text in PDFs and replaces
 * them with corresponding variable values in real-time
 */
const DynamicPDFViewer = React.forwardRef(({ 
  pdfBytes, 
  variables = {}, 
  currentPage = 1, 
  onPageChange,
  onVariablesDetected 
}, ref) => {
  const canvasRef = useRef(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState([]);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      const size = (pdfBytes && (pdfBytes.byteLength ?? pdfBytes.length)) || 0;
      console.debug('DynamicPDFViewer: loadPDF start', {
        type: pdfBytes?.constructor?.name,
        byteLength: pdfBytes?.byteLength,
        length: pdfBytes?.length
      });
      if (!pdfBytes || size === 0) {
        console.warn('DynamicPDFViewer: No PDF bytes to load');
        return;
      }

      setIsLoading(true);
      try {
        // Always pass a fresh copy to pdf.js to avoid ArrayBuffer detachment issues
        const dataCopy = pdfBytes instanceof Uint8Array
          ? pdfBytes.slice()
          : (pdfBytes instanceof ArrayBuffer
              ? new Uint8Array(pdfBytes).slice()
              : new Uint8Array(pdfBytes));
        const loadingTask = pdfjs.getDocument({ data: dataCopy });
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        
        // Extract all bracketed placeholders from the PDF
        const allPlaceholders = new Set();
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          textContent.items.forEach(item => {
            if (item.str) {
              const placeholders = extractBracketedPlaceholders(item.str);
              placeholders.forEach(ph => allPlaceholders.add(ph.inner));
            }
          });
        }
        
        const placeholderArray = Array.from(allPlaceholders);
        setDetectedPlaceholders(placeholderArray);
        
        // Notify parent about detected variables
        if (onVariablesDetected && placeholderArray.length > 0) {
          const detectedVars = {};
          placeholderArray.forEach(placeholder => {
            const varKey = placeholder.replace(/\s+/g, '_');
            if (!variables[varKey]) {
              detectedVars[varKey] = '';
            }
          });
          if (Object.keys(detectedVars).length > 0) {
            onVariablesDetected(detectedVars);
          }
        }
        
        console.log('DynamicPDFViewer: PDF loaded successfully', {
          pages: pdf.numPages,
          placeholders: placeholderArray
        });
      } catch (error) {
        console.error('DynamicPDFViewer: Failed to load PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfBytes]);

  // Render PDF page with dynamic variable replacement
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return;

      try {
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / 1.5}px`;
        canvas.style.height = `${viewport.height / 1.5}px`;

        // Render original PDF
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;

        // Apply dynamic text replacement
        await applyDynamicReplacements(page, context, viewport, variables);

        console.log(`DynamicPDFViewer: Page ${currentPage} rendered with ${Object.keys(variables).length} variables`);
      } catch (error) {
        console.error('DynamicPDFViewer: Error rendering page:', error);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, variables]);

  // Apply dynamic text replacement to the rendered PDF
  const applyDynamicReplacements = async (page, context, viewport, variables) => {
    try {
      const textContent = await page.getTextContent();
      
      console.log('DynamicPDFViewer: Processing text replacements', {
        items: textContent.items.length,
        variables: Object.keys(variables)
      });

      // Process each text item
      textContent.items.forEach((item) => {
        if (!item.str || !item.str.includes('[')) return;

        const transform = pdfjs.Util.transform(viewport.transform, item.transform);
        const placeholders = extractBracketedPlaceholders(item.str);
        
        if (placeholders.length === 0) return;

        // Setup context for this text item
        context.save();
        context.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
        context.transform(1, 0, 0, -1, 0, 0);
        context.font = `1px Arial, sans-serif`;
        context.textBaseline = 'alphabetic';

        // Process each placeholder in this text item
        placeholders.forEach(placeholder => {
          const value = findVariableForBracketedText(placeholder.inner, variables);
          
          if (value !== null && value !== undefined && value !== '') {
            // Calculate position of the placeholder
            const beforeText = item.str.substring(0, placeholder.position);
            const xOffset = context.measureText(beforeText).width;
            
            // Clear the placeholder text (punch out)
            const prevOp = context.globalCompositeOperation;
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = '#000';
            context.fillText(placeholder.full, xOffset, 0);
            context.globalCompositeOperation = prevOp;
            
            // Draw the replacement value
            context.fillStyle = '#000';
            context.fillText(String(value), xOffset, 0);
            
            console.log(`Replaced [${placeholder.inner}] with "${value}"`);
          }
        });

        context.restore();
      });

      // Handle placeholders split across multiple text items
      await handleSplitPlaceholders(textContent.items, context, viewport, variables);
      
    } catch (error) {
      console.error('DynamicPDFViewer: Error in text replacement:', error);
    }
  };

  // Handle placeholders that are split across multiple text items
  const handleSplitPlaceholders = async (items, context, viewport, variables) => {
    for (let i = 0; i < items.length; i++) {
      const text = items[i].str || '';
      
      // Look for opening bracket
      if (text.includes('[') && !text.includes(']')) {
        let fullText = text;
        let j = i + 1;
        
        // Accumulate text until closing bracket
        while (j < items.length && !fullText.includes(']')) {
          fullText += items[j].str || '';
          j++;
        }
        
        // Extract and process placeholders from accumulated text
        const placeholders = extractBracketedPlaceholders(fullText);
        
        placeholders.forEach(placeholder => {
          const value = findVariableForBracketedText(placeholder.inner, variables);
          
          if (value !== null && value !== undefined && value !== '') {
            // This is a split placeholder - handle it
            console.log(`Found split placeholder: [${placeholder.inner}] => ${value}`);
            
            // Clear the split segments
            for (let k = i; k < j; k++) {
              const item = items[k];
              const transform = pdfjs.Util.transform(viewport.transform, item.transform);
              
              context.save();
              context.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
              context.transform(1, 0, 0, -1, 0, 0);
              context.font = `1px Arial, sans-serif`;
              context.textBaseline = 'alphabetic';
              
              // Determine what part of the placeholder is in this item
              const itemText = item.str || '';
              if (k === i || k === j - 1 || itemText.includes('[') || itemText.includes(']')) {
                // Clear parts that are part of the placeholder
                const prevOp = context.globalCompositeOperation;
                context.globalCompositeOperation = 'destination-out';
                context.fillStyle = '#000';
                context.fillText(itemText, 0, 0);
                context.globalCompositeOperation = prevOp;
              }
              
              context.restore();
            }
            
            // Draw the replacement value at the first item's position
            const firstItem = items[i];
            const transform = pdfjs.Util.transform(viewport.transform, firstItem.transform);
            
            context.save();
            context.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
            context.transform(1, 0, 0, -1, 0, 0);
            context.font = `1px Arial, sans-serif`;
            context.textBaseline = 'alphabetic';
            context.fillStyle = '#000';
            
            // Find where the bracket starts in the first item
            const bracketPos = text.indexOf('[');
            const beforeBracket = text.substring(0, bracketPos);
            const xOffset = context.measureText(beforeBracket).width;
            
            context.fillText(String(value), xOffset, 0);
            context.restore();
          }
        });
        
        // Skip processed items
        i = j - 1;
      }
    }
  };

  // Export PDF with replacements
  const exportPDF = async () => {
    if (!pdfBytes) {
      throw new Error('No PDF loaded');
    }

    try {
      // Load original PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Process each page
      for (let pageNum = 0; pageNum < pages.length; pageNum++) {
        const page = pages[pageNum];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Load page with pdfjs to get text positions (clone bytes to avoid detachment)
        const dataCopy2 = pdfBytes instanceof Uint8Array
          ? pdfBytes.slice()
          : (pdfBytes instanceof ArrayBuffer
              ? new Uint8Array(pdfBytes).slice()
              : new Uint8Array(pdfBytes));
        const pdfjsDoc = await pdfjs.getDocument({ data: dataCopy2 }).promise;
        const pdfjsPage = await pdfjsDoc.getPage(pageNum + 1);
        const textContent = await pdfjsPage.getTextContent();
        
        // Process text items
        textContent.items.forEach(item => {
          if (!item.str || !item.str.includes('[')) return;
          
          const placeholders = extractBracketedPlaceholders(item.str);
          
          placeholders.forEach(placeholder => {
            const value = findVariableForBracketedText(placeholder.inner, variables);
            
            if (value !== null && value !== undefined && value !== '') {
              // Get position from transform matrix
              const x = item.transform[4];
              const y = pageHeight - item.transform[5];
              
              // Clear area (white rectangle)
              page.drawRectangle({
                x: x - 2,
                y: y - 2,
                width: 100, // Approximate width
                height: item.height || 12,
                color: rgb(1, 1, 1),
              });
              
              // Draw replacement text
              page.drawText(String(value), {
                x: x,
                y: y,
                size: item.height || 10,
                font: helvetica,
                color: rgb(0, 0, 0),
              });
            }
          });
        });
      }

      // Save and return PDF bytes
      const pdfBytesOutput = await pdfDoc.save();
      return pdfBytesOutput;
    } catch (error) {
      console.error('DynamicPDFViewer: Error exporting PDF:', error);
      throw error;
    }
  };

  // Expose export function to parent
  React.useImperativeHandle(ref, () => ({
    exportPDF,
    getDetectedPlaceholders: () => detectedPlaceholders,
    debugVariables: () => {
      console.log('=== Current Variables ===');
      console.log('Variables:', variables);
      console.log('Detected Placeholders:', detectedPlaceholders);
      detectedPlaceholders.forEach(ph => {
        const value = findVariableForBracketedText(ph, variables);
        console.log(`  [${ph}] => ${value || 'NO VALUE'}`);
      });
    }
  }), [pdfBytes, variables, detectedPlaceholders]);

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
      </div>
    );
  }

  return (
    <div className="dynamic-pdf-viewer">
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
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#f0f0f0', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong>
          <div>Variables: {Object.keys(variables).join(', ')}</div>
          <div>Placeholders: {detectedPlaceholders.join(', ')}</div>
        </div>
      )}
    </div>
  );
});

export default DynamicPDFViewer;
