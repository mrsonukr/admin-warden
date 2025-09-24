import React, { useState } from 'react';
import { Box, Text, Flex, Dialog, Button, TextField, SegmentedControl, DataList, Spinner } from '@radix-ui/themes';
import { Loader2 } from 'lucide-react';
import { addStudent } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const AddStudentDialog = ({ isOpen, onClose, wardenData }) => {
  const { token, wardenData: authWardenData } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [studentData, setStudentData] = useState({
    roll_no: '',
    fullname: '',
    gender: '',
    room_no: ''
  });
  const [selectedGender, setSelectedGender] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    roll_no: '',
    fullname: '',
    gender: '',
    room_no: ''
  });

  const handleStudentInputChange = (field, value) => {
    // Clear validation error when user starts typing
    setValidationErrors(prev => ({
      ...prev,
      [field]: ''
    }));

    // Validation for roll number - only numbers
    if (field === 'roll_no') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setStudentData(prev => ({
        ...prev,
        [field]: numericValue
      }));
      
      // Validate roll number
      if (numericValue && !/^\d+$/.test(numericValue)) {
        setValidationErrors(prev => ({
          ...prev,
          roll_no: 'Roll number must contain only numbers'
        }));
      }
      return;
    }
    
    // Validation for room number - only numbers
    if (field === 'room_no') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setStudentData(prev => ({
        ...prev,
        [field]: numericValue
      }));
      
      // Validate room number
      if (numericValue && !/^\d+$/.test(numericValue)) {
        setValidationErrors(prev => ({
          ...prev,
          room_no: 'Room number must contain only numbers'
        }));
      }
      return;
    }
    
    // Validation for student name - minimum 3 letters
    if (field === 'fullname') {
      setStudentData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Validate name length
      if (value.trim().length > 0 && value.trim().length < 3) {
        setValidationErrors(prev => ({
          ...prev,
          fullname: 'Name must be at least 3 letters long'
        }));
      }
      return;
    }
    
    // For other fields (like gender), allow normal input
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStudent = () => {
    let hasErrors = false;
    const newErrors = {};

    // Validate required fields
    if (!studentData.roll_no) {
      newErrors.roll_no = 'Enter roll number';
      hasErrors = true;
    } else if (!/^\d+$/.test(studentData.roll_no)) {
      newErrors.roll_no = 'Roll number must contain only numbers';
      hasErrors = true;
    }

    if (!studentData.fullname) {
      newErrors.fullname = 'Enter full name';
      hasErrors = true;
    } else if (studentData.fullname.trim().length < 3) {
      newErrors.fullname = 'Name must be at least 3 letters long';
      hasErrors = true;
    }

    if (!studentData.room_no) {
      newErrors.room_no = 'Enter room number';
      hasErrors = true;
    } else if (!/^\d+$/.test(studentData.room_no)) {
      newErrors.room_no = 'Room number must contain only numbers';
      hasErrors = true;
    }

    if (!studentData.gender) {
      newErrors.gender = 'Please select gender';
      hasErrors = true;
    }

    // Update validation errors
    setValidationErrors(newErrors);

    // If no errors, show confirmation dialog
    if (!hasErrors) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmAddStudent = async () => {
    setIsAddingStudent(true);

    try {
      // Get warden ID from context
      const currentWardenData = wardenData || authWardenData;
      const wardenId = currentWardenData?.id || currentWardenData?.warden_id;
      
      if (!wardenId) {
        showError('Error', 'Warden ID not found. Please refresh and try again.');
        setIsAddingStudent(false);
        return;
      }

      // Prepare student data for API
      const studentPayload = {
        roll_no: studentData.roll_no,
        fullname: studentData.fullname,
        gender: studentData.gender.toLowerCase(),
        added_by: wardenId,
        hostel: currentWardenData?.hostel || '16B',
        room_no: parseInt(studentData.room_no)
      };
      
      console.log('Adding student:', studentPayload);
      
      // Make API call and ensure minimum 1 second delay
      const [result] = await Promise.all([
        addStudent(studentPayload, token),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      
      if (result.success || result.message) {
        // Reset form and close dialogs
        resetForm();
        setShowConfirmDialog(false);
        onClose(); // Close the main dialog
        
        console.log('Student added successfully:', result);
        showSuccess('Success', 'Student added successfully!');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      showError('Error', `Failed to add student: ${error.message || 'Please try again.'}`);
    } finally {
      setIsAddingStudent(false);
    }
  };

  const resetForm = () => {
    setStudentData({
      roll_no: '',
      fullname: '',
      gender: '',
      room_no: ''
    });
    setSelectedGender('');
    setValidationErrors({
      roll_no: '',
      fullname: '',
      gender: '',
      room_no: ''
    });
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  const handleCancelAddStudent = () => {
    resetForm();
    onClose();
  };

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      {/* Add Student Dialog */}
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={() => {}}>
          <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Add New Student</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Enter the student details below to add them to Hostel-{wardenData?.hostel || '13B'}.
            </Dialog.Description>

            <Flex direction="column" gap="3">
              <Box>
                <Flex justify="between" align="center" mb="1">
                  <Text as="label" size="2" weight="bold" style={{ display: 'block' }}>
                    Roll Number *
                  </Text>
                  {validationErrors.roll_no && (
                    <Text size="1" color="red" style={{ fontWeight: '500' }}>
                      {validationErrors.roll_no}
                    </Text>
                  )}
                </Flex>
                <TextField.Root
                  placeholder="Enter roll number"
                  value={studentData.roll_no}
                  onChange={(e) => handleStudentInputChange('roll_no', e.target.value)}
                />
              </Box>

              <Box>
                <Flex justify="between" align="center" mb="1">
                  <Text as="label" size="2" weight="bold" style={{ display: 'block' }}>
                    Student Name *
                  </Text>
                  {validationErrors.fullname && (
                    <Text size="1" color="red" style={{ fontWeight: '500' }}>
                      {validationErrors.fullname}
                    </Text>
                  )}
                </Flex>
                <TextField.Root
                  placeholder="Enter student name"
                  value={studentData.fullname}
                  onChange={(e) => handleStudentInputChange('fullname', e.target.value)}
                />
              </Box>

              <Box>
                <Flex justify="between" align="center" mb="1">
                  <Text as="label" size="2" weight="bold" style={{ display: 'block' }}>
                    Gender *
                  </Text>
                  {validationErrors.gender && (
                    <Text size="1" color="red" style={{ fontWeight: '500' }}>
                      {validationErrors.gender}
                    </Text>
                  )}
                </Flex>
                <SegmentedControl.Root
                  value={selectedGender}
                  onValueChange={(value) => {
                    setSelectedGender(value);
                    handleStudentInputChange('gender', value);
                  }}
                  radius="medium"
                  style={{ cursor: 'pointer' }}
                >
                  <SegmentedControl.Item value="male" style={{ cursor: 'pointer' }}>Male</SegmentedControl.Item>
                  <SegmentedControl.Item value="female" style={{ cursor: 'pointer' }}>Female</SegmentedControl.Item>
                  <SegmentedControl.Item value="other" style={{ cursor: 'pointer' }}>Other</SegmentedControl.Item>
                </SegmentedControl.Root>
              </Box>

              <Box>
                <Flex justify="between" align="center" mb="1">
                  <Text as="label" size="2" weight="bold" style={{ display: 'block' }}>
                    Room Number *
                  </Text>
                  {validationErrors.room_no && (
                    <Text size="1" color="red" style={{ fontWeight: '500' }}>
                      {validationErrors.room_no}
                    </Text>
                  )}
                </Flex>
                <TextField.Root
                  placeholder="Enter room number"
                  value={studentData.room_no}
                  onChange={(e) => handleStudentInputChange('room_no', e.target.value)}
                />
              </Box>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" style={{ cursor: 'pointer' }} onClick={handleCancelAddStudent}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button 
                onClick={handleAddStudent} 
                style={{ cursor: 'pointer' }}
                disabled={isAddingStudent}
                color="indigo"
              >
                Continue
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Dialog.Root open={showConfirmDialog} onOpenChange={() => {}}>
          <Dialog.Content style={{ maxWidth: 500 }}>
            <Dialog.Title>Confirm Student Details</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Please review the student information before adding to Hostel-{(wardenData || authWardenData)?.hostel || '16B'}.
            </Dialog.Description>

            <DataList.Root>
              <DataList.Item>
                <DataList.Label minWidth="88px">Roll Number</DataList.Label>
                <DataList.Value>
                  <Text weight="bold">{studentData.roll_no}</Text>
                </DataList.Value>
              </DataList.Item>

              <DataList.Item>
                <DataList.Label minWidth="88px">Full Name</DataList.Label>
                <DataList.Value>
                  <Text weight="bold">{studentData.fullname}</Text>
                </DataList.Value>
              </DataList.Item>

              <DataList.Item>
                <DataList.Label minWidth="88px">Gender</DataList.Label>
                <DataList.Value>
                  <Text weight="bold" style={{ textTransform: 'capitalize' }}>{studentData.gender}</Text>
                </DataList.Value>
              </DataList.Item>

              <DataList.Item>
                <DataList.Label minWidth="88px">Room Number</DataList.Label>
                <DataList.Value>
                  <Text weight="bold">{studentData.room_no}</Text>
                </DataList.Value>
              </DataList.Item>
            </DataList.Root>

            <Flex gap="3" mt="4" justify="end">
              <Button variant="soft" color="gray" style={{ cursor: 'pointer' }} onClick={handleCancelConfirm}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAddStudent} 
                style={{ cursor: 'pointer' }}
                disabled={isAddingStudent}
                color="green"
              >
                {isAddingStudent ? (
                  <Flex align="center" gap="2">
                    <Loader2 size={16} className="animate-spin" />
                    Adding Student...
                  </Flex>
                ) : (
                  'Confirm & Add Student'
                )}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  );
};

export default AddStudentDialog;
