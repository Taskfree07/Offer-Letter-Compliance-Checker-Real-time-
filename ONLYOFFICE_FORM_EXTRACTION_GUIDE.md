# OnlyOffice Form Field Extraction & NLP Integration Guide

## Overview

This integration combines OnlyOffice JavaScript API with your external NLP backend to:
1. Extract bracketed form fields (e.g., `[CANDIDATE_NAME]`) from Word documents
2. Analyze field content using NLP (spaCy + GLiNER)
3. Display extracted fields in the Variable Panel on the right side
4. Update document fields with NLP-enriched suggestions

## Architecture

```
┌─────────────────────┐
│  React Frontend     │
│  (EmailEditor.js)   │
└──────────┬──────────┘
           │
           ├─> OnlyOffice Editor (displays .docx)
           │   └─> Variable Panel (displays extracted fields)
           │
           ├─> OnlyOfficeFormService.js
           │   ├─> Extract Form Data
           │   ├─> Analyze with NLP
           │   └─> Update Form Data
           │
           └─> Flask Backend (Python)
               ├─> /api/onlyoffice/extract-forms/<doc_id>
               ├─> /api/analyze-form-fields
               └─> /api/onlyoffice/update-forms/<doc_id>
```

## Components Created

### 1. **OnlyOffice Plugin** (`/public/onlyoffice-plugin/`)
- `config.json`: Plugin configuration
- `index.html`: Plugin UI with extraction/analysis buttons
- Communicates with parent window via `postMessage`

### 2. **Frontend Service** (`/src/services/onlyofficeFormService.js`)
- `extractFormData(documentId)`: Calls backend to extract bracketed fields
- `analyzeWithNLP(fields)`: Sends fields to NLP backend for analysis
- `updateFormData(fields, documentId)`: Updates document with analyzed values
- `convertFieldsToVariables(fields)`: Converts fields to Variable Panel format

### 3. **Backend Endpoints** (`/python-nlp/app.py`)
- `POST /api/onlyoffice/extract-forms/<doc_id>`: Extract bracketed variables from document
- `POST /api/analyze-form-fields`: Analyze field names/content with NLP (spaCy + GLiNER)
- `POST /api/onlyoffice/update-forms/<doc_id>`: Update document with analyzed values

### 4. **Variable Panel** (`/src/components/VariablePanel.js`)
- New extraction controls section
- Three action buttons:
  - **Extract Form Fields**: Extracts `[VARIABLE_NAME]` from document
  - **Analyze with NLP**: Uses NLP to categorize and suggest values
  - **Update Document**: Writes analyzed values back to document

## Workflow

### Step 1: Import Document
1. User imports a Word document (.docx) with bracketed fields like:
   ```
   Dear [CANDIDATE_NAME],

   Welcome to [COMPANY_NAME]! Your position is [JOB_TITLE]
   with a salary of [SALARY] starting on [START_DATE].
   ```
2. Document loads in OnlyOffice Editor
3. Variable Panel displays on the right side

### Step 2: Extract Form Fields
1. User clicks **"Extract Form Fields"** button
2. Frontend calls: `onlyofficeFormService.extractFormData(documentId)`
3. Backend extracts all `[VARIABLE_NAME]` patterns from document
4. Returns array of field objects:
   ```json
   [
     {
       "key": "CANDIDATE_NAME",
       "name": "CANDIDATE_NAME",
       "type": "text",
       "value": "",
       "original_value": ""
     },
     {
       "key": "COMPANY_NAME",
       "name": "COMPANY_NAME",
       "type": "text",
       "value": "",
       "original_value": ""
     }
   ]
   ```
5. Status shows: ✅ Extracted X fields

