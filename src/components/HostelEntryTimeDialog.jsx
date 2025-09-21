import React from 'react';
import { Dialog, Button, Text, Flex, Box, Select } from '@radix-ui/themes';

const HostelEntryTimeDialog = ({ 
  isOpen, 
  onClose, 
  hostelEntryTime, 
  onTimeChange, 
  onSave, 
  onCancel,
  wardenData 
}) => {
  // Generate time options
  const generateTimeOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];
    const periods = ['AM', 'PM'];
    
    return { hours, minutes, periods };
  };

  const { hours, minutes, periods } = generateTimeOptions();

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => {}}>
      <Dialog.Content style={{ maxWidth: 400 }}>
        <Dialog.Title>Edit Hostel Entry Time</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Set the hostel entry time for Hostel-{wardenData?.hostel || '13B'}.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {/* Opening Time */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
              Opening Time
            </Text>
            <Flex gap="2" align="center" style={{ width: '100%' }}>
              <Select.Root
                value={hostelEntryTime.startHour}
                onValueChange={(value) => onTimeChange('startHour', value)}
              >
                <Select.Trigger placeholder="Hour" style={{ flex: 1 }} />
                <Select.Content>
                  {hours.map(hour => (
                    <Select.Item key={hour} value={hour}>{hour}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Text size="2">:</Text>
              
              <Select.Root
                value={hostelEntryTime.startMinute}
                onValueChange={(value) => onTimeChange('startMinute', value)}
              >
                <Select.Trigger placeholder="Min" style={{ flex: 1 }} />
                <Select.Content>
                  {minutes.map(minute => (
                    <Select.Item key={minute} value={minute}>{minute}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Select.Root
                value={hostelEntryTime.startPeriod}
                onValueChange={(value) => onTimeChange('startPeriod', value)}
              >
                <Select.Trigger placeholder="AM/PM" style={{ flex: 1 }} />
                <Select.Content>
                  {periods.map(period => (
                    <Select.Item key={period} value={period}>{period}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Box>

          {/* Closing Time */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
              Closing Time
            </Text>
            <Flex gap="2" align="center" style={{ width: '100%' }}>
              <Select.Root
                value={hostelEntryTime.endHour}
                onValueChange={(value) => onTimeChange('endHour', value)}
              >
                <Select.Trigger placeholder="Hour" style={{ flex: 1 }} />
                <Select.Content>
                  {hours.map(hour => (
                    <Select.Item key={hour} value={hour}>{hour}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Text size="2">:</Text>
              
              <Select.Root
                value={hostelEntryTime.endMinute}
                onValueChange={(value) => onTimeChange('endMinute', value)}
              >
                <Select.Trigger placeholder="Min" style={{ flex: 1 }} />
                <Select.Content>
                  {minutes.map(minute => (
                    <Select.Item key={minute} value={minute}>{minute}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Select.Root
                value={hostelEntryTime.endPeriod}
                onValueChange={(value) => onTimeChange('endPeriod', value)}
              >
                <Select.Trigger placeholder="AM/PM" style={{ flex: 1 }} />
                <Select.Content>
                  {periods.map(period => (
                    <Select.Item key={period} value={period}>{period}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Box>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ cursor: 'pointer' }} onClick={onCancel}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button 
            onClick={onSave} 
            style={{ cursor: 'pointer' }}
            color="green"
          >
            Save Changes
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default HostelEntryTimeDialog;
