// Driver Dashboard Controller
// Matches rider dashboard architecture and functionality

class DriverDashboardController {
  constructor() {
    this.isOnline = false;
    this.currentRide = null;
    this.driverLocation = { lat: 12.9716, lng: 77.5946 }; // Default: Bangalore
    this.map = null;
    this.driverMarker = null;
    this.rideMarkers = { pickup: null, drop: null };
    this.routeLine = null;
    
    this.init();
  }

  init() {
    console.log('🚗 Driver Dashboard initializing...');
    this.setupEventListeners();
    this.initMap();
    this.loadDriverProfile();
    this.startLocationTracking();
    console.log('✅ Driver Dashboard initialized');
  }

  setupEventListeners() {
    // Toggle Online/Offline
    const toggleBtn = document.getElementById('toggleOnlineBtn');
    toggleBtn?.addEventListener('click', () => this.toggleOnlineStatus());

    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    profileBtn?.addEventListener('click', () => {
      profileMenu?.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        profileMenu?.classList.remove('active');
      }
    });

    // Notification panel
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');

    notificationBtn?.addEventListener('click', () => {
      notificationPanel?.classList.toggle('active');
    });

    closeNotificationBtn?.addEventListener('click', () => {
      notificationPanel?.classList.remove('active');
    });

    // Ride actions
    document.getElementById('acceptRideBtn')?.addEventListener('click', () => this.acceptRide());
    document.getElementById('rejectRideBtn')?.addEventListener('click', () => this.rejectRide());
    document.getElementById('arrivedBtn')?.addEventListener('click', () => this.markArrived());
    document.getElementById('startTripBtn')?.addEventListener('click', () => this.startTrip());
    document.getElementById('completeTripBtn')?.addEventListener('click', () => this.completeTrip());
    document.getElementById('cancelRideBtn')?.addEventListener('click', () => this.cancelRide());
    document.getElementById('contactRiderBtn')?.addEventListener('click', () => this.contactRider());
    document.getElementById('navigationBtn')?.addEventListener('click', () => this.openNavigation());

    // Map controls
    document.getElementById('centerMapBtn')?.addEventListener('click', () => this.centerMap());

    // SOS button
    const sosButton = document.getElementById('sosButton');
    const sosModal = document.getElementById('sosModal');
    const confirmSosBtn = document.getElementById('confirmSosBtn');
    const cancelSosBtn = document.getElementById('cancelSosBtn');

    sosButton?.addEventListener('click', () => {
      sosModal?.classList.add('active');
    });

    confirmSosBtn?.addEventListener('click', () => {
      this.triggerSOS();
      sosModal?.classList.remove('active');
    });

    cancelSosBtn?.addEventListener('click', () => {
      sosModal?.classList.remove('active');
    });

