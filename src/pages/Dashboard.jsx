import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user, token, wardenData, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 bg-slate-50 dark:bg-gray-900 min-h-screen ml-60">
        {/* Dashboard content */}
        <h1 className="mb-6 text-slate-800 dark:text-white text-3xl font-bold">
          Welcome to Admin Dashboard
        </h1>
        
        {isLoading ? (
          <p className="text-slate-600 dark:text-gray-400">Loading warden data...</p>
        ) : wardenData ? (
          <div className="max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700">
            <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-white">
              Warden Information
            </h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-medium text-slate-700 dark:text-gray-300 w-20">Name:</span>
                <span className="text-slate-600 dark:text-gray-400">{wardenData.name || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-slate-700 dark:text-gray-300 w-20">Email:</span>
                <span className="text-slate-600 dark:text-gray-400">{wardenData.email || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-slate-700 dark:text-gray-300 w-20">ID:</span>
                <span className="text-slate-600 dark:text-gray-400">{wardenData.warden_id || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-slate-700 dark:text-gray-300 w-20">Phone:</span>
                <span className="text-slate-600 dark:text-gray-400">{wardenData.phone || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-slate-700 dark:text-gray-300 w-20">Hostel:</span>
                <span className="text-slate-600 dark:text-gray-400">{wardenData.hostel || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-slate-700 dark:text-gray-300 w-20">Status:</span>
                <span className="text-slate-600 dark:text-gray-400">{wardenData.status || 'N/A'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-gray-400">No warden data available</p>
        )}

      </div>
    </div>
  );
}
