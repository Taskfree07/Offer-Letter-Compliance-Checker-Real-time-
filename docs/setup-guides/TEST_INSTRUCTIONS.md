# How to Test Word Document Workflow

## ✅ What's Been Updated

### Frontend Changes
1. **File input** now accepts `.docx` files only
2. **Import function** calls `/api/docx-extract-variables`
3. **Download function** calls `/api/docx-replace-variables`
4. **Variables** are extracted and editable in the right panel
5. **Preview** shows the document text

### Backend Ready
- ✅ Word document service is running
- ✅ Endpoints are available:
  - `POST /api/docx-extract-variables`
  - `POST /api/docx-replace-variables`
  - `GET /api/docx-health`

## 📝 Create a Test Word Document

1. Open Microsoft Word
2. Create a new document with this content:

```
OFFER LETTER

Dear [CANDIDATE_NAME],

We are pleased to offer you the position of [JOB_TITLE] at [COMPANY_NAME].

COMPENSATION
Your starting salary will be [SALARY] per year.
Your start date is [START_DATE].

BENEFITS
- Health Insurance
- [VACATION_DAYS] days of paid vacation
- 401(k) matching

MANAGER
You will report to [MANAGER_NAME], [MANAGER_TITLE].

Please respond by [RESPONSE_DEADLINE].

Sincerely,
[HR_NAME]
Human Resources
```

3. Save as `test_offer_letter.docx`

## 🧪 Test the Workflow

### Step 1: Import Document
1. Open your React app (http://localhost:3000)
2. Go to the Email Editor / Offer Letter section
3. Click **"Import Offer Letter"** button
4. Select your `test_offer_letter.docx` file
5. You should see an alert: "Word document imported successfully! Found 9 variables..."

### Step 2: Edit Variables
In the **Variables** panel on the right, you'll see:
- CANDIDATE_NAME
- JOB_TITLE
- COMPANY_NAME
- SALARY
- START_DATE
- VACATION_DAYS
- MANAGER_NAME
- MANAGER_TITLE
- RESPONSE_DEADLINE
- HR_NAME

Fill them in with values like:
- CANDIDATE_NAME: John Doe
- JOB_TITLE: Senior Software Engineer
- COMPANY_NAME: TechCorp Inc.
- SALARY: $120,000
- START_DATE: January 15, 2025
- etc.

### Step 3: Preview
The **left panel** will show the document text with the variables still in brackets.

### Step 4: Download
1. Click **"Download PDF"** button (it will actually download as .docx)
2. A file named `Edited_Offer_Letter.docx` will download
3. Open it in Microsoft Word
4. **All variables should be replaced** with your values!
5. **Formatting is preserved** exactly as in the original

## ✅ Expected Results

### Import
- ✅ File uploads successfully
- ✅ Variables are detected
- ✅ Alert shows correct count
- ✅ Variables appear in right panel

### Edit
- ✅ Can type in each variable field
- ✅ Values are saved

### Download
- ✅ Downloads a .docx file
- ✅ Opens in Microsoft Word
- ✅ All `[VARIABLE_NAME]` are replaced with actual values
- ✅ Formatting is exactly the same as original
- ✅ Tables, bold, italics, etc. are preserved

## 🐛 Troubleshooting

### "Failed to import Word document"
- Check backend is running: `http://127.0.0.1:5000/api/docx-health`
- Should return: `{"available": true}`

### "python-docx not installed"
```bash
cd python-nlp
pip install python-docx
# Restart Flask server
```

### Variables not detected
- Make sure variables are in brackets: `[VARIABLE_NAME]`
- Also supports: `{VARIABLE_NAME}` or `<<VARIABLE_NAME>>`

### Download fails
- Check browser console for errors
- Ensure Flask server is running
- Check that `window.originalDocxFile` is set (should happen on import)

## 🎯 Next Steps

Once this works, you can:
1. Add more sophisticated variable detection
2. Add a better preview (maybe convert to PDF for preview only)
3. Add variable validation
4. Add templates library
5. Add NLP suggestions for variable values

## 📊 Current Workflow

```
Upload .docx → Extract Variables → Edit in Panel → Download .docx
     ↓              ↓                    ↓              ↓
  Backend      /api/docx-        React State    /api/docx-
              extract-vars                    replace-vars
```

Simple, practical, and preserves all formatting!
