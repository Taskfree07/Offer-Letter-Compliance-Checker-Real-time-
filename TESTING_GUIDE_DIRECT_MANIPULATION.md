# Testing Guide: Direct Editor Manipulation

## Prerequisites

### 1. Backend Running
```bash
cd python-nlp
python app.py
```
**Expected**: Backend running on `http://127.0.0.1:5000`

### 2. OnlyOffice Document Server Running
```bash
docker ps
```
**Expected**: OnlyOffice container running on port `8080`

If not running:
```bash
docker-compose up -d onlyoffice-documentserver
```

### 3. Frontend Running
```bash
npm start
```
**Expected**: React app running on `http://localhost:3000`

---

## Test Workflow

### Test 1: Import Document

**Steps**:
1. Open `http://localhost:3000` in browser
2. Click "Select Template" → "Offer Letter Template"
3. Click "Import Document" button (right panel)
4. Select a Word document (.docx) with bracketed variables like:
   ```
   Employee Name: [EMPLOYEE_NAME]
   Start Date: [START_DATE]
   Salary: [SALARY]
   Position: [POSITION]
   ```
5. Wait for document to upload

**Expected Result**:
- ✅ Document loads in OnlyOffice editor
- ✅ Right panel shows "Template Editor" with 3 tabs: Variables | Extract | Compliance
- ✅ Variables tab shows all extracted variables
- ✅ OnlyOffice editor shows document content with bracketed variables

**Console Output**:
```
✅ ONLYOFFICE document uploaded: doc_12345
📄 Document text extracted for compliance: 15 sentences
```

---

### Test 2: Extract Form Fields

**Steps**:
1. After document import, switch to "Extract" tab in right panel
2. Click "Extract Form Fields" button (Step 1)
3. Wait for extraction to complete

**Expected Result**:
- ✅ Status message: "✅ Extracted 4 form fields"
- ✅ Fields preview shows all detected variables:
  - EMPLOYEE_NAME
  - START_DATE
  - SALARY
  - POSITION

**Console Output**:
```
🔍 Extracting bracketed fields from document: doc_12345
✅ Form fields extracted: {
  fieldCount: 4,
  fields: [
    {key: "EMPLOYEE_NAME", name: "EMPLOYEE_NAME", type: "text", value: ""},
    {key: "START_DATE", name: "START_DATE", type: "text", value: ""},
    {key: "SALARY", name: "SALARY", type: "text", value: ""},
    {key: "POSITION", name: "POSITION", type: "text", value: ""}
  ]
}
```

**What to Check**:
- Step 1 should be **green** (completed)
- Step 2 "Analyze with NLP" button should be **enabled**
- Fields preview should show all variables

---

### Test 3: Analyze with NLP

**Steps**:
1. After extraction, click "Analyze with NLP" button (Step 2)
2. Wait for NLP analysis (may take 2-5 seconds)
3. Check Variables tab

**Expected Result**:
- ✅ Status message: "✅ Analyzed 4 fields with NLP"
- ✅ Automatically switches to "Variables" tab
- ✅ Variables tab shows AI-suggested values

**Console Output**:
```
Sending fields to NLP for analysis: (4) [{...}, {...}, {...}, {...}]
NLP analysis complete: {
  fieldCount: 4,
  fields: [
    {
      key: "EMPLOYEE_NAME",
      type: "text",
      original_value: "",
      suggested_value: "John Smith",
      nlp_category: "PERSON"
    },
    {
      key: "START_DATE",
      type: "text",
      original_value: "",
      suggested_value: "January 15, 2024",
      nlp_category: "DATE"
    },
    {
      key: "SALARY",
      type: "text",
      original_value: "",
      suggested_value: "$120,000",
      nlp_category: "MONEY"
    },
    {
      key: "POSITION",
      type: "text",
      original_value: "",
      suggested_value: "Senior Software Engineer",
      nlp_category: "JOB_TITLE"
    }
  ]
}
```

**What to Check**:
- Step 2 should be **green** (completed)
- Step 3 "Update Document" button should be **enabled**
- Variables tab should show suggested values
- Fields should have categories (PERSON, DATE, MONEY, etc.)

---

### Test 4: Update Document (Direct Manipulation)

**Steps**:
1. After NLP analysis, switch back to "Extract" tab
2. Click "Update Document" button (Step 3)
3. Observe OnlyOffice editor