### Step 3: Analyze with NLP
1. User clicks **"Analyze with NLP"** button
2. Frontend calls: `onlyofficeFormService.analyzeWithNLP(extractedFields)`
3. Backend analyzes each field:
   - Uses spaCy NER to categorize field names (PERSON, ORG, DATE, etc.)
   - If GLiNER is available, provides smart suggestions
   - Enriches fields with:
     - `nlp_category`: Entity type detected by NLP
     - `suggested_value`: AI-generated suggestion (if GLiNER available)
4. Returns enriched fields:
   ```json
   [
     {
       "key": "CANDIDATE_NAME",
       "name": "CANDIDATE_NAME",
       "type": "text",
       "original_value": "",
       "suggested_value": "John Doe",
       "nlp_category": "PERSON"
     },
     {
       "key": "COMPANY_NAME",
       "name": "COMPANY_NAME",
       "type": "text",
       "original_value": "",
       "suggested_value": "Acme Corporation",
       "nlp_category": "ORG"
     }
   ]
   ```
5. Variable Panel displays fields grouped by category
6. Status shows: ✅ Extracted X fields | 🔬 Analyzed with NLP

### Step 4: Edit Variables
1. User edits field values in Variable Panel
2. Changes are tracked locally (no realtime updates)
3. Suggestions from NLP can be applied with 💡 button

### Step 5: Update Document
1. User clicks **"Update Document"** button
2. Frontend calls: `onlyofficeFormService.updateFormData(analyzedFields, documentId)`
3. Backend replaces all `[VARIABLE_NAME]` with actual values
4. Document is updated and saved
5. User sees changes reflected in OnlyOffice Editor

## API Reference

### Frontend Service Methods

#### `onlyofficeFormService.extractFormData(documentId)`
**Returns:**
```javascript
{
  success: true,
  fields: [...],
  count: 5
}
```

#### `onlyofficeFormService.analyzeWithNLP(fields)`
**Returns:**
```javascript
{
  success: true,
  fields: [...],  // enriched with NLP data
  count: 5,
  gliner_enabled: true
}
```

#### `onlyofficeFormService.updateFormData(fields, documentId)`
**Returns:**
```javascript
{
  success: true,
  updatedCount: 5
}
```

### Backend Endpoints

#### `POST /api/onlyoffice/extract-forms/<doc_id>`
**Request:** (none)
**Response:**
```json
{
  "success": true,
  "fields": [
    {
      "key": "VARIABLE_NAME",
      "name": "VARIABLE_NAME",
      "type": "text",
      "value": "",
      "original_value": ""
    }
  ],
  "count": 5,
  "message": "Extracted 5 form fields"
}
```

#### `POST /api/analyze-form-fields`
**Request:**
```json
{
  "fields": [
    {
      "key": "CANDIDATE_NAME",
      "value": "",
      "type": "text"
    }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "analyzed_fields": [
    {
      "key": "CANDIDATE_NAME",
      "name": "CANDIDATE_NAME",
      "type": "text",
      "original_value": "",
      "suggested_value": "John Doe",
      "nlp_category": "PERSON"
    }
  ],
  "count": 1,
  "gliner_enabled": true,
  "message": "Analyzed 1 fields"
}
```

#### `POST /api/onlyoffice/update-forms/<doc_id>`
**Request:**
```json
{
  "fields": [
    {
      "key": "CANDIDATE_NAME",
      "suggested_value": "John Doe"
    }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "updated_count": 1,
  "message": "Updated 1 form fields successfully. Reload to see changes."
}
```

## Testing Procedure

### Prerequisites
1. Backend running: `python python-nlp/app.py`
2. Frontend running: `npm start`
3. OnlyOffice Document Server running: `docker-compose up -d`

### Test Steps

1. **Import Test Document**
   - Create a Word document with bracketed fields:
     ```
     [CANDIDATE_NAME]
     [COMPANY_NAME]
     [JOB_TITLE]
     [SALARY]
     [START_DATE]
     ```
   - Save as `test-offer-letter.docx`
   - Import via "Import Document" button

2. **Test Extraction**
   - Click "Extract Form Fields" button
   - Verify: Alert shows "Successfully extracted 5 form fields!"
   - Verify: Status shows "✅ Extracted 5 fields"

