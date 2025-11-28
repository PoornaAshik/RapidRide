// Driver API Client
// Handles all backend communication for driver dashboard

class DriverAPI {
  constructor() {
    this.baseURL = window.location.origin;
    this.token = localStorage.getItem('authToken');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
      }
      throw error;
    }
  }

  // Profile endpoints
  async getProfile() {
    return this.request('/api/driver/profile');
  }

  async updateProfile(data) {
    return this.request('/api/driver/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Status endpoints
  async updateStatus(status) {
    return this.request('/api/driver/status', {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  async updateLocation(latitude, longitude) {
    return this.request('/api/driver/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude })
    });
  }

  // Ride endpoints
  async getRides(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/driver/rides?${queryString}`);
  }

  async acceptRide(rideId) {
    return this.request(`/api/driver/rides/${rideId}/accept`, {
      method: 'POST'
    });
  }

  async startRide(rideId) {
    return this.request(`/api/driver/rides/${rideId}/start`, {
      method: 'POST'
    });
  }

  async completeRide(rideId, data) {
    return this.request(`/api/driver/rides/${rideId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async cancelRide(rideId, reason) {
    return this.request(`/api/driver/rides/${rideId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Earnings endpoints
  async getEarnings(period = 'today') {
    return this.request(`/api/driver/earnings?period=${period}`);
  }

  // Analytics endpoints
  async getAnalytics(period = 'week') {
    return this.request(`/api/driver/analytics?period=${period}`);
  }

  // Incentives endpoints
  async getIncentives() {
    return this.request('/api/driver/incentives');
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/api/driver/notifications');
  }

  // Support endpoints
  async contactSupport(data) {
    return this.request('/api/driver/support', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Emergency SOS
  async triggerSOS(data) {
    return this.request('/api/driver/sos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Create singleton instance
const driverAPI = new DriverAPI();
