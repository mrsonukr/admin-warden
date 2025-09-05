import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchComplaintStats, fetchComplaints } from '../services/api';

const ComplaintsContext = createContext();

export const useComplaints = () => {
  const context = useContext(ComplaintsContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
};

export const ComplaintsProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [currentHostel, setCurrentHostel] = useState(null);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Check if data is stale
  const isDataStale = () => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_DURATION;
  };

  // Load complaints data
  const loadComplaintsData = async (hostel, forceRefresh = false) => {
    if (!hostel) return;

    // If data exists and is not stale, don't fetch again
    if (!forceRefresh && complaints.length > 0 && !isDataStale() && currentHostel === hostel) {
      return;
    }

    try {
      setIsLoadingStats(true);
      setIsLoadingComplaints(true);

      // Load stats and complaints in parallel
      const [statsData, complaintsData] = await Promise.all([
        fetchComplaintStats(hostel),
        fetchComplaints(hostel, 1, 1000)
      ]);

      setStats(statsData);
      setComplaints(complaintsData.data || []);
      setLastFetchTime(Date.now());
      setCurrentHostel(hostel);
    } catch (error) {
      console.error('Error loading complaints data:', error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingComplaints(false);
    }
  };

  // Refresh data manually
  const refreshData = async (hostel) => {
    await loadComplaintsData(hostel, true);
  };

  // Get complaint by ID from cache
  const getComplaintById = (id) => {
    return complaints.find(complaint => complaint.id.toString() === id.toString());
  };

  // Update complaint status in cache
  const updateComplaintStatus = (complaintId, newStatus) => {
    console.log('Updating complaint:', complaintId, 'to status:', newStatus);
    setComplaints(prevComplaints => {
      const updated = prevComplaints.map(complaint => {
        if (complaint.id.toString() === complaintId.toString()) {
          console.log('Found complaint to update:', complaint);
          return { ...complaint, status: newStatus };
        }
        return complaint;
      });
      console.log('Updated complaints:', updated);
      return updated;
    });
  };

  // Clear cache
  const clearCache = () => {
    setComplaints([]);
    setStats(null);
    setLastFetchTime(null);
    setCurrentHostel(null);
  };

  const value = {
    complaints,
    stats,
    isLoadingStats,
    isLoadingComplaints,
    loadComplaintsData,
    refreshData,
    getComplaintById,
    updateComplaintStatus,
    clearCache,
    isDataStale: isDataStale()
  };

  return (
    <ComplaintsContext.Provider value={value}>
      {children}
    </ComplaintsContext.Provider>
  );
};
