import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useComplaints } from "../contexts/ComplaintsContext";
import Sidebar from "../components/Sidebar";
import ComplaintsTable from "../components/ComplaintsTable";
import ComplaintStats from "../components/ComplaintStats";
import { Box, Text, Flex, TextField, Select, Button, IconButton } from "@radix-ui/themes";
import { Search, Filter, X, Search as MagnifyingGlassIcon, RefreshCw, TrendingUp } from "lucide-react";
import { ResetIcon } from '@radix-ui/react-icons';

export default function Complaints() {
  const navigate = useNavigate();
  const { user, token, wardenData, isLoading: isAuthLoading } = useAuth();
  const { 
    complaints, 
    stats, 
    isLoadingStats, 
    isLoadingComplaints, 
    loadComplaintsData,
    loadComplaintsPage,
    refreshData,
    updateComplaintStatus: updateComplaintStatusInContext,
    pagination,
    currentPage
  } = useComplaints();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [loadingPage, setLoadingPage] = useState(null);

  const handleComplaintUpdate = (complaintId, newStatus) => {
    console.log('handleComplaintUpdate called with:', complaintId, newStatus);
    updateComplaintStatusInContext(complaintId, newStatus);
  };

  useEffect(() => {
    if (wardenData?.hostel) {
      setIsInitialDataLoaded(false);
      loadComplaintsData(wardenData.hostel);
    }
  }, [wardenData?.hostel, loadComplaintsData]);

  // Track when initial data loading is complete - only when BOTH stats AND complaints are loaded
  useEffect(() => {
    if (!isLoadingComplaints && !isLoadingStats && wardenData?.hostel && !isInitialDataLoaded) {
      if (pagination || complaints.length > 0) {
        console.log('✅ Initial data loading complete');
        setIsInitialDataLoaded(true);
      }
    }
  }, [isLoadingComplaints, isLoadingStats, wardenData?.hostel, isInitialDataLoaded, pagination, complaints.length]);

  useEffect(() => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint => {
        const id = complaint.id?.toString() || '';
        const title = complaint.title || '';
        const description = complaint.description || '';
        const studentName = complaint.student_name || '';
        const studentRoll = complaint.student_roll || '';
        const roomNumber = complaint.room_number?.toString() || '';
        const category = complaint.category || '';
        const subcategory = complaint.subcategory || '';

        return id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subcategory.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter);
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, categoryFilter, complaints]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const handleRefresh = async () => {
    if (wardenData?.hostel) {
      await refreshData(wardenData.hostel, currentPage);
    }
  };

  const handlePageChange = async (newPage) => {
    if (wardenData?.hostel && newPage !== currentPage) {
      setIsPageLoading(true);
      setLoadingPage(newPage);
      try {
        await loadComplaintsPage(wardenData.hostel, newPage);
      } finally {
        setIsPageLoading(false);
        setLoadingPage(null);
      }
    }
  };

  // Determine if data fetch is complete
  const isDataFetchComplete = !isAuthLoading && isInitialDataLoaded && !isPageLoading && !isLoadingComplaints;
  
  // Debug logging
  console.log('🔍 Loading States:', JSON.stringify({
    isAuthLoading,
    isInitialDataLoaded,
    isPageLoading,
    isLoadingComplaints,
    isDataFetchComplete,
    complaintsLength: complaints.length
  }, null, 2));

  return (
    <Flex style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Box style={{
        flex: 1,
        padding: '24px',
        marginLeft: '240px',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)'
      }}>
        <Flex align="center" justify="between" style={{ marginBottom: '20px' }}>
          <Flex align="center" gap="3">
            <TrendingUp size={20} style={{ color: 'var(--gray-11)' }} />
            <Text size="5" weight="bold" style={{ color: 'var(--gray-12)' }}>
              Complaint Statistics
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <Button
              style={{ cursor: 'pointer' }}
              variant="soft"
              color="gray"
              onClick={handleRefresh}
              disabled={isLoadingStats || isLoadingComplaints}
            >
              <RefreshCw size="16" />
              Refresh
            </Button>
          </Flex>
        </Flex>

        <ComplaintStats stats={stats} isLoading={isLoadingStats} />

        <Flex gap="3" wrap="wrap" align="center" style={{ marginBottom: '12px' }}>
          <Box style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <TextField.Root
              placeholder="Search by complaint ID, student name, roll number, room, category..."
              size="2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
              {searchTerm && (
                <TextField.Slot>
                  <IconButton
                    size="1"
                    variant="ghost"
                    onClick={() => setSearchTerm("")}
                  >
                    <X height="14" width="14" />
                  </IconButton>
                </TextField.Slot>
              )}
            </TextField.Root>
          </Box>

          <Box>
            <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="pending">Pending</Select.Item>
                <Select.Item value="in_progress">In Progress</Select.Item>
                <Select.Item value="resolved">Resolved</Select.Item>
                <Select.Item value="rejected">Rejected</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Item value="all">All Categories</Select.Item>
                <Select.Item value="Electricity Issues">Electricity Issues</Select.Item>
                <Select.Item value="Plumbing Concerns">Plumbing Concerns</Select.Item>
                <Select.Item value="Room & Facilities Requests">Facilities Requests</Select.Item>
                <Select.Item value="Cleaning Services">Room Cleaning</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          <Button
            variant="soft"
            color="gray"
            onClick={clearFilters}
            disabled={!searchTerm && statusFilter === "all" && categoryFilter === "all"}
            style={{
              cursor: (!searchTerm && statusFilter === "all" && categoryFilter === "all") ? "default" : "pointer"
            }}
          >
            <ResetIcon size={16} />
            Reset Filters
          </Button>
        </Flex>

        <ComplaintsTable
          complaints={filteredComplaints}
          isLoading={isAuthLoading || !isInitialDataLoaded || isPageLoading || isLoadingComplaints}
          isDataFetchComplete={isDataFetchComplete}
          pagination={pagination}
          currentPage={currentPage}
          loadingPage={loadingPage}
          onPageChange={handlePageChange}
          onComplaintUpdate={handleComplaintUpdate}
        />
      </Box>
    </Flex>
  );
}