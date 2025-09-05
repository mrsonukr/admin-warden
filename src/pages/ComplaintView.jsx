import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Text,
    Flex,
    Card,
    Badge,
    Button,
    Separator,
    Avatar,
    IconButton,
    Skeleton,
    Table,
    Blockquote,
    AlertDialog
} from "@radix-ui/themes";
import { ArrowLeft, Phone, Mail, Calendar, User, MapPin, FileText, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { fetchComplaintDetails, updateComplaintStatus } from '../services/api';
import { useComplaints } from '../contexts/ComplaintsContext';
import Sidebar from '../components/Sidebar';
import ImageModal from '../components/ImageModal';

const ComplaintView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getComplaintById } = useComplaints();
    const [complaint, setComplaint] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [markingCompleted, setMarkingCompleted] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isProfileImage, setIsProfileImage] = useState(false);
    const [showAcceptDialog, setShowAcceptDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching complaint details for ID:', id);
                setLoading(true);
                const response = await fetchComplaintDetails(id);
                console.log('API Response:', response);
                const complaintData = response.success ? response.data : response;
                console.log('Complaint Data:', complaintData);
                setComplaint(complaintData);

                // Fetch student data if we have a complaint
                if (complaintData?.student_roll) {
                    setLoadingStudent(true);
                    try {
                        const response = await fetch(`https://hostelapis.mssonutech.workers.dev/api/get/${complaintData.student_roll}`);
                        const studentResponse = await response.json();
                        if (studentResponse.success && studentResponse.student) {
                            setStudentData(studentResponse.student);
                        }
                    } catch (error) {
                        console.error('Error fetching student data:', error);
                    } finally {
                        setLoadingStudent(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching complaint details:', error);
                alert('Error loading complaint details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const getStatusIcon = (status) => {
        if (!status) return <Clock size="16" color="gray" />;

        switch (status) {
            case 'resolved':
                return <CheckCircle2 size="16" color="green" />;
            case 'pending':
                return <Clock size="16" color="orange" />;
            case 'in_progress':
                return <AlertCircle size="16" color="indigo" />;
            case 'rejected':
                return <XCircle size="16" color="red" />;
            default:
                return <Clock size="16" color="gray" />;
        }
    };

    const getStatusBadgeColor = (status) => {
        if (!status) return 'gray';

        switch (status) {
            case 'resolved':
                return 'green';
            case 'pending':
                return 'orange';
            case 'in_progress':
                return 'indigo';
            case 'rejected':
                return 'red';
            default:
                return 'gray';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const complaintDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const time = date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toUpperCase();

        if (complaintDate.getTime() === today.getTime()) {
            return `Today, ${time}`;
        }

        if (complaintDate.getTime() === yesterday.getTime()) {
            return `Yesterday, ${time}`;
        }

        const diffTime = today.getTime() - complaintDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            const dayName = date.toLocaleDateString('en-IN', { weekday: 'long' });
            return `${dayName}, ${time}`;
        }

        const fullDate = date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        return `${fullDate}, ${time}`;
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMinutes < 1) {
            return 'just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else if (diffWeeks < 4) {
            return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
        } else if (diffMonths < 12) {
            return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
        } else {
            const diffYears = Math.floor(diffMonths / 12);
            return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
        }
    };

    const openImageModal = (photoUrl, isProfile = false) => {
        setSelectedImage(photoUrl);
        setIsProfileImage(isProfile);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsProfileImage(false);
    };

    const handleAcceptComplaint = async () => {
        if (!complaint) return;
        
        setAccepting(true);
        setShowAcceptDialog(false);
        try {
            const response = await updateComplaintStatus(complaint.id, 'in_progress', 'warden001');
            
            if (response.success) {
                // Update the complaint status locally
                setComplaint(prev => ({
                    ...prev,
                    status: 'in_progress',
                    in_progress_at: new Date().toISOString()
                }));
                
                // Success - no alert needed
            } else {
                alert('Failed to accept complaint. Please try again.');
            }
        } catch (error) {
            console.error('Error accepting complaint:', error);
            alert('Error accepting complaint. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    const handleRejectComplaint = async () => {
        if (!complaint) return;
        
        setRejecting(true);
        setShowRejectDialog(false);
        try {
            const response = await updateComplaintStatus(complaint.id, 'rejected', 'warden001');
            
            if (response.success) {
                // Update the complaint status locally
                setComplaint(prev => ({
                    ...prev,
                    status: 'rejected',
                    rejected_at: new Date().toISOString()
                }));
                
                // Success - no alert needed
            } else {
                alert('Failed to reject complaint. Please try again.');
            }
        } catch (error) {
            console.error('Error rejecting complaint:', error);
            alert('Error rejecting complaint. Please try again.');
        } finally {
            setRejecting(false);
        }
    };

    const handleMarkAsCompleted = async () => {
        if (!complaint) return;
        
        setMarkingCompleted(true);
        setShowCompleteDialog(false);
        try {
            const response = await updateComplaintStatus(complaint.id, 'resolved', 'warden001');
            
            if (response.success) {
                // Update the complaint status locally
                setComplaint(prev => ({
                    ...prev,
                    status: 'resolved',
                    resolved_at: new Date().toISOString()
                }));
                
                // Success - no alert needed
            } else {
                alert('Failed to mark complaint as completed. Please try again.');
            }
        } catch (error) {
            console.error('Error marking complaint as completed:', error);
            alert('Error marking complaint as completed. Please try again.');
        } finally {
            setMarkingCompleted(false);
        }
    };

    if (loading) {
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
                    {/* Header Skeleton */}
                    <Flex align="center" gap="4" mb="6">
                        <Skeleton height="32px" width="80px" />
                        <Flex align="center" justify="between" style={{ width: '100%' }}>
                            <Skeleton height="40px" width="200px" />
                            <Skeleton height="24px" width="150px" />
                        </Flex>
                    </Flex>

                    <Flex gap="6" wrap="wrap">
                        {/* Main Content Skeleton */}
                        <Box style={{ flex: '1 1 600px' }}>
                            <Card>
                                <Box style={{ padding: '24px' }}>
                                    <Flex direction="column" gap="4">
                                        {/* Title Section Skeleton */}
                                        <Flex align="start" justify="between" mb="2">
                                            <Flex direction="column" gap="2">
                                                <Skeleton height="32px" width="300px" />
                                                <Flex align="center" gap="3">
                                                    <Skeleton height="20px" width="150px" />
                                                    <Skeleton height="24px" width="80px" />
                                                </Flex>
                                            </Flex>
                                            <Flex gap="2">
                                                <Skeleton height="32px" width="80px" />
                                                <Skeleton height="32px" width="80px" />
                                            </Flex>
                                        </Flex>

                                        <Separator my="3" style={{ width: '100%' }} />

                                        {/* Description Skeleton */}
                                        <Flex direction="column" gap="2">
                                            <Skeleton height="24px" width="100px" />
                                            <Skeleton height="60px" width="100%" />
                                        </Flex>

                                        {/* Photos Skeleton */}
                                        <Separator my="3" style={{ width: '100%' }} />
                                        <Flex direction="column" gap="2">
                                            <Skeleton height="24px" width="80px" />
                                            <Flex gap="3" wrap="wrap">
                                                <Skeleton height="120px" width="120px" />
                                                <Skeleton height="120px" width="120px" />
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </Box>
                            </Card>
                        </Box>

                        {/* Sidebar Skeleton */}
                        <Box style={{ flex: '0 0 300px' }}>
                            <Flex direction="column" gap="4">
                                {/* Student Info Skeleton */}
                                <Card>
                                    <Box style={{ padding: '20px' }}>
                                        <Flex direction="column" gap="3">
                                            <Skeleton height="24px" width="140px" />

                                            <Flex align="start" gap="3">
                                                <Skeleton height="40px" width="40px" style={{ borderRadius: '50%' }} />
                                                <Flex direction="column" gap="1">
                                                    <Skeleton height="20px" width="120px" />
                                                    <Skeleton height="16px" width="80px" />
                                                </Flex>
                                            </Flex>

                                            <Flex align="center" gap="4">
                                                <Flex align="center" gap="2">
                                                    <Skeleton height="16px" width="16px" />
                                                    <Skeleton height="16px" width="60px" />
                                                </Flex>
                                                <Skeleton height="16px" width="1px" />
                                                <Flex align="center" gap="2">
                                                    <Skeleton height="16px" width="16px" />
                                                    <Skeleton height="16px" width="40px" />
                                                </Flex>
                                            </Flex>

                                            <Separator my="1" style={{ width: '100%' }} />
                                            <Skeleton height="16px" width="120px" />

                                            <Flex gap="2" align="center" mb="1">
                                                <Skeleton height="20px" width="20px" />
                                                <Skeleton height="16px" width="100px" />
                                            </Flex>

                                            <Flex gap="2" align="center">
                                                <Skeleton height="20px" width="20px" />
                                                <Skeleton height="16px" width="120px" />
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Card>

                                {/* Status History Skeleton */}
                                <Table.Root variant="surface">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell>
                                                <Flex align="center" gap="2">
                                                    <Skeleton height="20px" width="20px" />
                                                    <Skeleton height="16px" width="60px" />
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Skeleton height="20px" width="120px" />
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                <Flex align="center" gap="2">
                                                    <Skeleton height="20px" width="20px" />
                                                    <Skeleton height="16px" width="80px" />
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Skeleton height="20px" width="120px" />
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                <Flex align="center" gap="2">
                                                    <Skeleton height="20px" width="20px" />
                                                    <Skeleton height="16px" width="70px" />
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Skeleton height="20px" width="120px" />
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table.Root>
                            </Flex>
                        </Box>
                    </Flex>
                </Box>
            </Flex>
        );
    }

    if (!loading && !complaint) {
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
                    <Flex direction="column" align="center" gap="4" style={{ padding: '40px' }}>
                        <Text size="4" color="red">Complaint not found</Text>
                        <Text size="2" color="gray">Complaint ID: {id}</Text>
                        <Button onClick={() => navigate('/complaints')}>
                            <ArrowLeft size="16" />
                            Back to Complaints
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        );
    }

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
                {/* Header */}
                <Flex align="center" gap="4" mb="6">
                    <Button
                        variant="soft"
                        color="gray"
                        onClick={() => navigate('/complaints')}
                        style={{ cursor: 'pointer' }}
                    >
                        <ArrowLeft size="16" />
                        Back
                    </Button>
                    <Flex align="center" justify="between" style={{ width: '100%' }}>
                        <Text size="6" weight="bold">Complaint #{complaint.id}</Text>
                        <Badge color="gray" variant="soft" size="2">
                            {formatDate(complaint.created_at)}
                        </Badge>
                    </Flex>
                </Flex>

                <Flex gap="6" wrap="wrap">
                    {/* Main Content */}
                    <Box style={{ flex: '1 1 600px' }}>
                        <Card>
                            <Box style={{ padding: '24px' }}>
                                <Flex direction="column" gap="4">
                                    <Flex align="start" justify="between" mb="2">
                                        <Flex direction="column" gap="2">
                                            <Flex align="center" gap="3">
                                                <Text size="4" weight="bold">{complaint.subcategory || 'No Subcategory'}</Text>
                                            </Flex>
                                            <Flex align="center" gap="3">
                                                <Text size="2" color="gray">
                                                    {complaint.category || 'No Category'}
                                                </Text>
                                                <Badge color={getStatusBadgeColor(complaint.status)} size="2">
                                                    {complaint.status ? complaint.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
                                                </Badge>
                                            </Flex>
                                        </Flex>

                                        <Flex gap="2">
                                            {complaint.status === 'in_progress' ? (
                                                <AlertDialog.Root open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                                                    <AlertDialog.Trigger asChild>
                                                        <Button 
                                                            color="green" 
                                                            variant="soft" 
                                                            size="2"
                                                            disabled={markingCompleted}
                                                        >
                                                            <CheckCircle2 size="16" />
                                                            {markingCompleted ? 'Marking...' : 'Mark as Completed'}
                                                        </Button>
                                                    </AlertDialog.Trigger>
                                                    <AlertDialog.Content maxWidth="450px">
                                                        <AlertDialog.Title>Mark as Completed</AlertDialog.Title>
                                                        <AlertDialog.Description size="2">
                                                            Are you sure you want to mark this complaint as completed? This action cannot be undone.
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
                                                                    onClick={handleMarkAsCompleted}
                                                                    disabled={markingCompleted}
                                                                >
                                                                    {markingCompleted ? 'Marking...' : 'Mark as Completed'}
                                                                </Button>
                                                            </AlertDialog.Action>
                                                        </Flex>
                                                    </AlertDialog.Content>
                                                </AlertDialog.Root>
                                            ) : complaint.status === 'resolved' || complaint.status === 'rejected' ? (
                                                <Text size="2" color="gray" style={{ fontStyle: 'italic' }}>
                                                    {complaint.status === 'resolved' ? `Complaint Resolved ${getTimeAgo(complaint.resolved_at)}` : `Complaint Rejected ${getTimeAgo(complaint.rejected_at)}`}
                                                </Text>
                                            ) : (
                                                <>
                                                    <AlertDialog.Root open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                                                        <AlertDialog.Trigger asChild>
                                                            <Button 
                                                                color="green" 
                                                                variant="soft" 
                                                                size="2"
                                                                disabled={accepting}
                                                            >
                                                                <CheckCircle2 size="16" />
                                                                {accepting ? 'Accepting...' : 'Accept'}
                                                            </Button>
                                                        </AlertDialog.Trigger>
                                                        <AlertDialog.Content maxWidth="450px">
                                                            <AlertDialog.Title>Accept Complaint</AlertDialog.Title>
                                                            <AlertDialog.Description size="2">
                                                                Are you sure you want to accept this complaint? It will be marked as in progress.
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
                                                                        onClick={handleAcceptComplaint}
                                                                        disabled={accepting}
                                                                    >
                                                                        {accepting ? 'Accepting...' : 'Accept'}
                                                                    </Button>
                                                                </AlertDialog.Action>
                                                            </Flex>
                                                        </AlertDialog.Content>
                                                    </AlertDialog.Root>

                                                    <AlertDialog.Root open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                                                        <AlertDialog.Trigger asChild>
                                                            <Button 
                                                                color="red" 
                                                                variant="soft" 
                                                                size="2"
                                                                disabled={rejecting}
                                                            >
                                                                <XCircle size="16" />
                                                                {rejecting ? 'Rejecting...' : 'Reject'}
                                                            </Button>
                                                        </AlertDialog.Trigger>
                                                        <AlertDialog.Content maxWidth="450px">
                                                            <AlertDialog.Title>Reject Complaint</AlertDialog.Title>
                                                            <AlertDialog.Description size="2">
                                                                Are you sure you want to reject this complaint? This action cannot be undone.
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
                                                                        color="red"
                                                                        onClick={handleRejectComplaint}
                                                                        disabled={rejecting}
                                                                    >
                                                                        {rejecting ? 'Rejecting...' : 'Reject'}
                                                                    </Button>
                                                                </AlertDialog.Action>
                                                            </Flex>
                                                        </AlertDialog.Content>
                                                    </AlertDialog.Root>
                                                </>
                                            )}
                                        </Flex>
                                    </Flex>

                                    <Separator my="1" style={{ width: '100%' }} />

                                    <Flex direction="column" gap="2">
                                        <Text size="3" weight="medium">Description</Text>
                                        <Blockquote size="2" color="indigo" style={{ lineHeight: '1.6' }}>
                                            {complaint.description || 'No description provided'}
                                        </Blockquote>
                                    </Flex>

                                    {Array.isArray(complaint.photos) && complaint.photos.length > 0 && (
                                        <>
                                            <Separator my="1" style={{ width: '100%' }} />
                                            <Flex direction="column" gap="2">
                                                <Text size="3" weight="medium">Photos</Text>
                                                <Flex gap="3" wrap="wrap">
                                                    {complaint.photos.map((photoUrl, index) => (
                                                        <Box
                                                            key={index}
                                                            style={{
                                                                width: '120px',
                                                                height: '120px',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                border: '1px solid #e2e8f0',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => openImageModal(photoUrl)}
                                                        >
                                                            <img
                                                                src={photoUrl}
                                                                alt={`Complaint photo ${index + 1}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </Box>
                                                    ))}
                                                </Flex>
                                            </Flex>
                                        </>
                                    )}

                                </Flex>
                            </Box>
                        </Card>
                    </Box>

                    {/* Sidebar */}
                    <Box style={{ flex: '0 0 300px' }}>
                        <Flex direction="column" gap="4">
                            {/* Student Info */}
                            <Card>
                                <Box style={{ padding: '20px' }}>
                                    <Flex direction="column" gap="3">
                                        <Text size="3" weight="medium" mb="2">Student Information</Text>

                                        <Flex align="start" gap="3">
                                            {studentData?.profile_pic_url ? (
                                                <Box
                                                    style={{
                                                        cursor: 'pointer',
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        width: '48px',
                                                        height: '48px'
                                                    }}
                                                    onClick={() => openImageModal(studentData.profile_pic_url, true)}
                                                >
                                                    <img
                                                        src={studentData.profile_pic_url}
                                                        alt="Student profile"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Avatar
                                                    size="4"
                                                    fallback={complaint.student_name?.charAt(0) || 'S'}
                                                    radius="full"
                                                />
                                            )}

                                            <Flex direction="column" gap="1">
                                                <Text size="3" weight="bold">
                                                    {studentData?.full_name || complaint.student_name || 'Unknown Student'}
                                                </Text>
                                                <Text size="1" color="gray">
                                                    {complaint.student_roll || 'No roll number'}
                                                </Text>
                                            </Flex>
                                        </Flex>

                                        <Flex align="center" gap="4">
                                            <Flex align="center" gap="2">
                                                <MapPin size="14" color="var(--gray-9)" />
                                                <Text size="2">Room {complaint.room_number || 'N/A'}</Text>
                                            </Flex>

                                            <Separator orientation="vertical" />

                                            <Flex align="center" gap="2">

                                                <Text size="2">Hostel - {complaint.hostel_name || 'N/A'}</Text>
                                            </Flex>
                                        </Flex>

                                        {studentData && (
                                            <>
                                                <Separator my="1" style={{ width: '100%' }} />
                                                <Text size="2" weight="medium" mb="2">Contact Information</Text>

                                                <Flex gap="2" align="center" mb="1">
                                                    <IconButton size="1" color="green" variant="soft">
                                                        <Phone size="10" />
                                                    </IconButton>
                                                    <Text size="1">{studentData.mobile_no}</Text>
                                                </Flex>

                                                <Flex gap="2" align="center">
                                                    <IconButton color="red" size="1" variant="soft">
                                                        <Mail size="10" />
                                                    </IconButton>
                                                    <Text size="1">{studentData.email?.toLowerCase()}</Text>
                                                </Flex>
                                            </>
                                        )}

                                        {loadingStudent && (
                                            <Text size="2" color="indigo">Loading contact details...</Text>
                                        )}
                                    </Flex>
                                </Box>
                            </Card>


                            {/* Status History */}
                            <Table.Root variant="surface">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell>
                                            <Flex align="center" gap="2">
                                                <IconButton color="gray" variant="soft" size="1">
                                                    <Clock size="14" />
                                                </IconButton>
                                                <Text size="2" weight="medium" color="gray">Created</Text>
                                            </Flex>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color="gray" variant="soft" size="1">
                                                {formatDate(complaint.created_at)}
                                            </Badge>
                                        </Table.Cell>
                                    </Table.Row>

                                    {complaint.in_progress_at && (
                                        <Table.Row>
                                            <Table.Cell>
                                                <Flex align="center" gap="2">
                                                    <IconButton color="indigo" variant="soft" size="1">
                                                        <Clock size="14" />
                                                    </IconButton>
                                                    <Text size="2" weight="medium" color="indigo">In Progress</Text>
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge color="indigo" variant="soft" size="1">
                                                    {formatDate(complaint.in_progress_at)}
                                                </Badge>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}

                                    {complaint.resolved_at && (
                                        <Table.Row>
                                            <Table.Cell>
                                                <Flex align="center" gap="2">
                                                    <IconButton color="green" variant="soft" size="1">
                                                        <CheckCircle2 size="14" />
                                                    </IconButton>
                                                    <Text size="2" weight="medium" color="green">Resolved</Text>
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge color="green" variant="soft" size="1">
                                                    {formatDate(complaint.resolved_at)}
                                                </Badge>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}

                                    {complaint.rejected_at && (
                                        <Table.Row>
                                            <Table.Cell>
                                                <Flex align="center" gap="2">
                                                    <IconButton color="red" variant="soft" size="1">
                                                        <XCircle size="14" />
                                                    </IconButton>
                                                    <Text size="2" weight="medium" color="red">Rejected</Text>
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge color="red" variant="soft" size="1">
                                                    {formatDate(complaint.rejected_at)}
                                                </Badge>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </Flex>
                    </Box>
                </Flex>
            </Box>
            {/* Image Modal */}
            <ImageModal
                isOpen={!!selectedImage}
                imageUrl={selectedImage}
                isProfileImage={isProfileImage}
                onClose={closeImageModal}
            />

        </Flex>
    );
};

export default ComplaintView;
