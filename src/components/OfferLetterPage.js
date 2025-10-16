import React from 'react';
import EmailEditor from './EmailEditor';

const OfferLetterPage = () => {

  // Define the offer letter template
  const offerLetterTemplate = {
    id: 1,
    title: 'Offer Letter Template',
    description: 'Standard employment offer letter with customizable clauses',
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

  return (
    <EmailEditor
      template={offerLetterTemplate}
    />
  );
};

export default OfferLetterPage;
