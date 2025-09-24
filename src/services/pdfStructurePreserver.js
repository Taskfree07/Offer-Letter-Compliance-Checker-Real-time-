import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

class PDFStructurePreserver {
  constructor() {
    this.originalPdfBytes = null;
    this.textElements = new Map(); // Store text elements by page
    this.variablePositions = new Map(); // Store variable positions
    this.pageStructures = new Map(); // Store page structures
  }

  async loadPDF(arrayBuffer) {
    try {
      this.originalPdfBytes = arrayBuffer;
      const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      // Extract structure from all pages
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        await this.extractPageStructure(pdfDocument, pageNum);
      }
      
      return {
        success: true,
        numPages: pdfDocument.numPages,
        variablePositions: this.variablePositions
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      return { success: false, error: error.message };
    }
  }

  async extractPageStructure(pdfDocument, pageNumber) {
    try {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 });
      const textContent = await page.getTextContent();
      
      const textElements = [];
      const variableElements = [];
      
      textContent.items.forEach((item, index) => {
        if (!item.str || !item.str.trim()) return;

        const transform = item.transform;
        const x = transform[4];
        const y = viewport.height - transform[5]; // Flip Y coordinate
        const fontSize = Math.abs(transform[0]);
        const fontName = item.fontName || 'Arial';
        
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
          pageNumber: pageNumber
        };

        textElements.push(textElement);

        // Check if this text contains variables (patterns like [Variable Name] or {{Variable}})
        const variableMatches = item.str.match(/\[([^\]]+)\]|\{\{([^}]+)\}\}/g);
        if (variableMatches) {
          variableMatches.forEach(match => {
            const variableName = match.replace(/[\[\]{}]/g, '').trim();
            if (variableName) {
              variableElements.push({
                ...textElement,
                variableName: variableName,
                originalText: item.str,
                variablePattern: match
              });
            }
          });
        }
      });

      // Store structures
      this.textElements.set(pageNumber, textElements);
      this.variablePositions.set(pageNumber, variableElements);
      this.pageStructures.set(pageNumber, { viewport, textElements, variableElements });
      
      return { textElements, variableElements, viewport };
    } catch (error) {
      console.error('Error extracting page structure:', error);
      throw error;
    }
  }

  async renderPageWithVariables(pageNumber, variables = {}, canvas) {
    if (!this.originalPdfBytes) {
      throw new Error('No PDF loaded');
    }

    try {
      const pdfDocument = await pdfjs.getDocument({ data: this.originalPdfBytes }).promise;
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 });
      const context = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / 2}px`;
      canvas.style.height = `${viewport.height / 2}px`;

      // Render original PDF as background
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;

      // Get variable positions for this page
      const variableElements = this.variablePositions.get(pageNumber) || [];
      
      // Overlay updated text for variables
      variableElements.forEach(element => {
        const variableValue = variables[element.variableName];
        if (variableValue !== undefined) {
          // Clear the original text area (approximate)
          context.fillStyle = 'white';
          context.fillRect(
            element.x - 2, 
            element.y - element.fontSize - 2, 
            element.width + 4, 
            element.fontSize + 4
          );

          // Draw updated text
          context.fillStyle = 'black';
          context.font = `${element.fontSize}px ${this.getFontFamily(element.fontName)}`;
          context.textBaseline = 'bottom';
          
          // Replace variable in original text
          const updatedText = element.originalText.replace(
            element.variablePattern, 
            variableValue
          );
          
          context.fillText(updatedText, element.x, element.y);
        }
      });

      return {
        width: viewport.width / 2,
        height: viewport.height / 2
      };
    } catch (error) {
      console.error('Error rendering page with variables:', error);
      throw error;
    }
  }

  getFontFamily(pdfFontName) {
    // Map PDF font names to web-safe fonts
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
  }

  extractVariablesFromText(text) {
    const variables = {};
    const variableMatches = text.match(/\[([^\]]+)\]|\{\{([^}]+)\}\}/g) || [];
    
    variableMatches.forEach(match => {
      const variableName = match.replace(/[\[\]{}]/g, '').trim();
      if (variableName) {
        variables[variableName] = '';
      }
    });

    return variables;
  }

  getAllVariables() {
    const allVariables = {};
    
    for (const [pageNumber, variableElements] of this.variablePositions) {
      variableElements.forEach(element => {
        if (element.variableName && !allVariables[element.variableName]) {
          allVariables[element.variableName] = '';
        }
      });
    }

    return allVariables;
  }

  async exportPDFWithVariables(variables = {}) {
    if (!this.originalPdfBytes) {
      throw new Error('No original PDF loaded');
    }

    try {
      // Load original PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(this.originalPdfBytes);
      const pages = pdfDoc.getPages();

      // Embed fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      // Process each page
      for (let pageNum = 1; pageNum <= pages.length; pageNum++) {
        const page = pages[pageNum - 1];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const variableElements = this.variablePositions.get(pageNum) || [];

        variableElements.forEach(element => {
          const variableValue = variables[element.variableName];
          if (variableValue !== undefined) {
            // Convert coordinates from canvas to PDF space
            const pdfX = element.x;
            const pdfY = pageHeight - element.y;

            // Choose appropriate font
            let font = helvetica;
            if (element.fontName.includes('Bold')) {
              font = helveticaBold;
            } else if (element.fontName.includes('Times')) {
              font = timesRoman;
            }

            // Clear original area (draw white rectangle)
            page.drawRectangle({
              x: pdfX - 2,
              y: pdfY - 2,
              width: element.width + 4,
              height: element.fontSize + 4,
              color: rgb(1, 1, 1), // White
            });

            // Draw updated text
            const updatedText = element.originalText.replace(
              element.variablePattern,
              variableValue
            );

            page.drawText(updatedText, {
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
      console.error('Error exporting PDF with variables:', error);
      throw error;
    }
  }

  // Helper method to detect common variable patterns in text
  detectVariablePatterns(text) {
    const patterns = [
      /\[([^\]]+)\]/g,           // [Variable Name]
      /\{\{([^}]+)\}\}/g,        // {{Variable Name}}
      /\$\{([^}]+)\}/g,          // ${Variable Name}
      /<([^>]+)>/g,              // <Variable Name>
    ];

    const variables = new Set();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        variables.add(match[1].trim());
      }
    });

    return Array.from(variables);
  }

  // Method to suggest variable names based on common offer letter fields
  suggestVariableNames(detectedVariables) {
    const commonMappings = {
      'candidate name': 'candidateName',
      'employee name': 'candidateName',
      'first name': 'firstName',
      'last name': 'lastName',
      'job title': 'jobTitle',
      'position': 'jobTitle',
      'company name': 'companyName',
      'company': 'companyName',
      'salary': 'salary',
      'annual salary': 'salary',
      'start date': 'startDate',
      'starting date': 'startDate',
      'department': 'department',
      'manager': 'manager',
      'supervisor': 'supervisor',
      'location': 'workLocation',
      'office location': 'workLocation'
    };

    const suggestions = {};
    
    detectedVariables.forEach(variable => {
      const lowerVar = variable.toLowerCase();
      const suggestion = commonMappings[lowerVar] || 
                        variable.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      suggestions[variable] = suggestion;
    });

    return suggestions;
  }
}

export default PDFStructurePreserver;
