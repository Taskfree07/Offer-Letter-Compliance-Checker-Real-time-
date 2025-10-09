# CKEditor 5 + Mammoth Integration

## What Was Done

Integrated **CKEditor 5** (professional WYSIWYG editor) with **Mammoth** (Word to HTML converter) for perfect document formatting preservation and editing.

---

## Changes Made

### 1. **Installed CKEditor 5**
```bash
npm install @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
```

### 2. **Created WordDocumentEditor Component**
**File:** `src/components/WordDocumentEditor.js`

**Features:**
- ✅ CKEditor 5 WYSIWYG editor
- ✅ Real-time variable replacement with highlights
- ✅ Preserves all Word formatting (fonts, sizes, styles, alignment)
- ✅ Full editing toolbar (bold, italic, lists, tables, etc.)
- ✅ Read-only mode support
- ✅ Custom CSS for Word-like rendering

**Props:**
- `htmlContent` - HTML from Mammoth conversion
- `variables` - Object with variable values
- `onVariableChange` - Callback for variable updates
- `readOnly` - Enable/disable editing

### 3. **Updated Backend (docx_service.py)**
- ✅ Installed `python-mammoth`
- ✅ Replaced custom HTML converter with Mammoth
- ✅ Added custom style mapping for headings, tables, lists
- ✅ Image support (base64 encoding)
- ✅ Variable wrapping with `<span>` tags

### 4. **Updated EmailEditor.js**
- ✅ Imported WordDocumentEditor component
- ✅ Replaced dangerouslySetInnerHTML with CKEditor
- ✅ Removed page navigation (CKEditor handles scrolling)
- ✅ Cleaner preview rendering

---

## How It Works

### **Import Flow:**
```
1. User selects .docx file
2. Frontend calls /api/docx-to-html
3. Backend uses Mammoth to convert → HTML with exact formatting
4. Frontend displays HTML in CKEditor 5
5. Variables highlighted (red = empty, yellow = filled)
```

### **Editing Flow:**
```
1. User types in variable fields (right panel)
2. React updates variables state
3. WordDocumentEditor re-renders
4. Variables in CKEditor update with highlights
5. Real-time preview with exact formatting
```

### **Download Flow:**
```
1. User clicks "Download as Word"
2. Frontend sends original .docx + variables to backend
3. Backend replaces variables in Word doc
4. Returns downloadable .docx with all formatting preserved
```

---

## CKEditor Features

### **Toolbar:**
- Headings (H1, H2, H3)
- Bold, Italic, Underline
- Bulleted/Numbered lists
- Indent/Outdent
- Links, Block quotes
- Tables
- Undo/Redo

### **Styling:**
- **Document-like appearance**: White background, padding like Word
- **Proper fonts**: Calibri, Arial (matching Word)
- **Correct spacing**: Paragraph margins, line heights
- **Table borders**: Preserved from Word
- **Variable highlights**: Visual feedback for filled/empty

---

## Variable Highlighting

### **Empty Variable** (Not Filled):
```html
<span class="variable-empty" style="background: red-gradient; ...">
  [CANDIDATE_NAME]
</span>
```
- Red/pink background
- Shows placeholder text

### **Filled Variable** (Has Value):
```html
<span class="variable-filled" style="background: yellow-gradient; ...">
  John Doe
</span>
```
- Yellow/gold background
- Shows actual value
- Bold text

---

## Mammoth Configuration

### **Style Mapping:**
```
Heading 1 → <h1>
Heading 2 → <h2>
Heading 3 → <h3>
Title → <h1 class="title">
Normal → <p>
Strong → <strong>
Emphasis → <em>
Tables → <table class="docx-table">
```

### **Image Handling:**
- Converts images to base64 data URIs
- Embeds directly in HTML
- No external image files needed

---

## Benefits

### ✅ **Perfect Formatting**
- Mammoth preserves exact Word formatting
- CKEditor renders it beautifully
- What you see is what you get

### ✅ **Professional Editing**
- Rich text editing with toolbar
- Table editing support
- Format text inline

### ✅ **Real-Time Updates**
- Variables update as you type
- Instant visual feedback
- No page refresh needed

### ✅ **Better UX**
- Familiar Word-like interface
- Smooth scrolling
- Professional appearance

### ✅ **Reliable**
- Industry-standard tools
- Well-maintained libraries
- Better than custom solutions

---

## Testing

### **Test the Integration:**

1. **Import a Word document** with:
   - Multiple fonts and sizes
   - Bold, italic, underline text
   - Tables with borders
   - Headings (H1, H2, H3)
   - Variables: `[CANDIDATE_NAME]`, `[JOB_TITLE]`, etc.
   - Images (optional)

2. **Verify in CKEditor:**
   - ✅ All formatting preserved
   - ✅ Can scroll through document
   - ✅ Toolbar works
   - ✅ Variables highlighted in red
   - ✅ Tables rendered correctly

3. **Fill Variables:**
   - Type in variable fields (right panel)
   - ✅ See yellow highlights in editor
   - ✅ Values appear instantly
   - ✅ Multiple variables update

4. **Download:**
   - Click "Download as Word"
   - Open in Microsoft Word
   - ✅ All formatting intact
   - ✅ Variables replaced
   - ✅ Looks professional

---

## Troubleshooting

### **CKEditor not showing:**
- Check browser console for errors
- Verify CKEditor packages installed
- Restart React dev server

### **Formatting broken:**
- Check Mammoth conversion warnings in backend logs
- Verify HTML content has inline styles
- Check CSS in WordDocumentEditor.js

### **Variables not highlighting:**
- Check variable names match exactly
- Verify Mammoth wrapped them in spans
- Check browser console for regex errors

### **Backend errors:**
- Ensure `mammoth` is installed: `pip install mammoth`
- Restart Flask backend
- Check backend logs for conversion errors

---

## Files Modified

1. ✅ `python-nlp/docx_service.py` - Added Mammoth conversion
2. ✅ `src/components/WordDocumentEditor.js` - New CKEditor component
3. ✅ `src/components/EmailEditor.js` - Integrated CKEditor
4. ✅ `package.json` - Added CKEditor dependencies

---

## Next Steps (Optional Enhancements)

- [ ] Add custom CKEditor plugins for variables
- [ ] Click-to-edit variables directly in editor
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Comments and annotations
- [ ] Export to PDF directly from CKEditor

---

## Dependencies

### **Frontend:**
- `@ckeditor/ckeditor5-react` - React wrapper for CKEditor
- `@ckeditor/ckeditor5-build-classic` - Classic editor build

### **Backend:**
- `mammoth` - Word to HTML conversion
- `python-docx` - Word document manipulation

---

## Support

- CKEditor Docs: https://ckeditor.com/docs/ckeditor5/latest/
- Mammoth Docs: https://github.com/mwilliamson/python-mammoth
- React CKEditor: https://ckeditor.com/docs/ckeditor5/latest/installation/integrations/react.html