**Expected Result**:
- ✅ Status message: "✅ Updated 4 fields in document"
- ✅ **OnlyOffice editor shows changes immediately**
- ✅ All bracketed variables replaced with values:
  - `[EMPLOYEE_NAME]` → "John Smith"
  - `[START_DATE]` → "January 15, 2024"
  - `[SALARY]` → "$120,000"
  - `[POSITION]` → "Senior Software Engineer"

**Console Output**:
```
🔄 Replacing all variables in document...
📝 Updating variable [EMPLOYEE_NAME] to "John Smith"
✅ Variable [EMPLOYEE_NAME] replaced with "John Smith"
📝 Updating variable [START_DATE] to "January 15, 2024"
✅ Variable [START_DATE] replaced with "January 15, 2024"
📝 Updating variable [SALARY] to "$120,000"
✅ Variable [SALARY] replaced with "$120,000"
📝 Updating variable [POSITION] to "Senior Software Engineer"
✅ Variable [POSITION] replaced with "Senior Software Engineer"
✅ All variables replaced successfully
✅ Fields replaced successfully in editor
```

**What to Check**:
- ✅ Changes visible **immediately** in editor (no reload)
- ✅ Document content updated with AI-suggested values
- ✅ No page refresh or file re-upload
- ✅ Step 3 should be **green** (completed)

---

### Test 5: Edit Variables Manually

**Steps**:
1. After updating document, switch to "Variables" tab
2. Change a variable value (e.g., change "John Smith" to "Jane Doe")
3. Click "Replace in Template" button at bottom of Variables panel
4. Observe OnlyOffice editor

**Expected Result**:
- ✅ OnlyOffice editor updates with new value
- ✅ "John Smith" replaced with "Jane Doe" in document

**Console Output**:
```
📝 Variable [EMPLOYEE_NAME] updated locally, will apply on Replace click
🔄 Replacing all variables in template...
✅ Variables successfully replaced in template
```

---

## Error Cases to Test

### Error 1: Extract Before Document Ready

**Steps**:
1. Import a document
2. Immediately click "Extract Form Fields" before OnlyOffice loads

**Expected Result**:
- ⚠️ Status message: "❌ No document loaded"
- OR backend returns 404 (document session not ready)

**Fix**: Wait for OnlyOffice editor to finish loading

---

### Error 2: Analyze Before Extract

**Steps**:
1. Import a document
2. Click "Analyze with NLP" without extracting first

**Expected Result**:
- ⚠️ Status message: "❌ Please extract form data first"
- Button should be **disabled**

**Fix**: Click "Extract Form Fields" first

---

### Error 3: Update Before Analyze

**Steps**:
1. Import a document
2. Extract form fields
3. Click "Update Document" without analyzing

**Expected Result**:
- ⚠️ Status message: "❌ Please analyze fields first"
- Button should be **disabled**

**Fix**: Click "Analyze with NLP" first

---

### Error 4: Backend Not Running

**Steps**:
1. Stop Python backend (`Ctrl+C` in terminal)
2. Try to extract form fields

**Expected Result**:
- ⚠️ Status message: "❌ Failed: fetch failed"
- Console error: Network request failed

**Fix**: Start backend: `python python-nlp/app.py`

---

### Error 5: OnlyOffice Not Running

**Steps**:
1. Stop OnlyOffice container: `docker-compose stop onlyoffice-documentserver`
2. Try to import document

**Expected Result**:
- ⚠️ Error message: "ONLYOFFICE Document Server is not responding"
- Document fails to load

**Fix**: Start OnlyOffice: `docker-compose up -d onlyoffice-documentserver`

---

## Performance Tests

### Test 1: Large Document (100+ Variables)

**Steps**:
1. Create a Word document with 100+ bracketed variables
2. Import document
3. Extract form fields
4. Measure time to complete

**Expected Performance**:
- Extraction: < 2 seconds
- NLP Analysis: < 10 seconds
- Update Document: < 5 seconds

---

### Test 2: Tab Switching (No Flickering)

**Steps**:
1. Import document with variables
2. Rapidly switch between "Variables", "Extract", and "Compliance" tabs
3. Observe for flickering or blinking

**Expected Result**:
- ✅ No flickering or blinking
- ✅ Instant tab switches
- ✅ OnlyOffice editor remains stable

---

### Test 3: Repeated Updates

