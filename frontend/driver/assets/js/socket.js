// Driver Socket.IO Client
// Handles real-time communication for driver dashboard

class DriverSocket {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = {};
  }

  connect() {
    if (this.socket) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(window.location.origin);

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('🔌 Socket connected:', this.socket.id);
      this.emit('driver_online', { driverId: this.getDriverId() });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Listen for ride requests
    this.socket.on('ride_request', (data) => {
      console.log('📱 New ride request:', data);
      this.trigger('ride_request', data);
    });

    // Listen for ride updates
    this.socket.on('ride_assigned', (data) => {
      console.log('✅ Ride assigned:', data);
      this.trigger('ride_assigned', data);
    });

    this.socket.on('ride_cancelled', (data) => {
      console.log('❌ Ride cancelled:', data);
      this.trigger('ride_cancelled', data);
    });

    // Listen for rider location updates
    this.socket.on('rider_location_update', (data) => {
      console.log('📍 Rider location update:', data);
      this.trigger('rider_location_update', data);
    });

    console.log('✅ Socket client initialized');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected');
    }
  }

  // Emit driver location updates
  updateLocation(latitude, longitude, rideId = null) {
    if (!this.connected) {
      console.warn('Socket not connected, cannot update location');
      return;
    }

    const data = {
      lat: latitude,
      lng: longitude,
      driverId: this.getDriverId(),
      timestamp: new Date().toISOString()
    };

    if (rideId) {
      data.rideId = rideId;
    }

    this.socket.emit('driver:updateLocation', data);
    console.log('📍 Location update sent:', data);
  }

  // Subscribe to ride updates
  subscribeToRide(rideId) {
    if (!this.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('subscribe_ride', { rideId });
    console.log(`📡 Subscribed to ride: ${rideId}`);
  }

  // Unsubscribe from ride updates
  unsubscribeFromRide(rideId) {
    if (!this.connected) return;

    this.socket.emit('unsubscribe_ride', { rideId });
    console.log(`🔕 Unsubscribed from ride: ${rideId}`);
  }

  // Custom event emitter
  emit(event, data) {
    if (!this.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  // Register event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Trigger event listeners
  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // Helper to get driver ID from token
  getDriverId() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error getting driver ID:', error);
      return null;
    }
  }

  // Check connection status
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const driverSocket = new DriverSocket();

// Auto-connect when script loads
if (localStorage.getItem('authToken')) {
  driverSocket.connect();
}
