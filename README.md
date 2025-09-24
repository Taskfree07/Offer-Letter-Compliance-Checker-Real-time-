# Email & Offer Letter Compliance System

A modern React application for ensuring legal compliance in offer letters and email templates, with a specific focus on California employment law. The system provides real-time compliance checking, PDF preview generation, and detailed feedback on potential legal issues.

## Features

### 📝 Core Features
- **Template Management**: Create, view, and manage email and offer letter templates
- **PDF Processing**: Upload, preview, and generate compliant PDF documents
- **Split-Screen Editor**: Edit templates with a live preview and compliance feedback
- **Modern UI**: Clean, responsive design with intuitive user experience

### ⚖️ Compliance Features
- **Real-time Analysis**: Instant feedback on compliance issues
- **California Employment Law**: Focused on CA state requirements
- **Key Compliance Areas**:
  - Non-compete clauses (prohibited in CA)
  - Salary history questions (illegal)
  - Background check requirements
  - Drug testing regulations
  - Arbitration clauses
  - Employment agreement terms

### 🚨 Compliance Analysis
- **Visual Indicators**:
  - ✅ Green: Compliant documents
  - ❌ Red: Critical issues
  - ⚠️ Yellow: Warnings
- **Detailed Feedback**:
  - Specific law references
  - Violation details
  - Suggested corrections
  - Alternative compliant language

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd emailautoflow
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Technical Architecture

### Frontend Components
```
src/
├── components/
│   ├── EmailEditor.js         # Main editor component
│   ├── HomeScreen.js         # Landing page and template selection
│   ├── PDFGenerator.js       # PDF preview and generation
│   ├── TemplateModal.js      # Template management
│   └── compliance/
│       ├── ComplianceChecker.js   # Compliance checking logic
│       ├── ComplianceAnalysis.js  # Results display
│       ├── complianceRules.js     # Rule definitions
│       └── RulesManager.js        # Rule management
├── services/
│   ├── pdfTemplateService.js     # PDF handling
│   └── pdfContentExtractor.js    # Text extraction
```

### Key Technologies
- **React.js**: Frontend framework
- **pdf-lib**: PDF manipulation
- **PDF.js**: PDF rendering and text extraction
- **Custom Compliance Engine**: Rule-based analysis system

### Compliance Engine Features
- Regular expression pattern matching
- Severity-based categorization
- Contextual suggestions
- Real-time analysis

## Compliance Rules

### California Employment Law Focus
Current implementation focuses on California employment law requirements:

1. **Non-compete Clauses**
   - Automatically detects prohibited non-compete language
   - Provides compliant alternatives
   - References CA Business & Professions Code Section 16600

2. **Salary History**
   - Identifies prohibited salary history questions
   - Suggests compliant alternatives
   - Based on California Labor Code Section 432.3

3. **Background Checks**
   - Ensures proper timing of checks
   - Validates Fair Chance Act compliance
   - References CA Labor Code Section 432.9

4. **Drug Testing**
   - Checks for compliant language
   - Validates against recent cannabis laws
   - Based on CA Government Code Section 12954

### Rule Implementation
```javascript
{
  ruleKey: {
    severity: 'error' | 'warning',
    message: 'User-friendly explanation',
    lawReference: 'Specific law citation',
    flaggedPhrases: ['prohibited terms'],
    suggestion: 'Compliant alternative'
  }
}
```

## Future Development

### Planned Features
- Multi-state compliance support
- Custom rule creation interface
- Template management system
- Batch processing capabilities
- HR system integration

### Expansion Areas
- Additional state laws
- Industry-specific rules
- Custom company policies
- API integration options

## Usage

### Creating New Documents
1. **Home Screen**
   - View all available templates in a card-based layout
   - Click "Add New Template" to create a custom template
   - Click "Edit Template" on any existing template to start editing

2. **Template Editor**
   - **Left Panel**: Live preview with real-time compliance checking
   - **Right Panel**: Content editing and compliance feedback
   - **Compliance Status**: Visual indicators for document compliance

### Checking Existing Documents
1. **Upload Document**
   - Click "Upload Document" button
   - Select your PDF offer letter
   - System automatically extracts and analyzes content

2. **Compliance Review**
   - Review automatic compliance analysis
   - See highlighted issues with severity indicators
   - Get specific law references and suggestions
   - Access alternative compliant language

3. **Document Generation**
   - Make suggested corrections
   - Preview updated content
   - Generate new compliant PDF
- **Add Sections**: Use the "Add Section" button to insert new content
- **Delete Sections**: Click the delete button on any sentence to remove it

### Creating Templates
1. Click "Add New Template" on the home screen
2. Fill in the template title and description
3. Enter your email content in the text area
4. Click "Create Template" to save

## Project Structure

```
src/
├── components/
│   ├── HomeScreen.js      # Main home screen with template carousel
│   ├── EmailEditor.js     # Split-screen editor component
│   └── TemplateModal.js   # Modal for creating new templates
├── App.js                 # Main application component
├── App.css               # Application styles
├── index.js              # Application entry point
└── index.css             # Global styles
```

## Customization

### Adding New Templates
The application comes with sample templates. To add your own:
1. Use the "Add New Template" feature in the UI, or
2. Modify the `templates` array in `HomeScreen.js`

### Styling
- Global styles are in `src/index.css`
- Component-specific styles are in `src/App.css`
- The application uses a modern design system with consistent colors and spacing

## Future Enhancements

- PDF/Word document import functionality
- Template versioning and history
- Export to various formats (PDF, Word, HTML)
- Collaborative editing features
- Template sharing and marketplace

## Technologies Used

- React 18
- Lucide React (icons)
- CSS3 with modern features
- Responsive design principles

## License

This project is open source and available under the MIT License.

