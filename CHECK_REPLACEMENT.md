# How to Debug the Replacement Issue

## Step 1: Check Browser Console

Open your browser's Developer Tools (F12) and look for these logs when you click "Replace in Template":

```
🔄 Starting variable replacement: {Candidate_Name: "...", ...}
🔄 Step 1: Updating variables on backend...
✅ Backend updated successfully
🔄 Step 2: Reloading document in editor...
🔄 Replacing all variables in document...
🔄 Requesting document reload...
✅ Document reload triggered
📄 Loading ONLYOFFICE config for document: abc123...
```

## Step 2: Check Backend Terminal Logs

In your terminal where `python app.py` is running, you should see:

```
🔄 Updating variables for document abc123
📝 Variables to replace: ['Candidate_Name', 'Company_Name', ...]
📄 Read document from: ./uploads/abc123.docx (12345 bytes)
✅ Variables replaced, new size: 12350 bytes
💾 Saved modified document to: ./uploads/abc123.docx
🔍 Re-extracted 5 variables after replacement
✅ Successfully updated variables for document abc123
```

## Step 3: Manual Test

1. Open a terminal and run:
   ```bash
   cd python-nlp
   ls -lh uploads/*.docx | head -5
   ```

2. Note the timestamp of a document

3. Click "Replace in Template" in your browser

4. Run the `ls` command again - the timestamp should have changed!

5. If the timestamp changed, the replacement IS working, but ONLYOFFICE isn't reloading it

## Step 4: Check ONLYOFFICE Config

Look in the browser console for this log:
```
📋 Generated document key: abc123_20251031123456789
```

Each time you click "Replace in Template", this key should be DIFFERENT (the timestamp part should change).

## The Problem

If you see:
- ✅ Backend logs show replacement worked
- ✅ File timestamp changed
- ✅ Document key changed
- ❌ BUT document in browser doesn't update

Then ONLYOFFICE is using a cached version. The fix is to force a complete refresh.

## The Solution

We need to **destroy and recreate** the ONLYOFFICE editor instance, not just reload the config.

Let me implement this fix now...
