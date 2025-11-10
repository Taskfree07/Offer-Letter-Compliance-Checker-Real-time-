/**
 * OnlyOffice Form Service
 * Directly manipulates OnlyOffice Editor using JavaScript API
 */

class OnlyOfficeFormService {
  constructor() {
    this.apiBaseUrl = 'http://127.0.0.1:5000/api';
    this.documentId = null;
    this.extractedFields = null;
    this.analyzedFields = null;
    this.editorInstance = null;
  }

  /**
   * Set the current document ID and editor instance
   */
  setDocumentId(docId) {
    this.documentId = docId;
    console.log('OnlyOffice Form Service: Document ID set to', docId);
  }

  /**
   * Set the OnlyOffice editor instance for direct manipulation
   */
  setEditorInstance(editor) {
    this.editorInstance = editor;
    console.log('OnlyOffice Form Service: Editor instance set', !!editor);
  }

  /**
   * Get document content from OnlyOffice editor
   */
  async getDocumentContent() {
    return new Promise((resolve, reject) => {
      if (!window.onlyofficeEditor) {
        reject(new Error('OnlyOffice editor not available'));
        return;
      }

      try {
        // Use connector to get document content
        window.onlyofficeEditor.asc_DownloadOrigin();

        // Alternative: Get text content
        setTimeout(() => {
          resolve({ success: true });
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Extract bracketed fields [FIELD_NAME] directly from the document
   * Uses backend API to read the saved document file
   */
  async extractFormData(documentId = null) {
    const docId = documentId || this.documentId;
    if (!docId) {
      throw new Error('No document ID provided');
    }

    try {
      console.log('🔍 Extracting bracketed fields from document:', docId);

      // Call backend to extract variables from the saved file
      const response = await fetch(`${this.apiBaseUrl}/onlyoffice/extract-realtime/${docId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to extract form data: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Convert variables to fields format
        const fields = Object.entries(data.variables || {}).map(([key, varData]) => ({
          key: key,
          name: key,
          type: 'text',
          value: typeof varData === 'object' ? (varData.suggested_value || varData.value || '') : varData || '',
          original_value: typeof varData === 'object' ? (varData.suggested_value || varData.value || '') : varData || ''
        }));

        this.extractedFields = fields;
        console.log('✅ Form fields extracted:', {
          fieldCount: fields.length,
          fields: fields
        });

        return {
          success: true,
          fields: fields,
          count: fields.length
        };
      } else {
        throw new Error(data.error || 'Form extraction failed');
      }
    } catch (error) {
      console.error('❌ Error extracting form data:', error);
      throw error;
    }
  }

  /**
   * Send extracted fields to NLP backend for analysis
   * The NLP backend will analyze field names and content to provide better suggestions
   */
  async analyzeWithNLP(fields = null) {
    const fieldsToAnalyze = fields || this.extractedFields;
    if (!fieldsToAnalyze || fieldsToAnalyze.length === 0) {
      throw new Error('No fields to analyze. Please extract form data first.');
    }

    try {
      console.log('Sending fields to NLP for analysis:', fieldsToAnalyze);

      const response = await fetch(`${this.apiBaseUrl}/analyze-form-fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: fieldsToAnalyze
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `NLP analysis failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.analyzedFields = data.analyzed_fields;
        console.log('NLP analysis complete:', {
          fieldCount: data.analyzed_fields.length,
          fields: data.analyzed_fields
        });

        return {
          success: true,
          fields: data.analyzed_fields,
          count: data.analyzed_fields.length
        };
      } else {
        throw new Error(data.error || 'NLP analysis failed');
      }
    } catch (error) {
      console.error('Error during NLP analysis:', error);
      throw error;
    }
  }

  /**
   * Replace bracketed fields directly in OnlyOffice editor using Find & Replace
   */
  async updateFormData(fields = null, editorRef = null) {
    const fieldsToUpdate = fields || this.analyzedFields;
    const editor = editorRef || this.editorInstance;

    if (!fieldsToUpdate || fieldsToUpdate.length === 0) {
      throw new Error('No fields to update');
    }

    if (!editor) {
      throw new Error('OnlyOffice editor reference not available');
    }

    try {
      console.log('🔄 Replacing fields in OnlyOffice editor:', fieldsToUpdate);

      // Convert fields to variables format
      const variablesObj = {};
      fieldsToUpdate.forEach(field => {
        const key = field.key || field.name;
        const value = field.suggested_value || field.value || '';
        if (key) {
          variablesObj[key] = value;
        }
      });

      // Use the editor's replaceAllVariables method
      if (editor.replaceAllVariables && typeof editor.replaceAllVariables === 'function') {
        await editor.replaceAllVariables(variablesObj);

        console.log('✅ Fields replaced successfully in editor');
        return {
          success: true,
          updatedCount: Object.keys(variablesObj).length
        };
      } else {
        throw new Error('Editor replaceAllVariables method not available');
      }
    } catch (error) {
      console.error('❌ Error replacing fields in editor:', error);
      throw error;
    }
  }

  /**
   * Convert analyzed fields to variables format for Variable Panel
   */
  convertFieldsToVariables(fields = null) {
    const fieldsToConvert = fields || this.analyzedFields || this.extractedFields;
    if (!fieldsToConvert) {
      return {};
    }

    const variables = {};
    fieldsToConvert.forEach(field => {
      const key = field.key || field.name || field.id;
      const value = field.suggested_value || field.value || '';

      if (key) {
        variables[key] = value;
      }
    });

    return variables;
  }

  /**
   * Get current extracted fields
   */
  getExtractedFields() {
    return this.extractedFields;
  }

  /**
   * Get current analyzed fields
   */
  getAnalyzedFields() {
    return this.analyzedFields;
  }

  /**
   * Clear stored data
   */
  clear() {
    this.documentId = null;
    this.extractedFields = null;
    this.analyzedFields = null;
  }
}

// Export singleton instance
const onlyofficeFormService = new OnlyOfficeFormService();
export default onlyofficeFormService;


