import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import EmailEditor from './EmailEditor';

const OfferLetterPage = () => {
  const location = useLocation();
  const editorRef = useRef(null);

  // Check if a template and uploaded file were passed via navigation state
  const navigationTemplate = location.state?.template;
  const uploadedFile = location.state?.uploadedFile;

  // Define the default offer letter template
  const defaultOfferLetterTemplate = {
    id: 1,
    title: 'Offer Letter Template',
    description: 'Professional employment offer letter with smart variables, compliance verification, and customizable terms',
    category: 'hiring',
    lastModified: '2025-01-20',
    usage: 45,
    compliance: 'verified',
    preview: 'Dear [Candidate Name], We are pleased to offer you the position of [Job Title]...',
    content: `Dear [Candidate Name],

We are pleased to offer you the position of [Job Title] at [Company Name]. This offer is contingent upon your acceptance of the following terms and conditions:

Position: [Job Title]
Department: [Department]
Start Date: [Start Date]
Salary: $[Amount] per [Period]
Benefits: [List of Benefits]

This offer is valid for [Number] days from the date of this letter. Please sign and return a copy of this letter to indicate your acceptance.

We look forward to welcoming you to our team.

Sincerely,
[Hiring Manager Name]
[Company Name]`
  };

  // Use navigation template if available, otherwise use default
  const offerLetterTemplate = navigationTemplate || defaultOfferLetterTemplate;

  // Trigger file upload in EmailEditor when a file is provided
  useEffect(() => {
    if (uploadedFile && editorRef.current) {
      // Create a synthetic file input event
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(uploadedFile);

      // Wait for EmailEditor to mount, then trigger the file upload
      setTimeout(() => {
        const fileInput = document.getElementById('offerLetterInput');
        if (fileInput) {
          fileInput.files = dataTransfer.files;
          // Dispatch a change event to trigger the handler
          const event = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(event);
        }
      }, 500);
    }
  }, [uploadedFile]);

  return (
    <EmailEditor
      ref={editorRef}
      template={offerLetterTemplate}
      initialFile={uploadedFile}
    />
  );
};

export default OfferLetterPage;
