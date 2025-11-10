import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { extractTextWithNLP, generateTemplateFromPDF } from '../services/pdfContentExtractor';
import { syncCompliancePhrases } from '../services/legalDictionary';
import { ensureComplianceClauses, buildVariablesFromEntities } from '../services/complianceAutoInsert';
import { API_BASE_URL } from '../config/constants';
// Full-Featured EmailEditor with Professional Preview and Exact Positioning
import { Download, FileText, Settings, AlertCircle, RefreshCw, Shield, Edit3, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import pdfTemplateService from '../services/pdfTemplateService';
import ComplianceAnalysis from './compliance/ComplianceAnalysis';
import { COMPLIANCE_RULES } from './compliance/complianceRules';
import EnhancedPDFViewer from './EnhancedPDFViewer';
import DynamicPDFViewer from './DynamicPDFViewer';
import EntitiesPanel from './EntitiesPanel';
import WordDocumentEditor from './WordDocumentEditor';
import OnlyOfficeViewer from './OnlyOfficeViewer';
import VariablePanel from './VariablePanel';
import FormExtraction from './FormExtraction';
import enhancedPdfService from '../services/enhancedPdfService';
import { enableInputMonitoring, disableInputMonitoring } from '../utils/inputAutoResize';
import * as pdfjs from 'pdfjs-dist';
import '../styles/preview.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const EmailEditor = ({ template, onBack }) => {
  const [templateContent, setTemplateContent] = useState(template?.content || '');
  const [extractedPdfText, setExtractedPdfText] = useState('');
  const [activeTab, setActiveTab] = useState('variables');
  const [extractedEntities, setExtractedEntities] = useState([]);
  const [variables, setVariables] = useState({});
  const [stateConfig, setStateConfig] = useState({
    selectedState: 'CA',
    stateBlocks: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewPdfBytes, setPreviewPdfBytes] = useState(null);
  const [uploadedPdfBytes, setUploadedPdfBytes] = useState(null);
  const [previewMode, setPreviewMode] = useState('original'); // prefer exact view when possible
  const [pdfJsViewerAvailable, setPdfJsViewerAvailable] = useState(false);
  // Enhanced PDF viewer states
  const [importedPdfBytes, setImportedPdfBytes] = useState(null);
  const [isPdfImported, setIsPdfImported] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  // Word document states
  const [docxHtmlContent, setDocxHtmlContent] = useState('');
  const [docxPages, setDocxPages] = useState([]);
  const [currentDocxPage, setCurrentDocxPage] = useState(1);
  // ONLYOFFICE states
  const [onlyofficeDocId, setOnlyofficeDocId] = useState(null);
  const [useOnlyOffice, setUseOnlyOffice] = useState(false);
  // Use refs to store PDF data to avoid async state issues
  const importedPdfBytesRef = useRef(null);
  const isPdfImportedRef = useRef(false);
  const [pdfImportKey, setPdfImportKey] = useState(0);
  const htmlEditTimerRef = useRef(null);
  const editableRef = useRef(null);
  const docxPreviewContainerRef = useRef(null);
  const onlyofficeViewerRef = useRef(null);

  // Memoize the callback to prevent re-renders
  const handleVariablesExtracted = useCallback((extractedVars) => {
    setVariables(extractedVars);
    setActiveTab('variables'); // Auto-switch to variables tab
  }, []);

  // Memoize isEditorReady check to prevent re-renders
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Handle editor ready callback from OnlyOfficeViewer
  const handleEditorReady = useCallback(() => {
    setIsEditorReady(true);
  }, []);

  // Memoize all OnlyOffice callbacks to prevent re-renders
  const handleOnlyOfficeSave = useCallback(() => {
    console.log('Document saved in ONLYOFFICE');
  }, []);

  const handleOnlyOfficeSessionExpired = useCallback(() => {
    console.log('⚠️ ONLYOFFICE session may have expired, but keeping document ID');
    setIsEditorReady(false);
  }, []);

  const handleOnlyOfficeVariablesUpdate = useCallback((vars) => {
    console.log('Variables updated from ONLYOFFICE:', vars);

    // Handle both array and object formats
    const updatedVars = {};

    if (Array.isArray(vars)) {
      vars.forEach(v => {
        updatedVars[v.variable] = v.value || '';
      });
    } else if (typeof vars === 'object' && vars !== null) {
      Object.entries(vars).forEach(([varName, varData]) => {
        if (typeof varData === 'object' && varData !== null) {
          updatedVars[varName] = varData.suggested_value || varData.value || '';
        } else {
          updatedVars[varName] = varData || '';
        }
      });
    }

    // Merge with existing variables instead of replacing them
    // This preserves variables that were already there
    setVariables(prev => ({ ...prev, ...updatedVars }));
  }, []);

  // Compliance system states
  const [complianceFlags, setComplianceFlags] = useState({});
  const [sentences, setSentences] = useState([]);
  const [showRulesManager, setShowRulesManager] = useState(false);
  const [currentRules, setCurrentRules] = useState(COMPLIANCE_RULES);
  const [newRuleData, setNewRuleData] = useState('');
  // Variables UX enhancements
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [variableSearch, setVariableSearch] = useState('');
  
  // Enhanced PDF processing state
  const [enhancedPdfProcessed, setEnhancedPdfProcessed] = useState(false);
  const [enhancedPdfStats, setEnhancedPdfStats] = useState({ totalVariables: 0, glinerSuggestions: 0 });

  // Use ref to store current URL for cleanup without causing re-renders
  const currentPreviewUrlRef = useRef(null);
  const pdfDocumentRef = useRef(null);
  const canvasRef = useRef(null);
  const pdfViewportContainerRef = useRef(null);
  const variableChangeTimerRef = useRef(null);
  const enhancedPdfViewerRef = useRef(null);

  const US_STATES = [
    { code: 'CA', name: 'California' }, { code: 'NY', name: 'New York' }, 
    { code: 'TX', name: 'Texas' }, { code: 'FL', name: 'Florida' },
    { code: 'WA', name: 'Washington' }, { code: 'IL', name: 'Illinois' }
  ];

  // Professional PDF generation with enhanced error handling
  // Normalize various entity shapes from NLP to a canonical array of { label, text, ... }
  const normalizeEntities = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === 'object') {
      // If nested container with .entities array
      if (Array.isArray(input.entities)) return input.entities;
      const out = [];
      Object.entries(input).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach(item => {
            if (!item) return;
            if (typeof item === 'string') out.push({ label: key, text: item });
            else if (typeof item === 'object') out.push({ label: item.label || key, ...item });
          });
        } else if (typeof val === 'string') {
          out.push({ label: key, text: val });
        }
      });
      return out;
    }
    return [];
  };
  const generateLivePdfPreview = useCallback(async (htmlContent) => {
    if (!htmlContent) return;
    
    try {
      console.log('Generating live PDF preview from HTML...');
      setIsLoadingPreview(true);
      setPreviewError(null);

      // Clean up previous URL
      if (currentPreviewUrlRef.current) {
        URL.revokeObjectURL(currentPreviewUrlRef.current);
        currentPreviewUrlRef.current = null;
      }

      const response = await fetch(`${API_BASE_URL}/api/html-to-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          variables: variables
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Backend preview generation failed');
      }

      const pdfBytes = await response.arrayBuffer();

      // Set PDF bytes for preview
      setPreviewPdfBytes(new Uint8Array(pdfBytes));
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      currentPreviewUrlRef.current = url;
      setPreviewPdfUrl(url);

      // Set page info
      const pdfDoc = await pdfjs.getDocument({ data: pdfBytes }).promise;
      const numPages = pdfDoc.numPages || 1;
      pdfDocumentRef.current = pdfDoc;
      setTotalPages(numPages);
      setCurrentPage(1);

      console.log('Live PDF preview generated successfully');
    } catch (error) {
      console.error('Live PDF preview error:', error);
      setPreviewError(`Preview generation failed: ${error.message}. Ensure backend is running on port 5000.`);
      setPreviewPdfUrl(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [variables]);

  const generateProfessionalPreview = useCallback(async () => {
    if (!templateLoaded) {
      console.log('Template not loaded yet, skipping preview generation');
      return;
    }

    // If in HTML edit mode, use live preview
    if (previewMode === 'html-edit') {
      const currentHtml = editableRef.current ? editableRef.current.innerHTML : templateContent;
      await generateLivePdfPreview(currentHtml);
      return;
    }

    // Extract text for compliance analysis from template
    if (templateContent && sentences.length === 0) {
      const splitSentences = templateContent
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 10)
        .map((sentence, index) => ({
          id: `sentence_${index}`,
          text: sentence.trim(),
          section: Math.floor(index / 3) + 1
        }));
      
      setSentences(splitSentences);
      console.log('Template text extracted for compliance analysis:', splitSentences.length, 'sentences');
    }

    // If user prefers exact-fidelity original PDF preview, render uploaded bytes directly
    if (previewMode === 'original' && uploadedPdfBytes) {
      try {
        // Always pass a fresh copy to pdf.js to avoid ArrayBuffer detachment issues
        const dataCopy = uploadedPdfBytes instanceof Uint8Array
          ? uploadedPdfBytes.slice()
          : new Uint8Array(uploadedPdfBytes).slice();
        const pdfDoc = await pdfjs.getDocument({ data: dataCopy }).promise;
        pdfDocumentRef.current = pdfDoc;
        const numPages = pdfDoc.numPages || 1;
        setTotalPages(numPages);
        setCurrentPage(prev => Math.min(prev || 1, numPages));
        setPreviewPdfBytes(uploadedPdfBytes);
        const blob = new Blob([uploadedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        if (currentPreviewUrlRef.current) URL.revokeObjectURL(currentPreviewUrlRef.current);
        currentPreviewUrlRef.current = url;
        setPreviewPdfUrl(url);
        return;
      } catch (e) {
        console.warn('Failed to render original PDF bytes, falling back to generated preview:', e);
      }
    }

    if (!templateContent || !templateContent.trim()) {
      console.log('No content available, skipping preview generation');
      setPreviewPdfUrl(null);
      setPreviewError('No content to preview. Please add content to the template.');
      return;
    }

    try {
      console.log('Generating professional PDF preview...');
      setIsLoadingPreview(true);
      setPreviewError(null);
      
      // Clean up previous URL to prevent memory leaks
      if (currentPreviewUrlRef.current) {
        URL.revokeObjectURL(currentPreviewUrlRef.current);
        currentPreviewUrlRef.current = null;
      }
      
      const pdfBytes = await pdfTemplateService.generatePDF(
        templateContent, 
        variables, 
        stateConfig.stateBlocks, 
        stateConfig.selectedState
      );
      
      if (pdfBytes && pdfBytes.length > 0) {
        // Get total pages to support minimal custom pagination
        try {
          const pdfDoc = await pdfjs.getDocument({ data: pdfBytes }).promise;
          const numPages = pdfDoc.numPages || 1;
          pdfDocumentRef.current = pdfDoc;
          setTotalPages(numPages);
          setCurrentPage(prev => Math.min(prev || 1, numPages));
        } catch (e) {
          console.warn('Unable to read PDF page count for preview:', e);
          setTotalPages(1);
          setCurrentPage(1);
        }
        setPreviewPdfBytes(pdfBytes);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        currentPreviewUrlRef.current = url;
        setPreviewPdfUrl(url);
        console.log('Professional PDF preview generated successfully, size:', pdfBytes.length, 'bytes');
      } else {
        console.error('PDF generation returned empty or invalid data');
        setPreviewError('PDF generation failed: Empty data returned');
        setPreviewPdfUrl(null);
      }
    } catch (error) {
      console.error('Failed to generate professional preview PDF:', error);
      setPreviewError(`Failed to generate PDF preview: ${error.message}`);
      setPreviewPdfUrl(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [templateLoaded, templateContent, variables, stateConfig.stateBlocks, stateConfig.selectedState, previewMode, uploadedPdfBytes, generateLivePdfPreview]);

  // Enable aggressive input monitoring to fix white box issues
  useEffect(() => {
    enableInputMonitoring();
    
    return () => {
      disableInputMonitoring();
    };
  }, []);

  // Keep refs in sync with state for reliability
  useEffect(() => {
    if (importedPdfBytes && importedPdfBytes.byteLength > 0) {
      importedPdfBytesRef.current = importedPdfBytes;
    }
    isPdfImportedRef.current = isPdfImported;
  }, [importedPdfBytes, isPdfImported]);

  // Initialize professional PDF template
  const initializeProfessionalTemplate = useCallback(async () => {
    try {
      console.log('Initializing professional PDF template...');
      setIsLoadingPreview(true);
      setPreviewError(null);
      
      const success = await pdfTemplateService.loadTemplate('/letterhead.pdf');
      setTemplateLoaded(success);
      
      if (success) {
        console.log('Professional PDF template loaded successfully');

        // Explicitly set safer margins to prevent letterhead overlap
        try {
          pdfTemplateService.setProfessionalContentArea(0.22, 0.15, 0.10);
          const layoutInfo = pdfTemplateService.getProfessionalLayoutInfo();
          if (layoutInfo) {
            console.log('Professional layout configured (post-set):', layoutInfo);
          }
        } catch (e) {
          console.warn('Failed to set professional content area:', e);
        }
      } else {
        console.error('Failed to load professional PDF template');
        setPreviewError('Failed to load PDF template. Please check if letterhead.pdf exists in the public folder.');
      }
    } catch (error) {
      console.error('Error loading professional PDF template:', error);
      setPreviewError(`Error loading PDF template: ${error.message}`);
      setTemplateLoaded(false);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Compliance analysis functions
  const determineSectionNumber = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('at-will') || lowerText.includes('terminate employment')) return 5;
    if (lowerText.includes('confidentiality') || lowerText.includes('intellectual property')) return 6;
    if (lowerText.includes('employment agreement') || lowerText.includes('competitive')) return 8;
    if (lowerText.includes('arbitration') || lowerText.includes('dispute')) return 10;
    if (lowerText.includes('benefits') || lowerText.includes('health')) return 3;
    if (lowerText.includes('pre-employment') || lowerText.includes('background')) return 7;
    if (lowerText.includes('compensation') || lowerText.includes('salary')) return 2;
    
    return 0;
  };

  // Build a quick index of variables and where they appear, and whether they are inside flagged sentences
  const variableMeta = React.useMemo(() => {
    const meta = {};
    // Initialize all variables with default meta
    Object.keys(variables || {}).forEach(v => {
      meta[v] = { occurrences: 0, flaggedOccurrences: 0 };
    });
    if (!template?.content) return meta;

    // Map sentence id to text and flags
    const flaggedSentenceIds = new Set(Object.keys(complianceFlags || {}));

    // For each sentence, count occurrences per variable
    sentences.forEach(s => {
      const text = s.text || '';
      Object.keys(variables || {}).forEach(v => {
        const pattern = new RegExp(`\\[\\s*${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\]`, 'g');
        const matches = text.match(pattern);
        if (matches && matches.length) {
          meta[v].occurrences += matches.length;
          if (flaggedSentenceIds.has(s.id)) {
            meta[v].flaggedOccurrences += matches.length;
          }
        }
      });
    });
    return meta;
  }, [variables, sentences, complianceFlags, template?.content]);

  const getComplianceSummary = () => {
    const summary = { error: 0, warning: 0, info: 0 };
    Object.values(complianceFlags).flat().forEach(flag => {
      if (flag.severity) summary[flag.severity]++;
    });
    return summary;
  };

  const generateComplianceReport = () => {
    const summary = getComplianceSummary();
    const allFlags = Object.values(complianceFlags).flat();
    
    const report = {
      template: template?.title || 'Offer Letter',
      state: stateConfig.selectedState,
      timestamp: new Date().toISOString(),
      summary,
      totalIssues: allFlags.length,
      criticalIssues: allFlags.filter(f => f.severity === 'error'),
      warnings: allFlags.filter(f => f.severity === 'warning'),
      details: complianceFlags,
      professionalLayoutInfo: pdfTemplateService.getProfessionalLayoutInfo()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${stateConfig.selectedState}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleComplianceRulesUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Extract text from the uploaded PDF
      const extraction = await extractTextWithNLP(file, {
        performNLP: true,
        extractEntities: true,
        suggestVariables: false,
        replaceEntities: false
      });

      const text = extraction.text || '';
      if (!text.trim()) {
        alert('Could not extract text from the PDF. Please try a different file.');
        return;
      }

      // Parse compliance rules from the extracted text
      const parsedRules = parseComplianceRulesFromText(text);
      
      if (Object.keys(parsedRules).length === 0) {
        alert('No compliance rules detected in the PDF. Please ensure the document contains clear rule definitions.');
        return;
      }

      // Set the extracted rules as JSON for preview
      setNewRuleData(JSON.stringify(parsedRules, null, 2));
      
      console.log('Extracted compliance rules from PDF:', parsedRules);
    } catch (error) {
      console.error('Error processing compliance rules PDF:', error);
      alert('Failed to process PDF: ' + error.message);
    }
  };

  const parseComplianceRulesFromText = (text) => {
    const rules = {};
    
    // Split text into sections/paragraphs
    const sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 50);
    
    sections.forEach((section, index) => {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      
      // Look for rule patterns
      const rulePatterns = [
        /must\s+(?:not\s+)?(.+)/gi,
        /shall\s+(?:not\s+)?(.+)/gi,
        /required\s+to\s+(.+)/gi,
        /prohibited\s+from\s+(.+)/gi,
        /mandatory\s+(.+)/gi,
        /violation\s+of\s+(.+)/gi,
        /failure\s+to\s+(.+)/gi
      ];

      lines.forEach(line => {
        rulePatterns.forEach(pattern => {
          const matches = [...line.matchAll(pattern)];
          matches.forEach(match => {
            const ruleText = match[1]?.trim();
            if (ruleText && ruleText.length > 10) {
              const ruleName = `rule_${Object.keys(rules).length + 1}`;
              const severity = line.toLowerCase().includes('prohibited') || 
                            line.toLowerCase().includes('violation') || 
                            line.toLowerCase().includes('must not') ? 'error' : 'warning';
              
              rules[ruleName] = {
                severity,
                message: ruleText,
                lawReference: `Extracted from compliance document section ${index + 1}`,
                flaggedPhrases: [ruleText.toLowerCase()]
              };
            }
          });
        });
      });
    });

    return rules;
  };

  const handleAddRule = () => {
    try {
      const parsedRule = JSON.parse(newRuleData);

      const updatedRules = { ...currentRules };
      if (!updatedRules[stateConfig.selectedState]) {
        updatedRules[stateConfig.selectedState] = {
          state: stateConfig.selectedState,
          rules: {},
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }

      // Merge new rules with existing ones
      updatedRules[stateConfig.selectedState].rules = {
        ...updatedRules[stateConfig.selectedState].rules,
        ...parsedRule
      };

      updatedRules[stateConfig.selectedState].lastUpdated = new Date().toISOString().split('T')[0];

      setCurrentRules(updatedRules);
      setNewRuleData('');

      const ruleCount = Object.keys(parsedRule).length;
      console.log(`✅ Added ${ruleCount} compliance rule(s) for ${stateConfig.selectedState}`, parsedRule);

      alert(`Successfully added ${ruleCount} rule(s) for ${stateConfig.selectedState}! Check the Compliance tab to see detected issues.`);
    } catch (error) {
      console.error('Error parsing rule data:', error);
      alert('Invalid JSON format. Please check the rule format.');
    }
  };

  // Initialize template and compliance analysis
  useEffect(() => {
    const initializeAll = async () => {
      // Initialize PDF template
      await initializeProfessionalTemplate();

      // Split sentences for compliance analysis
      const splitSentences = template.content
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0)
        .map((text, index) => ({
          id: `sentence-${index}`,
          text: text.trim(),
          section: determineSectionNumber(text)
        }));
      
      setSentences(splitSentences);

      // Extract variables
      const extractVariables = (content) => {
        const variableMatches = content.match(/\[([^\]]+)\]/g);
        if (!variableMatches) return {};
        
        const extractedVars = {};
        variableMatches.forEach(match => {
          let varName = match.slice(1, -1).trim();
          if (varName) extractedVars[varName] = '';
        });
        return extractedVars;
      };

      const extractedVars = extractVariables(template.content);
      setVariables(extractedVars);
    };

    initializeAll();
  }, [template.content, initializeProfessionalTemplate]);

  // Generate preview with professional formatting
  useEffect(() => {
    if (template?.content && typeof template.content === 'string') {
      setTemplateContent(template.content);
    }
  }, [template]);
  useEffect(() => {
    if (templateLoaded) {
      const timeoutId = setTimeout(generateProfessionalPreview, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [templateLoaded, generateProfessionalPreview]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (currentPreviewUrlRef.current) {
        URL.revokeObjectURL(currentPreviewUrlRef.current);
        currentPreviewUrlRef.current = null;
      }
      if (pdfDocumentRef.current) {
        try { pdfDocumentRef.current.destroy(); } catch {}
        pdfDocumentRef.current = null;
      }
    };
  }, []);

  // Render PDF.js canvas when bytes or page change
  useEffect(() => {
    const renderPage = async () => {
      if (!previewPdfBytes || !canvasRef.current) return;

      try {
        let pdfDoc = pdfDocumentRef.current;
        if (!pdfDoc) {
          pdfDoc = await pdfjs.getDocument({ data: previewPdfBytes }).promise;
          pdfDocumentRef.current = pdfDoc;
          setTotalPages(pdfDoc.numPages || 1);
          setCurrentPage(prev => Math.min(prev || 1, pdfDoc.numPages || 1));
        }

        const safePage = Math.min(Math.max(1, currentPage || 1), pdfDoc.numPages || 1);
        const page = await pdfDoc.getPage(safePage);

        // Determine scale to fit container width
        const container = pdfViewportContainerRef.current;
        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = container ? container.clientWidth - 4 : viewport.width;
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);

        const renderContext = { canvasContext: context, viewport: scaledViewport }; 
        await page.render(renderContext).promise;
      } catch (err) {
        console.error('PDF.js render error:', err);
      }
    };

    renderPage();
  }, [previewPdfBytes, currentPage]);


  // Detect if bundled PDF.js viewer is available at /pdfjs/web/viewer.html
  useEffect(() => {
    const checkViewer = async () => {
      try {
        const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
        const path = `${base}/pdfjs/web/viewer.html`;
        const res = await fetch(path, { method: 'GET' });
        if (!res.ok) { setPdfJsViewerAvailable(false); return; }
        const html = await res.text();
        // Heuristic: official viewer contains this title
        const isViewer = /<title>\s*PDF\.js viewer\s*<\/title>/i.test(html);
        setPdfJsViewerAvailable(isViewer);
      } catch {
        setPdfJsViewerAvailable(false);
      }
    };
    checkViewer();
  }, []);

  // Analyze compliance
  // Sync compliance phrases for the selected state into the backend (EntityRuler)
// This ensures your LEGAL_POLICY detections match the rules in COMPLIANCE_RULES.
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      // Example: when selectedState is 'CA', this collects CA flaggedPhrases
      // and pushes them to the Python API as LEGAL_POLICY patterns.
      const res = await syncCompliancePhrases(stateConfig.selectedState);
      if (!cancelled) {
        console.log('Synced compliance phrases for', stateConfig.selectedState, res);
      }
    } catch (e) {
      if (!cancelled) {
        console.warn('Failed to sync compliance phrases:', e);
      }
    }
  })();
  return () => { cancelled = true; };
}, [stateConfig.selectedState]);

  useEffect(() => {
    console.log('🔍 Compliance analysis running:', {
      sentencesCount: sentences.length,
      selectedState: stateConfig.selectedState,
      hasRules: !!currentRules[stateConfig.selectedState],
      rulesCount: Object.keys(currentRules[stateConfig.selectedState]?.rules || {}).length
    });

    const newFlags = {};
    let matchCount = 0;

    sentences.forEach(sentence => {
      const stateRules = currentRules[stateConfig.selectedState]?.rules || {};
      const lowerText = sentence.text.toLowerCase();
      const flags = [];

      Object.keys(stateRules).forEach(ruleKey => {
        const rule = stateRules[ruleKey];
        if (rule.flaggedPhrases && Array.isArray(rule.flaggedPhrases)) {
          const matchedPhrases = rule.flaggedPhrases.filter(phrase =>
            lowerText.includes(phrase.toLowerCase())
          );

          if (matchedPhrases.length > 0) {
            matchCount++;
            console.log(`🚩 Match found in sentence ${sentence.id}:`, {
              rule: ruleKey,
              severity: rule.severity,
              matchedPhrases,
              sentencePreview: sentence.text.substring(0, 100)
            });

            flags.push({
              type: ruleKey,
              severity: rule.severity,
              message: rule.message,
              suggestion: rule.suggestion,
              alternativeLanguage: rule.alternativeLanguage,
              lawReference: rule.lawReference,
              matchedPhrases: matchedPhrases
            });
          }
        }
      });

      if (flags.length > 0) {
        newFlags[sentence.id] = flags;
      }
    });

    console.log('✅ Compliance analysis completed:', {
      totalSentences: sentences.length,
      flaggedSentences: Object.keys(newFlags).length,
      totalMatches: matchCount,
      errorCount: Object.values(newFlags).flat().filter(f => f.severity === 'error').length,
      warningCount: Object.values(newFlags).flat().filter(f => f.severity === 'warning').length,
      infoCount: Object.values(newFlags).flat().filter(f => f.severity === 'info').length
    });

    // Log first few sentences for debugging
    if (sentences.length > 0) {
      console.log('📝 Sample sentences for debugging:',
        sentences.slice(0, 3).map(s => ({ id: s.id, text: s.text.substring(0, 100) }))
      );
    }

    setComplianceFlags(newFlags);
  }, [sentences, stateConfig.selectedState, currentRules]);

  const handleDownloadDOCX = async () => {
    try {
      setIsGenerating(true);

      if (window.originalDocxFile) {
        const formData = new FormData();
        formData.append('file', window.originalDocxFile);
        formData.append('variables', JSON.stringify(variables));

        const response = await fetch(`${API_BASE_URL}/api/docx-replace-variables`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Download generation failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Edited_Offer_Letter.docx';
        a.click();
        URL.revokeObjectURL(url);
        
        setIsGenerating(false);
        return;
      }

      alert('No document loaded. Please import a Word document first.');
      setIsGenerating(false);
    } catch (error) {
      console.error('Error downloading DOCX:', error);
      alert('Failed to download document: ' + error.message);
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);

      // Check if we have an imported Word document
      if (window.originalDocxFile) {
        // Download as PDF with replaced variables
        const formData = new FormData();
        formData.append('file', window.originalDocxFile);
        formData.append('variables', JSON.stringify(variables));

        const response = await fetch(`${API_BASE_URL}/api/docx-to-pdf`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Show helpful error message
          if (errorData.message && errorData.message.includes('LibreOffice')) {
            alert('PDF conversion requires LibreOffice.\n\nPlease either:\n1. Download as Word (.docx) instead, or\n2. Install LibreOffice from: https://www.libreoffice.org/download/');
          } else {
            throw new Error(errorData.error || 'PDF generation failed');
          }
          
          setIsGenerating(false);
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Offer_Letter.pdf';
        a.click();
        URL.revokeObjectURL(url);
        
        setIsGenerating(false);
        return;
      }

      // Fallback to PDF generation for templates
      let bytesToDownload = null;
      let downloadName = 'Offer_Letter.pdf';

      if (previewMode === 'html-edit' && editableRef.current) {
        const currentHtml = editableRef.current.innerHTML;
        const response = await fetch(`${API_BASE_URL}/api/html-to-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: currentHtml, variables })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Download generation failed');
        }

        bytesToDownload = await response.arrayBuffer();
        downloadName = 'Edited_Document.pdf';
      } else if (isPdfImported && enhancedPdfViewerRef.current) {
        // Export enhanced PDF with variable updates
        bytesToDownload = await enhancedPdfViewerRef.current.exportPDF();
        downloadName = 'Updated_Offer_Letter.pdf';
      } else if (template && template.content) {
        // Generate from template
        bytesToDownload = await pdfTemplateService.generatePDF(
          template.content,
          variables,
          stateConfig.stateBlocks,
          stateConfig.selectedState
        );
        downloadName = 'Offer_Letter.pdf';
      } else {
        alert('No content available to download.');
        setIsGenerating(false);
        return;
      }
      
      const blob = new Blob([bytesToDownload], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document: ' + error.message + '. Ensure backend is running on port 5000.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Removed real-time variable updates - now only updates when "Replace in Template" is clicked
  const handleVariableChange = async (varName, value) => {
    // Only update local state for UI feedback - no real-time ONLYOFFICE updates
    const updatedVars = { ...variables, [varName]: value };
    setVariables(updatedVars);
    
    // All ONLYOFFICE updates now happen only in handleReplaceInTemplate
    console.log(`📝 Variable [${varName}] updated locally, will apply on Replace click`);
    
    // Update editable HTML spans (for HTML edit mode only)
    if (previewMode === 'html-edit' && editableRef.current) {
      updateEditableVariables();
    }

    // Debounce preview refresh (only for non-OnlyOffice modes)
    if (variableChangeTimerRef.current) {
      clearTimeout(variableChangeTimerRef.current);
    }
    variableChangeTimerRef.current = setTimeout(() => {
      if (previewMode === 'html-edit' && editableRef.current) {
        generateLivePdfPreview(editableRef.current.innerHTML);
      } else if (previewMode !== 'onlyoffice') {
        // Only regenerate preview if NOT in OnlyOffice mode
        generateProfessionalPreview();
      }
    }, 400);
  };

  const handleReplaceInTemplate = useCallback(async (updatedVariables) => {
    if (!onlyofficeViewerRef.current || previewMode !== 'onlyoffice') {
      throw new Error('ONLYOFFICE editor not available');
    }

    try {
      console.log('🔄 Using lightweight variable replacement...', updatedVariables);

      // Use the lightweight API method directly - no backend call needed
      // The OnlyOfficeViewer will handle the replacement using Document Editor API
      await onlyofficeViewerRef.current.replaceAllVariables(updatedVariables);

      // Update local state immediately
      setVariables(updatedVariables);

      console.log('✅ Variables successfully replaced in template (lightweight method)');
    } catch (error) {
      console.error('❌ Error replacing variables:', error);
      throw error;
    }
  }, [onlyofficeDocId, previewMode]);

  const handleStateChange = (state) => {
    setStateConfig(prev => ({ ...prev, selectedState: state }));
  };

  // Handle variables detected from imported PDF
  const handleVariablesDetected = (detectedVariables) => {
    setVariables(prev => ({ ...prev, ...detectedVariables }));
    console.log('Variables detected from PDF:', detectedVariables);
  };

  // Extract text for compliance analysis from imported PDF
  const extractTextForCompliance = async (arrayBuffer) => {
    try {
      const pdfDocument = await pdfjs.getDocument(arrayBuffer).promise;
      let pdfText = '';

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        pdfText += pageText + ' ';
      }

      // Split into sentences for compliance analysis
      const splitSentences = pdfText
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 10)
        .map((sentence, index) => ({
          id: `sentence_${index}`,
          text: sentence.trim(),
          section: Math.floor(index / 3) + 1 // Group sentences into sections
        }));

      setSentences(splitSentences);
      console.log('Text extracted for compliance analysis:', splitSentences.length, 'sentences');
    } catch (error) {
      console.error('Error extracting text for compliance:', error);
    }
  };

  // Handle page changes in PDF viewer
  const handlePageChange = (newPage, totalPages) => {
    setCurrentPage(newPage);
    setTotalPages(totalPages);
  };

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      isPdfImported,
      hasImportedPdfBytes: !!importedPdfBytes,
      importedPdfBytesLength: importedPdfBytes?.byteLength || 0,
      pdfImportKey
    });
  }, [isPdfImported, importedPdfBytes, pdfImportKey]);

  // Force re-render when PDF is imported
  useEffect(() => {
    if (isPdfImported && importedPdfBytes) {
      console.log('PDF imported - forcing re-render');
      // Force a re-render by updating a dummy state
      setTimeout(() => {
        console.log('Checking state after delay:', {
          hasImportedPdfBytes: !!importedPdfBytes,
          importedPdfBytesLength: importedPdfBytes?.byteLength || 0
        });
      }, 10);
    }
  }, [isPdfImported, importedPdfBytes]);

  const handleRefreshPreview = () => {
    generateProfessionalPreview();
  };

  // Professional Compliance Summary Component
  const ComplianceSummaryPanel = ({ summary, selectedState }) => {
    const total = summary.error + summary.warning + summary.info;
    
    if (total === 0) {
      return (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '8px',
          margin: '12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Shield size={18} style={{ color: '#28a745' }} />
          <span style={{ fontWeight: '600' }}>
            No compliance issues detected for {selectedState}
          </span>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        padding: '16px',
        borderRadius: '8px',
        margin: '12px 0'
      }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#856404'
        }}>
          <Shield size={18} />
          Compliance Status for {selectedState}:
        </h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {summary.error > 0 && (
            <span style={{ 
              backgroundColor: '#f8d7da',
              padding: '6px 12px',
              borderRadius: '6px',
              color: '#721c24',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Critical Issues: {summary.error}
            </span>
          )}
          {summary.warning > 0 && (
            <span style={{ 
              backgroundColor: '#fff3e0',
              padding: '6px 12px',
              borderRadius: '6px',
              color: '#ef6c00',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Warnings: {summary.warning}
            </span>
          )}
          {summary.info > 0 && (
            <span style={{ 
              backgroundColor: '#e8f4f8',
              padding: '6px 12px',
              borderRadius: '6px',
              color: '#0277bd',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Notices: {summary.info}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Function to handle document removal
  const handleRemoveDocument = useCallback(() => {
    if (window.confirm('Are you sure you want to remove the imported document? This action cannot be undone.')) {
      // Clear all document-related state
      setOnlyofficeDocId(null);
      setPreviewMode('generated');
      setPreviewError(null);
      setTemplateContent(template?.content || '');
      setVariables({});
      setSentences([]);
      window.originalDocxFile = null;

      // Reset the file input
      const fileInput = document.getElementById('offerLetterInput');
      if (fileInput) {
        fileInput.value = '';
      }

      console.log('✅ Document removed successfully');
      alert('Document removed successfully. You can now import a new document.');
    }
  }, [template]);

  const renderProfessionalPreview = () => (
    <div className="email-preview">
      <div className="document-view">
        <div className="pdf-preview-container">
          {!onlyofficeDocId && !isLoadingPreview && !isImportingPdf && !previewError ? (
            <div className="import-placeholder">
              <FileText size={64} style={{ color: '#94a3b8', marginBottom: '24px' }} />
              <button
                className="btn-import-document"
                onClick={() => {
                  document.getElementById('offerLetterInput').click();
                }}
              >
                <FileText size={20} />
                Import Document
              </button>
              <p style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
                Upload a Word document to get started
              </p>
            </div>
          ) : previewError ? (
            <div className="preview-error">
              <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
              <h3>Connection Issue</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{previewError}</p>
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setPreviewError(null);
                    document.getElementById('offerLetterInput').click();
                  }}
                  className="btn-import-document"
                >
                  <FileText size={20} />
                  Import New Document
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px' }}
                >
                  <RefreshCw size={16} />
                  Reload Page
                </button>
              </div>
            </div>
          ) : isLoadingPreview || isImportingPdf ? (
            <div className="pdf-loading">
              <div className="spinner"></div>
              <p>{isImportingPdf ? 'Importing document...' : 'Loading preview...'}</p>
              <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
                {isImportingPdf ? 'Processing document and extracting variables...' : 'Please wait...'}
              </p>
            </div>
          ) : previewMode === 'onlyoffice' && onlyofficeDocId ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <OnlyOfficeViewer
                ref={onlyofficeViewerRef}
                documentId={onlyofficeDocId}
                onEditorReady={handleEditorReady}
                onSave={handleOnlyOfficeSave}
                onSessionExpired={handleOnlyOfficeSessionExpired}
                onVariablesUpdate={handleOnlyOfficeVariablesUpdate}
              />
            </div>
          ) : previewMode === 'docx-preview' && docxHtmlContent ? (
            <div className="pdf-viewport" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                flex: 1,
                padding: '24px',
                background: '#f5f5f5',
                borderRadius: '8px',
                overflow: 'auto'
              }}>
                {/* CKEditor with Mammoth HTML */}
                <WordDocumentEditor
                  htmlContent={docxHtmlContent}
                  variables={variables}
                  onVariableChange={(varName, value) => {
                    setVariables(prev => ({ ...prev, [varName]: value }));
                  }}
                  readOnly={false}
                />
              </div>
            </div>
          ) : isPdfImported || isPdfImportedRef.current ? (
            <div className="pdf-viewport">
              {/* Enhanced PDF viewer with real-time variable updates */}
              {console.log('Rendering DynamicPDFViewer with:', {
                importedPdfBytes: !!importedPdfBytes,
                importedPdfBytesLength: importedPdfBytes?.byteLength || 0,
                importedPdfBytesRef: !!importedPdfBytesRef.current,
                importedPdfBytesRefLength: importedPdfBytesRef.current?.byteLength || 0,
                isPdfImported,
                isPdfImportedRef: isPdfImportedRef.current,
                variablesCount: Object.keys(variables).length
              })}
              {((importedPdfBytes && importedPdfBytes.byteLength > 0) 
                || (importedPdfBytesRef.current && importedPdfBytesRef.current.byteLength > 0)
                || (uploadedPdfBytes && uploadedPdfBytes.byteLength > 0)) ? (
                <DynamicPDFViewer
                  key={`pdf-viewer-${pdfImportKey}`}
                  ref={enhancedPdfViewerRef}
                  pdfBytes={importedPdfBytes || importedPdfBytesRef.current || uploadedPdfBytes}
                  variables={variables}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onVariablesDetected={handleVariablesDetected}
                />
              ) : (
                <div className="pdf-placeholder">
                  <p>PDF imported but bytes not available</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Debug: isPdfImported={isPdfImported.toString()}, isPdfImportedRef={isPdfImportedRef.current.toString()}, hasBytes={!!importedPdfBytes}, hasBytesRef={!!importedPdfBytesRef.current}, uploadedHasBytes={!!uploadedPdfBytes}
                  </p>
                </div>
              )}
            </div>
          ) : previewPdfBytes ? (
            <div className="pdf-viewport" ref={pdfViewportContainerRef}>
              {/* Fallback: canvas rendering via pdf.js */}
              <canvas ref={canvasRef} className="pdf-canvas-full" />
            </div>
          ) : (
            <div className="preview-placeholder">
              <FileText size={48} />
              <h3>No Preview Available</h3>
              <p>Upload an offer letter or check template content</p>
              <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
                Professional formatting will be applied automatically
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Update editable spans with current variable values
  const updateEditableVariables = useCallback(() => {
    if (!editableRef.current) return;

    const editable = editableRef.current;
    const spans = editable.querySelectorAll('span[data-var]');
    spans.forEach(span => {
      const varName = span.getAttribute('data-var');
      const value = variables[varName] || `[${varName}]`;
      span.textContent = value;
    });
  }, [variables]);

  // Editable HTML editor overlay for template editing
  // Show this when previewMode is 'html-edit'
  const renderHtmlEditor = () => {
    if (previewMode !== 'html-edit') return null;

    return (
      <div className="email-preview html-edit-mode" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FileText size={18} />
            <strong>Editable Offer Letter (HTML) - Live Preview Below</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => { setPreviewMode('generated'); generateProfessionalPreview(); }}>
              Switch to Template Mode
            </button>
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              Download PDF
            </button>
          </div>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', minHeight: '280px', background: '#fff' }}>
          <div
            contentEditable
            suppressContentEditableWarning
            className="html-editable-area"
            ref={editableRef}
            style={{ outline: 'none', minHeight: '240px' }}
            onInput={(e) => {
              const newHtml = e.currentTarget.innerHTML;
              setTemplateContent(newHtml);

              if (htmlEditTimerRef.current) clearTimeout(htmlEditTimerRef.current);
              htmlEditTimerRef.current = setTimeout(() => {
                generateLivePdfPreview(newHtml);
              }, 500);
            }}
            dangerouslySetInnerHTML={{ __html: templateContent }}
          />
        </div>
      </div>
    );
  };

  const renderVariablesTab = () => {
    const search = (variableSearch || '').toLowerCase();
    const entries = Object.entries(variables || {})
      .filter(([k]) => !search || k.toLowerCase().includes(search))
      .filter(([k]) => !showFlaggedOnly || (variableMeta[k]?.flaggedOccurrences > 0));

    return (
      <div className="tab-content">
        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
          <input
            type="text"
            value={variableSearch}
            onChange={(e) => setVariableSearch(e.target.value)}
            placeholder="Search variables..."
            style={{ flex: '1', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '6px' }}
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={(e) => setShowFlaggedOnly(e.target.checked)}
            />
            Show variables in flagged sections only
          </label>
        </div>

        <div className="variables-list-invoice-style">
          {entries.length === 0 && (
            <div className="empty-state" style={{ padding: '16px' }}>
              <p>No variables match your filter.</p>
            </div>
          )}
          {entries.map(([key, value]) => {
            // Check if this is a section field (multi-line content)
            const isSection = key.includes('Confidentiality') || 
                            key.includes('Pre-Employment') || 
                            key.includes('Employment Agreement') || 
                            key.includes('Compliance with Policies') || 
                            key.includes('Governing Law');
            
            return (
              <div key={key} className="variable-row" style={{ alignItems: 'flex-start', flexDirection: isSection ? 'column' : 'row' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: isSection ? '1' : '0 0 220px', marginRight: isSection ? '0' : '10px', width: isSection ? '100%' : 'auto' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: isSection ? '8px 12px' : '0',
                    background: isSection ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                    borderRadius: isSection ? '6px' : '0',
                    marginBottom: isSection ? '8px' : '0'
                  }}>
                    {isSection && <FileText size={16} style={{ color: '#ffffff' }} />}
                    <input
                      type="text"
                      value={key}
                      readOnly
                      className="variable-name-input"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isSection ? '#ffffff' : 'inherit',
                        fontWeight: isSection ? '600' : 'normal',
                        fontSize: isSection ? '14px' : 'inherit',
                        padding: '0'
                      }}
                    />
                  </div>
                </div>
                <div className="variable-separator"></div>
                {isSection ? (
                  <textarea
                    value={value || ''}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    className="variable-value-input"
                    placeholder={`Enter content for ${key}...`}
                    rows={6}
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '0',
                      border: 'none',
                      borderRadius: '0',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      background: 'transparent',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    className="variable-value-input"
                    placeholder={`Enter ${key}...`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStateConfigTab = () => (
    <div className="tab-content">
      {/* Compliance Analysis Panel */}
      <div style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Shield size={20} />
            Legal Compliance Analysis ({sentences.length} sentences analyzed)
          </h3>
        </div>

        {Object.keys(complianceFlags).length === 0 && (
          <div style={{
            padding: '16px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0 }}>✅ No compliance issues detected</p>
          </div>
        )}
        {sentences
          .filter(sentence => complianceFlags[sentence.id])
          .map((sentence) => (
          <div key={sentence.id} style={{ marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: complianceFlags[sentence.id] ?
                (complianceFlags[sentence.id].some(f => f.severity === 'error') ? '#ffebee' : '#fff3e0') :
                '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderLeft: complianceFlags[sentence.id] ?
                `4px solid ${complianceFlags[sentence.id].some(f => f.severity === 'error') ? '#dc3545' : '#ffc107'}` :
                '4px solid #6c757d'
            }}>
              <strong style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                marginRight: '12px'
              }}>
                §{sentence.section}
              </strong>
              <span style={{
                backgroundColor: complianceFlags[sentence.id] ?
                  (complianceFlags[sentence.id].some(f => f.severity === 'error') ? '#ffcdd2' : '#fff8e1') :
                  'transparent',
                padding: complianceFlags[sentence.id] ? '3px 6px' : '0',
                borderRadius: '3px'
              }}>
                {sentence.text}
              </span>
            </div>

            {complianceFlags[sentence.id].map((flag, idx) => (
              <div key={idx} style={{
                backgroundColor: flag.severity === 'error' ? '#f8d7da' : '#fff3cd',
                padding: '12px',
                margin: '8px 0 8px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                borderLeft: `3px solid ${flag.severity === 'error' ? '#dc3545' : '#ffc107'}`
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                  {flag.severity === 'error' ? '🚨 ERROR' : '⚠️ WARNING'} - {flag.type.toUpperCase()}
                </div>
                <div style={{ marginBottom: '8px' }}>{flag.message}</div>

                {flag.lawReference && (
                  <div style={{
                    backgroundColor: '#e9ecef',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    marginBottom: '6px'
                  }}>
                    <strong>Legal Reference:</strong> {flag.lawReference}
                  </div>
                )}

                {flag.suggestion && (
                  <div style={{
                    backgroundColor: '#d4edda',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    marginBottom: '6px'
                  }}>
                    <strong>Suggestion:</strong> {flag.suggestion}
                  </div>
                )}

                {flag.alternativeLanguage && (
                  <div style={{
                    backgroundColor: '#d1ecf1',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}>
                    <strong>Alternative:</strong> "{flag.alternativeLanguage}"
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '10px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Shield size={20} /> Legal Compliance Configuration
          </h3>
          <button
            className="btn btn-secondary"
            onClick={() => setShowRulesManager(!showRulesManager)}
          >
            <BookOpen size={16} />
            {showRulesManager ? 'Hide' : 'Manage'} Rules
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
            Select State for Legal Compliance Check:
          </label>
          <select 
            value={stateConfig.selectedState} 
            onChange={(e) => handleStateChange(e.target.value)}
            style={{ 
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          >
            {US_STATES.map(state => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          
          <div style={{ marginTop: '8px', color: '#6c757d', fontSize: '0.875rem' }}>
            Rules Last Updated: {currentRules[stateConfig.selectedState]?.lastUpdated || 'Default'}
          </div>
        </div>
        
        {showRulesManager && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '15px' }}>
            <h4>Add New Compliance Rules for {stateConfig.selectedState}</h4>
            <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '16px' }}>
              Upload a PDF document containing compliance rules, legal requirements, or regulatory guidelines. 
              The system will automatically extract and create rules from the content.
            </p>
            <div style={{ 
              border: '2px dashed #dee2e6', 
              borderRadius: '8px', 
              padding: '24px', 
              textAlign: 'center',
              marginBottom: '16px',
              backgroundColor: '#f8f9fa'
            }}>
              <FileText size={32} style={{ color: '#6c757d', marginBottom: '8px' }} />
              <p style={{ margin: '0 0 12px 0', fontWeight: '500' }}>
                Upload Compliance Rules PDF
              </p>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6c757d' }}>
                Drag and drop a PDF file here, or click to browse
              </p>
              <input
                type="file"
                id="complianceRulesInput"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleComplianceRulesUpload}
              />
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('complianceRulesInput').click()}
              >
                <FileText size={16} style={{ marginRight: '8px' }} />
                Choose PDF File
              </button>
            </div>

            {newRuleData && (
              <div style={{ 
                backgroundColor: '#e8f5e8', 
                border: '1px solid #c3e6cb', 
                borderRadius: '6px', 
                padding: '12px',
                marginBottom: '16px'
              }}>
                <h6 style={{ margin: '0 0 8px 0', color: '#155724' }}>
                  📄 Extracted Rules Preview:
                </h6>
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  fontSize: '13px',
                  backgroundColor: '#fff',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #c3e6cb'
                }}>
                  <pre>{newRuleData}</pre>
                </div>
              </div>
            )}

            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleAddRule} 
                className="btn btn-primary"
                disabled={!newRuleData.trim()}
              >
                <Shield size={16} style={{ marginRight: '8px' }} />
                Save Extracted Rules
              </button>
              <button 
                onClick={() => {
                  setShowRulesManager(false);
                  setNewRuleData('');
                }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h5>Current {stateConfig.selectedState} Rules:</h5>
              {Object.keys(currentRules[stateConfig.selectedState]?.rules || {}).map(ruleName => (
                <div key={ruleName} style={{
                  padding: '8px',
                  marginBottom: '5px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong>{ruleName}:</strong> {currentRules[stateConfig.selectedState].rules[ruleName].message}
                  </div>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '0.75em',
                    backgroundColor: currentRules[stateConfig.selectedState].rules[ruleName].severity === 'error' ? '#dc3545' : '#ffc107',
                    color: currentRules[stateConfig.selectedState].rules[ruleName].severity === 'error' ? 'white' : '#000'
                  }}>
                    {currentRules[stateConfig.selectedState].rules[ruleName].severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditorPanel = () => (
    <div className="editor-panel">
      <div className="panel-header">
        <h3 className="panel-title">Template Editor</h3>
        {onlyofficeDocId && (
          <button
            onClick={handleRemoveDocument}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            title="Remove the imported document"
          >
            <AlertCircle size={16} />
            Remove Document
          </button>
        )}
      </div>
      
      {/* Show Variable Panel when in ONLYOFFICE mode with tabs */}
      {previewMode === 'onlyoffice' && onlyofficeDocId ? (
        <>
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'variables' ? 'active' : ''}`}
              onClick={() => setActiveTab('variables')}
            >
              <Settings size={16} />
              Variables
            </button>
            {/* Extract tab hidden to save space - functionality preserved */}
            {/* <button
              className={`tab-button ${activeTab === 'extraction' ? 'active' : ''}`}
              onClick={() => setActiveTab('extraction')}
            >
              <Edit3 size={16} />
              Extract
            </button> */}
            <button
              className={`tab-button ${activeTab === 'state' ? 'active' : ''}`}
              onClick={() => setActiveTab('state')}
            >
              <Shield size={16} />
              Compliance
            </button>
          </div>
          <div className="tab-content-wrapper">
            <div style={{ display: activeTab === 'variables' ? 'block' : 'none', height: '100%' }}>
              <VariablePanel
                variables={variables}
                onReplaceInTemplate={handleReplaceInTemplate}
                isEditorReady={isEditorReady}
              />
            </div>
            {/* Extract panel hidden to save space - functionality preserved in background */}
            {/* <div style={{ display: activeTab === 'extraction' ? 'block' : 'none', height: '100%' }}>
              <FormExtraction
                documentId={onlyofficeDocId}
                onVariablesExtracted={handleVariablesExtracted}
                editorRef={onlyofficeViewerRef}
              />
            </div> */}
            <div style={{ display: activeTab === 'state' ? 'block' : 'none', height: '100%' }}>
              {renderStateConfigTab()}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'variables' ? 'active' : ''}`}
              onClick={() => setActiveTab('variables')}
            >
              <Settings size={16} />
              Variables
            </button>
            <button
              className={`tab-button ${activeTab === 'state' ? 'active' : ''}`}
              onClick={() => setActiveTab('state')}
            >
              <Shield size={16} />
              Compliance
            </button>
          </div>
          <input
            type="file"
            id="offerLetterInput"
            accept=".docx"
            style={{ display: 'none' }}
            onChange={(e) => {
              console.log('File input onChange triggered', e.target.files);
              handleOfferLetterImport(e);
            }}
          />
          
          <div className="tab-content-wrapper">
            {activeTab === 'variables' && (
              <>
                {/* Enhanced PDF Processing Status */}
                {enhancedPdfProcessed && (
                  <div style={{ 
                    background: '#f0f9ff', 
                    border: '1px solid #0ea5e9', 
                    borderRadius: '6px', 
                    padding: '12px', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} style={{ color: '#0ea5e9' }} />
                    <div>
                      <div style={{ fontWeight: '500', color: '#0c4a6e', fontSize: '14px' }}>
                        Enhanced PDF Processing Complete
                      </div>
                      <div style={{ fontSize: '12px', color: '#0369a1' }}>
                        {enhancedPdfStats.totalVariables} variables found • {enhancedPdfStats.glinerSuggestions} AI suggestions
                      </div>
                    </div>
                  </div>
                )}
                
                {renderVariablesTab()}

                {/* Controls for variables tab */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                    placeholder="Search variables..."
                    style={{ flex: '1', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '6px' }}
                  />
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={showFlaggedOnly}
                      onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                    />
                    Show variables in flagged sections only
                  </label>
                  {previewMode === 'html-edit' && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={rescanVariables}
                      style={{ padding: '8px 12px', borderRadius: '6px' }}
                    >
                      Rescan Variables
                    </button>
                  )}
                </div>

                {/* Entities Panel: edit and apply NLP replacements */}
                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <EntitiesPanel
                  entities={extractedEntities}
                  variables={variables}
                  content={isPdfImported ? extractedPdfText : (editableRef.current ? editableRef.current.innerHTML : templateContent)}
                  onVariablesChange={(updated) => {
                    setVariables(updated);
                    if (previewMode === 'html-edit') updateEditableVariables();
                    setTimeout(() => {
                      if (previewMode === 'html-edit' && editableRef.current) {
                        generateLivePdfPreview(editableRef.current.innerHTML);
                      } else {
                        generateProfessionalPreview();
                      }
                    }, 300);
                  }}
                  onContentChange={(newContent) => {
                    if (previewMode === 'html-edit') {
                      setTemplateContent(newContent);
                      generateLivePdfPreview(newContent);
                    }
                  }}
                  onAfterApply={() => {
                    console.log('NLP replacement applied');
                    if (previewMode === 'html-edit') {
                      updateEditableVariables();
                      generateLivePdfPreview(editableRef.current?.innerHTML);
                    }
                  }}
                />
                </div>
              </>
            )}
            {activeTab === 'state' && renderStateConfigTab()}
          </div>
        </>
      )}
    </div>
  );

  // Function to split HTML content into pages
  const splitHtmlIntoPages = (htmlContent) => {
    // Split by explicit page breaks first
    let pages = htmlContent.split(/<div[^>]*style="[^"]*page-break-after:\s*always[^"]*"[^>]*>/gi);
    
    // If no explicit page breaks, split by approximate content length
    if (pages.length === 1) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const elements = Array.from(tempDiv.children);
      
      pages = [];
      let currentPage = '';
      let currentHeight = 0;
      const maxHeight = 1056; // Approximate height for 11 inches at 96 DPI
      
      elements.forEach((element) => {
        const elementHtml = element.outerHTML;
        const estimatedHeight = elementHtml.length / 5; // Rough estimate
        
        if (currentHeight + estimatedHeight > maxHeight && currentPage) {
          pages.push(currentPage);
          currentPage = elementHtml;
          currentHeight = estimatedHeight;
        } else {
          currentPage += elementHtml;
          currentHeight += estimatedHeight;
        }
      });
      
      if (currentPage) {
        pages.push(currentPage);
      }
    }
    
    return pages.length > 0 ? pages : [htmlContent];
  };

  const rescanVariables = useCallback(() => {
    if (!editableRef.current) {
      alert('Editable area not available');
      return;
    }

    const spans = editableRef.current.querySelectorAll('span[data-var]');
    const newVars = {};
    spans.forEach(span => {
      const varName = span.getAttribute('data-var');
      if (varName && !variables[varName]) {
        newVars[varName] = '';
      }
    });

    if (Object.keys(newVars).length > 0) {
      setVariables(prev => ({ ...prev, ...newVars }));
      console.log(`Added ${Object.keys(newVars).length} new variables from HTML`);
      alert(`Added ${Object.keys(newVars).length} new variables!`);
      generateLivePdfPreview(editableRef.current.innerHTML);
    } else {
      alert('No new variables found.');
    }
  }, [variables]);

  async function handleOfferLetterImport(event) {
    console.log('handleOfferLetterImport called');
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check if it's a Word document
    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Please upload a Word document (.docx file)');
      return;
    }

    try {
      setIsImportingPdf(true);
      setPreviewError(null);

      // Store the original file for later download
      window.originalDocxFile = file;

      // Create separate FormData objects for each endpoint
      const formData1 = new FormData();
      formData1.append('file', file);

      const formData2 = new FormData();
      formData2.append('file', file);

      // Call only the necessary endpoints for ONLYOFFICE workflow
      const [variablesResponse, onlyofficeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/docx-extract-variables`, {
          method: 'POST',
          body: formData1
        }),
        fetch(`${API_BASE_URL}/api/onlyoffice/upload`, {
          method: 'POST',
          body: formData2
        })
      ]);

      // Check responses
      if (!variablesResponse.ok) {
        const varError = await variablesResponse.json().catch(() => ({}));
        const errorMsg = `Variables API (${variablesResponse.status}): ${varError.error || varError.message || 'Unknown error'}`;
        throw new Error(errorMsg);
      }

      if (!onlyofficeResponse.ok) {
        const onlyofficeError = await onlyofficeResponse.json().catch(() => ({}));
        const errorMsg = `ONLYOFFICE Upload (${onlyofficeResponse.status}): ${onlyofficeError.error || onlyofficeError.message || 'Unknown error'}`;
        throw new Error(errorMsg);
      }

      const variablesResult = await variablesResponse.json();
      const onlyofficeResult = await onlyofficeResponse.json();

      if (!variablesResult.success) {
        throw new Error(variablesResult.error || 'Failed to process Word document');
      }

      if (!onlyofficeResult.success) {
        throw new Error(onlyofficeResult.error || 'Failed to upload to ONLYOFFICE');
      }

      // Store ONLYOFFICE document ID only if successful
      if (onlyofficeResult.document_id) {
        console.log('✅ ONLYOFFICE document uploaded:', onlyofficeResult.document_id);
        setOnlyofficeDocId(onlyofficeResult.document_id);
        setPreviewMode('onlyoffice');
      } else {
        throw new Error('ONLYOFFICE upload did not return a document ID');
      }

      // Set template content as text (for variable detection and compliance)
      const documentText = variablesResult.data.text || '';
      setTemplateContent(documentText);
      setTemplateLoaded(true);

      // Extract and analyze sentences for compliance
      const splitSentences = documentText
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 10)
        .map((sentence, index) => ({
          id: `sentence_${index}`,
          text: sentence.trim(),
          section: Math.floor(index / 3) + 1
        }));

      setSentences(splitSentences);
      console.log('📄 Document text extracted for compliance:', splitSentences.length, 'sentences');

      // Extract variables from the result
      const extractedVars = {};
      Object.entries(variablesResult.data.variables || {}).forEach(([varName, varData]) => {
        extractedVars[varName] = varData.suggested_value || '';
      });

      setVariables(extractedVars);

      // Set metadata
      const metadata = variablesResult.data.metadata || {};
      console.log('Document metadata:', metadata);

      // Give user feedback
      alert(`Word document imported successfully! Found ${Object.keys(extractedVars).length} variables. Edit them in the Variables panel on the right.`);
      setIsImportingPdf(false);

    } catch (error) {
      console.error('Error importing Word document:', error);
      setPreviewError(`Failed to import Word document: ${error.message}. Ensure backend is running on port 5000.`);
      alert('Failed to import Word document: ' + error.message);
      setIsImportingPdf(false);
    }
  }

  return (
    <div className="email-editor">
      <div className="split-view">
        {previewMode === 'html-edit' ? renderHtmlEditor() : renderProfessionalPreview()}
        {renderEditorPanel()}
      </div>
    </div>
  );
};

export default EmailEditor;

