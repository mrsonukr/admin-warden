import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cachedPages, setCachedPages] = useState({}); // Cache for different pages
  
  // Use refs to track ongoing requests and prevent duplicate calls
  const statsRequestRef = useRef(null);
  const complaintsRequestRef = useRef(null);
  const isInitializedRef = useRef(false);
  const initializationPromiseRef = useRef(null);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Check if data is stale
  const isDataStale = useCallback(() => {
    return !lastFetchTime || (Date.now() - lastFetchTime > CACHE_DURATION);
  }, [lastFetchTime, CACHE_DURATION]);

  // Unified data loading function - this prevents duplicate calls
  const loadData = useCallback(async (hostel, forceRefresh = false, loadComplaints = false, page = 1) => {
    console.log('🔄 ComplaintsContext: loadData called', {
      hostel,
      forceRefresh,
      loadComplaints,
      currentHostel,
      hasStats: !!stats,
      hasComplaints: complaints.length > 0,
      isDataStale: isDataStale(),
      statsRequestInProgress: !!statsRequestRef.current,
      complaintsRequestInProgress: !!complaintsRequestRef.current
    });

    if (!hostel) {
      console.log('⚠️ ComplaintsContext: No hostel provided for loadData');
      return;
    }

    // Check if we already have fresh data and don't need to refresh
    const hasFreshStats = stats && !isDataStale() && currentHostel === hostel;
    const hasFreshComplaints = complaints.length > 0 && !isDataStale() && currentHostel === hostel;
    
    if (!forceRefresh && hasFreshStats && (!loadComplaints || hasFreshComplaints)) {
      console.log('✅ ComplaintsContext: Using cached data, skipping API calls');
      return;
    }

    // If we need complaints but stats are already being loaded, wait for stats to complete
    if (loadComplaints && statsRequestRef.current && !complaintsRequestRef.current) {
      console.log('⏳ ComplaintsContext: Stats loading in progress, waiting for completion before loading complaints');
      try {
        await statsRequestRef.current;
        // After stats complete, check if we still need to load complaints
        const freshComplaints = complaints.length > 0 && !isDataStale() && currentHostel === hostel;
        if (!forceRefresh && freshComplaints) {
          console.log('✅ ComplaintsContext: Complaints already fresh after stats loaded');
          return;
        }
        // Check if complaints request is already in progress
        if (complaintsRequestRef.current) {
          console.log('⏳ ComplaintsContext: Complaints request already started, waiting for existing promise');
          return complaintsRequestRef.current;
        }
        
        // Now load only complaints since we already have fresh stats
        console.log('🚀 ComplaintsContext: Loading only complaints after stats completed');
        setIsLoadingComplaints(true);
        const complaintsPromise = fetchComplaints(hostel, page, 20);
        complaintsRequestRef.current = complaintsPromise;
        
        try {
          const complaintsData = await complaintsPromise;
          setComplaints(complaintsData.data || []);
          setPagination(complaintsData.pagination || null);
          setCurrentPage(page);
          setLastFetchTime(Date.now());
          
          // Cache the page data
          setCachedPages(prev => ({
            ...prev,
            [page]: {
              data: complaintsData.data || [],
              pagination: complaintsData.pagination || null,
              timestamp: Date.now()
            }
          }));
          
          console.log('✅ ComplaintsContext: Complaints loaded successfully', {
            complaintsCount: complaintsData.data?.length || 0,
            pagination: complaintsData.pagination
          });
        } finally {
          setIsLoadingComplaints(false);
          complaintsRequestRef.current = null;
        }
        return;
      } catch (error) {
        console.error('❌ ComplaintsContext: Error loading complaints after stats:', error);
        setIsLoadingComplaints(false);
        complaintsRequestRef.current = null;
        return;
      }
    }

    // Prevent duplicate requests
    if (statsRequestRef.current && !loadComplaints) {
      console.log('⏳ ComplaintsContext: Stats request already in progress, returning existing promise');
      return statsRequestRef.current;
    }

    if (loadComplaints && complaintsRequestRef.current) {
      console.log('⏳ ComplaintsContext: Complaints request already in progress, returning existing promise');
      return complaintsRequestRef.current;
    }

    console.log('🚀 ComplaintsContext: Starting loadData API calls', { loadComplaints });
    setIsLoadingStats(true);
    if (loadComplaints) setIsLoadingComplaints(true);
    setError(null);

    try {
      if (loadComplaints) {
        // Load both stats and complaints
        const statsPromise = fetchComplaintStats(hostel);
        const complaintsPromise = fetchComplaints(hostel, page, 20);
        
        const combinedPromise = Promise.all([statsPromise, complaintsPromise]);
        complaintsRequestRef.current = combinedPromise;

        const [statsData, complaintsData] = await combinedPromise;

        console.log('✅ ComplaintsContext: loadData (with complaints) completed successfully', {
          statsData,
          complaintsCount: complaintsData.data?.length || 0,
          pagination: complaintsData.pagination
        });

        setStats(statsData);
        setComplaints(complaintsData.data || []);
        setPagination(complaintsData.pagination || null);
        setCurrentPage(page);
        setLastFetchTime(Date.now());
        setCurrentHostel(hostel);
        
        // Cache the page data
        setCachedPages(prev => ({
          ...prev,
          [page]: {
            data: complaintsData.data || [],
            pagination: complaintsData.pagination || null,
            timestamp: Date.now()
          }
        }));
      } else {
        // Load only stats
        const statsPromise = fetchComplaintStats(hostel);
        statsRequestRef.current = statsPromise;
        
        const statsData = await statsPromise;
        
        console.log('✅ ComplaintsContext: loadData (stats only) completed successfully', statsData);
        
        setStats(statsData);
        setCurrentHostel(hostel);
        
        // Update last fetch time only if we don't have complaints data
        if (complaints.length === 0) {
          setLastFetchTime(Date.now());
        }
      }
      
    } catch (error) {
      console.error('❌ ComplaintsContext: Error loading data:', error);
      setError(error);
    } finally {
      setIsLoadingStats(false);
      if (loadComplaints) setIsLoadingComplaints(false);
      statsRequestRef.current = null;
      if (loadComplaints) complaintsRequestRef.current = null;
    }
  }, [stats, complaints.length, isDataStale, currentHostel]);

  // Fetch stats only (for sidebar) - now uses unified loadData
  const fetchStatsOnly = useCallback(async (hostel, forceRefresh = false) => {
    console.log('🔄 ComplaintsContext: fetchStatsOnly called - delegating to loadData');
    await loadData(hostel, forceRefresh, false);
    return stats;
  }, [loadData, stats]);

  // Load full complaints data (for complaints page) - now uses unified loadData
  const loadComplaintsData = useCallback(async (hostel, forceRefresh = false, page = 1) => {
    console.log('🔄 ComplaintsContext: loadComplaintsData called - delegating to loadData');
    await loadData(hostel, forceRefresh, true, page);
  }, [loadData]);

  // Load specific page of complaints with caching
  const loadComplaintsPage = useCallback(async (hostel, page) => {
    console.log('🔄 ComplaintsContext: loadComplaintsPage called', { 
      hostel, 
      page,
      isPageCached: !!cachedPages[page],
      cachedPagesKeys: Object.keys(cachedPages)
    });

    // Check if page is already cached
    if (cachedPages[page] && !isDataStale()) {
      console.log('✅ ComplaintsContext: Using cached page data, skipping API call', { page });
      setComplaints(cachedPages[page].data);
      setPagination(cachedPages[page].pagination);
      setCurrentPage(page);
      return;
    }

    console.log('🚀 ComplaintsContext: Loading fresh page data from API (complaints only, no stats reload)', { page });
    setIsLoadingComplaints(true);
    try {
      const complaintsData = await fetchComplaints(hostel, page, 20);
      setComplaints(complaintsData.data || []);
      setPagination(complaintsData.pagination || null);
      setCurrentPage(page);
      setLastFetchTime(Date.now());

      // Cache the page data
      setCachedPages(prev => ({
        ...prev,
        [page]: {
          data: complaintsData.data || [],
          pagination: complaintsData.pagination || null,
          timestamp: Date.now()
        }
      }));

      console.log('✅ ComplaintsContext: Page complaints loaded successfully', {
        complaintsCount: complaintsData.data?.length || 0,
        pagination: complaintsData.pagination
      });
    } catch (error) {
      console.error('❌ ComplaintsContext: Failed to load page complaints', error);
    } finally {
      setIsLoadingComplaints(false);
    }
  }, [cachedPages, isDataStale]);

  // Initialize data when hostel is available - now uses unified loadData
  const initializeData = useCallback(async (hostel) => {
    console.log('🔄 ComplaintsContext: initializeData called', {
      hostel,
      isInitialized: isInitializedRef.current,
      hasStats: !!stats,
      hasComplaints: complaints.length > 0,
      currentHostel,
      hasInitializationPromise: !!initializationPromiseRef.current
    });

    if (!hostel) {
      console.log('⚠️ ComplaintsContext: No hostel provided for initialization');
      return;
    }

    // If we already have data for this hostel, don't re-initialize
    if (isInitializedRef.current && currentHostel === hostel && (stats || complaints.length > 0)) {
      console.log('✅ ComplaintsContext: Already initialized with data, skipping');
      return;
    }

    // If we're already initializing, return the existing promise
    if (initializationPromiseRef.current) {
      console.log('⏳ ComplaintsContext: Initialization already in progress, returning existing promise');
      return initializationPromiseRef.current;
    }
    
    console.log('🚀 ComplaintsContext: Starting initialization for hostel:', hostel);
    isInitializedRef.current = true;
    
    // Create and store the initialization promise
    const initPromise = loadData(hostel, false, false); // Load only stats for initialization
    initializationPromiseRef.current = initPromise;
    
    try {
      await initPromise;
    } finally {
      // Clear the promise reference when done
      initializationPromiseRef.current = null;
    }
  }, [loadData, stats, complaints.length, currentHostel]);

  // Refresh data manually - now uses unified loadData
  const refreshData = useCallback(async (hostel, page = 1) => {
    console.log('🔄 ComplaintsContext: refreshData called', { hostel, page });
    
    if (!hostel) {
      console.log('⚠️ ComplaintsContext: No hostel provided for refreshData');
      return;
    }
    
    console.log('🚀 ComplaintsContext: Clearing cache and forcing refresh');
    // Clear cache and force refresh
    setLastFetchTime(null);
    await loadData(hostel, true, true, page); // Force refresh with complaints
  }, [loadData]);

  // Get complaint by ID from cache
  const getComplaintById = useCallback((id) => {
    return complaints.find(complaint => complaint.id.toString() === id.toString());
  }, [complaints]);

  // Update complaint status in cache
  const updateComplaintStatus = useCallback((complaintId, newStatus) => {
    console.log('Updating complaint:', complaintId, 'to status:', newStatus);
    
    setComplaints(prevComplaints => {
      const updated = prevComplaints.map(complaint => {
        if (complaint.id.toString() === complaintId.toString()) {
          return { ...complaint, status: newStatus };
        }
        return complaint;
      });
      return updated;
    });

    // Update stats to reflect the status change
    if (stats && stats.data) {
      setStats(prevStats => {
        const newStats = { ...prevStats };
        const oldComplaint = complaints.find(c => c.id.toString() === complaintId.toString());
        
        if (oldComplaint && oldComplaint.status !== newStatus) {
          // Decrease old status count
          if (newStats.data[oldComplaint.status] > 0) {
            newStats.data[oldComplaint.status]--;
          }
          
          // Increase new status count
          if (newStats.data[newStatus] !== undefined) {
            newStats.data[newStatus]++;
          }
        }
        
        return newStats;
      });
    }
  }, [complaints, stats]);

  // Clear cache
  const clearCache = useCallback(() => {
    setComplaints([]);
    setStats(null);
    setLastFetchTime(null);
    setCurrentHostel(null);
    setError(null);
    setPagination(null);
    setCurrentPage(1);
    setCachedPages({}); // Clear page cache
    isInitializedRef.current = false;
    
    // Cancel any ongoing requests
    if (statsRequestRef.current) {
      statsRequestRef.current = null;
    }
    if (complaintsRequestRef.current) {
      complaintsRequestRef.current = null;
    }
    if (initializationPromiseRef.current) {
      initializationPromiseRef.current = null;
    }
  }, []);

  // Get pending count for sidebar badge
  const getPendingCount = useCallback(() => {
    return stats?.data?.pending || 0;
  }, [stats]);

  const value = {
    // Data
    complaints,
    stats,
    error,
    pagination,
    currentPage,
    cachedPages,
    
    // Loading states
    isLoadingStats,
    isLoadingComplaints,
    
    // Functions
    loadComplaintsData,
    loadComplaintsPage,
    fetchStatsOnly,
    initializeData,
    refreshData,
    getComplaintById,
    updateComplaintStatus,
    clearCache,
    getPendingCount,
    
    // Computed values
    isDataStale: isDataStale(),
    currentHostel
  };

  return (
    <ComplaintsContext.Provider value={value}>
      {children}
    </ComplaintsContext.Provider>
  );
};