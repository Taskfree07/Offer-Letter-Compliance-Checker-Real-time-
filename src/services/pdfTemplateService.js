import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

class PDFTemplateService {
  constructor() {
    this.templatePdf = null;
    this.contentArea = null;
    this.headerHeight = 0;
    this.footerHeight = 0;
    this.pageMargins = {
      top: 72,    // 1 inch
      bottom: 72, // 1 inch  
      left: 72,   // 1 inch
      right: 72   // 1 inch
    };
  }

  async loadTemplate(pdfFile = '/letterhead.pdf') {
    try {
      let pdfBytes;
      if (typeof pdfFile === 'string') {
        // Load from URL (default letterhead)
        // Resolve against current origin to handle base paths
        const resolvedUrl = pdfFile.startsWith('http')
          ? pdfFile
          : `${window.location.origin}${pdfFile.startsWith('/') ? '' : '/'}${pdfFile}`;
        let response = await fetch(resolvedUrl);
        if (!response.ok) {
          // Fallback attempt: try raw path in case origin resolution fails in specific hosts
          response = await fetch(pdfFile).catch(() => null);
        }
        if (!response || !response.ok) {
          throw new Error(`Failed to fetch PDF template from ${resolvedUrl}`);
        }
        pdfBytes = await response.arrayBuffer();
      } else {
        // Load from File object
        pdfBytes = await pdfFile.arrayBuffer();
      }
      
      this.templatePdf = await PDFDocument.load(pdfBytes);
      
      // Register fontkit for custom font support
      this.templatePdf.registerFontkit(fontkit);
      
      // Analyze the template to determine professional content area
      await this.analyzeTemplateForProfessionalLayout();
      
      console.log('PDF template loaded successfully with professional layout');
      return true;
    } catch (error) {
      console.error('Failed to load PDF template:', error);
      throw new Error(`Template loading failed: ${error.message}`);
    }
  }

  async analyzeTemplateForProfessionalLayout() {
    if (!this.templatePdf) {
      throw new Error('Template not loaded');
    }

    const pages = this.templatePdf.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    console.log('Page dimensions:', { width, height });

    // Professional content area calculation
    // Adjusted for HR letterheads: more generous header/footer and side margins
    // - Top margin: 26% of page (room for tall letterhead graphics)
    // - Bottom margin: 15% of page (room for footer/signature)
    // - Side margins: 10% of page width each (professional appearance)
    // Also enforce minimum pixel margins to prevent slight overlaps on atypical sizes.
    const topMarginPercent = 0.26;    // 26% from top for letterhead
    const bottomMarginPercent = 0.15; // 15% from bottom for footer
    const sideMarginPercent = 0.10;   // 10% from each side

    // Calculate margins and enforce a minimum pixel margin (2 inches ~ 144pt for header, 1.2 inches ~ 86pt for footer)
    const minTopPx = 170;   // ~2.36 inches safety for letterhead
    const minBottomPx = 86; // ~1.2 inches safety for signature/footer
    const minSidePx = 54;   // ~0.75 inch side margins

    const topMargin = Math.max(height * topMarginPercent, minTopPx);
    const bottomMargin = Math.max(height * bottomMarginPercent, minBottomPx);
    const leftMargin = Math.max(width * sideMarginPercent, minSidePx);
    const rightMargin = Math.max(width * sideMarginPercent, minSidePx);

    // Calculate content area with professional spacing
    const contentWidth = width - leftMargin - rightMargin;
    const contentHeight = height - topMargin - bottomMargin;

    // In PDF coordinates, y=0 is at the bottom
    const contentY = bottomMargin;
    const contentX = leftMargin;

    this.contentArea = {
      x: contentX,
      y: contentY,
      width: contentWidth,
      height: contentHeight
    };

    // Store margins for reference
    this.pageMargins = {
      top: topMargin,
      bottom: bottomMargin,
      left: leftMargin,
      right: rightMargin
    };

    console.log('Professional PDF Layout Analysis:', {
      pageSize: { width: Math.round(width), height: Math.round(height) },
      contentArea: {
        x: Math.round(contentX),
        y: Math.round(contentY),
        width: Math.round(contentWidth),
        height: Math.round(contentHeight)
      },
      margins: {
        top: Math.round(topMargin),
        bottom: Math.round(bottomMargin),
        left: Math.round(leftMargin),
        right: Math.round(rightMargin)
      },
      contentAreaPercentage: {
        topStart: `${Math.round(topMarginPercent * 100)}%`,
        bottomEnd: `${Math.round((1 - bottomMarginPercent) * 100)}%`,
        leftStart: `${Math.round(sideMarginPercent * 100)}%`,
        rightEnd: `${Math.round((1 - sideMarginPercent) * 100)}%`
      }
    });
  }

