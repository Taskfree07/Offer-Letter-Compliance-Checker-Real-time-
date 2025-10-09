import React, { useEffect, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

/**
 * WordDocumentEditor - CKEditor 5 with Mammoth integration
 * Displays Word documents with exact formatting and allows real-time variable editing
 * Supports page-by-page viewing
 */
const WordDocumentEditor = ({ htmlContent, variables, onVariableChange, readOnly = false }) => {
  const [editorData, setEditorData] = useState('');
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const editorRef = useRef(null);

  // Split HTML into pages based on content length
  useEffect(() => {
    if (htmlContent) {
      const splitPages = splitHtmlIntoPages(htmlContent);
      setPages(splitPages);
      setCurrentPage(1);
    }
  }, [htmlContent]);

  // Update editor when page or variables change
  useEffect(() => {
    if (pages.length > 0) {
      const currentPageContent = pages[currentPage - 1] || '';
      const updatedHtml = replaceVariablesInHtml(currentPageContent, variables);
      setEditorData(updatedHtml);
    }
  }, [pages, currentPage, variables]);

  const splitHtmlIntoPages = (html) => {
    // Split HTML into pages based on estimated height (like a real Word document)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = Array.from(doc.body.children);

    const pages = [];
    const pageHeightEstimate = 1056; // ~11 inches at 96 DPI (11 * 96)
    const lineHeight = 18; // Approximate line height in pixels

    let currentPage = [];
    let currentHeight = 0;

    elements.forEach((el, index) => {
      // Estimate element height based on type
      let estimatedHeight = 0;

      if (el.tagName.match(/^H[1-6]$/)) {
        // Headings are taller and should start new page if near bottom
        estimatedHeight = el.tagName === 'H1' ? 60 : (el.tagName === 'H2' ? 50 : 40);

        // If heading is near page bottom (more than 75% full), start new page
        if (currentHeight > pageHeightEstimate * 0.75 && currentPage.length > 0) {
          const pageDiv = document.createElement('div');
          currentPage.forEach(elem => pageDiv.appendChild(elem.cloneNode(true)));
          pages.push(pageDiv.innerHTML);
          currentPage = [];
          currentHeight = 0;
        }
      } else if (el.tagName === 'P') {
        // Paragraphs: estimate based on text length
        const textLength = el.textContent.length;
        const lines = Math.ceil(textLength / 80); // ~80 chars per line
        estimatedHeight = lines * lineHeight + 12; // line height + margin
      } else if (el.tagName === 'TABLE') {
        // Tables: estimate based on row count
        const rows = el.querySelectorAll('tr').length;
        estimatedHeight = rows * 35; // ~35px per row
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        // Lists: estimate based on list items
        const items = el.querySelectorAll('li').length;
        estimatedHeight = items * 25; // ~25px per item
      } else {
        estimatedHeight = 20; // Default for other elements
      }

      // Check if adding this element would exceed page height
      if (currentHeight + estimatedHeight > pageHeightEstimate && currentPage.length > 0) {
        // Save current page
        const pageDiv = document.createElement('div');
        currentPage.forEach(elem => pageDiv.appendChild(elem.cloneNode(true)));
        pages.push(pageDiv.innerHTML);

        // Start new page
        currentPage = [el];
        currentHeight = estimatedHeight;
      } else {
        // Add to current page
        currentPage.push(el);
        currentHeight += estimatedHeight;
      }
    });

    // Add remaining elements as final page
    if (currentPage.length > 0) {
      const pageDiv = document.createElement('div');
      currentPage.forEach(elem => pageDiv.appendChild(elem.cloneNode(true)));
      pages.push(pageDiv.innerHTML);
    }

    return pages.length > 0 ? pages : [html];
  };

  const replaceVariablesInHtml = (html, vars) => {
    let result = html;

    // Section field names to detect
    const sectionFields = [
      "Confidentiality and Intellectual Property",
      "Pre-Employment Conditions",
      "Employment Agreement",
      "Compliance with Policies",
      "Governing Law and Dispute Resolution"
    ];

    // First, handle section content replacement
    sectionFields.forEach(sectionName => {
      if (vars[sectionName] && vars[sectionName].trim()) {
        const newContent = vars[sectionName].trim();

        // Create regex to find section and replace its content
        const sectionPattern = new RegExp(
          `(<h[1-6][^>]*>[^<]*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*<\\/h[1-6]>)([\\s\\S]*?)(?=<h[1-6]|$)`,
          'gi'
        );

        // Also try to match if section is in <p><strong>
        const strongSectionPattern = new RegExp(
          `(<p[^>]*><strong[^>]*>[^<]*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*<\\/strong><\\/p>)([\\s\\S]*?)(?=<p[^>]*><strong|<h[1-6]|$)`,
          'gi'
        );

        // Format the new content as paragraphs
        const formattedContent = newContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(line => `<p style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 6px 10px; margin: 4px 0; border-radius: 3px; border-left: 3px solid #fbbf24; line-height: 1.5;">${line}</p>`)
          .join('');

        const replacement = `$1<div style="margin: 10px 0; padding: 10px; background: #fffbeb; border-radius: 4px; border: 1px dashed #fbbf24;">${formattedContent}</div>`;

        result = result.replace(sectionPattern, replacement);
        result = result.replace(strongSectionPattern, replacement);
      }
    });

    // Replace regular variables in HTML spans (from Mammoth formatting)
    Object.entries(vars).forEach(([varName, varValue]) => {
      if (sectionFields.includes(varName)) return;

      // Replace span elements with data-var attribute
      const spanPattern = new RegExp(
        `<span class="variable-empty" data-var="${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>([^<]*)</span>`,
        'g'
      );

      const highlightedValue = varValue
        ? `<span class="variable-filled" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 2px 6px; border-radius: 3px; font-weight: 600; color: #92400e; border: 1px solid #fbbf24;">${varValue}</span>`
        : `<span class="variable-empty" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 2px 6px; border-radius: 3px; color: #991b1b; border: 1px solid #f87171; font-weight: 500;">$1</span>`;

      result = result.replace(spanPattern, highlightedValue);
    });

    // Also handle plain bracketed text
    Object.entries(vars).forEach(([varName, varValue]) => {
      if (sectionFields.includes(varName)) return;

      const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const bracketPattern = new RegExp(`\\[${escapedVarName}\\]`, 'g');

      const highlightedValue = varValue
        ? `<span style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 2px 6px; border-radius: 3px; font-weight: 600; color: #92400e; border: 1px solid #fbbf24;">${varValue}</span>`
        : `<span style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 2px 6px; border-radius: 3px; color: #991b1b; border: 1px solid #f87171; font-weight: 500;">[${varName}]</span>`;

      result = result.replace(bracketPattern, highlightedValue);
    });

    return result;
  };

  const editorConfiguration = {
    toolbar: readOnly ? [] : [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'link',
      'blockQuote',
      'insertTable',
      '|',
      'undo',
      'redo'
    ],
    readOnly: readOnly,
    initialData: editorData
  };

  return (
    <div className="word-document-editor" style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Page Navigation */}
      {pages.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '12px 24px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              background: currentPage === 1 ? '#e0e0e0' : '#3b82f6',
              color: currentPage === 1 ? '#999' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Page {currentPage} of {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(pages.length, prev + 1))}
            disabled={currentPage === pages.length}
            style={{
              padding: '8px 16px',
              background: currentPage === pages.length ? '#e0e0e0' : '#3b82f6',
              color: currentPage === pages.length ? '#999' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === pages.length ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* CKEditor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CKEditor
          editor={ClassicEditor}
          config={editorConfiguration}
          data={editorData}
          onReady={editor => {
            editorRef.current = editor;
            console.log('CKEditor is ready', editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setEditorData(data);
          }}
          disabled={readOnly}
        />
      </div>

      <style>{`
        .word-document-editor .ck-editor__editable {
          min-height: 11in;
          max-height: 11in;
          width: 8.5in;
          font-family: Calibri, Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.15;
          padding: 1in;
          margin: 0 auto;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow-y: auto;
          page-break-after: always;
        }

        .word-document-editor .ck-toolbar {
          background: #f8f9fa !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }

        .word-document-editor .ck-editor__editable p {
          margin: 0 0 8pt 0;
          line-height: 1.15;
          text-align: justify;
        }

        .word-document-editor .ck-editor__editable h1 {
          font-size: 16pt;
          font-weight: bold;
          margin: 12pt 0 6pt 0;
          page-break-after: avoid;
        }

        .word-document-editor .ck-editor__editable h2 {
          font-size: 14pt;
          font-weight: bold;
          margin: 10pt 0 6pt 0;
          page-break-after: avoid;
        }

        .word-document-editor .ck-editor__editable h3 {
          font-size: 13pt;
          font-weight: bold;
          margin: 10pt 0 6pt 0;
          page-break-after: avoid;
        }

        .word-document-editor .ck-editor__editable table {
          border-collapse: collapse;
          margin: 10pt 0;
          width: 100%;
          page-break-inside: avoid;
        }

        .word-document-editor .ck-editor__editable td,
        .word-document-editor .ck-editor__editable th {
          border: 1px solid #000;
          padding: 5pt 8pt;
          vertical-align: top;
        }

        .word-document-editor .ck-editor__editable ul,
        .word-document-editor .ck-editor__editable ol {
          margin: 6pt 0;
          padding-left: 30pt;
        }

        .word-document-editor .ck-editor__editable li {
          margin: 3pt 0;
          line-height: 1.15;
        }

        .word-document-editor .variable-filled,
        .word-document-editor .variable-empty {
          cursor: default;
          user-select: none;
          white-space: nowrap;
        }

        /* Page-like appearance */
        .word-document-editor .ck-editor__editable_inline {
          border: 1px solid #d0d0d0;
        }

        /* Prevent orphaned headings */
        .word-document-editor .ck-editor__editable h1,
        .word-document-editor .ck-editor__editable h2,
        .word-document-editor .ck-editor__editable h3 {
          page-break-after: avoid;
          orphans: 3;
          widows: 3;
        }
      `}</style>
    </div>
  );
};

export default WordDocumentEditor;
