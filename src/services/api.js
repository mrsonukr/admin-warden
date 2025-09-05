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