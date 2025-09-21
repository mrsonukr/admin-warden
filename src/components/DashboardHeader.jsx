import React from "react";
import { Flex, Text, Badge, Button } from "@radix-ui/themes";
import { Edit } from "lucide-react";

export default function DashboardHeader({ 
  wardenData, 
  hostelEntryTime, 
  onEditTimeClick 
}) {
  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Flex align="center" justify="between" style={{ marginBottom: '20px' }}>
      <Flex align="center" gap="3">
        <Badge color="indigo" size="2" variant="solid">
          Hostel-{wardenData?.hostel || '13B'}
        </Badge>
        <Text size="5" weight="bold" style={{ color: 'var(--gray-12)' }}>
          {getTimeBasedGreeting()}, {wardenData?.name || 'Warden'}
        </Text>
      </Flex>
      <Flex align="center" gap="2">
        <Badge color="green" size="2" variant="soft">
          Hostel Entry Time: {hostelEntryTime.startHour}:{hostelEntryTime.startMinute} {hostelEntryTime.startPeriod} - {hostelEntryTime.endHour}:{hostelEntryTime.endMinute} {hostelEntryTime.endPeriod}
        </Badge>
        <Button variant="soft" size="1" style={{ cursor: 'pointer' }} onClick={onEditTimeClick}>
          <Edit size={14} />
          Edit
        </Button>
      </Flex>
    </Flex>
  );
}
