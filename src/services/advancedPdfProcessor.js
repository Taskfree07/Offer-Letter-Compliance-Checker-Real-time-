import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

class AdvancedPdfProcessor {
  constructor() {
    this.pdfDocument = null;
    this.originalBytes = null;
    this.textElements = new Map(); // Store by page
    this.imageElements = new Map(); // Store by page
  }

  async loadPDF(arrayBuffer) {
    try {
      this.originalBytes = arrayBuffer;
      this.pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      return {
        success: true,
        numPages: this.pdfDocument.numPages,
        document: this.pdfDocument
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      return { success: false, error: error.message };
    }
  }

  async extractPageStructure(pageNumber) {
    if (!this.pdfDocument) {
      throw new Error('No PDF document loaded');
    }

    try {
      const page = await this.pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Extract text with detailed positioning
      const textContent = await page.getTextContent();
      const textElements = this.processTextContent(textContent, viewport);
      
      // Extract images and graphics
      const operatorList = await page.getOperatorList();
      const imageElements = this.processImages(operatorList, viewport);
      
      // Store for this page
      this.textElements.set(pageNumber, textElements);
      this.imageElements.set(pageNumber, imageElements);
      
      return {
        textElements,
        imageElements,
        viewport: {
          width: viewport.width,
          height: viewport.height,
          scale: viewport.scale
        }
      };
    } catch (error) {
      console.error('Error extracting page structure:', error);
      throw error;
    }
  }

  processTextContent(textContent, viewport) {
    const elements = [];
    let currentLine = [];
    let lastY = null;
    const lineThreshold = 5; // pixels

    textContent.items.forEach((item, index) => {
      if (!item.str || !item.str.trim()) return;

      const transform = item.transform;
      const x = transform[4];
      const y = viewport.height - transform[5]; // Flip Y coordinate
      const fontSize = Math.abs(transform[0]);
      const fontName = item.fontName || 'Arial';
      
      // Detect line breaks
      if (lastY !== null && Math.abs(y - lastY) > lineThreshold) {
        if (currentLine.length > 0) {
          elements.push(this.createLineElement(currentLine, viewport));
          currentLine = [];
        }
      }

      const textElement = {
        id: `text_${pageNumber}_${index}`,
        text: item.str,
        x: x,
        y: y,
        fontSize: fontSize,
        fontName: fontName,
        width: item.width || (item.str.length * fontSize * 0.6),
        height: item.height || fontSize,
        transform: transform,
        dir: item.dir || 'ltr',
        hasEOL: item.hasEOL || false,
        original: item
      };

      currentLine.push(textElement);
      lastY = y;
    });

    // Process remaining line
    if (currentLine.length > 0) {
      elements.push(this.createLineElement(currentLine, viewport));
    }

    return elements;
  }

  createLineElement(lineItems, viewport) {
    if (lineItems.length === 0) return null;

    // Calculate line boundaries
    const minX = Math.min(...lineItems.map(item => item.x));
    const maxX = Math.max(...lineItems.map(item => item.x + item.width));
    const avgY = lineItems.reduce((sum, item) => sum + item.y, 0) / lineItems.length;
    const maxHeight = Math.max(...lineItems.map(item => item.height));
    const avgFontSize = lineItems.reduce((sum, item) => sum + item.fontSize, 0) / lineItems.length;

    // Combine text with proper spacing
    let combinedText = '';
    let lastEndX = minX;

    lineItems.forEach((item, index) => {
      if (index > 0) {
        const gap = item.x - lastEndX;
        const spaceWidth = avgFontSize * 0.3; // Approximate space width
        const numSpaces = Math.round(gap / spaceWidth);
        combinedText += ' '.repeat(Math.max(1, numSpaces));
      }
      combinedText += item.text;
      lastEndX = item.x + item.width;
    });

    return {
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'textLine',
      text: combinedText,
      x: minX,
      y: avgY,
      width: maxX - minX,
      height: maxHeight,
      fontSize: avgFontSize,
      fontName: lineItems[0].fontName,
      items: lineItems,
      editable: true
    };
  }

  processImages(operatorList, viewport) {
    const images = [];
    const ops = operatorList.fnArray;
    const args = operatorList.argsArray;

    for (let i = 0; i < ops.length; i++) {
      if (ops[i] === pdfjs.OPS.paintImageXObject || ops[i] === pdfjs.OPS.paintInlineImageXObject) {
        // Extract image positioning information
        const imageArgs = args[i];
        if (imageArgs && imageArgs.length > 0) {
          images.push({
            id: `image_${i}`,
            type: 'image',
            x: 0, // Would need more complex extraction
            y: 0,
            width: 100,
            height: 100,
            args: imageArgs
          });
        }
      }
    }

    return images;
  }

  async renderPageToCanvas(pageNumber, canvas, scale = 1) {
    if (!this.pdfDocument) {
      throw new Error('No PDF document loaded');
    }

    try {
      const page = await this.pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: scale * 2 }); // High DPI
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
      
      return {
        width: viewport.width / 2,
        height: viewport.height / 2,
        scale: scale
      };
    } catch (error) {
      console.error('Error rendering page to canvas:', error);
      throw error;
    }
  }

  async exportEditedPDF(editedElements) {
    if (!this.originalBytes) {
      throw new Error('No original PDF loaded');
    }

    try {
      // Load original PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(this.originalBytes);
      const pages = pdfDoc.getPages();

      // Embed fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Process each page with edits
      for (const [pageNumber, elements] of editedElements.entries()) {
        const page = pages[pageNumber - 1];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Clear existing text (simplified approach)
        // In production, you'd want more sophisticated text removal

        // Add edited text elements
        elements.forEach(element => {
          if (element.type === 'textLine' && element.text) {
            // Convert coordinates from canvas to PDF space
            const pdfX = element.x;
            const pdfY = pageHeight - element.y - element.fontSize;

            // Choose font based on element properties
            let font = helvetica;
            if (element.fontName && element.fontName.toLowerCase().includes('bold')) {
              font = helveticaBold;
            }

            page.drawText(element.text, {
              x: pdfX,
              y: pdfY,
              size: element.fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
        });
      }

      // Generate and return PDF bytes
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('Error exporting edited PDF:', error);
      throw error;
    }
  }

  // Utility method to detect text formatting
  analyzeTextFormatting(textElements) {
    const analysis = {
      fonts: new Set(),
      fontSizes: new Set(),
      colors: new Set(),
      alignments: new Set()
    };

    textElements.forEach(element => {
      if (element.fontName) analysis.fonts.add(element.fontName);
      if (element.fontSize) analysis.fontSizes.add(element.fontSize);
      // Add more analysis as needed
    });

    return {
      fonts: Array.from(analysis.fonts),
      fontSizes: Array.from(analysis.fontSizes).sort((a, b) => a - b),
      colors: Array.from(analysis.colors),
      alignments: Array.from(analysis.alignments)
    };
  }

  // Method to detect table structures
  detectTables(textElements) {
    const tables = [];
    const sortedElements = textElements.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 5) {
        return a.x - b.x; // Same line, sort by x
      }
      return a.y - b.y; // Different lines, sort by y
    });

    // Group elements by approximate Y position (rows)
    const rows = [];
    let currentRow = [];
    let lastY = null;

    sortedElements.forEach(element => {
      if (lastY !== null && Math.abs(element.y - lastY) > 10) {
        if (currentRow.length > 0) {
          rows.push([...currentRow]);
          currentRow = [];
        }
      }
      currentRow.push(element);
      lastY = element.y;
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    // Detect table patterns (simplified)
    if (rows.length >= 2) {
      const columnCount = Math.max(...rows.map(row => row.length));
      if (columnCount >= 2) {
        tables.push({
          id: `table_${Date.now()}`,
          rows: rows,
          columns: columnCount,
          bounds: this.calculateTableBounds(rows)
        });
      }
    }

    return tables;
  }

  calculateTableBounds(rows) {
    const allElements = rows.flat();
    const minX = Math.min(...allElements.map(el => el.x));
    const maxX = Math.max(...allElements.map(el => el.x + el.width));
    const minY = Math.min(...allElements.map(el => el.y));
    const maxY = Math.max(...allElements.map(el => el.y + el.height));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}

export default AdvancedPdfProcessor;
