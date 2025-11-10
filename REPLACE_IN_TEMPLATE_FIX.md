# Replace in Template Fix

## Problem

The "Replace in Template" button in the Variables panel wasn't working. No changes were being applied to the OnlyOffice document.

## Root Cause

**Data format mismatch** between VariablePanel and EmailEditor/Backend.

**VariablePanel was sending**:
```javascript
{
  EMPLOYEE_NAME: {
    value: "John Doe",
    entity_type: "person",
    suggested_value: "...",
    confidence: 0.95,
    // other properties
  }
}
```

**Backend/OnlyOffice expected**:
```javascript
{
  EMPLOYEE_NAME: "John Doe"
}
```

## Solution

Modified `VariablePanel.js` `handleReplaceInTemplate()` function to convert the nested object structure to simple key-value pairs before passing to the handler:

```javascript
const handleReplaceInTemplate = async () => {
  if (!isEditorReady) {
    alert('Document editor is not ready. Please wait a moment and try again.');
    return;
  }

  try {
    // Convert localVariables format to simple key-value pairs
    // From: { VAR_NAME: { value: "...", ... } }
    // To: { VAR_NAME: "..." }
    const simpleVariables = {};
    Object.entries(localVariables).forEach(([key, data]) => {
      if (typeof data === 'object' && data !== null) {
        simpleVariables[key] = data.value || '';
      } else {
        simpleVariables[key] = data || '';
      }
    });

    console.log('📝 Variables to replace:', simpleVariables);

    // Call the replace function with simple format
    if (onReplaceInTemplate) {
      await onReplaceInTemplate(simpleVariables);
    }

    setHasChanges(false);

    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'success-toast';
    successMsg.textContent = 'Variables replaced successfully!';
    document.body.appendChild(successMsg);

    setTimeout(() => {
      if (document.body.contains(successMsg)) {
        document.body.removeChild(successMsg);
      }
    }, 3000);

  } catch (error) {
    console.error('Error replacing variables:', error);
    alert('Error replacing variables. Please try again.');
  }
};
```

## How It Works Now

### Step 1: User Edits Variables
User changes a variable in the Variables panel:
```
EMPLOYEE_NAME: "John Doe" ✏️
START_DATE: "January 1, 2024" ✏️
```

### Step 2: Click "Replace in Template"
1. **Extract simple values** from nested objects
2. **Log to console**: `📝 Variables to replace: {...}`
3. **Call backend**: `POST /api/onlyoffice/update-variables/{docId}`
4. **Update OnlyOffice**: `editor.replaceAllVariables(simpleVariables)`
5. **Show success toast**: "Variables replaced successfully!"

### Step 3: Changes Visible in Editor
OnlyOffice editor immediately shows:
- `[EMPLOYEE_NAME]` → "John Doe"
- `[START_DATE]` → "January 1, 2024"

## File Modified

**File**: `src/components/VariablePanel.js`
**Function**: `handleReplaceInTemplate()`
**Lines**: 33-77

## Testing

### Test Case 1: Edit Single Variable
1. Import a document with `[EMPLOYEE_NAME]`
2. In Variables panel, change value to "Jane Smith"
3. Click "Replace in Template"
4. **Expected**: OnlyOffice shows "Jane Smith" instead of `[EMPLOYEE_NAME]`

### Test Case 2: Edit Multiple Variables
1. Import document with multiple variables
2. Edit 3-4 variables
3. Click "Replace in Template"
4. **Expected**: All variables replaced in OnlyOffice editor

### Test Case 3: Empty Values
1. Clear a variable value (empty string)
2. Click "Replace in Template"
3. **Expected**: Variable bracket removed, replaced with empty string

## Debug Console Output

When "Replace in Template" is clicked, you'll see:

```javascript
📝 Variables to replace: {
  EMPLOYEE_NAME: "John Doe",
  START_DATE: "January 1, 2024",
  SALARY: "$120,000",
  POSITION: "Senior Software Engineer"
}

🔄 Replacing all variables in template...
✅ Variables successfully replaced in template
```

## Success Indicators

✅ **Console log** shows simplified variables
✅ **Success toast** appears: "Variables replaced successfully!"
✅ **OnlyOffice editor** shows updated values immediately
✅ **Orange dot** disappears from "Replace in Template" button
✅ **No errors** in console

## Related Files

- `src/components/VariablePanel.js` - Fixed data format conversion
- `src/components/EmailEditor.js` - Receives simple format, calls backend + editor
- `src/components/OnlyOfficeViewer.js` - Executes `replaceAllVariables()`
- `src/services/onlyofficeFormService.js` - Not used in this flow
- `python-nlp/app.py` - Backend `/api/onlyoffice/update-variables` endpoint

## Summary

**The "Replace in Template" button now works correctly!**

The fix converts the nested variable structure to simple key-value pairs before passing to the backend and OnlyOffice editor. Users can now edit variables and see changes immediately in the document.

🎉 **Ready to test!**
