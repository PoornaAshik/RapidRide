// API Module - Handles all HTTP requests to backend
export class API {
  constructor() {
    // Use the current origin so frontend works across ports/hosts without hardcoding
    this.baseURL = `${location.origin}/api`;
    this.token = localStorage.getItem('token');
  }

  // Get authorization headers
  getHeaders() {
    const token = this.token || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    try {
      // Merge headers: default headers first, then any provided in options
      const mergedHeaders = { ...this.getHeaders(), ...(options.headers || {}) };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: mergedHeaders
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== USER ENDPOINTS =====
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // ===== RIDE ENDPOINTS =====
  async requestRide(rideData) {
    return this.request('/rides/request', {
      method: 'POST',
      body: JSON.stringify(rideData)
    });
  }

  async cancelRide(rideId) {
    return this.request(`/rides/${rideId}/cancel`, {
      method: 'POST'
    });
  }

  async getRideHistory(page = 1, limit = 10) {
    return this.request(`/rides/history?page=${page}&limit=${limit}`);
  }

  async getRideDetails(rideId) {
    return this.request(`/rides/${rideId}`);
  }

  async getCurrentRide() {
    return this.request('/rides/current');
  }

  async rateRide(rideId, rating, feedback) {
    return this.request(`/rides/${rideId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback })
    });
  }

  // ===== FARE ESTIMATION =====
  async estimateFare(pickup, drop, rideType) {
    return this.request('/rides/estimate-fare', {
      method: 'POST',
      body: JSON.stringify({ pickup, drop, rideType })
    });
  }

  // ===== PRE-BOOKING ENDPOINTS =====
  async scheduleRide(scheduleData) {
    return this.request('/rides/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  }

  async getScheduledRides() {
    return this.request('/rides/scheduled');
  }

  async cancelScheduledRide(scheduleId) {
    return this.request(`/rides/scheduled/${scheduleId}/cancel`, {
      method: 'POST'
    });
  }

  // ===== REWARDS & COUPONS =====
  async getRewardPoints() {
    return this.request('/rewards/points');
  }

  async applyCoupon(couponCode) {
    return this.request('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: couponCode })
    });
  }

  async getAvailableCoupons() {
    return this.request('/coupons/available');
  }

  // ===== NOTIFICATIONS =====
  async getNotifications(page = 1) {
    return this.request(`/notifications?page=${page}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // ===== SUPPORT =====
  async submitSupportRequest(issueData) {
    return this.request('/support/request', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  }

  async getSupportTickets() {
    return this.request('/support/tickets');
  }

  // ===== EMERGENCY =====
  async triggerSOS(location) {
    return this.request('/emergency/sos', {
      method: 'POST',
      body: JSON.stringify({ location })
    });
  }

  async addEmergencyContact(contact) {
    return this.request('/emergency/contacts', {
      method: 'POST',
      body: JSON.stringify(contact)
    });
  }

  // ===== ANALYTICS =====
  async getRideAnalytics() {
    return this.request('/analytics/rides');
  }

  async getSpendingAnalytics(period = 'month') {
    return this.request(`/analytics/spending?period=${period}`);
  }

  // ===== PAYMENT =====
  async getPaymentMethods() {
    return this.request('/payments/methods');
  }

  async addPaymentMethod(paymentData) {
    return this.request('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async downloadInvoice(rideId) {
    // Returns blob for PDF download
    const response = await fetch(`${this.baseURL}/rides/${rideId}/invoice`, {
      headers: this.getHeaders()
    });
    
    return response.blob();
  }
}

export default API;