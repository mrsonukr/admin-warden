import { useState } from 'react';
import { getDefaultHostelEntryTime, getDefaultMessTimings } from '../utils/timeUtils';

export const useDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    return savedCollapsed === 'true';
  });
  const [isEditTimeDialogOpen, setIsEditTimeDialogOpen] = useState(false);
  const [isEditMessDialogOpen, setIsEditMessDialogOpen] = useState(false);
  const [hostelEntryTime, setHostelEntryTime] = useState(getDefaultHostelEntryTime());
  const [messTimings, setMessTimings] = useState(getDefaultMessTimings());

  const handleEditTimeClick = () => {
    console.log('Current hostel entry time:', hostelEntryTime);
    setIsEditTimeDialogOpen(true);
  };

  const handleTimeChange = (field, value) => {
    setHostelEntryTime(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveTime = () => {
    // Here you would typically save to backend
    console.log('Saving hostel entry time:', hostelEntryTime);
    setIsEditTimeDialogOpen(false);
  };

  const handleCancelEditTime = () => {
    setHostelEntryTime(getDefaultHostelEntryTime());
    setIsEditTimeDialogOpen(false);
  };

  const handleEditMessClick = () => {
    setIsEditMessDialogOpen(true);
  };

  const handleMessTimeChange = (index, field, value) => {
    setMessTimings(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Update time strings when components change
        if (field.includes('start')) {
          updatedItem.startTime = `${updatedItem.startHour}:${updatedItem.startMinute} ${updatedItem.startPeriod}`;
        }
        if (field.includes('end')) {
          updatedItem.endTime = `${updatedItem.endHour}:${updatedItem.endMinute} ${updatedItem.endPeriod}`;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSaveMessTimings = () => {
    console.log('Saving mess timings:', messTimings);
    setIsEditMessDialogOpen(false);
  };

  const handleCancelEditMess = () => {
    setMessTimings(getDefaultMessTimings());
    setIsEditMessDialogOpen(false);
  };

  return {
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
  };
};
