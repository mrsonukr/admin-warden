import React, { useState } from 'react';
import { Box, Text, Flex, Card, Badge, Skeleton, Dialog, Button, TextField, SegmentedControl, Select } from '@radix-ui/themes';
import { Users, UserCheck, UserX, UserPlus, Loader2, Megaphone, Clock, Calendar, UserCog } from 'lucide-react';
import BannerManagement from './BannerManagement';

const StudentStats = ({ stats, isLoading, wardenData }) => {
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentData, setStudentData] = useState({
    rollNumber: '',
    name: '',
    gender: '',
    department: '',
    roomNumber: ''
  });
  const [selectedGender, setSelectedGender] = useState('');
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);

  const handleAddStudentClick = () => {
    setStudentData({
      rollNumber: '',
      name: '',
      gender: '',
      department: '',
      roomNumber: ''
    });
    setSelectedGender('');
    setIsAddStudentDialogOpen(true);
  };

  const handleStudentInputChange = (field, value) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStudent = async () => {
    setIsAddingStudent(true);
    
    // Validate required fields
    if (!studentData.rollNumber || !studentData.name || !studentData.gender || !studentData.department || !studentData.roomNumber) {
      alert('Please fill in all required fields');
      setIsAddingStudent(false);
      return;
    }

    try {
      // Here you would typically make an API call to add the student
      console.log('Adding student:', studentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close dialog
      setStudentData({
        rollNumber: '',
        name: '',
        gender: '',
        department: '',
        roomNumber: ''
      });
      setSelectedGender('');
      setIsAddStudentDialogOpen(false);
      
      // You might want to refresh the stats here
      console.log('Student added successfully');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please try again.');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleCancelAddStudent = () => {
    setStudentData({
      rollNumber: '',
      name: '',
      gender: '',
      department: '',
      roomNumber: ''
    });
    setSelectedGender('');
    setIsAddStudentDialogOpen(false);
  };

  const handleBannerClick = () => {
    setIsBannerDialogOpen(true);
  };

  const handleCloseBannerDialog = () => {
    setIsBannerDialogOpen(false);
  };
  if (isLoading) {
    return (
      <Box style={{ marginBottom: '20px' }}>
        {/* All Cards in One Row - Skeleton */}
        <Flex gap="4" wrap="nowrap" style={{ overflowX: 'auto' }}>
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              variant="surface"
              style={{
                flex: '1',
                minWidth: '180px',
                padding: '20px',
              }}
            >
              <Flex align="center" gap="3">
                <Box
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--gray-3)',
                    position: 'relative',
                    width: '48px',
                    height: '48px',
                  }}
                />
                <Box>
                  <Skeleton style={{ width: '80px', height: '16px' }} />
                </Box>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box style={{ marginBottom: '20px' }}>
        <Card style={{ padding: '20px', textAlign: 'center' }}>
          <Text size="3" color="red">
            Failed to load student statistics
          </Text>
        </Card>
      </Box>
    );
  }

  // Use passed stats data
  const statsData = stats || {
    total_students: 0,
    registered: 0,
    unregistered: 0,
    active_students: 0,
    graduated: 0,
    new_admissions: 0
  };

  const statCards = [
    {
      title: 'Total Students',
      value: statsData.total_students,
      icon: <Users size={24} />,
      color: 'indigo',
    },
    {
      title: 'Registered',
      value: statsData.registered,
      icon: <UserCheck size={24} />,
      color: 'green',
    },
    {
      title: 'Unregistered',
      value: statsData.unregistered,
      icon: <UserX size={24} />,
      color: 'red',
    },
    {
      title: 'Add New Student',
      value: '+',
      icon: <UserPlus size={24} />,
      color: 'blue',
      isAction: true,
    },
  ];

  const actionCards = [
    {
      title: 'Manage Banner',
      value: '',
      icon: <Megaphone size={24} />,
      color: 'purple',
      isAction: true,
    },
    {
      title: 'Update Mess Time',
      value: '',
      icon: <Clock size={24} />,
      color: 'orange',
      isAction: true,
    },
    {
      title: 'Update Attendance Time',
      value: '',
      icon: <Calendar size={24} />,
      color: 'teal',
      isAction: true,
    },
    {
      title: 'Manage Caretaker',
      value: '',
      icon: <UserCog size={24} />,
      color: 'cyan',
      isAction: true,
    },
  ];

  return (
    <Box style={{ marginBottom: '20px' }}>
      {/* Statistics Cards Row */}
      <Flex gap="4" wrap="nowrap" style={{ overflowX: 'auto', marginBottom: '16px' }}>
        {statCards.map((stat, index) => (
          <Card
            key={index}
            variant="surface"
            style={{
              flex: '1',
              minWidth: '180px',
              padding: '20px',
              cursor: stat.isAction ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (stat.isAction && stat.title === 'Add New Student') {
                handleAddStudentClick();
              }
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: `var(--${stat.color}-3)`,
                  color: `var(--${stat.color}-11)`,
                  position: 'relative',
                }}
              >
                {stat.icon}
                {!stat.isAction && (
                  <Badge
                    variant="solid"
                    color={stat.color}
                    size="1"
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {stat.value}
                  </Badge>
                )}
              </Box>
              <Box>
                <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                  {stat.title}
                </Text>
              </Box>
            </Flex>
          </Card>
        ))}
      </Flex>

      {/* Action Cards Row */}
      <Flex gap="4" wrap="nowrap" style={{ overflowX: 'auto' }}>
        {actionCards.map((stat, index) => (
          <Card
            key={index}
            variant="surface"
            style={{
              flex: '1',
              minWidth: '180px',
              padding: '20px',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (stat.title === 'Add New Student') {
                handleAddStudentClick();
              } else if (stat.title === 'Manage Banner') {
                handleBannerClick();
              } else if (stat.title === 'Update Mess Time') {
                // Handle mess time update click
                console.log('Update Mess Time clicked');
              } else if (stat.title === 'Update Attendance Time') {
                // Handle attendance time update click
                console.log('Update Attendance Time clicked');
              } else if (stat.title === 'Manage Caretaker') {
                // Handle caretaker management click
                console.log('Manage Caretaker clicked');
              }
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: `var(--${stat.color}-3)`,
                  color: `var(--${stat.color}-11)`,
                  position: 'relative',
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                  {stat.title}
                </Text>
              </Box>
            </Flex>
          </Card>
        ))}
      </Flex>

      {/* Add Student Dialog */}
      {isAddStudentDialogOpen && (
         <Dialog.Root open={isAddStudentDialogOpen} onOpenChange={() => {}}>
          <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Add New Student</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Enter the student details below to add them to Hostel-{wardenData?.hostel || '13B'}.
            </Dialog.Description>

            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                  Roll Number *
                </Text>
                <TextField.Root
                  placeholder="Enter roll number"
                  value={studentData.rollNumber}
                  onChange={(e) => handleStudentInputChange('rollNumber', e.target.value)}
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                  Student Name *
                </Text>
                <TextField.Root
                  placeholder="Enter student name"
                  value={studentData.name}
                  onChange={(e) => handleStudentInputChange('name', e.target.value)}
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                  Gender *
                </Text>
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
                 <Text as="label" size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                   Department *
                 </Text>
                 <Select.Root
                   value={studentData.department}
                   onValueChange={(value) => handleStudentInputChange('department', value)}
                 >
                   <Select.Trigger placeholder="Select department" style={{ width: '100%' }} />
                   <Select.Content>
                     <Select.Item value="B.Tech Computer Science Engineering">B.Tech Computer Science Engineering</Select.Item>
                     <Select.Item value="B.Tech Civil Engineering">B.Tech Civil Engineering</Select.Item>
                     <Select.Item value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</Select.Item>
                     <Select.Item value="B.Tech Electronics & Communication Engineering">B.Tech Electronics & Communication Engineering</Select.Item>
                     <Select.Item value="B.Tech Electrical & Electronics Engineering">B.Tech Electrical & Electronics Engineering</Select.Item>
                     <Select.Item value="B.Tech Information Technology">B.Tech Information Technology</Select.Item>
                     <Select.Item value="B.Tech Chemical Engineering">B.Tech Chemical Engineering</Select.Item>
                     <Select.Item value="B.Tech Aerospace Engineering">B.Tech Aerospace Engineering</Select.Item>
                     <Select.Item value="B.Tech Biotechnology">B.Tech Biotechnology</Select.Item>
                     <Select.Item value="B.Tech Data Science">B.Tech Data Science</Select.Item>
                     <Select.Item value="B.Tech Artificial Intelligence">B.Tech Artificial Intelligence</Select.Item>
                     <Select.Item value="B.Tech Cyber Security">B.Tech Cyber Security</Select.Item>
                     <Select.Item value="BBA (Bachelor of Business Administration)">BBA (Bachelor of Business Administration)</Select.Item>
                     <Select.Item value="B.Com (Bachelor of Commerce)">B.Com (Bachelor of Commerce)</Select.Item>
                     <Select.Item value="B.A (Bachelor of Arts)">B.A (Bachelor of Arts)</Select.Item>
                     <Select.Item value="B.Sc (Bachelor of Science)">B.Sc (Bachelor of Science)</Select.Item>
                     <Select.Item value="MBA (Master of Business Administration)">MBA (Master of Business Administration)</Select.Item>
                     <Select.Item value="M.Tech Computer Science">M.Tech Computer Science</Select.Item>
                     <Select.Item value="M.Sc Data Science">M.Sc Data Science</Select.Item>
                     <Select.Item value="Other">Other</Select.Item>
                   </Select.Content>
                 </Select.Root>
               </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="1" style={{ display: 'block' }}>
                  Room Number *
                </Text>
                <TextField.Root
                  placeholder="Enter room number"
                  value={studentData.roomNumber}
                  onChange={(e) => handleStudentInputChange('roomNumber', e.target.value)}
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
                {isAddingStudent ? (
                  <Flex align="center" gap="2">
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </Flex>
                ) : (
                  'Add Student'
                )}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}

      {/* Banner Management Dialog */}
      <BannerManagement 
        isOpen={isBannerDialogOpen} 
        onClose={handleCloseBannerDialog}
        wardenData={wardenData}
      />
    </Box>
  );
};

export default StudentStats;
