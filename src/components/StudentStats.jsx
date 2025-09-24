import React, { useState } from 'react';
import { Box, Text, Flex, Card, Badge, Skeleton } from '@radix-ui/themes';
import { Users, UserCheck, UserX, UserPlus, Megaphone, Clock, Calendar, UserCog } from 'lucide-react';
import BannerManagement from './BannerManagement';
import AddStudentDialog from './AddStudentDialog';

const StudentStats = ({ stats, isLoading, wardenData }) => {
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);

  const handleAddStudentClick = () => {
    setIsAddStudentDialogOpen(true);
  };

  const handleCloseAddStudentDialog = () => {
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
      <AddStudentDialog 
        isOpen={isAddStudentDialogOpen} 
        onClose={handleCloseAddStudentDialog}
        wardenData={wardenData}
      />

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
