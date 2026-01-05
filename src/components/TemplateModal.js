import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

const TemplateModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        alert('Please upload a Word document (.docx file)');
        e.target.value = '';
        return;
      }
      setUploadedFile(file);
      // Auto-fill title from filename if title is empty
      if (!formData.title) {
        const fileName = file.name.replace('.docx', '');
        setFormData(prev => ({
          ...prev,
          title: fileName
        }));
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    // Reset the file input
    const fileInput = document.getElementById('template-file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({ ...formData, file: uploadedFile });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Template</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Template Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input"
              placeholder="e.g., Offer Letter Template"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input"
              placeholder="Brief description of the template"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Upload Template (Optional)
            </label>
            <div className="file-upload-container">
              <input
                type="file"
                id="template-file-upload"
                accept=".docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {!uploadedFile ? (
                <label htmlFor="template-file-upload" className="file-upload-label">
                  <Upload size={20} />
                  <span>Upload .docx file</span>
                </label>
              ) : (
                <div className="file-uploaded">
                  <div className="file-info">
                    <Upload size={18} />
                    <span className="file-name">{uploadedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={handleRemoveFile}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="form-hint">
              Upload an offer letter template in .docx format
            </p>
          </div>

          {!uploadedFile && (
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Email Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="textarea"
                placeholder="Enter your email template content here..."
                rows={8}
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Template
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .file-upload-container {
          margin-top: 8px;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 20px;
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .file-upload-label:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #3b82f6;
        }

        .file-uploaded {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border: 1px solid #10b981;
          border-radius: 8px;
          background: #f0fdf4;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #059669;
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 14px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .remove-file-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #dc2626;
          transition: all 0.2s ease;
          border-radius: 4px;
        }

        .remove-file-btn:hover {
          background: #fee2e2;
        }

        .form-hint {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 8px;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default TemplateModal;

