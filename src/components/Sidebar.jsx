import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../contexts/ComplaintsContext';
import { Avatar, Badge } from '@radix-ui/themes';
import {
  Home,
  Search,
  FileText,
  Plus,
  BarChart3,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  {
    text: 'Home',
    icon: <Home className="w-6 h-6" />,
    path: '/'
  },
  {
    text: 'Search',
    icon: <Search className="w-6 h-6" />,
    path: '/search'
  },
  {
    text: 'Complaints',
    icon: <FileText className="w-6 h-6" />,
    path: '/complaints',
    hasBadge: true
  },
  {
    text: 'Create',
    icon: <Plus className="w-6 h-6" />,
    path: '/create-complaint'
  },
  {
    text: 'Analytics',
    icon: <BarChart3 className="w-6 h-6" />,
    path: '/analytics'
  },
  {
    text: 'Profile',
    icon: <User className="w-6 h-6" />,
    path: '/profile'
  },
];

export default function Sidebar({ open, onClose, onCollapseChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wardenData, logout } = useAuth();
  const { getPendingCount, fetchStatsOnly, initializeData } = useComplaints();
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check localStorage for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode === 'true';
  });
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    // Check localStorage for saved collapsed preference
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    return savedCollapsed === 'true';
  });

  // Initialize data when warden data is available
  useEffect(() => {
    if (wardenData?.hostel) {
      initializeData(wardenData.hostel);
    }
  }, [wardenData?.hostel, initializeData]);

  // Get current pending count
  const pendingCount = getPendingCount();

  // Apply dark mode on component mount
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Save to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());

    // Apply theme change with smooth transition
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Add smooth transition to the entire document
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Remove transition after animation completes
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);
  };

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
  };

  // Function to check if a menu item is active
  const isActive = (path) => {
    if (path === '/complaints') {
      // Keep complaints active when viewing complaint details
      return location.pathname === path || location.pathname.startsWith('/complaints/');
    }
    return location.pathname === path;
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full flex flex-col z-10 transition-all duration-300 select-none ${isCollapsed ? 'w-16' : 'w-60'
        }`}
      style={{
        backgroundColor: 'var(--color-background)',
        borderRight: '1px solid var(--gray-6)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      {/* HostelCare Logo */}
      <div className={`${isCollapsed ? 'p-3 pb-4' : 'p-6 pb-4'} flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
        <img
          src={isDarkMode ? "/images/lightlogo.svg" : "/images/darklogo.svg"}
          alt="HostelCare"
          className={`object-contain ${isCollapsed ? 'w-9 h-9 mt-2' : 'w-10 h-10'}`}
        />
        {!isCollapsed && <h1 className='text-2xl font-bold'>HostelCare</h1>}
      </div>

      {/* Navigation Menu */}
      <div className={`flex-1 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item) => (
          <button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-4 py-3 px-3'} text-left rounded-lg transition-colors group relative cursor-pointer ${isActive(item.path) ? 'font-medium' : 'font-normal'
              }`}
            style={{
              color: 'var(--gray-12)',
              backgroundColor: isActive(item.path) ? 'var(--gray-4)' : 'transparent',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = 'var(--gray-4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
            title={isCollapsed ? item.text : undefined}
          >
            <div
              className="w-6 h-6 flex items-center justify-center"
              style={{ color: 'var(--gray-12)' }}
            >
              {item.text === 'Profile' && (user || wardenData) ? (
                <Avatar
                  src={wardenData?.profile_pic}
                  size="2"
                  color='gray'
                  radius="full"
                  fallback={wardenData?.name ? wardenData.name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'W')} />
              ) : (
                item.icon
              )}
            </div>
            {!isCollapsed && (
              <>
                <span
                  className="text-base"
                  style={{
                    color: 'var(--gray-12)',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                >
                  {item.text === 'Profile' && (user || wardenData) ? (wardenData?.name || user?.name || 'Admin User') : item.text}
                </span>
                {item.hasBadge && (
                  <div className="ml-auto">
                    <Badge variant="solid" radius="full" color="red">
                      {pendingCount}
                    </Badge>
                  </div>
                )}
              </>
            )}
            {isCollapsed && item.hasBadge && (
              <div className="absolute -top-1 -right-1">
                <Badge variant="solid" radius="full" color="red" size="1">
                  {pendingCount}
                </Badge>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} pb-2`}>
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-4 py-3 px-3'} text-left rounded-lg transition-colors group cursor-pointer`}
          style={{
            color: 'var(--gray-12)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--gray-4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
          title={isCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ color: 'var(--gray-12)' }}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </div>
          {!isCollapsed && (
            <span
              className="text-base"
              style={{
                color: 'var(--gray-12)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar Toggle */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} pb-2`}>
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-4 py-3 px-3'} text-left rounded-lg transition-colors group cursor-pointer`}
          style={{
            color: 'var(--gray-12)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--gray-4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ color: 'var(--gray-12)' }}
          >
            {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </div>
          {!isCollapsed && (
            <span
              className="text-base"
              style={{
                color: 'var(--gray-12)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              Collapse
            </span>
          )}
        </button>
      </div>

      {/* Logout Button */}
      <div
        className={`${isCollapsed ? 'p-2' : 'p-4'} border-t`}
        style={{ borderTopColor: 'var(--gray-6)' }}
      >
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-4 py-3 px-3'} text-left rounded-lg transition-colors group cursor-pointer`}
          style={{
            color: 'var(--gray-12)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--gray-4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ color: 'var(--gray-12)' }}
          >
            <LogOut className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <span
              className="text-base"
              style={{
                color: 'var(--gray-12)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
}