  async generatePDF(htmlContent, variables = {}, stateBlocks = {}, selectedState = 'CA') {
    if (!this.templatePdf) {
      throw new Error('Template not loaded');
    }

    // Process content with variables and state-specific blocks
    let processedContent = this.processContentVariables(htmlContent, variables);
    processedContent = this.removeStateSpecificBlocks(processedContent, stateBlocks, selectedState);

    // Convert HTML to professionally formatted text
    const formattedText = this.convertHtmlToFormattedText(processedContent);
    
    // Split text into pages with professional formatting
    const textPages = await this.splitTextIntoProfessionalPages(formattedText);
    
    // Create new PDF document
    const newPdf = await PDFDocument.create();
    
    // Embed professional fonts with proper error handling
    let timesFont, timesBoldFont, timesItalicFont;
    
    try {
      timesFont = await newPdf.embedFont(StandardFonts.TimesRoman);
    } catch (error) {
      console.warn('Failed to embed TimesRoman, using Helvetica:', error);
      timesFont = await newPdf.embedFont(StandardFonts.Helvetica);
    }
    
    try {
      // Some pdf-lib versions expose TimesRomanBold instead of TimesBold
      const timesBoldKey = StandardFonts.TimesRomanBold || StandardFonts.TimesBold;
      timesBoldFont = await newPdf.embedFont(timesBoldKey);
    } catch (error) {
      console.warn('Failed to embed TimesBold, using HelveticaBold:', error);
      timesBoldFont = await newPdf.embedFont(StandardFonts.HelveticaBold);
    }
    
    try {
      // Some pdf-lib versions expose TimesRomanItalic instead of TimesItalic
      const timesItalicKey = StandardFonts.TimesRomanItalic || StandardFonts.TimesItalic;
      timesItalicFont = await newPdf.embedFont(timesItalicKey);
    } catch (error) {
      console.warn('Failed to embed TimesItalic, using HelveticaOblique:', error);
      timesItalicFont = await newPdf.embedFont(StandardFonts.HelveticaOblique);
    }
    
    console.log('Fonts embedded successfully:', {
      regular: timesFont ? 'loaded' : 'failed',
      bold: timesBoldFont ? 'loaded' : 'failed',
      italic: timesItalicFont ? 'loaded' : 'failed'
    });
    
    // Process each page of text
    for (let i = 0; i < textPages.length; i++) {
      const textLines = textPages[i];
      
      // Clone the template page
      const [templatePage] = await newPdf.copyPages(this.templatePdf, [0]);
      const newPage = newPdf.addPage(templatePage);
      
      // Add professionally formatted text to the page
      await this.addProfessionalTextToPage(newPage, textLines, {
        regular: timesFont,
        bold: timesBoldFont,
        italic: timesItalicFont
      });
    }

    return await newPdf.save();
  }

