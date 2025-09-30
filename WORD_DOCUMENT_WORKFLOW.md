# Word Document Workflow

## Overview

The application now supports **Word documents (.docx)** for a simpler, more practical editing workflow:

1. **Import** a Word document (.docx)
2. **Edit variables** in the right panel
3. **Preview** the document on the left
4. **Download** as Word document (.docx) with all edits applied

## Backend Endpoints

### 1. Extract Variables from Word Document
**Endpoint**: `POST /api/docx-extract-variables`

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: file (Word document .docx)

**Response**:
```json
{
  "success": true,
  "data": {
    "variables": {
      "CANDIDATE_NAME": {
        "name": "CANDIDATE_NAME",
        "original_text": "[CANDIDATE_NAME]",
        "occurrences": 3,
        "suggested_value": ""
      },
      "SALARY": {
        "name": "SALARY",
        "original_text": "[SALARY]",
        "occurrences": 2,
        "suggested_value": ""
      }
    },
    "text": "Full document text...",
    "metadata": {
      "paragraph_count": 15,
      "table_count": 2,
      "total_variables": 8
    }
  },
  "message": "Extracted 8 variables from Word document"
}
```

### 2. Replace Variables and Download
**Endpoint**: `POST /api/docx-replace-variables`

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - file (original Word document)
  - variables (JSON string of variable values)

**Response**:
- Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Returns the modified Word document as a download

### 3. Health Check
**Endpoint**: `GET /api/docx-health`

**Response**:
```json
{
  "available": true,
  "message": "Word document service ready"
}
```

## Variable Detection

The service detects variables in these formats:
- `[VARIABLE_NAME]` - Standard square brackets
- `{VARIABLE_NAME}` - Curly braces
- `<<VARIABLE_NAME>>` - Double angle brackets

## Features

✅ **Preserves formatting**: All Word document formatting is maintained
✅ **Table support**: Variables in tables are detected and replaced
✅ **Multiple occurrences**: Same variable can appear multiple times
✅ **Simple workflow**: Upload → Edit → Download
✅ **No HTML conversion**: Works directly with Word documents

## Frontend Integration Needed

You'll need to update the frontend to:

1. **Change file input** to accept `.docx` files:
```javascript
<input type="file" accept=".docx" onChange={handleDocxImport} />
```

2. **Call the new endpoint** for import:
```javascript
async function handleDocxImport(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://127.0.0.1:5000/api/docx-extract-variables', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  setVariables(result.data.variables);
  setDocumentText(result.data.text);
}
```

3. **Download with replaced variables**:
```javascript
async function handleDownload() {
  const formData = new FormData();
  formData.append('file', originalFile); // Store original file
  formData.append('variables', JSON.stringify(variables));
  
  const response = await fetch('http://127.0.0.1:5000/api/docx-replace-variables', {
    method: 'POST',
    body: formData
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'edited_document.docx';
  a.click();
}
```

## Example Word Document

Create a template like this:

```
Dear [CANDIDATE_NAME],

We are pleased to offer you the position of [JOB_TITLE] at [COMPANY_NAME].

Your starting salary will be [SALARY] per year, with a start date of [START_DATE].

Benefits include:
- Health insurance
- [VACATION_DAYS] days of paid vacation
- 401(k) matching

Please sign and return by [RESPONSE_DEADLINE].

Sincerely,
[MANAGER_NAME]
[MANAGER_TITLE]
```

## Testing

Test the endpoints:

```bash
# Check if service is available
curl http://127.0.0.1:5000/api/docx-health

# Extract variables (replace with your .docx file)
curl -X POST -F "file=@template.docx" http://127.0.0.1:5000/api/docx-extract-variables

# Replace variables and download
curl -X POST \
  -F "file=@template.docx" \
  -F 'variables={"CANDIDATE_NAME":"John Doe","SALARY":"$75,000"}' \
  http://127.0.0.1:5000/api/docx-replace-variables \
  --output edited.docx
```

## Next Steps

1. ✅ Backend is ready with Word document support
2. ⏳ Update frontend to use `.docx` files instead of PDFs
3. ⏳ Add Word document preview (can use iframe or convert to PDF for preview)
4. ⏳ Update download logic to use `/api/docx-replace-variables`

The backend is fully functional and ready to handle Word documents!
