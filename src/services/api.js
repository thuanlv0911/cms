const BASE_URL = 'http://localhost:9999';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Có lỗi xảy ra khi gọi API!');
  }
  return response.json();
};

export const authService = {
  login: async (username, password) => {
    const data = await fetch(`${BASE_URL}/users?username=${username}&password=${password}`);
    return handleResponse(data);
  },
  
  changePassword: async (userId, newPassword) => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });
    return handleResponse(response);
  },

  getAllUsers: async () => {
    const response = await fetch(`${BASE_URL}/users`);
    return handleResponse(response);
  },

  createUser: async (userData) => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  updateUser: async (userId, userData) => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
};

export const clubService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/clubs`);
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/clubs/${id}`);
    return handleResponse(response);
  },
  
  getMembers: async (clubId) => {
    const response = await fetch(`${BASE_URL}/club_members?clubId=${clubId}`);
    return handleResponse(response);
  }
};

export const eventService = {
  getAllApproved: async (limit) => {
    const url = limit 
      ? `${BASE_URL}/events?status=approved&_limit=${limit}` 
      : `${BASE_URL}/events?status=approved`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  getByClub: async (clubId) => {
    const response = await fetch(`${BASE_URL}/events?clubId=${clubId}`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/events/${id}`);
    return handleResponse(response);
  },

  getPending: async () => {
    const response = await fetch(`${BASE_URL}/events?status=pending`);
    return handleResponse(response);
  },

  create: async (eventData) => {
    const response = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...eventData, status: 'pending', pdpFeedback: '', hasReport: false }),
    });
    return handleResponse(response);
  },

  update: async (eventId, eventData) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  delete: async (eventId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
};

export const newsService = {
  getAllApproved: async (limit) => {
    const url = limit 
      ? `${BASE_URL}/news?status=approved&_limit=${limit}` 
      : `${BASE_URL}/news?status=approved`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/news/${id}`);
    return handleResponse(response);
  },

  getByClub: async (clubId) => {
    const response = await fetch(`${BASE_URL}/news?clubId=${clubId}`);
    return handleResponse(response);
  },

  getPending: async () => {
    const response = await fetch(`${BASE_URL}/news?status=pending`);
    return handleResponse(response);
  },

  create: async (newsData) => {
    const response = await fetch(`${BASE_URL}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...newsData, status: 'pending', pdpFeedback: '', createdAt: new Date().toISOString() }),
    });
    return handleResponse(response);
  },

  update: async (newsId, newsData) => {
    const response = await fetch(`${BASE_URL}/news/${newsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newsData),
    });
    return handleResponse(response);
  },

  delete: async (newsId) => {
    const response = await fetch(`${BASE_URL}/news/${newsId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
};

export const reportService = {
  getPending: async () => {
    const response = await fetch(`${BASE_URL}/reports?status=pending`);
    return handleResponse(response);
  },

  getByClub: async (clubId) => {
    const response = await fetch(`${BASE_URL}/reports?clubId=${clubId}`);
    return handleResponse(response);
  },

  create: async (reportData) => {
    const response = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...reportData, status: 'pending', pdpFeedback: '', submittedAt: new Date().toISOString() }),
    });
    return handleResponse(response);
  },

  update: async (reportId, reportData) => {
    const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });
    return handleResponse(response);
  }
};
