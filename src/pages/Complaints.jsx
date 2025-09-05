import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useComplaints } from "../contexts/ComplaintsContext";
import Sidebar from "../components/Sidebar";
import ComplaintsTable from "../components/ComplaintsTable";
import ComplaintStats from "../components/ComplaintStats";
import { Box, Text, Flex, TextField, Select, Button, Card, IconButton } from "@radix-ui/themes";
import { Search, Filter, X, Search as MagnifyingGlassIcon, MoreHorizontal as DotsHorizontalIcon, RefreshCw, TrendingUp } from "lucide-react";
import { ResetIcon } from '@radix-ui/react-icons';
export default function Complaints() {
  const navigate = useNavigate();
  const { user, token, wardenData } = useAuth();
  const { 
    complaints, 
    stats, 
    isLoadingStats, 
    isLoadingComplaints, 
    loadComplaintsData, 
    refreshData,
    isDataStale,
    updateComplaintStatus: updateComplaintStatusInContext
  } = useComplaints();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleComplaintUpdate = (complaintId, newStatus) => {
    console.log('handleComplaintUpdate called with:', complaintId, newStatus);
    // Update the complaint status in the context
    updateComplaintStatusInContext(complaintId, newStatus);
  };

  useEffect(() => {
    if (wardenData?.hostel) {
      loadComplaintsData(wardenData.hostel);
    }
  }, [wardenData?.hostel, loadComplaintsData]);

  // Filter complaints based on search term and status
  useEffect(() => {
    let filtered = complaints;

    // Filter by search term
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

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Filter by category
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
      await refreshData(wardenData.hostel);
    }
  };

  return (
    <Flex style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box style={{
        flex: 1,
        padding: '24px',
        marginLeft: '240px',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)'
      }}>
        {/* Header with Title and Refresh Button */}
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

        {/* Complaint Statistics */}
        <ComplaintStats stats={stats} isLoading={isLoadingStats} />

        {/* Search and Filter Section */}
        <Flex gap="3" wrap="wrap" align="center" style={{ marginBottom: '12px' }}>
          {/* Search Input */}
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

          {/* Status Filter */}
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

          {/* Category Filter */}
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

          {/* Clear Filters Button */}
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

        {/* Complaints Table */}
        <ComplaintsTable
          complaints={filteredComplaints}
          isLoading={isLoadingComplaints}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onComplaintUpdate={handleComplaintUpdate}
        />
      </Box>
    </Flex>
  );
}
