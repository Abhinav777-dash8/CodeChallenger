export async function apiRequest(endpoint, method = 'GET', body = null) {
    const url = `http://localhost:8000/api/${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    };
  
    const config = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    };
  
    let response = await fetch(url, config);
  
    // Handle token expiration
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...config, headers });
      }
    }
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.error || 'Request failed');
    }
  
    return response.json();
  }
  
  async function refreshToken() {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) return null;
  
    try {
      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
  
      if (!response.ok) throw new Error('Token refresh failed');
  
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return data.access;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return null;
    }
  }