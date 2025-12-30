/**
 * UserMenu - User profile dropdown with logout functionality
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserMenu = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const initials = getInitials(user.name);

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-details">
          <span className="user-name">{user.name}</span>
          <span className="user-role">{user.job_title || 'User'}</span>
          {user.department && (
            <span className="user-org">{user.department}</span>
          )}
        </div>
        <div className="user-avatar">
          <div className="user-avatar-image">
            {initials}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-menu-info">
              <div className="user-menu-name">{user.name}</div>
              <div className="user-menu-email">{user.email}</div>
              {user.auth_provider === 'microsoft' && (
                <div className="user-menu-badge">Microsoft Account</div>
              )}
            </div>
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-items">
            <button className="user-menu-item" onClick={() => setIsOpen(false)}>
              <User size={16} />
              <span>Profile</span>
            </button>
            <button className="user-menu-item" onClick={() => setIsOpen(false)}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-items">
            <button
              className="user-menu-item logout"
              onClick={handleLogout}
              disabled={loading}
            >
              <LogOut size={16} />
              <span>{loading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-menu-container {
          position: relative;
        }

        .user-profile-trigger {
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

        .user-profile-trigger:hover {
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

        .user-avatar-image {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border: 2px solid rgba(0, 85, 164, 0.2);
        }

        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          overflow: hidden;
        }

        .user-menu-header {
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .user-menu-name {
          font-size: 16px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .user-menu-email {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .user-menu-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #3b82f6;
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .user-menu-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }

        .user-menu-items {
          padding: 8px;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .user-menu-item:hover {
          background: #f8fafc;
          color: #1e293b;
        }

        .user-menu-item.logout {
          color: #ef4444;
        }

        .user-menu-item.logout:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .user-menu-item:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UserMenu;