**Steps**:
1. Extract and analyze fields
2. Update document (Step 3)
3. Go back to Variables tab, change values
4. Click "Replace in Template"
5. Repeat 10 times

**Expected Result**:
- ✅ All updates work correctly
- ✅ No memory leaks
- ✅ No performance degradation

---

## Browser DevTools Checks

### Console Checks

**Open Console** (F12 → Console tab)

**Look for**:
- ✅ No red errors
- ✅ Successful API calls
- ✅ Clear status logs

**Warnings to Ignore**:
- ⚠️ PDF.js warnings (harmless)
- ⚠️ Source map warnings (harmless)
- ⚠️ OnlyOffice SVG fetch errors (harmless)

---

### Network Checks

**Open Network Tab** (F12 → Network tab)

**Check API Calls**:
1. **POST** `/api/onlyoffice/upload` → Status 200
2. **GET** `/api/onlyoffice/config/{doc_id}` → Status 200
3. **POST** `/api/onlyoffice/extract-realtime/{doc_id}` → Status 200
4. **POST** `/api/analyze-form-fields` → Status 200
5. **POST** `/api/onlyoffice/update-variables/{doc_id}` → Status 200

**All should return 200 OK**

---

### Performance Checks

**Open Performance Tab** (F12 → Performance tab)

**Record Profile**:
1. Click "Record" button
2. Switch between tabs
3. Extract → Analyze → Update workflow
4. Stop recording

**Check for**:
- ✅ No long tasks (> 50ms)
- ✅ Minimal re-renders
- ✅ No memory leaks

---

## Success Criteria

### ✅ Functional Requirements

- [x] Extract form fields from document
- [x] Analyze fields with NLP (spaCy + GLiNER)
- [x] Update document using direct editor manipulation
- [x] Changes visible immediately in OnlyOffice editor
- [x] No page reload or file re-upload required
- [x] 3-step workflow (Extract → Analyze → Update)

### ✅ Performance Requirements

- [x] No flickering or blinking
- [x] Tab switches < 50ms
- [x] Extraction < 2 seconds
- [x] NLP Analysis < 10 seconds
- [x] Document updates < 5 seconds

### ✅ Error Handling

- [x] Clear error messages for all edge cases
- [x] Buttons disabled when prerequisites not met
- [x] Status messages guide user through workflow
- [x] Graceful degradation when services unavailable

---

## Troubleshooting

### Issue: "Document session not found"

**Symptoms**: Error message after importing document

**Causes**:
- Backend was restarted
- Session expired
- Document ID not stored correctly

**Solution**:
1. Click "Remove Document" button
2. Re-import the document
3. Check backend logs for errors

---

### Issue: "Editor not ready"

**Symptoms**: Update Document button shows error

**Causes**:
- OnlyOffice editor still loading
- Editor reference not available

**Solution**:
- Wait for OnlyOffice editor to fully load (green checkmark)
- Check that document is visible in editor

---

### Issue: "No fields to update"

**Symptoms**: Update fails with this error

**Causes**:
- NLP analysis not completed
- Fields array empty

**Solution**:
1. Extract form fields (Step 1)
2. Analyze with NLP (Step 2)
3. Then update document (Step 3)

---

### Issue: Variables not replacing

**Symptoms**: Click "Update Document" but nothing changes

**Causes**:
- Editor reference not passed correctly
- `replaceAllVariables` method not available

**Solution**:
1. Check console for errors
2. Verify OnlyOffice editor loaded successfully
3. Check that `onlyofficeViewerRef.current` is not null
4. Verify backend returned valid variables

---

## Summary

**Direct editor manipulation is working when**:
- ✅ Document imports successfully
- ✅ Fields extract correctly
- ✅ NLP analysis completes
- ✅ Update Document shows "✅ Updated X fields"
- ✅ **Changes visible immediately in OnlyOffice editor**

**Key Success Indicator**: After clicking "Update Document", bracketed variables like `[EMPLOYEE_NAME]` should be **immediately replaced** with values in the OnlyOffice editor without any page reload or file re-upload.

---

## Next Actions

If all tests pass:
1. ✅ Implementation is complete
2. ✅ Feature ready for production use
3. ✅ Document workflow for users

If tests fail:
1. ❌ Check console for errors
2. ❌ Verify all services running (backend, OnlyOffice, frontend)
3. ❌ Review error messages and troubleshooting guide
4. ❌ Check network tab for failed API calls