3. **Test NLP Analysis**
   - Click "Analyze with NLP" button
   - Verify: Alert shows "NLP analysis complete! 5 fields analyzed."
   - Verify: Status shows "✅ Extracted 5 fields | 🔬 Analyzed with NLP"
   - Verify: Variable Panel displays grouped fields

4. **Test Field Editing**
   - Edit a field value in Variable Panel
   - Verify: "Replace in Template" button shows changes indicator

5. **Test Document Update**
   - Click "Update Document" button
   - Verify: Alert shows "Successfully updated 5 form fields!"
   - Verify: Changes appear in OnlyOffice Editor

### Expected Console Logs

**Frontend:**
```
OnlyOffice Form Service: Document ID set to abc123
📋 Extracted 5 form fields from document abc123
🔬 Analyzed 5 form fields with NLP
✅ Updated 5 form fields in document abc123
```

**Backend:**
```
📋 Extracted 5 form fields from document abc123
🔬 Analyzed 5 form fields with NLP
✅ Updated 5 form fields in document abc123
```

## Troubleshooting

### Issue: "No document loaded"
**Solution:** Ensure documentId is passed to VariablePanel in EmailEditor.js (line 1763)

### Issue: "Failed to extract form data"
**Solution:**
- Check backend is running on port 5000
- Verify document was uploaded successfully
- Check browser console for CORS errors

### Issue: "NLP analysis failed"
**Solution:**
- Verify spaCy is installed: `pip install spacy`
- Verify GLiNER (optional): `pip install gliner`
- Check backend logs for Python errors

### Issue: Fields not showing in Variable Panel
**Solution:**
- Ensure document uses bracketed format: `[VARIABLE_NAME]`
- Check extraction status message
- Verify variables state is updated (React DevTools)

## Advanced: Custom OnlyOffice Plugin (Optional)

For deeper integration, you can use the OnlyOffice plugin created in `/public/onlyoffice-plugin/`:

1. **Load Plugin in OnlyOffice:**
   ```javascript
   const config = {
     // ... existing config
     editorConfig: {
       plugins: {
         pluginsData: [
           "http://localhost:3000/onlyoffice-plugin/config.json"
         ]
       }
     }
   };
   ```

2. **Plugin Features:**
   - Runs inside OnlyOffice Editor iframe
   - Direct access to `GetFormsData()` and `SetFormsData()` API
   - Can communicate with parent window via `postMessage`

## Notes

- **No Realtime Updates:** Changes are only applied when user clicks "Update Document"
- **GLiNER Optional:** NLP analysis works without GLiNER but provides better suggestions with it
- **Bracketed Format Required:** Variables must be in format `[VARIABLE_NAME]` (no spaces inside brackets)
- **Content Controls:** Backend can convert bracketed variables to Content Controls for better protection

## Files Modified/Created

### Created:
- `public/onlyoffice-plugin/config.json`
- `public/onlyoffice-plugin/index.html`
- `src/services/onlyofficeFormService.js`
- `ONLYOFFICE_FORM_EXTRACTION_GUIDE.md`

### Modified:
- `python-nlp/app.py` (added 3 endpoints)
- `src/components/VariablePanel.js` (added extraction controls)
- `src/components/VariablePanel.css` (added styles)
- `src/components/EmailEditor.js` (passed documentId prop)

## Next Steps

1. Test the complete workflow with a real document
2. Enhance NLP suggestions with more training data
3. Add form field validation (e.g., date format, email format)
4. Implement batch processing for multiple documents
5. Add export functionality for extracted data

---

**🔗 Related Documentation:**
- [OnlyOffice API Docs](https://api.onlyoffice.com/docs/office-api/)
- [spaCy NER](https://spacy.io/usage/linguistic-features#named-entities)
- [GLiNER](https://github.com/urchade/GLiNER)
