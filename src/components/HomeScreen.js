import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Pen, Download, BarChart3, Shield, Clock, Search, Bell, Settings, ChevronDown, Globe } from 'lucide-react';
import TemplateModal from './TemplateModal';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
              <div className="brand-logo">
                <div className="company-name-text">TECHGENE</div>
              </div>
              <div className="brand-info">
                <div className="product-name">HR Document Management</div>
              </div>
            </div>
            <div className="nav-separator"></div>
            <nav className="main-navigation">
              <button className="nav-item active">
                <FileText size={16} />
                Templates
              </button>
              <button className="nav-item">
                <BarChart3 size={16} />
                Analytics
              </button>
              <button className="nav-item">
                <Shield size={16} />
                Compliance
              </button>
            </nav>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="action-btn">
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>
              <button className="action-btn">
                <Settings size={18} />
              </button>
              <button className="action-btn">
                <Globe size={18} />
              </button>
            </div>
            <div className="user-profile">
              <div className="user-details">
                <span className="user-name">Sarah Johnson</span>
                <span className="user-role">HR Operations Manager</span>
                <span className="user-org">North America • HR Division</span>
              </div>
              <div className="user-avatar">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%233b82f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.35em' fill='white' font-family='Arial, sans-serif' font-size='16' font-weight='600'%3ESJ%3C/text%3E%3C/svg%3E" alt="User Avatar" />
                <ChevronDown size={14} className="dropdown-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Document Templates</h1>
            <p className="page-description">
              Manage and create professional HR documents with built-in compliance checking
            </p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              New Template
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
                <span className="filter-count">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="templates-section">
          <div className="template-grid">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="template-card"
              >
                <div className="template-header">
                  <div className="template-icon-wrapper">
                    <div className="template-icon">
                      <FileText size={24} />
                    </div>
                    <div className="template-category">
                      {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    </div>
                  </div>
                  <div className="template-meta">
                    <div 
                      className="compliance-badge"
                      style={{ 
                        backgroundColor: getComplianceColor(template.compliance) + '15',
                        color: getComplianceColor(template.compliance),
                        border: `1px solid ${getComplianceColor(template.compliance)}30`
                      }}
                    >
                      <Shield size={12} />
                      {getComplianceText(template.compliance)}
                    </div>
                  </div>
                </div>
                
                <div className="template-content">
                  <h3 className="template-title">{template.title}</h3>
                  <p className="template-description">{template.description}</p>
                  <div className="template-preview">
                    "{template.preview}"
                  </div>
                </div>

                <div className="template-stats">
                  <div className="stat-item">
                    <div className="stat-icon">
                      <BarChart3 size={14} />
                    </div>
                    <div className="stat-details">
                      <span className="stat-value">{template.usage}</span>
                      <span className="stat-label">Uses</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <Clock size={14} />
                    </div>
                    <div className="stat-details">
                      <span className="stat-value">{template.lastModified}</span>
                      <span className="stat-label">Modified</span>
                    </div>
                  </div>
                </div>

                <div className="template-actions">
                  <button
                    className="btn btn-primary btn-template"
                    onClick={() => {
                      // Special handling for Offer Letter template
                      if (template.id === 1) {
                        navigate('/offer-letter');
                      } else {
                        // For other templates, you can add routing later
                        alert('Editor for other templates coming soon!');
                      }
                    }}
                  >
                    <Pen size={16} />
                    Edit Offer Letter
                  </button>
                  <button
                    className="btn btn-secondary btn-template"
                    onClick={() => {
                      // For now, just show an alert
                      alert('PDF generation coming soon!');
                    }}
                  >
                    <Download size={16} />
                    Generate
                  </button>
                </div>
              </div>
            ))}

            {/* Add Template Card */}
            <div
              className="template-card add-template-card"
              onClick={() => setShowAddModal(true)}
            >
              <div className="add-template-content">
                <div className="add-template-icon">
                  <Plus size={32} />
                </div>
                <h3 className="add-template-title">Create New Template</h3>
                <p className="add-template-description">
                  Build a custom document template for your organization
                </p>
              </div>
            </div>
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
          background-color: #F8F9FA;
        }

        /* Enterprise Header */
        .header {
          background: #1e3a5f;
          border-bottom: none;
          padding: 0;
          box-shadow: none;
          position: relative;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #0055A4;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .company-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .brand-logo {
          height: auto;
          background: transparent;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 0;
          min-width: 150px;
          padding: 0;
        }

        .company-name-text {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 2px;
          text-transform: uppercase;
          line-height: 1;
          text-align: left;
        }

        .company-logo-img {
          height: 30px;
          width: auto;
          object-fit: contain;
          max-width: 150px;
          display: block;
        }

        .brand-info {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .company-name {
          font-size: 20px;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          letter-spacing: -0.25px;
        }

        .product-name {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.75);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          text-align: left;
          margin-top: 0;
          white-space: nowrap;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }

        .nav-separator {
          width: 1px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          margin: 0 8px;
        }

        .main-navigation {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #1E70C1;
          border-radius: 50%;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-btn {
          position: relative;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .notification-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 18px;
          height: 18px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #1e3a5f;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-profile:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #FFFFFF;
          line-height: 1;
        }

        .user-role {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          line-height: 1;
        }

        .user-org {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
          line-height: 1;
        }

        .user-avatar {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-avatar img {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 2px solid rgba(0, 85, 164, 0.2);
        }

        .dropdown-arrow {
          color: #64748b;
          transition: transform 0.2s ease;
        }

        .user-profile:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        /* Main Content */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 24px 0;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #333333;
          margin-bottom: 8px;
        }

        .page-description {
          font-size: 16px;
          color: #64748b;
          margin: 0;
        }

        /* Filters */
        .filters-section {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: #f8fafc;
        }

        .search-input:focus {
          outline: none;
          border-color: #1E70C1;
          background: white;
        }

        .category-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          border-color: #1E70C1;
          color: #0055A4;
        }

        .filter-btn.active {
          background: #0055A4;
          border-color: #0055A4;
          color: white;
        }

        .filter-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .filter-btn.active .filter-count {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Template Grid */
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 28px;
        }

        .template-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 0;
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
          word-wrap: break-word;
          display: flex;
          flex-direction: column;
          height: fit-content;
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .template-card:hover {
          border-color: #1E70C1;
          box-shadow: 0 8px 25px rgba(0, 85, 164, 0.1);
          transform: translateY(-2px);
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
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 320px;
          position: relative;
          overflow: visible;
        }

        .add-template-card:hover {
          border-color: #1E70C1;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 85, 164, 0.1);
        }

        .add-template-content {
          text-align: center;
          padding: 40px 20px;
        }

        .add-template-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .add-template-card:hover .add-template-icon {
          background: linear-gradient(135deg, #0055A4 0%, #1E70C1 100%);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 85, 164, 0.25);
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

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .template-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;