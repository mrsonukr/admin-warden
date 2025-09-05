import React from 'react';
import { Box, Text, Flex, Card, Badge, Skeleton } from '@radix-ui/themes';
import { AlertCircle, Clock, CheckCircle2, XCircle, FileText, TrendingUp } from 'lucide-react';

const ComplaintStats = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Box style={{ marginBottom: '32px' }}>

        {/* All Cards in One Row - Skeleton */}
        <Flex gap="4" wrap="nowrap" style={{ overflowX: 'auto' }}>
          {[1, 2, 3, 4, 5].map((i) => (
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

  if (!stats || !stats.data) {
    return (
      <Box style={{ marginBottom: '32px' }}>
        <Card style={{ padding: '20px', textAlign: 'center' }}>
          <Text size="3" color="red">
            Failed to load statistics
          </Text>
        </Card>
      </Box>
    );
  }

  const { total_complaints, pending, in_progress, resolved, rejected } = stats.data;

  const statCards = [
    {
      title: 'Total Complaints',
      value: total_complaints,
      icon: <FileText size={24} />,
      color: 'indigo',
    },
    {
      title: 'Pending',
      value: pending,
      icon: <Clock size={24} />,
      color: 'orange',
    },
    {
      title: 'In Progress',
      value: in_progress,
      icon: <AlertCircle size={24} />,
      color: 'yellow',
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: <CheckCircle2 size={24} />,
      color: 'green',
    },
    {
      title: 'Rejected',
      value: rejected,
      icon: <XCircle size={24} />,
      color: 'red',
    },
  ];

  return (
    <Box style={{ marginBottom: '32px' }}>

      {/* All Cards in One Row */}
      <Flex gap="4" wrap="nowrap" style={{ overflowX: 'auto' }}>
        {statCards.map((stat, index) => (
          <Card
            key={index}
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
                  backgroundColor: `var(--${stat.color}-3)`,
                  color: `var(--${stat.color}-11)`,
                  position: 'relative',
                }}
              >
                {stat.icon}
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
    </Box>
  );
};

export default ComplaintStats;
