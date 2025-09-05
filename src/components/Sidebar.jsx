import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, Badge } from '@radix-ui/themes';
import { fetchComplaintStats } from '../services/api';
import {
  Home,
  Search,
  FileText,
  Plus,
  BarChart3,
  User,
  LogOut,
  Moon,
  Sun
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
    text: 'Dashboard',
    icon: <BarChart3 className="w-6 h-6" />,
    path: '/dashboard'
  },
  {
    text: 'Profile',
    icon: <User className="w-6 h-6" />,
    path: '/profile'
  },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wardenData, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check localStorage for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode === 'true';
  });

  // Fetch pending complaints count
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!wardenData?.hostel) return; // Wait for warden data
      
      try {
        const stats = await fetchComplaintStats(wardenData.hostel);
        if (stats && stats.data) {
          setPendingCount(stats.data.pending || 0);
        }
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
  }, [wardenData?.hostel]);

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

    // Apply to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-10 transition-colors"
      style={{
        backgroundColor: 'var(--color-background)',
        borderRight: '1px solid var(--gray-6)'
      }}
    >
      {/* Instagram Logo */}
      <div className="p-6 pb-4">
        <img
          src="https://logos-world.net/wp-content/uploads/2020/04/Instagram-Logo-2013-2015.png"
          alt="Instagram"
          className="w-32 object-contain"
        />
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-4 py-3 px-3 text-left rounded-lg transition-colors group relative cursor-pointer ${isActive(item.path) ? 'font-medium' : 'font-normal'
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
          </button>
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <div className="px-4 pb-4">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-4 py-3 px-3 text-left rounded-lg transition-colors group cursor-pointer"
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
        >
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ color: 'var(--gray-12)' }}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </div>
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
        </button>
      </div>

      {/* Logout Button */}
      <div
        className="p-4 border-t"
        style={{ borderTopColor: 'var(--gray-6)' }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 py-3 px-3 text-left rounded-lg transition-colors group cursor-pointer"
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
        >
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ color: 'var(--gray-12)' }}
          >
            <LogOut className="w-6 h-6" />
          </div>
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
        </button>
      </div>
    </div>
  );
}