  processContentVariables(content, variables) {
    let processedContent = content;
    
    // Replace variables with proper error handling
    for (const [key, value] of Object.entries(variables)) {
      try {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\[${escapedKey}\\]`, 'g');
        processedContent = processedContent.replace(regex, value || `[${key}]`);
      } catch (error) {
        console.warn(`Error processing variable ${key}:`, error);
      }
    }
    
    return processedContent;
  }

  removeStateSpecificBlocks(htmlContent, stateBlocks, selectedState) {
    let processedHtml = htmlContent;
    
    // Remove text blocks that should be excluded for the selected state
    for (const block of Object.values(stateBlocks)) {
      if (block.excludedStates && block.excludedStates.includes(selectedState)) {
        try {
          const escapedText = block.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedText, 'g');
          processedHtml = processedHtml.replace(regex, '');
        } catch (error) {
          console.warn('Error removing state-specific block:', error);
        }
      }
    }
    
    return processedHtml;
  }

  convertHtmlToFormattedText(html) {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    let text = '';
    
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return this.cleanSpecialCharacters(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        let content = '';
        
        // Process child nodes
        for (const child of node.childNodes) {
          content += processNode(child);
        }
        
        // Handle different HTML elements with professional formatting
        switch (tagName) {
          case 'p':
            return content.trim() + '\n\n'; // Double line break for paragraphs
          case 'div':
            return content.trim() + '\n';
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return content.trim() + '\n\n'; // Headers get extra spacing
          case 'br':
            return '\n';
          case 'li':
            return '• ' + content.trim() + '\n';
          case 'ul':
          case 'ol':
            return '\n' + content + '\n';
          case 'strong':
          case 'b':
            return `**${content}**`; // Markdown-style bold for processing
          case 'em':
          case 'i':
            return `*${content}*`; // Markdown-style italic for processing
          default:
            return content;
        }
      }
      return '';
    };
    
    text = processNode(tempDiv);
    
    // Clean up excessive whitespace while preserving intentional formatting
    text = text.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive line breaks
    text = text.replace(/[ \t]+/g, ' '); // Multiple spaces become single space
    text = text.trim();
    
    return text;
  }

  cleanSpecialCharacters(text) {
    if (!text) return text;
    
    // Enhanced character replacement for professional documents
    const replacements = {
      // Smart quotes
      '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
      
      // Dashes
      '\u2013': '-', '\u2014': '—', '\u2015': '—',
      
      // Bullets and symbols
      '\u2022': '•', '\u25CF': '•', '\u2023': '>', '\u2043': '-',
      '\u204C': '*', '\u204D': '*', '\u25E6': '°', '\u2219': '*',
      '\uF0B7': '•',
      
      // Other symbols
      '\u2026': '...', '\u00A0': ' ', '\u2009': ' ', '\u200A': ' ',
      '\u2028': '\n', '\u2029': '\n\n',
      '\u00B0': '°', '\u00A9': '©', '\u00AE': '®', '\u2122': '™',
      '\u00B1': '±', '\u00D7': '×', '\u00F7': '÷',
      
      // Fractions
      '\u00BC': '¼', '\u00BD': '½', '\u00BE': '¾',
      '\u2153': '⅓', '\u2154': '⅔',
      
      // Arrows
      '\u2190': '←', '\u2192': '→', '\u2191': '↑', '\u2193': '↓'
    };
    
    let cleanedText = text;
    for (const [unicode, replacement] of Object.entries(replacements)) {
      cleanedText = cleanedText.replace(new RegExp(unicode, 'g'), replacement);
    }
    
    // Remove characters that can't be encoded (keep printable ASCII + extended Latin)
    cleanedText = cleanedText.replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
    
    return cleanedText;
  }

  async splitTextIntoProfessionalPages(text) {
    const pages = [];
    const lines = text.split('\n');
    
    // Professional typography settings
    const fontSize = 12; // Standard business document size
    const lineHeight = fontSize * 1.5; // Professional line spacing (18pt)
    
    const maxLinesPerPage = Math.floor(this.contentArea.height / lineHeight);
    console.log(`Max lines per page: ${maxLinesPerPage} (based on content height: ${this.contentArea.height}px)`);
    
    let currentPageLines = [];
    let currentLineCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle empty lines (paragraph breaks)
      if (line.trim() === '') {
        // Only add empty line if we have content and it's not excessive
        if (currentPageLines.length > 0 && 
            currentPageLines[currentPageLines.length - 1] !== '') {
          currentPageLines.push('');
          currentLineCount++;
        }
        continue;
      }

      // Split long lines that exceed page width
      const wrappedLines = this.wrapTextProfessionally(line, fontSize, this.contentArea.width);
      
      for (const wrappedLine of wrappedLines) {
        // Check if we need a new page
        if (currentLineCount >= maxLinesPerPage) {
          pages.push([...currentPageLines]);
          currentPageLines = [];
          currentLineCount = 0;
        }
        
        currentPageLines.push(wrappedLine);
        currentLineCount++;
      }
    }

    // Add remaining lines to final page
    if (currentPageLines.length > 0) {
      pages.push(currentPageLines);
    }

    console.log(`Text split into ${pages.length} pages`);
    return pages;
  }

  wrapTextProfessionally(text, fontSize, maxWidth) {
    // Improved text wrapping for professional appearance
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    // More accurate character width estimation for Times New Roman
    const avgCharWidth = fontSize * 0.5; // Times New Roman is narrower than sans-serif
    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is too long, but we must include it
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  async addProfessionalTextToPage(page, lines, fonts) {
    // Professional typography settings
    const fontSize = 12;
    const lineHeight = fontSize * 1.5; // 18pt line height
    const textColor = rgb(0, 0, 0); // Pure black for professional documents
    
    // Validate fonts - ensure they're not undefined
    const safeFont = fonts.regular || fonts.bold || fonts.italic;
    if (!safeFont) {
      throw new Error('No valid fonts available for text rendering');
    }
    
    console.log('Adding text to page with professional formatting:', {
      contentArea: this.contentArea,
      fontSize,
      lineHeight,
      totalLines: lines.length,
      fontsAvailable: {
        regular: !!fonts.regular,
        bold: !!fonts.bold,
        italic: !!fonts.italic
      }
    });
    
    // Start from the top of the content area
    // In PDF coordinates, we start from the top and work down
    let yPosition = this.contentArea.y + this.contentArea.height - lineHeight;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if we have space for this line
      if (yPosition < this.contentArea.y) {
        console.warn(`Text overflow: line ${i + 1} exceeds page boundaries`);
        break;
      }

      // Only draw non-empty lines
      if (line.trim()) {
        // Handle basic formatting markers
        let formattedText = line;
        let font = fonts.regular || safeFont;
        
        // Simple bold/italic detection (from our HTML conversion)
        if (line.includes('**') && line.includes('**')) {
          formattedText = line.replace(/\*\*(.*?)\*\*/g, '$1');
          font = fonts.bold || fonts.regular || safeFont;
        } else if (line.includes('*') && line.includes('*')) {
          formattedText = line.replace(/\*(.*?)\*/g, '$1');
          font = fonts.italic || fonts.regular || safeFont;
        }
        
        try {
          page.drawText(formattedText, {
            x: this.contentArea.x,
            y: yPosition,
            size: fontSize,
            font: font,
            color: textColor,
          });
        } catch (error) {
          console.error(`Error drawing text line ${i + 1}:`, error);
          // Fallback to safe font if there's an issue
          try {
            page.drawText(line, {
              x: this.contentArea.x,
              y: yPosition,
              size: fontSize,
              font: safeFont,
              color: textColor,
            });
          } catch (fallbackError) {
            console.error(`Fallback font also failed for line ${i + 1}:`, fallbackError);
            // Skip this line if all fonts fail
            continue;
          }
        }
      }

      yPosition -= lineHeight;
    }

    console.log(`Successfully added ${lines.length} lines to page`);
  }

  // Professional content area configuration methods
  setProfessionalContentArea(topPercent = 0.15, bottomPercent = 0.12, sidePercent = 0.08) {
    if (!this.templatePdf) {
      console.warn('Template not loaded, cannot set content area');
      return;
    }

    const pages = this.templatePdf.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const topMargin = height * topPercent;
    const bottomMargin = height * bottomPercent;
    const leftMargin = width * sidePercent;
    const rightMargin = width * sidePercent;

    this.contentArea = {
      x: leftMargin,
      y: bottomMargin,
      width: width - leftMargin - rightMargin,
      height: height - topMargin - bottomMargin
    };

    console.log('Professional content area updated:', this.contentArea);
  }

  // Utility methods for professional PDF generation
  getContentArea() {
    return this.contentArea;
  }

  getPageMargins() {
    return this.pageMargins;
  }

  isTemplateLoaded() {
    return this.templatePdf !== null;
  }

  // Method to validate content area settings
  validateContentArea() {
    if (!this.contentArea) {
      throw new Error('Content area not configured');
    }

    if (this.contentArea.width <= 0 || this.contentArea.height <= 0) {
      throw new Error('Invalid content area dimensions');
    }

    return true;
  }

  // Method to get professional layout recommendations
  getProfessionalLayoutInfo() {
    if (!this.templatePdf) {
      return null;
    }

    const pages = this.templatePdf.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    return {
      pageSize: { width, height },
      contentArea: this.contentArea,
      margins: this.pageMargins,
      recommendations: {
        fontSize: '12pt (professional standard)',
        lineHeight: '18pt (1.5x spacing)',
        margins: 'Top: 22% (>=144pt), Bottom: 15% (>=86pt), Sides: 10% (>=54pt)',
        fontFamily: 'Times New Roman (professional documents)',
        textColor: 'Pure black (#000000)'
      }
    };
  }
}

// Create and export a singleton instance
const pdfTemplateService = new PDFTemplateService();
export default pdfTemplateService;