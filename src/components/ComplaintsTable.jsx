import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Badge,
    Flex,
    Text,
    Box,
    IconButton,
    Button,
    Skeleton,
    HoverCard,
    Avatar,
    Separator,
    AlertDialog
} from "@radix-ui/themes";
import VerifiedIcon from '@mui/icons-material/Verified';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Copy, Eye, Check, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react";
import { updateComplaintStatus, sendBothNotifications } from '../services/api';

const ComplaintsTable = ({ complaints, isLoading, pagination, currentPage, onPageChange, onComplaintUpdate }) => {
    const navigate = useNavigate();
    const itemsPerPage = 20;
    const [studentData, setStudentData] = useState({});
    const [loadingStudents, setLoadingStudents] = useState({});
    const [acceptingComplaints, setAcceptingComplaints] = useState({});
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // Sort complaints by created_at date (latest first)
    const sortedComplaints = [...complaints].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });

    // Use client-side pagination since we have all data
    const totalPages = Math.ceil(sortedComplaints.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentComplaints = sortedComplaints.slice(startIndex, endIndex);

    // Reset to first page when complaints change
    React.useEffect(() => {
        onPageChange(1);
    }, [complaints.length, onPageChange]);
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const complaintDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Format time
        const time = date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toUpperCase();

        // Check if it's today
        if (complaintDate.getTime() === today.getTime()) {
            return `Today, ${time}`;
        }

        // Check if it's yesterday
        if (complaintDate.getTime() === yesterday.getTime()) {
            return `Yesterday, ${time}`;
        }

        // Check if it's within the last 7 days
        const diffTime = today.getTime() - complaintDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            const dayName = date.toLocaleDateString('en-IN', { weekday: 'long' });
            return `${dayName}, ${time}`;
        }

        // For older dates, show the full date with time
        const fullDate = date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        return `${fullDate}, ${time}`;
    };


    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "pending":
                return "orange";  // Pending
            case "in_progress":
                return "indigo";    // In Progress
            case "completed":
                return "green";
            case "resolved":
                return "green";   // Complete
            case "rejected":
                return "red";     // Rejected
            default:
                return "gray";    // Default to gray for any other status
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here if needed
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const fetchStudentData = async (rollNumber) => {
        if (studentData[rollNumber] || loadingStudents[rollNumber]) return;

        setLoadingStudents(prev => ({ ...prev, [rollNumber]: true }));

        try {
            const response = await fetch(`https://hostelapis.mssonutech.workers.dev/api/get/${rollNumber}`);
            const data = await response.json();

            if (data.success && data.student) {
                setStudentData(prev => ({ ...prev, [rollNumber]: data.student }));
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoadingStudents(prev => ({ ...prev, [rollNumber]: false }));
        }
    };

    const handleAcceptComplaint = async (complaintId, currentStatus) => {
        if (acceptingComplaints[complaintId]) return;

        console.log('Processing complaint:', complaintId, 'current status:', currentStatus);
        setAcceptingComplaints(prev => ({ ...prev, [complaintId]: true }));

        try {
            let newStatus, successMessage;
            
            if (currentStatus === 'pending') {
                // If pending, accept it (make it in_progress)
                newStatus = 'in_progress';
                successMessage = 'Complaint accepted successfully!';
            } else if (currentStatus === 'in_progress') {
                // If in_progress, mark as resolved
                newStatus = 'resolved';
                successMessage = 'Complaint marked as completed successfully!';
            } else {
                alert('Invalid action for this complaint status.');
                return;
            }

            const response = await updateComplaintStatus(complaintId, newStatus, 'warden001');
            
            if (response.success) {
                // Send notification when complaint is accepted (pending -> in_progress)
                if (currentStatus === 'pending' && newStatus === 'in_progress') {
                    try {
                        // Find the complaint data to get category, subcategory, and roll number
                        const complaint = complaints.find(c => c.id === complaintId);
                        if (complaint) {
                            const notificationData = {
                                title: `${complaint.category} - In Progress`,
                                description: `Complaint #${complaintId} regarding ${complaint.subcategory} is currently being processed.`,
                                channel: "complaint_status",
                                complaint_id: complaintId.toString()
                            };
                            
                            const result = await sendBothNotifications(complaint.student_roll, notificationData);
                            console.log('Notifications sent successfully for complaint:', complaintId, result);
                        }
                    } catch (notificationError) {
                        console.error('Error sending notifications:', notificationError);
                        // Don't fail the complaint acceptance if notification fails
                    }
                }
                
                // Send notification when complaint is resolved (in_progress -> resolved)
                if (currentStatus === 'in_progress' && newStatus === 'resolved') {
                    try {
                        // Find the complaint data to get category, subcategory, and roll number
                        const complaint = complaints.find(c => c.id === complaintId);
                        if (complaint) {
                            const notificationData = {
                                title: `${complaint.category} - Resolved`,
                                description: `Complaint #${complaintId} regarding ${complaint.subcategory} has been successfully resolved.`,
                                channel: "complaint_status",
                                complaint_id: complaintId.toString()
                            };
                            
                            const result = await sendBothNotifications(complaint.student_roll, notificationData);
                            console.log('Resolved notifications sent successfully for complaint:', complaintId, result);
                        }
                    } catch (notificationError) {
                        console.error('Error sending resolved notifications:', notificationError);
                        // Don't fail the complaint resolution if notification fails
                    }
                }

                // Success - no alert needed
                // Update the local complaint status
                if (onComplaintUpdate) {
                    console.log('Calling onComplaintUpdate with:', complaintId, newStatus);
                    onComplaintUpdate(complaintId, newStatus);
                }
            } else {
                alert('Failed to update complaint. Please try again.');
            }
        } catch (error) {
            console.error('Error updating complaint:', error);
            alert('Error updating complaint. Please try again.');
        } finally {
            setAcceptingComplaints(prev => ({ ...prev, [complaintId]: false }));
        }
    };

    const openConfirmDialog = (complaint) => {
        setSelectedComplaint(complaint);
        setShowConfirmDialog(true);
    };

    const confirmAction = async () => {
        if (selectedComplaint) {
            await handleAcceptComplaint(selectedComplaint.id, selectedComplaint.status);
            setShowConfirmDialog(false);
            setSelectedComplaint(null);
        }
    };


    if (isLoading) {
        return (
            <Box>
                <Box style={{ overflowX: 'auto' }}>
                    <Table.Root variant="surface">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>Complaint ID</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Room</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Subcategory</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Table.Row key={i}>
                                    <Table.Cell><Skeleton style={{ width: '80px', height: '20px' }} /></Table.Cell>
                                    <Table.Cell><Skeleton style={{ width: '60px', height: '20px' }} /></Table.Cell>
                                    <Table.Cell><Skeleton style={{ width: '120px', height: '20px' }} /></Table.Cell>
                                    <Table.Cell><Skeleton style={{ width: '80px', height: '20px' }} /></Table.Cell>
                                    <Table.Cell><Skeleton style={{ width: '100px', height: '20px' }} /></Table.Cell>
                                    <Table.Cell><Skeleton style={{ width: '80px', height: '20px' }} /></Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <style>
                {`
                    .hover-bg:hover {
                        background-color: var(--gray-3) !important;
                    }
                `}
            </style>
            <Box style={{ overflowX: 'auto' }}>
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Complaint ID</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Room</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Subcategory</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {!isLoading && currentComplaints.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    <Flex direction="column" align="center" gap="3">
                                        <Text size="3" color="gray" weight="medium">
                                            No complaints found
                                        </Text>
                                        <Text size="2" color="gray">
                                            Try adjusting your search or filter criteria
                                        </Text>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        ) : !isLoading ? (
                             currentComplaints.map((complaint) => {
                                 return (
                                     <Table.Row key={complaint.id}>
                                    <Table.Cell>
                                        <Flex align="center" gap="2">
                                            <Text size="2" weight="medium">
                                                {complaint.id}
                                            </Text>
                                            <IconButton
                                                size="1"
                                                aria-label="Copy complaint ID"
                                                color="gray"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(complaint.id.toString())}
                                            >
                                                <Copy size="14" />
                                            </IconButton>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Flex align="center" gap="2">
                                            <Text size="2" weight="medium">
                                                {complaint.room_number}
                                            </Text>
                                            <HoverCard.Root>
                                                <HoverCard.Trigger asChild>
                                                    <Box
                                                        style={{
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.2s',
                                                        }}
                                                        className="hover-bg"
                                                        onMouseEnter={() => fetchStudentData(complaint.student_roll)}
                                                    >
                                                        <InfoCircledIcon width="14" height="14" style={{ color: 'var(--gray-9)' }} />
                                                    </Box>
                                                </HoverCard.Trigger>
                                                <HoverCard.Content maxWidth="320px">
                                                    <Flex gap="3">
                                                        <Avatar
                                                            size="3"
                                                            fallback={complaint.student_name?.charAt(0) || 'S'}
                                                            radius="full"
                                                            src={studentData[complaint.student_roll]?.profile_pic_url}
                                                        />
                                                        <Box style={{ flex: 1 }}>
                                                            <Flex gap="1" align="center" mb="2">
                                                                <Text size="3" weight="bold">
                                                                    {studentData[complaint.student_roll]?.full_name || complaint.student_name}
                                                                </Text>
                                                                <VerifiedIcon sx={{ fontSize: 16, color: 'var(--blue-9)' }} />
                                                            </Flex>

                                                            <Flex gap="3" align="center" mb="2">
                                                                <Text size="1">{complaint.student_roll}</Text>
                                                                <Separator orientation="vertical" />
                                                                <Text size="1">{complaint.hostel_name}</Text>
                                                            </Flex>

                                                            {studentData[complaint.student_roll] && (
                                                                <>
                                                                    <Flex gap="2" align="center" mb="1">
                                                                        <IconButton size="1" color="green" variant="soft">
                                                                            <Phone size="10" />
                                                                        </IconButton>
                                                                        <Text size="1">{studentData[complaint.student_roll].mobile_no}</Text>
                                                                    </Flex>

                                                                    <Flex gap="2" align="center">
                                                                        <IconButton color="red" size="1" variant="soft">
                                                                            <Mail size="10" />
                                                                        </IconButton>
                                                                        <Text size="1">{studentData[complaint.student_roll].email?.toLowerCase()}</Text>
                                                                    </Flex>
                                                                </>
                                                            )}

                                                            {loadingStudents[complaint.student_roll] && (
                                                                <>
                                                                    <Separator my="2" size="4" />
                                                                    <Text size="1" color="indigo">
                                                                        Loading contact details...
                                                                    </Text>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Flex>
                                                </HoverCard.Content>
                                            </HoverCard.Root>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Flex direction="column" gap="2">
                                            <Text size="2" weight="medium">
                                                {complaint.subcategory}
                                            </Text>
                                            <Text size="1" color="gray">
                                                {complaint.category}
                                            </Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={getStatusBadgeColor(complaint.status)}>
                                            {complaint.status === 'in_progress' ? 'Progress' : complaint.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text
                                            size="1"
                                            color="gray"
                                            weight="medium"

                                        >
                                            {formatDate(complaint.created_at)}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Flex gap="2" align="center">
                                            <IconButton 
                                                radius="large" 
                                                color="green" 
                                                variant="soft" 
                                                style={{ 
                                                    cursor: (acceptingComplaints[complaint.id] || complaint.status === 'resolved' || complaint.status === 'rejected') ? 'default' : 'pointer' 
                                                }}
                                                onClick={() => openConfirmDialog(complaint)}
                                                disabled={acceptingComplaints[complaint.id] || complaint.status === 'resolved' || complaint.status === 'rejected'}
                                            >
                                                <Check size="16" />
                                            </IconButton>
                                            <IconButton 
                                                radius="large" 
                                                color="indigo" 
                                                variant="soft" 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/complaints/${complaint.id}`)}
                                            >
                                                <Eye size="16" />
                                            </IconButton>
                                        </Flex>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                        ) : null}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box style={{ marginTop: '20px' }}>
                    <Flex align="center" justify="between" wrap="wrap" gap="3">
                        <Text size="2" color="gray">
                            Showing {startIndex + 1} to {Math.min(endIndex, sortedComplaints.length)} of {sortedComplaints.length} complaints
                        </Text>

                        <Flex align="center" gap="2">
                            <Button
                                variant="soft"
                                color="gray"
                                size="2"
                                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    cursor: currentPage === 1 ? "default" : "pointer"
                                }}
                            >
                                <ChevronLeft size="16" />
                                Previous
                            </Button>

                            <Flex align="center" gap="1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                    // Show first page, last page, current page, and pages around current
                                    const shouldShow = page === 1 ||
                                        page === totalPages ||
                                        Math.abs(page - currentPage) <= 1;

                                    if (!shouldShow) {
                                        // Show ellipsis for gaps
                                        if (page === 2 && currentPage > 4) {
                                            return <Text key={`ellipsis-${page}`} size="2" color="gray">...</Text>;
                                        }
                                        if (page === totalPages - 1 && currentPage < totalPages - 3) {
                                            return <Text key={`ellipsis-${page}`} size="2" color="gray">...</Text>;
                                        }
                                        return null;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant={page === currentPage ? "solid" : "soft"}
                                            color={page === currentPage ? "indigo" : "gray"}
                                            size="2"
                                            onClick={() => onPageChange(page)}
                                            style={{
                                                minWidth: '32px',
                                                cursor: "pointer"
                                            }}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </Flex>

                            <Button
                                variant="soft"
                                color="gray"
                                size="2"
                                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    cursor: currentPage === totalPages ? "default" : "pointer"
                                }}
                            >
                                Next
                                <ChevronRight size="16" />
                            </Button>
                        </Flex>
                    </Flex>
                </Box>
            )}

            {/* Confirmation Dialog */}
            <AlertDialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialog.Content maxWidth="450px">
                    <AlertDialog.Title>
                        {selectedComplaint?.status === 'pending' ? 'Accept Complaint' : 'Mark as Completed'}
                    </AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        {selectedComplaint?.status === 'pending' 
                            ? 'Are you sure you want to accept this complaint? It will be marked as in progress.'
                            : 'Are you sure you want to mark this complaint as completed? This action cannot be undone.'
                        }
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button 
                                variant="solid" 
                                color="green"
                                onClick={confirmAction}
                                disabled={selectedComplaint && acceptingComplaints[selectedComplaint.id]}
                            >
                                {selectedComplaint?.status === 'pending' ? 'Accept' : 'Mark as Completed'}
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Box>
    );
};

export default ComplaintsTable;
