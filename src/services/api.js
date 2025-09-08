// API service for fetching warden data
const API_BASE_URL = 'https://admin.mssonutech.workers.dev';

export const fetchWardenData = async (wardenId, token) => {
  console.log('🚀 API Call: fetchWardenData', {
    url: `${API_BASE_URL}/wardens/${wardenId}`,
    method: 'GET',
    wardenId,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/wardens/${wardenId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response received for fetchWardenData:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ fetchWardenData success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching warden data:', error);
    throw error;
  }
};

export const updateWardenProfile = async (wardenId, profileData, token) => {
  console.log('🚀 API Call: updateWardenProfile', {
    url: `${API_BASE_URL}/wardens/${wardenId}`,
    method: 'PUT',
    wardenId,
    profileData,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/wardens/${wardenId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    console.log('📡 Response received for updateWardenProfile:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ updateWardenProfile success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating warden profile:', error);
    throw error;
  }
};

export const fetchComplaintStats = async (hostelName) => {
  console.log('🚀 API Call: fetchComplaintStats', {
    url: `https://risecomplaint.mssonutech.workers.dev/api/stats/${hostelName}`,
    method: 'GET',
    hostelName,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(`https://risecomplaint.mssonutech.workers.dev/api/stats/${hostelName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response received for fetchComplaintStats:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ fetchComplaintStats success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching complaint stats:', error);
    throw error;
  }
};

export const fetchComplaints = async (hostelName = '16B', page = 1, limit = 20) => {
  console.log('🚀 API Call: fetchComplaints', {
    url: `https://risecomplaint.mssonutech.workers.dev/api/complaints?hostel_name=${hostelName}&page=${page}&limit=${limit}`,
    method: 'GET',
    hostelName,
    page,
    limit,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(`https://risecomplaint.mssonutech.workers.dev/api/complaints?hostel_name=${hostelName}&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response received for fetchComplaints:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ fetchComplaints success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching complaints:', error);
    throw error;
  }
};

export const fetchComplaintDetails = async (complaintId) => {
  console.log('🚀 API Call: fetchComplaintDetails', {
    url: `https://risecomplaint.mssonutech.workers.dev/api/complaints/${complaintId}`,
    method: 'GET',
    complaintId,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(`https://risecomplaint.mssonutech.workers.dev/api/complaints/${complaintId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response received for fetchComplaintDetails:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ fetchComplaintDetails success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching complaint details:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (complaintId, status, wardenId) => {
  console.log('🚀 API Call: updateComplaintStatus', {
    url: `https://risecomplaint.mssonutech.workers.dev/api/complaints/${complaintId}/status`,
    method: 'PUT',
    complaintId,
    status,
    wardenId,
    timestamp: new Date().toISOString()
  });
  
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

    console.log('📡 Response received for updateComplaintStatus:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ updateComplaintStatus success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating complaint status:', error);
    throw error;
  }
};

export const sendNotification = async (rollNo, notificationData) => {
  console.log('🚀 API Call: sendNotification', {
    url: `https://sendnotification.mssonutech.workers.dev/api/notifications?roll_no=${rollNo}`,
    method: 'POST',
    rollNo,
    notificationData,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(`https://sendnotification.mssonutech.workers.dev/api/notifications?roll_no=${rollNo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    console.log('📡 Response received for sendNotification:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ sendNotification success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

export const fetchUserPushTokens = async (rollNo) => {
  console.log('🚀 API Call: fetchUserPushTokens', {
    url: `https://notification.mssonutech.workers.dev/api/user-tokens/${rollNo}`,
    method: 'GET',
    rollNo,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(`https://notification.mssonutech.workers.dev/api/user-tokens/${rollNo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response received for fetchUserPushTokens:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ fetchUserPushTokens success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching push tokens:', error);
    throw error;
  }
};

export const sendPushNotification = async (pushTokens, notificationData) => {
  const requestBody = {
    to: pushTokens,
    title: notificationData.title,
    body: notificationData.description,
    data: {
      channel: notificationData.channel,
      complaint_id: notificationData.complaint_id
    }
  };

  console.log('🚀 API Call: sendPushNotification', {
    url: 'https://pushnotification.mssonutech.workers.dev/send',
    method: 'POST',
    pushTokens,
    notificationData,
    requestBody,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch('https://pushnotification.mssonutech.workers.dev/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response received for sendPushNotification:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Push notification API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ sendPushNotification success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
};

export const sendBothNotifications = async (rollNo, notificationData) => {
  console.log('🚀 API Call: sendBothNotifications', {
    rollNo,
    notificationData,
    timestamp: new Date().toISOString()
  });
  
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
    
    const result = {
      regular: regularResult.status === 'fulfilled' ? regularResult.value : { success: false, error: regularResult.reason },
      push: pushResult.status === 'fulfilled' ? pushResult.value : { success: false, error: pushResult.reason }
    };
    
    console.log('✅ sendBothNotifications success:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending both notifications:', error);
    throw error;
  }
};