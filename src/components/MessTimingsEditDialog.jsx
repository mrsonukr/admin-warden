import React from "react";
import { Dialog, Box, Text, Flex, Button, Select } from "@radix-ui/themes";

export default function MessTimingsEditDialog({
  isOpen,
  onClose,
  messTimings,
  onMessTimeChange,
  onSave,
  onCancel,
  wardenData
}) {
  // Generate time options for mess timings
  const generateMessTimeOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];
    const periods = ['AM', 'PM'];
    
    return { hours, minutes, periods };
  };

  const { hours: messHours, minutes: messMinutes, periods: messPeriods } = generateMessTimeOptions();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>Edit Mess Timings</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Set the meal timings for Hostel-{wardenData?.hostel || '13B'}.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {messTimings.map((timing, index) => (
            <Box key={index} style={{ padding: '16px', border: '1px solid var(--gray-6)', borderRadius: '8px' }}>
              <Flex gap="3" align="center">
                <Box style={{ flex: 1 }}>
                  <Text size="3" weight="bold" style={{ color: 'var(--gray-12)' }}>
                    {timing.meal}
                  </Text>
                </Box>
                
                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Start Time
                  </Text>
                  <Flex gap="1" align="center" style={{ width: '100%' }}>
                    <Select.Root
                      value={timing.startHour}
                      onValueChange={(value) => onMessTimeChange(index, 'startHour', value)}
                    >
                      <Select.Trigger placeholder="Hour" style={{ flex: 1 }} />
                      <Select.Content>
                        {messHours.map(hour => (
                          <Select.Item key={hour} value={hour}>{hour}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    
                    <Text size="2">:</Text>
                    
                    <Select.Root
                      value={timing.startMinute}
                      onValueChange={(value) => onMessTimeChange(index, 'startMinute', value)}
                    >
                      <Select.Trigger placeholder="Min" style={{ flex: 1 }} />
                      <Select.Content>
                        {messMinutes.map(minute => (
                          <Select.Item key={minute} value={minute}>{minute}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    
                    <Select.Root
                      value={timing.startPeriod}
                      onValueChange={(value) => onMessTimeChange(index, 'startPeriod', value)}
                    >
                      <Select.Trigger placeholder="AM/PM" style={{ flex: 1 }} />
                      <Select.Content>
                        {messPeriods.map(period => (
                          <Select.Item key={period} value={period}>{period}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                </Box>
                
                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    End Time
                  </Text>
                  <Flex gap="1" align="center" style={{ width: '100%' }}>
                    <Select.Root
                      value={timing.endHour}
                      onValueChange={(value) => onMessTimeChange(index, 'endHour', value)}
                    >
                      <Select.Trigger placeholder="Hour" style={{ flex: 1 }} />
                      <Select.Content>
                        {messHours.map(hour => (
                          <Select.Item key={hour} value={hour}>{hour}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    
                    <Text size="2">:</Text>
                    
                    <Select.Root
                      value={timing.endMinute}
                      onValueChange={(value) => onMessTimeChange(index, 'endMinute', value)}
                    >
                      <Select.Trigger placeholder="Min" style={{ flex: 1 }} />
                      <Select.Content>
                        {messMinutes.map(minute => (
                          <Select.Item key={minute} value={minute}>{minute}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    
                    <Select.Root
                      value={timing.endPeriod}
                      onValueChange={(value) => onMessTimeChange(index, 'endPeriod', value)}
                    >
                      <Select.Trigger placeholder="AM/PM" style={{ flex: 1 }} />
                      <Select.Content>
                        {messPeriods.map(period => (
                          <Select.Item key={period} value={period}>{period}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          ))}
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
            color="indigo"
          >
            Save Changes
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}