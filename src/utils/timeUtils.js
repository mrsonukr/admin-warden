// Generate time options for time selectors
export const generateTimeOptions = () => {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];
  
  return { hours, minutes, periods };
};

// Get time-based greeting
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Get current time
export const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Calculate duration between start and end times
export const calculateDuration = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  return `${diffHours} hours`;
};

// Default hostel entry time
export const getDefaultHostelEntryTime = () => ({
  startHour: '06',
  startMinute: '00',
  startPeriod: 'AM',
  endHour: '10',
  endMinute: '00',
  endPeriod: 'PM'
});

// Default mess timings
export const getDefaultMessTimings = () => [
  { 
    meal: 'Breakfast', 
    startTime: '7:00 AM', 
    endTime: '9:00 AM',
    startHour: '07',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '09',
    endMinute: '00',
    endPeriod: 'AM'
  },
  { 
    meal: 'Lunch', 
    startTime: '12:00 PM', 
    endTime: '2:00 PM',
    startHour: '12',
    startMinute: '00',
    startPeriod: 'PM',
    endHour: '02',
    endMinute: '00',
    endPeriod: 'PM'
  },
  { 
    meal: 'Snacks', 
    startTime: '4:00 PM', 
    endTime: '6:00 PM',
    startHour: '04',
    startMinute: '00',
    startPeriod: 'PM',
    endHour: '06',
    endMinute: '00',
    endPeriod: 'PM'
  },
  { 
    meal: 'Dinner', 
    startTime: '7:00 PM', 
    endTime: '9:00 PM',
    startHour: '07',
    startMinute: '00',
    startPeriod: 'PM',
    endHour: '09',
    endMinute: '00',
    endPeriod: 'PM'
  }
];
