import React from 'react';
import { Box, Text, Flex, Button, Table } from '@radix-ui/themes';
import { Edit } from 'lucide-react';

const MessTimingsTable = ({ messTimings, onEditClick }) => {
  // Calculate duration between start and end times
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return `${diffHours} hours`;
  };

  return (
    <Box style={{ marginTop: '18px' }}>
      <Flex align="center" justify="between" style={{ marginBottom: '16px' }}>
        <Text size="4" weight="bold" style={{ color: 'var(--gray-12)' }}>
          Mess Timings
        </Text>
        <Button variant="soft" size="1" style={{ cursor: 'pointer' }} onClick={onEditClick}>
          <Edit size={14} />
          Edit
        </Button>
      </Flex>
      <Table.Root variant="surface" >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Meal</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Start Time</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>End Time</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {messTimings.map((timing, index) => (
            <Table.Row key={index}>
              <Table.Cell weight="medium">{timing.meal}</Table.Cell>
              <Table.Cell>{timing.startTime}</Table.Cell>
              <Table.Cell>{timing.endTime}</Table.Cell>
              <Table.Cell>{calculateDuration(timing.startTime, timing.endTime)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default MessTimingsTable;
