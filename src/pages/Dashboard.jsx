import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import StudentStats from "../components/StudentStats";
import MessTimingsTable from "../components/MessTimingsTable";
import HostelEntryTimeDialog from "../components/HostelEntryTimeDialog";
import MessTimingsEditDialog from "../components/MessTimingsEditDialog";
import DashboardHeader from "../components/DashboardHeader";
import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, wardenData } = useAuth();
  
  // Use custom hook for dashboard state management
  const {
    sidebarOpen,
    setSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isEditTimeDialogOpen,
    isEditMessDialogOpen,
    hostelEntryTime,
    messTimings,
    handleEditTimeClick,
    handleTimeChange,
    handleSaveTime,
    handleCancelEditTime,
    handleEditMessClick,
    handleMessTimeChange,
    handleSaveMessTimings,
    handleCancelEditMess
  } = useDashboard();

  // Mock student statistics data
  const studentStats = {
    total_students: 1250,
    registered: 1180,
    unregistered: 70,
    active_students: 1100,
    graduated: 80,
    new_admissions: 45
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCollapseChange={setIsSidebarCollapsed} />
      
      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col p-6 min-h-screen transition-all duration-300"
        style={{
          marginLeft: isSidebarCollapsed ? '64px' : '240px',
          width: isSidebarCollapsed ? 'calc(100vw - 64px)' : 'calc(100vw - 240px)',
          backgroundColor: 'var(--color-background)'
        }}
      >
        {/* Header */}
        <DashboardHeader 
          wardenData={wardenData}
          hostelEntryTime={hostelEntryTime}
          onEditTimeClick={handleEditTimeClick}
        />

        {/* Student Statistics Cards */}
        <StudentStats stats={studentStats} isLoading={false} wardenData={wardenData} />

        {/* Mess Timings Table */}
        <MessTimingsTable 
          messTimings={messTimings} 
          onEditClick={handleEditMessClick} 
        />

        {/* Edit Hostel Entry Time Dialog */}
        <HostelEntryTimeDialog
          isOpen={isEditTimeDialogOpen}
          onClose={() => setIsEditTimeDialogOpen(false)}
          hostelEntryTime={hostelEntryTime}
          onTimeChange={handleTimeChange}
          onSave={handleSaveTime}
          onCancel={handleCancelEditTime}
          wardenData={wardenData}
        />

        {/* Edit Mess Timings Dialog */}
        <MessTimingsEditDialog
          isOpen={isEditMessDialogOpen}
          onClose={() => setIsEditMessDialogOpen(false)}
          messTimings={messTimings}
          onMessTimeChange={handleMessTimeChange}
          onSave={handleSaveMessTimings}
          onCancel={handleCancelEditMess}
          wardenData={wardenData}
        />

      </div>
    </div>
  );
}
