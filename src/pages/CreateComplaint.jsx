import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import {
    Box,
    Text,
    Flex,
    Card,
    Button,
    TextField,
    TextArea,
    Select,
    Badge,
    IconButton,
    Spinner,
    AlertDialog
} from "@radix-ui/themes";
import { Upload, X, Plus, Search, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateComplaint = () => {
    const { user, wardenData } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        const savedCollapsed = localStorage.getItem('sidebarCollapsed');
        return savedCollapsed === 'true';
    });

    const [formData, setFormData] = useState({
        student_roll: '',
        student_name: '',
        category: '',
        subcategory: '',
        description: '',
        room_number: '',
        photos: []
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingStudent, setIsLoadingStudent] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const [hostelMismatch, setHostelMismatch] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const fileInputRef = React.useRef(null);

    const categories = {
        "Electricity Issues": [
            "Fan (not working/faulty)",
            "Tubelight problems",
            "Plug or switch defects",
            "Short circuit/burning smell",
            "Power outage in room",
            "Other electricity-related issues"
        ],
        "Plumbing Concerns": [
            "Water leakage",
            "Non-functional flush",
            "Lack of water supply",
            "Other plumbing issues"
        ],
        "Cleaning Services": [
            "Room and washroom cleaning",
            "Other cleaning needs"
        ],
        "Room & Facilities Requests": [
            "Request for a table",
            "Request for a chair",
            "Request for a bed",
            "Request for an almirah",
            "Internet not working",
            "Other room & facilities issues"
        ]
    };

    const fetchStudentData = async (rollNumber) => {
        // Only proceed if roll number is 7-11 digits and contains only numbers
        if (!rollNumber || !/^\d{7,11}$/.test(rollNumber)) {
            // Clear student data if invalid format
            if (rollNumber && !/^\d{7,11}$/.test(rollNumber)) {
                setStudentData(null);
                setFormData(prev => ({
                    ...prev,
                    student_name: '',
                    room_number: ''
                }));
            }
            return;
        }

        setIsLoadingStudent(true);
        setHostelMismatch(false);

        try {
            const response = await fetch(`https://hostelapis.mssonutech.workers.dev/api/student/${rollNumber}`);
            const data = await response.json();

            if (data.success && data.student) {
                const student = data.student;
                setStudentData(student);

                // Check for hostel mismatch
                const wardenHostel = wardenData?.hostel;
                const studentHostel = student.hostel_no;

                if (wardenHostel && studentHostel && wardenHostel !== studentHostel) {
                    setHostelMismatch(true);
                } else {
                    setHostelMismatch(false);
                }

                // Auto-fill form data
                setFormData(prev => ({
                    ...prev,
                    student_name: student.full_name,
                    room_number: student.room_no
                }));
            } else {
                setStudentData(null);
                setHostelMismatch(false);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            setStudentData(null);
            setHostelMismatch(false);
        } finally {
            setIsLoadingStudent(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Reset subcategory when category changes
        if (field === 'category') {
            setFormData(prev => ({
                ...prev,
                subcategory: ''
            }));
        }

        // Fetch student data when roll number changes
        if (field === 'student_roll') {
            fetchStudentData(value);
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map(file => ({
            file,
            id: Date.now() + Math.random(),
            preview: URL.createObjectURL(file)
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (fileId) => {
        setSelectedFiles(prev => {
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== fileId);
        });
    };

    const compressImageToWebP = (file, maxSizeKB = 100) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions to maintain aspect ratio
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to WebP with quality adjustment
                let quality = 0.8;
                const tryCompress = () => {
                    canvas.toBlob((blob) => {
                        if (blob && blob.size <= maxSizeKB * 1024) {
                            resolve(blob);
                        } else if (quality > 0.1) {
                            quality -= 0.1;
                            tryCompress();
                        } else {
                            resolve(blob);
                        }
                    }, 'image/webp', quality);
                };
                
                tryCompress();
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const uploadImage = async (file) => {
        try {
            // Compress image to 100KB WebP
            const compressedBlob = await compressImageToWebP(file, 100);
            
            const formData = new FormData();
            formData.append('image', compressedBlob);
            
            const response = await fetch('https://hostel.mssonutech.workers.dev/', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.urls[0];
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirmDialog(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmDialog(false);
        setIsSubmitting(true);

        try {
            // Upload photos if any
            let photoUrls = [];
            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => uploadImage(file.file));
                photoUrls = await Promise.all(uploadPromises);
            }

            const complaintData = {
                student_roll: formData.student_roll,
                student_name: formData.student_name,
                category: formData.category,
                subcategory: formData.subcategory,
                description: formData.description,
                photos: photoUrls,
                room_number: formData.room_number,
                hostel_name: studentData?.hostel_no || wardenData?.hostel || 'Unknown Hostel',
                warden_id: wardenData?.id || wardenData?.warden_id,
                status: 'pending'
            };

            console.log('Submitting complaint:', complaintData);

            // Make the API call
            const response = await fetch('https://risecomplaint.mssonutech.workers.dev/api/complaints', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(complaintData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit complaint');
            }

            const result = await response.json();
            console.log('Complaint submitted successfully:', result);
            
            setShowSuccessDialog(true);
        } catch (error) {
            console.error('Error submitting complaint:', error);
            // Remove alert and show error in console only
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessDialog(false);
        navigate('/complaints');
    };

    return (
        <Flex style={{ minHeight: '100vh' }}>
            <Sidebar onCollapseChange={setIsSidebarCollapsed} />

            <Box style={{
                flex: 1,
                padding: '24px',
                marginLeft: isSidebarCollapsed ? '64px' : '240px',
                minHeight: '100vh',
                backgroundColor: 'var(--color-background)',
                transition: 'margin-left 0.3s ease',
                width: isSidebarCollapsed ? 'calc(100vw - 64px)' : 'calc(100vw - 240px)'
            }}>
                {/* Header */}
                <Flex align="center" gap="4" mb="6">
                    <Text size="6" weight="bold">Create Complaint</Text>
                </Flex>

                <Box style={{ width: '100%' }}>
                    <Card>
                            <Box style={{ padding: '32px' }}>
                                <form onSubmit={handleSubmit}>
                                    <Flex direction="column" gap="6">
                                        {/* Student Information */}
                                        <Box>
                                            <Flex gap="4" wrap="wrap">
                                                <Box style={{ flex: '1 1 300px' }}>
                                                    <Text size="2" weight="medium" mb="2">Student Roll Number *</Text>
                                                    <TextField.Root
                                                        value={formData.student_roll}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Only allow numbers
                                                            if (/^\d*$/.test(value)) {
                                                                handleInputChange('student_roll', value);
                                                            }
                                                        }}
                                                        placeholder="Enter roll number"
                                                        required
                                                    >
                                                        <TextField.Slot>
                                                            <Search size="16" />
                                                        </TextField.Slot>
                                                        <TextField.Slot>
                                                            {isLoadingStudent && <Spinner size="1" />}
                                                        </TextField.Slot>
                                                    </TextField.Root>
                                                </Box>
                                                <Box style={{ flex: '1 1 300px' }}>
                                                    <Text size="2" weight="medium" mb="2">Student Name *</Text>
                                                    <TextField.Root
                                                        value={formData.student_name}
                                                        placeholder="Enter roll number to auto-fill"
                                                        disabled
                                                        style={{ backgroundColor: 'var(--gray-2)' }}
                                                    />
                                                </Box>
                                            </Flex>
                                        </Box>

                                        {/* Hostel Mismatch Warning */}
                                        {hostelMismatch && (
                                            <Box style={{
                                                padding: '12px',
                                                backgroundColor: 'var(--red-3)',
                                                border: '1px solid var(--red-6)',
                                                borderRadius: '8px'
                                            }}>
                                                <Text size="2" weight="medium" style={{ color: 'var(--red-11)' }}>
                                                    ⚠️ Hostel Mismatch: Student belongs to Hostel {studentData?.hostel_no} but you are warden of Hostel {wardenData?.hostel}
                                                </Text>
                                            </Box>
                                        )}

                                        {/* Room Information */}
                                        <Flex gap="4" wrap="wrap">
                                            <Box style={{ flex: '1 1 300px' }}>
                                                <Text size="2" weight="medium" mb="2">Room Number *</Text>
                                                <TextField.Root
                                                    value={formData.room_number}
                                                    placeholder="Enter roll number to auto-fill"
                                                    disabled
                                                    style={{ backgroundColor: 'var(--gray-2)' }}
                                                />
                                            </Box>
                                            <Box style={{ flex: '1 1 300px' }}>
                                                <Text size="2" weight="medium" mb="2">Hostel *</Text>
                                                <TextField.Root
                                                    value={studentData?.hostel_no || ''}
                                                    placeholder="Enter roll number to auto-fill"
                                                    disabled
                                                    style={{ backgroundColor: 'var(--gray-2)' }}
                                                />
                                            </Box>
                                        </Flex>

                                        {/* Category Selection */}
                                        <Flex gap="4" wrap="wrap">
                                            {/* Category */}
                                            <Box style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
                                                <Text size="2" weight="medium" style={{ marginBottom: "6px" }}>
                                                    Category *
                                                </Text>
                                                <Select.Root
                                                    value={formData.category}
                                                    onValueChange={(value) => handleInputChange("category", value)}
                                                >
                                                    <Select.Trigger placeholder="Select category" />
                                                    <Select.Content>
                                                        {Object.keys(categories).map((category) => (
                                                            <Select.Item key={category} value={category}>
                                                                {category}
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Root>
                                            </Box>

                                            {/* Subcategory */}
                                            <Box style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
                                                <Text size="2" weight="medium" style={{ marginBottom: "6px" }}>
                                                    Subcategory *
                                                </Text>
                                                <Select.Root
                                                    value={formData.subcategory}
                                                    onValueChange={(value) => handleInputChange("subcategory", value)}
                                                    disabled={!formData.category}
                                                >
                                                    <Select.Trigger placeholder="Select subcategory" />
                                                    <Select.Content>
                                                        {formData.category &&
                                                            categories[formData.category]?.map((subcategory) => (
                                                                <Select.Item key={subcategory} value={subcategory}>
                                                                    {subcategory}
                                                                </Select.Item>
                                                            ))}
                                                    </Select.Content>
                                                </Select.Root>
                                            </Box>
                                        </Flex>


                                        {/* Description */}
                                        <Box>
                                            <Text size="2" weight="medium" mb="2">Issue Description *</Text>
                                            <TextArea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                placeholder="Describe the issue in detail..."
                                                required
                                            />
                                        </Box>

                                        {/* Photo Upload */}
                                        <Box>
                                            <Text size="2" weight="medium" mb="2">Upload photos (optional)</Text>

                                            <Flex direction="column" gap="3">
                                                <Button
                                                    type="button"
                                                    variant="soft"
                                                    color="gray"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    style={{ alignSelf: 'flex-start' }}
                                                >
                                                    <Upload size="16" />
                                                    Add Photos
                                                </Button>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    style={{ display: 'none' }}
                                                />

                                                {selectedFiles.length > 0 && (
                                                    <Flex wrap="wrap" gap="3" mt="2">
                                                        {selectedFiles.map(file => (
                                                            <Box
                                                                key={file.id}
                                                                style={{
                                                                    position: 'relative',
                                                                    width: '100px',
                                                                    height: '100px',
                                                                    borderRadius: '8px',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid var(--gray-6)'
                                                                }}
                                                            >
                                                                <img
                                                                    src={file.preview}
                                                                    alt="Preview"
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    size="1"
                                                                    color="red"
                                                                    variant="solid"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '4px',
                                                                        right: '4px',
                                                                        width: '20px',
                                                                        height: '20px'
                                                                    }}
                                                                    onClick={() => removeFile(file.id)}
                                                                >
                                                                    <X size="12" />
                                                                </IconButton>
                                                            </Box>
                                                        ))}
                                                    </Flex>
                                                )}
                                            </Flex>
                                        </Box>

                                        {/* Submit Button */}
                                        <Flex justify="end" gap="3">
                                            <Button
                                                type="button"
                                                variant="soft"
                                                color="gray"
                                                onClick={() => navigate('/complaints')}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </form>
                            </Box>
                    </Card>
                </Box>
            </Box>

            {/* Confirmation Dialog */}
            <AlertDialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialog.Content maxWidth="450px">
                    <AlertDialog.Title>Confirm Complaint Submission</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Are you sure you want to submit this complaint? This action cannot be undone.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button 
                                variant="soft" 
                                color="gray"
                                style={{ cursor: 'pointer' }}
                            >
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button 
                                variant="solid" 
                                color="indigo"
                                onClick={confirmSubmit}
                                disabled={isSubmitting}
                                style={{ cursor: 'pointer' }}
                            >
                                {isSubmitting ? (
                                    <Flex align="center" gap="2">
                                        <Spinner size="1" />
                                        Submitting...
                                    </Flex>
                                ) : (
                                    'Confirm'
                                )}
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>

            {/* Success Dialog */}
            <AlertDialog.Root open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialog.Content maxWidth="450px">
                    <AlertDialog.Title>Complaint Submitted Successfully!</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Your complaint has been submitted and will be reviewed by the warden.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Action>
                            <Button 
                                variant="solid" 
                                color="green"
                                onClick={handleSuccessClose}
                            >
                                View Complaints
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Flex>
    );
};

export default CreateComplaint;
