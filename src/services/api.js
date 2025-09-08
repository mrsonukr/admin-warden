// API service for fetching warden data
const API_BASE_URL = 'https://admin.mssonutech.workers.dev';

export const fetchWardenData = async (wardenId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wardens/${wardenId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching warden data:', error);
    throw error;
  }
};

export const updateWardenProfile = async (wardenId, profileData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wardens/${wardenId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating warden profile:', error);
    throw error;
  }
};

export const fetchComplaintStats = async (hostelName) => {
  try {
    const response = await fetch(`https://risecomplaint.mssonutech.workers.dev/api/stats/${hostelName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    throw error;
  }
};

export const fetchComplaints = async (hostelName = '16B', page = 1, limit = 20) => {
  try {
    const response = await fetch(`https://risecomplaint.mssonutech.workers.dev/api/complaints?hostel_name=${hostelName}&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

export const fetchComplaintDetails = async (complaintId) => {
  try {
    const response = await fetch(`https://risecomplaint.mssonutech.workers.dev/api/complaints/${complaintId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (complaintId, status, wardenId) => {
  try {
    const response = await fetch(`https://risecomplaint.mssonutech.workers.dev/api/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status,
        warden_id: wardenId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
};

export const sendNotification = async (rollNo, notificationData) => {
  try {
    const response = await fetch(`https://sendnotification.mssonutech.workers.dev/api/notifications?roll_no=${rollNo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export const fetchUserPushTokens = async (rollNo) => {
  try {
    const response = await fetch(`https://notification.mssonutech.workers.dev/api/user-tokens/${rollNo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching push tokens:', error);
    throw error;
  }
};

export const sendPushNotification = async (pushTokens, notificationData) => {
  try {
    const requestBody = {
      to: pushTokens,
      title: notificationData.title,
      body: notificationData.description,
      data: {
        channel: notificationData.channel,
        complaint_id: notificationData.complaint_id
      }
    };

    console.log('Sending push notification with data:', requestBody);

    const response = await fetch('https://pushnotification.mssonutech.workers.dev/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Push notification API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Push notification sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

export const sendBothNotifications = async (rollNo, notificationData) => {
  try {
    // Send regular notification
    const regularNotificationPromise = sendNotification(rollNo, notificationData);
    
    // Fetch push tokens and send push notification
    const pushTokensResponse = await fetchUserPushTokens(rollNo);
    let pushNotificationPromise = Promise.resolve({ success: false, message: 'No push tokens found' });
    
    if (pushTokensResponse.success && pushTokensResponse.tokens && pushTokensResponse.tokens.length > 0) {
      pushNotificationPromise = sendPushNotification(pushTokensResponse.tokens, notificationData);
    }
    
    // Wait for both notifications to complete
    const [regularResult, pushResult] = await Promise.allSettled([regularNotificationPromise, pushNotificationPromise]);
    
    return {
      regular: regularResult.status === 'fulfilled' ? regularResult.value : { success: false, error: regularResult.reason },
      push: pushResult.status === 'fulfilled' ? pushResult.value : { success: false, error: pushResult.reason }
    };
  } catch (error) {
    console.error('Error sending both notifications:', error);
    throw error;
  }
};