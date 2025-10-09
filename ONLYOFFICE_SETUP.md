# ONLYOFFICE Document Editor Integration

This guide explains how to use the ONLYOFFICE integration for editing Word documents with preserved formatting.

## Features

- **Direct Word Editing**: Edit .docx files in their native format with full formatting preservation
- **Real-time Collaboration**: ONLYOFFICE provides Word-like editing experience
- **Variable Management**: Extract and edit variables using GLiNER NLP while preserving document formatting
- **Auto-save**: Changes are automatically saved to the backend

## Setup Instructions

### 1. Start ONLYOFFICE Document Server

Run ONLYOFFICE using Docker:

```bash
docker-compose up -d
```

This will start ONLYOFFICE Document Server on `http://localhost:8080`.

**Verify it's running:**
- Open http://localhost:8080 in your browser
- You should see the ONLYOFFICE landing page

### 2. Install Python Dependencies

```bash
cd python-nlp
pip install -r requirements.txt
```

### 3. Start Backend Server

```bash
cd python-nlp
python app.py
```

Backend runs on `http://localhost:5000`.

### 4. Start Frontend

```bash
npm start
```

Frontend runs on `http://localhost:3000`.

## How to Use

### Step 1: Import a Word Document

1. Go to **Offer Letter Template**
2. Click **"Import & Edit"** tab
3. Click **"Choose Word Document (.docx)"**
4. Select your offer letter template (.docx file)

### Step 2: View in ONLYOFFICE Editor

After upload, the document will automatically:
- Upload to ONLYOFFICE Document Server
- Extract variables using GLiNER (NLP)
- Display in the ONLYOFFICE editor (right panel)

### Step 3: Edit Variables

**In the Variables Tab (left panel):**
1. See all detected variables (e.g., `[CANDIDATE_NAME]`, `[JOB_TITLE]`)
2. Enter values for each variable
3. Variables are automatically updated in the document

**In the ONLYOFFICE Editor (right panel):**
- Edit the document directly like in Microsoft Word
- Make formatting changes
- Add/remove content
- All changes auto-save

### Step 4: Update Variables in Document

When you change variables in the Variables tab:
1. Values are sent to backend
2. Backend replaces variables in the .docx file
3. Document formatting is preserved
4. Reload to see updated values in ONLYOFFICE

### Step 5: Download

Click **"Download Word"** to get the final document with:
- All variable values filled in
- All manual edits preserved
- Original formatting maintained

## Architecture

### Workflow

```
1. Upload .docx → Backend
2. Backend extracts variables (GLiNER NLP)
3. Backend stores document & returns document ID
4. Frontend loads ONLYOFFICE with document URL
5. User edits variables → Backend updates .docx
6. User edits document in ONLYOFFICE → Auto-saves to backend
7. Download final .docx with all changes
```

### Backend Endpoints

- `POST /api/onlyoffice/upload` - Upload document, extract variables
- `GET /api/onlyoffice/config/<doc_id>` - Get editor configuration
- `GET /api/onlyoffice/download/<doc_id>` - Serve document to ONLYOFFICE
- `POST /api/onlyoffice/callback/<doc_id>` - Handle document saves from ONLYOFFICE
- `GET /api/onlyoffice/variables/<doc_id>` - Get extracted variables
- `POST /api/onlyoffice/update-variables/<doc_id>` - Update variables in document

### Format Preservation

The integration uses `python-docx` to:
- Read .docx structure
- Find and replace variable placeholders
- Preserve all formatting (fonts, styles, tables, images)
- Maintain document layout exactly

## Troubleshooting

### ONLYOFFICE Not Loading

**Error:** "Failed to load ONLYOFFICE"

**Solution:**
1. Check Docker is running: `docker ps`
2. Verify ONLYOFFICE container is up:
   ```bash
   docker logs onlyoffice-docs
   ```
3. Access http://localhost:8080 directly
4. Restart Docker: `docker-compose down && docker-compose up -d`

### Variables Not Updating

**Issue:** Variables don't change in document

**Solution:**
1. Check backend logs for errors
2. Verify `python-docx` is installed: `pip install python-docx`
3. Ensure variables use bracket format: `[VARIABLE_NAME]`

### Document Not Saving

**Issue:** Changes in ONLYOFFICE don't persist

**Solution:**
1. Check callback endpoint in backend logs
2. Verify network connectivity between ONLYOFFICE and backend
3. Check uploads folder permissions: `chmod 755 ./uploads`

## Configuration

### Environment Variables

Create a `.env` file:

```env
ONLYOFFICE_SERVER_URL=http://localhost:8080
UPLOAD_FOLDER=./uploads
```

### Docker Compose

To change ONLYOFFICE port, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 8080 to your preferred port
```

## Production Deployment

For production:

1. **Use JWT Authentication:**
   ```yaml
   environment:
     - JWT_ENABLED=true
     - JWT_SECRET=your-secure-secret-key
   ```

2. **Use Persistent Storage:**
   - Configure database instead of in-memory sessions
   - Use Redis for document session management

3. **Enable HTTPS:**
   - Configure SSL certificates for ONLYOFFICE
   - Use reverse proxy (nginx/traefik)

4. **Scale ONLYOFFICE:**
   - Use ONLYOFFICE Enterprise for clustering
   - Configure load balancing

## Technical Details

### Variable Detection (GLiNER)

The system uses GLiNER (Generalist and Lightweight Named Entity Recognition) to:
- Detect bracketed variables: `[NAME]`, `[DATE]`, etc.
- Extract context around variables
- Suggest variable types and values

### Format Preservation

`python-docx` library:
- Reads XML structure of .docx files
- Replaces text while maintaining:
  - Font styles (bold, italic, underline)
  - Font sizes and colors
  - Paragraph alignment
  - Tables and borders
  - Images and shapes
  - Page layout and margins

## Support

For issues:
1. Check backend logs: `python-nlp/app.py` output
2. Check browser console: F12 → Console tab
3. Verify Docker logs: `docker logs onlyoffice-docs`
4. Check ONLYOFFICE documentation: https://api.onlyoffice.com/editors/basic
