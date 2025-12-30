import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Star, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import TemplateModal from './TemplateModal';
import UserMenu from './UserMenu';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('available');
  const [favorites, setFavorites] = useState([1]); // Store favorite template IDs
  const [templates, setTemplates] = useState([
    {
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
    },
    {
      id: 2,
      title: 'Welcome Email',
      description: 'New employee welcome and onboarding email',
      category: 'onboarding',
      lastModified: '2025-01-18',
      usage: 32,
      compliance: 'verified',
      preview: 'Welcome to [Company Name]! We are excited to have you join our team...',
      content: `Welcome to [Company Name]!

We are excited to have you join our team as [Job Title]. Your first day will be [Start Date] at [Time].

Please bring the following documents:
- Government-issued ID
- Social Security Card
- Direct Deposit Form
- Emergency Contact Information

If you have any questions, please don't hesitate to reach out.

Best regards,
[HR Team]`
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'hiring', name: 'Hiring', count: templates.filter(t => t.category === 'hiring').length },
    { id: 'onboarding', name: 'Onboarding', count: templates.filter(t => t.category === 'onboarding').length },
    { id: 'performance', name: 'Performance', count: 0 },
    { id: 'termination', name: 'Termination', count: 0 }
  ];

  const handleAddTemplate = (templateData) => {
    const newTemplate = {
      id: Date.now(),
      ...templateData,
      category: templateData.category || 'other',
      lastModified: new Date().toISOString().split('T')[0],
      usage: 0,
      compliance: 'pending',
      content: templateData.content || 'Your email content will appear here...'
    };
    setTemplates([...templates, newTemplate]);
    setShowAddModal(false);
  };

  const toggleFavorite = (templateId) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleTemplateClick = (template) => {
    if (template.id === 1) {
      navigate('/offer-letter');
    } else {
      alert('Editor for other templates coming soon!');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'available' || (activeTab === 'favorite' && favorites.includes(template.id));
    return matchesSearch && matchesTab;
  });

  const getComplianceColor = (compliance) => {
    switch (compliance) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'review': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getComplianceText = (compliance) => {
    switch (compliance) {
      case 'verified': return 'Compliant';
      case 'pending': return 'Review Pending';
      case 'review': return 'Needs Review';
      default: return 'Not Checked';
    }
  };

  return (
    <div className="home-screen">
      {/* Enterprise Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="company-brand">
              <img
                src="/Button (1).png"
                alt="Logo"
                className="brand-logo-img"
              />
              <span className="brand-name">Onboarding Docs</span>
            </div>
          </div>
          <div className="header-right">
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Document Templates</h1>
          <p className="page-description">
            Manage and Create Professional HR documents with built-in compliance checking
          </p>
          <div className="header-search-bar">
            <Search size={20} className="header-search-icon" />
            <input
              type="text"
              placeholder="Search for Template names here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-section">
          <button
            className={`tab-item ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Templates
          </button>
          <button
            className={`tab-item ${activeTab === 'favorite' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorite')}
          >
            Favorite Templates
          </button>
        </div>

        {/* Templates Carousel */}
        <div className="templates-section">
          <div className="carousel-container">
            <button className="carousel-arrow carousel-arrow-left">
              <ChevronLeft size={24} />
            </button>

            <div className="template-carousel">
              {/* Add Template Card - Only show in Available Templates tab */}
              {activeTab === 'available' && (
                <div
                  className="template-card add-template-card"
                  onClick={() => setShowAddModal(true)}
                >
                  <div className="add-template-content">
                    <div className="add-template-icon-circle">
                      <Plus size={40} />
                    </div>
                    <p className="add-template-text">Add New Template</p>
                  </div>
                </div>
              )}

              {/* Template Cards */}
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="template-preview-content">
                    <div className="template-document-preview">
                      <FileText size={48} className="document-icon" />
                      <div className="preview-text">
                        {template.preview}
                      </div>
                    </div>
                  </div>

                  <div className="template-footer">
                    <span className="template-name">{template.title}</span>
                    <button
                      className="favorite-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                    >
                      <Star
                        size={20}
                        fill={favorites.includes(template.id) ? '#FCD34D' : 'none'}
                        stroke={favorites.includes(template.id) ? '#FCD34D' : '#FFFFFF'}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="carousel-arrow carousel-arrow-right">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <TemplateModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTemplate}
        />
      )}

      <style jsx>{`
        .home-screen {
          min-height: 100vh;
          background-color: #ffffff;
          width: 100%;
          overflow-x: hidden;
        }

        /* Enterprise Header */
        .header {
          background: #3B82F6;
          border: none;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: relative;
          margin-bottom: 48px;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .header-content {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 0 48px;
          display: grid !important;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 65px;
          box-sizing: border-box;
          overflow: hidden;
        }

        @media (max-width: 1200px) {
          .header-content {
            padding: 0 32px;
          }
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-self: start;
          min-width: 0;
          flex-shrink: 0;
        }

        .company-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-logo-img {
          height: 42px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          display: block;
          flex-shrink: 0;
        }

        .brand-name {
          font-size: 28px;
          font-weight: 600;
          color: #FFFFFF;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        @media (max-width: 1200px) {
          .brand-name {
            font-size: 24px;
          }
        }

        .header-right {
          display: flex !important;
          align-items: center;
          position: relative;
          justify-self: end;
          grid-column: 3;
          flex-shrink: 0;
        }

        .user-profile {
          display: flex !important;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .user-profile:hover {
          opacity: 0.9;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #FFFFFF;
          line-height: 1;
        }

        .user-avatar {
          display: flex;
          align-items: center;
        }

        .user-avatar img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.25);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 280px;
          z-index: 1000;
          overflow: hidden;
        }

        .user-dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .dropdown-avatar img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
        }

        .dropdown-user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dropdown-user-name {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.2;
        }

        .dropdown-user-email {
          font-size: 13px;
          color: #64748b;
          line-height: 1.2;
        }

        /* Main Content */
        .container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 0 48px;
          box-sizing: border-box;
        }

        @media (max-width: 1200px) {
          .container {
            padding: 0 32px;
          }
        }

        .page-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 0 40px 0;
          text-align: center;
          gap: 12px;
        }

        .page-title {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #000000;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.5px;
          text-align: center;
        }

        .page-description {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
          text-align: center;
          max-width: 600px;
        }

        .header-search-bar {
          position: relative;
          width: 100%;
          max-width: 840px;
          margin-top: 24px;
          height: 48px;
          display: flex;
          align-items: center;
        }

        .header-search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          z-index: 2;
        }

        .header-search-input {
          width: 100%;
          height: 100%;
          padding: 0 20px 0 56px !important;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          background: white;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
        }

        .header-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .header-search-input::placeholder {
          color: #cbd5e1;
        }

        /* Tabs */
        .tabs-section {
          display: flex;
          align-items: center;
          gap: 48px;
          margin-bottom: 40px;
          padding: 0;
          border-bottom: 2px solid #f1f5f9;
        }

        .tab-item {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.2px;
          background: none;
          border: none;
          padding: 0 0 12px 0;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
          color: #94a3b8;
          white-space: nowrap;
        }

        .tab-item:hover {
          color: #64748b;
        }

        .tab-item.active {
          color: #3b82f6;
        }

        .tab-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #3b82f6;
        }

        /* Carousel Container */
        .carousel-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          max-width: 100%;
        }

        .carousel-arrow {
          background: #3b82f6;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .carousel-arrow:hover {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transform: scale(1.05);
        }

        .template-carousel {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 12px 0 24px 0;
          flex: 1;
        }

        .template-carousel::-webkit-scrollbar {
          height: 6px;
        }

        .template-carousel::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }

        .template-carousel::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .template-carousel::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .template-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          min-width: 280px;
          max-width: 280px;
          height: 380px;
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 0;
        }

        .template-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
          transform: translateY(-6px);
        }

        .template-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 24px 16px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #f1f5f9;
        }

        .template-icon-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .template-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #0055A4 0%, #1E70C1 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0, 85, 164, 0.25);
        }

        .template-category {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .compliance-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.25px;
        }

        .template-content {
          padding: 24px;
          flex-grow: 1;
          overflow: hidden;
        }

        .template-title {
          font-size: 20px;
          font-weight: 700;
          color: #2C2C2C;
          margin-bottom: 12px;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .template-description {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .template-preview {
          font-size: 13px;
          color: #94a3b8;
          font-style: italic;
          line-height: 1.5;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 3px solid #e2e8f0;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .template-stats {
          display: flex;
          gap: 24px;
          padding: 20px 24px;
          background: #fafbfc;
          border-top: 1px solid #f1f5f9;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .stat-details {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 16px;
          color: #333333;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .template-actions {
          display: flex;
          gap: 0;
          border-top: 1px solid #f1f5f9;
        }

        .btn-template {
          padding: 16px 20px;
          border-radius: 0;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
          position: relative;
        }

        .btn-template:first-child {
          border-bottom-left-radius: 16px;
        }

        .btn-template:last-child {
          border-bottom-right-radius: 16px;
          border-left: 1px solid #f1f5f9;
        }

        .btn-primary.btn-template {
          background: #3b82f6;
          color: white;
        }

        .btn-primary.btn-template:hover {
          background: #2563eb;
        }

        .btn-secondary.btn-template {
          background: white;
          color: #64748b;
        }

        .btn-secondary.btn-template:hover {
          background: #F8F9FA;
          color: #0055A4;
        }

        .btn {
          padding: 10px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
        }

        .btn-sm {
          padding: 8px 12px;
          font-size: 13px;
        }

        .btn-primary {
          background: #0055A4;
          color: white;
        }

        .btn-primary:hover {
          background: #1E70C1;
        }

        .btn-secondary {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        /* Add Template Card */
        .add-template-card {
          border: 2px dashed #cbd5e1;
          background: #fafbfc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 380px;
          position: relative;
          overflow: visible;
          box-shadow: none;
        }

        .add-template-card:hover {
          border-color: #3b82f6;
          background: #f8fafc;
          transform: translateY(-6px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
        }

        .add-template-content {
          text-align: center;
          padding: 40px 20px;
        }

        .add-template-icon-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          color: #3b82f6;
          transition: all 0.3s ease;
        }

        .add-template-card:hover .add-template-icon-circle {
          color: #2563eb;
          transform: scale(1.1);
        }

        .add-template-text {
          font-size: 15px;
          font-weight: 500;
          color: #64748b;
          margin: 0;
        }

        .add-template-title {
          font-size: 20px;
          font-weight: 700;
          color: #2C2C2C;
          margin-bottom: 12px;
        }

        .add-template-description {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          max-width: 280px;
          margin: 0 auto;
        }

        /* Template Preview Content */
        .template-preview-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: white;
        }

        .template-document-preview {
          width: 100%;
          height: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .document-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .preview-text {
          font-size: 11px;
          line-height: 1.4;
          color: #94a3b8;
          text-align: left;
          width: 100%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 8;
          -webkit-box-orient: vertical;
          font-family: 'Courier New', monospace;
        }

        .template-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #3b82f6;
          border-top: none;
          margin: 0;
          border-radius: 0 0 8px 8px;
        }

        .template-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin: 0;
          text-align: left;
        }

        .favorite-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .favorite-btn:hover {
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0 20px;
            height: 64px;
          }

          .brand-logo-img {
            height: 32px;
          }

          .brand-name {
            font-size: 20px;
          }

          .user-avatar img {
            width: 36px;
            height: 36px;
          }

          .user-dropdown {
            min-width: 260px;
          }

          .container {
            padding: 0 20px;
          }

          .page-header {
            padding: 0 0 32px 0;
            gap: 16px;
          }

          .page-title {
            font-size: 32px;
          }

          .page-description {
            font-size: 14px;
          }

          .header-search-bar {
            margin-top: 20px;
            max-width: 100%;
          }

          .tabs-section {
            gap: 32px;
            margin-bottom: 32px;
          }

          .tab-item {
            font-size: 16px;
          }

          .carousel-container {
            gap: 12px;
          }

          .carousel-arrow {
            width: 36px;
            height: 36px;
          }

          .template-card,
          .add-template-card {
            min-width: 260px;
            max-width: 260px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;