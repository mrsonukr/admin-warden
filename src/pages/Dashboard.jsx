import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import StudentStats from "../components/StudentStats";
import { Box, Text, Flex } from "@radix-ui/themes";
import { TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    return savedCollapsed === 'true';
  });

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
        <Flex align="center" justify="between" style={{ marginBottom: '20px' }}>
          <Flex align="center" gap="3">
            <TrendingUp size={20} style={{ color: 'var(--gray-11)' }} />
            <Text size="5" weight="bold" style={{ color: 'var(--gray-12)' }}>
              Student Statistics
            </Text>
          </Flex>
        </Flex>

        {/* Student Statistics Cards */}
        <StudentStats stats={studentStats} isLoading={false} />



      </div>
    </div>
  );
}