    // Support modal
    const contactSupportBtn = document.getElementById('contactSupportBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupportModalBtn = document.getElementById('closeSupportModalBtn');

    contactSupportBtn?.addEventListener('click', () => {
      supportModal?.classList.add('active');
    });

    closeSupportModalBtn?.addEventListener('click', () => {
      supportModal?.classList.remove('active');
    });

    // Support form
    const supportForm = document.getElementById('supportForm');
    supportForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSupportRequest();
      supportModal?.classList.remove('active');
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLogout();
    });
  }

  // Initialize Leaflet map
  initMap() {
    const container = document.getElementById('mapContainer');
    if (!container) {
      console.warn('Map container not found');
      return;
    }

    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      return;
    }

    try {
      this.map = L.map('mapContainer').setView([this.driverLocation.lat, this.driverLocation.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // Add driver marker
      this.driverMarker = L.marker([this.driverLocation.lat, this.driverLocation.lng], {
        title: 'You (Driver)'
      }).addTo(this.map);

      // Expose to window for debugging
      window.driverMap = this.map;
      window.driverMarker = this.driverMarker;

      // Fix map size after load
      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);

      console.log('✅ Map initialized');
    } catch (error) {
      console.error('Map initialization failed:', error);
    }
  }

  // Toggle online/offline status
  toggleOnlineStatus() {
    this.isOnline = !this.isOnline;
    const toggleBtn = document.getElementById('toggleOnlineBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusText = statusIndicator?.querySelector('.status-text');

    if (this.isOnline) {
      toggleBtn?.classList.add('online');
      toggleBtn.innerHTML = '<span class="toggle-icon">🟢</span><span class="toggle-label">Go Offline</span>';
      statusDot?.classList.remove('offline');
      statusDot?.classList.add('online');
      statusText.textContent = 'Online';
      this.updateStatus('available');
      this.showNotification('You are now online and available for rides', 'success');
      
      // Simulate ride request after 5 seconds (for demo)
      setTimeout(() => {
        if (this.isOnline && !this.currentRide) {
          this.showRideRequest();
        }
      }, 5000);
    } else {
      toggleBtn?.classList.remove('online');
      toggleBtn.innerHTML = '<span class="toggle-icon">🔴</span><span class="toggle-label">Go Online</span>';
      statusDot?.classList.remove('online');
      statusDot?.classList.add('offline');
      statusText.textContent = 'Offline';
      this.updateStatus('available');
      this.showNotification('You are now offline', 'info');
    }
  }

  // Update ride status bar
  updateStatus(status) {
    const statusSteps = document.querySelectorAll('.status-step');
    const statusMap = {
      available: 0,
      assigned: 1,
      en_route: 2,
      arrived: 3,
      on_trip: 4,
      completed: 5
    };

    const activeIndex = statusMap[status] || 0;
    
    statusSteps.forEach((step, index) => {
      if (index <= activeIndex) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  // Show new ride request modal
  showRideRequest() {
    const modal = document.getElementById('riderInfoModal');
    if (modal) {
      modal.classList.add('active');
      this.startRequestTimer();
    }
  }

  startRequestTimer() {
    let timeLeft = 15;
    const timerElement = document.getElementById('requestTimer');
    
    const interval = setInterval(() => {
      timeLeft--;
      if (timerElement) timerElement.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        this.rejectRide();
      }
    }, 1000);

    this.requestTimerInterval = interval;
  }

  // Accept ride
  acceptRide() {
    if (this.requestTimerInterval) {
      clearInterval(this.requestTimerInterval);
    }

    const modal = document.getElementById('riderInfoModal');
    modal?.classList.remove('active');

    this.currentRide = {
      riderId: 'rider_123',
      riderName: 'Priya Mehta',
      pickup: { lat: 12.9352, lng: 77.6245, address: 'Koramangala 5th Block' },
      drop: { lat: 13.1986, lng: 77.7066, address: 'Kempegowda Airport' },
      fare: 450,
      distance: 28.5
    };

    this.updateStatus('assigned');
    this.showCurrentRideCard();
    this.addRideMarkersToMap();
    this.showNotification('Ride accepted! Navigate to pickup location', 'success');
  }

  // Reject ride
  rejectRide() {
    if (this.requestTimerInterval) {
      clearInterval(this.requestTimerInterval);
    }

    const modal = document.getElementById('riderInfoModal');
    modal?.classList.remove('active');
    this.showNotification('Ride request rejected', 'info');
  }

  // Show current ride card
  showCurrentRideCard() {
    const card = document.getElementById('currentRideCard');
    if (card) {
      card.style.display = 'block';
      setTimeout(() => {
        card.style.animation = 'slideUp 0.5s ease-out';
      }, 100);
    }
  }

  // Add pickup and drop markers to map
  addRideMarkersToMap() {
    if (!this.map || !this.currentRide) return;

    // Remove existing markers
    if (this.rideMarkers.pickup) this.map.removeLayer(this.rideMarkers.pickup);
    if (this.rideMarkers.drop) this.map.removeLayer(this.rideMarkers.drop);
    if (this.routeLine) this.map.removeLayer(this.routeLine);

    // Add pickup marker
    this.rideMarkers.pickup = L.marker(
      [this.currentRide.pickup.lat, this.currentRide.pickup.lng],
      { title: 'Pickup' }
    ).addTo(this.map);

    // Add drop marker
    this.rideMarkers.drop = L.marker(
      [this.currentRide.drop.lat, this.currentRide.drop.lng],
      { title: 'Drop' }
    ).addTo(this.map);

    // Draw route line
    this.routeLine = L.polyline([
      [this.driverLocation.lat, this.driverLocation.lng],
      [this.currentRide.pickup.lat, this.currentRide.pickup.lng],
      [this.currentRide.drop.lat, this.currentRide.drop.lng]
    ], { color: '#3498db', weight: 3 }).addTo(this.map);

    // Fit bounds to show all markers
    const bounds = L.latLngBounds([
      [this.driverLocation.lat, this.driverLocation.lng],
      [this.currentRide.pickup.lat, this.currentRide.pickup.lng],
      [this.currentRide.drop.lat, this.currentRide.drop.lng]
    ]);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  // Mark arrived at pickup
  markArrived() {
    this.updateStatus('arrived');
    this.showNotification('Marked as arrived at pickup', 'success');
    
    // Show start trip button
    document.getElementById('arrivedBtn').style.display = 'none';
    document.getElementById('startTripBtn').style.display = 'block';
  }

  // Start trip
  startTrip() {
    this.updateStatus('on_trip');
    this.showNotification('Trip started!', 'success');
    
    // Show complete trip button
    document.getElementById('startTripBtn').style.display = 'none';
    document.getElementById('completeTripBtn').style.display = 'block';

    // Update route line to only show pickup to drop
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    this.routeLine = L.polyline([
      [this.currentRide.pickup.lat, this.currentRide.pickup.lng],
      [this.currentRide.drop.lat, this.currentRide.drop.lng]
    ], { color: '#27ae60', weight: 4 }).addTo(this.map);
  }

  // Complete trip
  completeTrip() {
    this.updateStatus('completed');
    this.showNotification(`Trip completed! You earned ₹${this.currentRide.fare}`, 'success');
    
    // Hide ride card
    setTimeout(() => {
      const card = document.getElementById('currentRideCard');
      if (card) card.style.display = 'none';
      
      // Clear ride data
      this.currentRide = null;
      if (this.rideMarkers.pickup) this.map.removeLayer(this.rideMarkers.pickup);
      if (this.rideMarkers.drop) this.map.removeLayer(this.rideMarkers.drop);
      if (this.routeLine) this.map.removeLayer(this.routeLine);
      
      // Reset status
      this.updateStatus('available');
      
      // Update earnings (demo)
      this.updateEarnings();
    }, 3000);
  }

  // Cancel ride
  cancelRide() {
    if (!confirm('Are you sure you want to cancel this ride?')) return;

    this.showNotification('Ride cancelled', 'warning');
    const card = document.getElementById('currentRideCard');
    if (card) card.style.display = 'none';
    
    this.currentRide = null;
    if (this.rideMarkers.pickup) this.map.removeLayer(this.rideMarkers.pickup);
    if (this.rideMarkers.drop) this.map.removeLayer(this.rideMarkers.drop);
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    
    this.updateStatus('available');
  }

  // Contact rider
  contactRider() {
    if (!this.currentRide) return;
    this.showNotification(`Calling ${this.currentRide.riderName}...`, 'info');
    // In real app, initiate call
  }

  // Open navigation
  openNavigation() {
    if (!this.currentRide) return;
    const { lat, lng } = this.currentRide.pickup;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
    this.showNotification('Opening Google Maps...', 'info');
  }

  // Center map on driver location
  centerMap() {
    if (this.map && this.driverMarker) {
      this.map.setView([this.driverLocation.lat, this.driverLocation.lng], 15);
    }
  }

  // Start tracking driver location (simulated)
  startLocationTracking() {
    // In real app, use Geolocation API
    // For demo, just update occasionally
    setInterval(() => {
      if (this.isOnline) {
        // Simulate slight location change
        this.driverLocation.lat += (Math.random() - 0.5) * 0.001;
        this.driverLocation.lng += (Math.random() - 0.5) * 0.001;
        
        if (this.driverMarker) {
          this.driverMarker.setLatLng([this.driverLocation.lat, this.driverLocation.lng]);
        }
      }
    }, 5000);
  }

  // Update earnings display
  updateEarnings() {
    const earningsAmount = document.querySelector('.earnings-amount');
    if (earningsAmount) {
      const current = parseInt(earningsAmount.textContent.replace('₹', ''));
      const newAmount = current + (this.currentRide?.fare || 0);
      earningsAmount.textContent = `₹${newAmount}`;
    }

    const ridesCount = document.querySelector('.earnings-rides');
    if (ridesCount) {
      const current = parseInt(ridesCount.textContent.split(' ')[0]);
      ridesCount.textContent = `${current + 1} rides`;
    }
  }

  // Load driver profile
  async loadDriverProfile() {
    // In real app, fetch from API
    const profile = {
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      rating: 4.87,
      totalRides: 342,
      vehicle: {
        model: 'Toyota Innova',
        year: 2021,
        plate: 'KA 01 AB 1234',
        color: 'White'
      }
    };

    this.updateProfileDisplay(profile);
  }

  updateProfileDisplay(profile) {
    document.querySelector('.profile-name')?.textContent = profile.name;
    document.querySelector('.profile-name-large')?.textContent = profile.name;
    document.querySelector('.profile-phone')?.textContent = profile.phone;
    
    const initials = this.getInitials(profile.name);
    document.querySelectorAll('.profile-avatar, .profile-avatar-large').forEach(avatar => {
      avatar.textContent = initials;
    });
  }

  getInitials(name) {
    if (!name) return 'D';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Show notification (toast)
  showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 30px;
      background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      z-index: 4000;
      font-weight: 600;
      animation: slideInRight 0.4s ease, fadeOut 0.4s ease 2.6s;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Trigger SOS
  triggerSOS() {
    console.log('🆘 SOS TRIGGERED');
    this.showNotification('Emergency services have been notified', 'warning');
    
    // Flash effect
    document.body.style.animation = 'flash 0.5s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }

  // Handle support request
  handleSupportRequest() {
    this.showNotification('Support request submitted successfully', 'success');
  }

  // Logout
  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('rapidride_token');
      localStorage.removeItem('rapidride_driver');
      window.location.href = '../../login.html';
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DriverDashboardController();
  window.driverDashboard = dashboard; // Expose for debugging
});

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes flash {
    0%, 100% { background-color: inherit; }
    50% { background-color: rgba(231, 76, 60, 0.2); }
  }
`;
document.head.appendChild(style);
