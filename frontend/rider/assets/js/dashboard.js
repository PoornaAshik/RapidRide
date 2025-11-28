// Import modules
import { RideManager } from './ride.js';
import { NotificationManager } from './notifications.js';
import { SocketManager } from './socket.js';
import { API } from './api.js';

// ===== DASHBOARD CONTROLLER =====
class DashboardController {
  constructor() {
    this.rideManager = new RideManager();
    this.notificationManager = new NotificationManager();
    this.socketManager = new SocketManager();
    this.api = new API();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUserData();
    this.socketManager.connect();
    this.setupSocketListeners();
    this.mapState = this.initMapbox();
  }

  setupEventListeners() {
    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    profileBtn?.addEventListener('click', () => {
      profileMenu.classList.toggle('active');
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
      notificationPanel.classList.toggle('active');
    });

    closeNotificationBtn?.addEventListener('click', () => {
      notificationPanel.classList.remove('active');
    });

    // Ride request form
    const rideRequestForm = document.getElementById('rideRequestForm');
    rideRequestForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRideRequest();
    });

    // Ride type change - update fare estimate
    const rideTypeSelect = document.getElementById('rideTypeSelect');
    rideTypeSelect?.addEventListener('change', () => {
      this.updateFareEstimate();
    });

    // Cancel ride
    const cancelRideBtn = document.getElementById('cancelRideBtn');
    cancelRideBtn?.addEventListener('click', () => {
      this.handleCancelRide();
    });

    // SOS button
    const sosButton = document.getElementById('sosButton');
    const sosModal = document.getElementById('sosModal');
    const confirmSosBtn = document.getElementById('confirmSosBtn');
    const cancelSosBtn = document.getElementById('cancelSosBtn');

    sosButton?.addEventListener('click', () => {
      sosModal.classList.add('active');
    });

    confirmSosBtn?.addEventListener('click', () => {
      this.triggerSOS();
      sosModal.classList.remove('active');
    });

    cancelSosBtn?.addEventListener('click', () => {
      sosModal.classList.remove('active');
    });

    // Support modal
    const contactSupportBtn = document.getElementById('contactSupportBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupportModalBtn = document.getElementById('closeSupportModalBtn');

    contactSupportBtn?.addEventListener('click', () => {
      supportModal.classList.add('active');
    });

    closeSupportModalBtn?.addEventListener('click', () => {
      supportModal.classList.remove('active');
    });

    // Support form
    const supportForm = document.getElementById('supportForm');
    supportForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSupportRequest();
      supportModal.classList.remove('active');
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

    // Route deviation modal close
    const closeDeviationBtn = document.getElementById('closeDeviationBtn');
    closeDeviationBtn?.addEventListener('click', () => {
      document.getElementById('deviationModal').classList.remove('active');
    });

    const contactDriverBtn = document.getElementById('contactDriverBtn');
    contactDriverBtn?.addEventListener('click', () => {
      this.contactDriver();
    });
  }

  async loadUserData() {
    try {
      const userData = await this.api.getUserProfile();
      this.updateProfileDisplay(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  updateProfileDisplay(userData) {
    // Update profile name in navbar
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
      profileName.textContent = userData.name || 'User';
    }

    // Update profile card
    const profileNameLarge = document.querySelector('.profile-name-large');
    const profilePhone = document.querySelector('.profile-phone');
    
    if (profileNameLarge) {
      profileNameLarge.textContent = userData.name || 'User';
    }
    
    if (profilePhone) {
      profilePhone.textContent = userData.phone || '+91 XXXXXXXXXX';
    }

    // Update avatar initials
    const initials = this.getInitials(userData.name);
    document.querySelectorAll('.profile-avatar, .profile-avatar-large').forEach(avatar => {
      avatar.textContent = initials;
    });
  }

  getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  async handleRideRequest() {
    const pickup = document.getElementById('pickupInput').value;
    const drop = document.getElementById('dropInput').value;
    const rideType = document.getElementById('rideTypeSelect').value;

    if (!pickup || !drop) {
      this.notificationManager.show('Please enter pickup and drop locations', 'error');
      return;
    }

    try {
      // Show searching status
      this.updateRideStatus('searching');
      
      const rideData = await this.api.requestRide({
        pickup,
        drop,
        rideType
      });

      this.rideManager.startRide(rideData);
      this.showCurrentRideCard(rideData);
      
      this.notificationManager.show('Searching for nearby drivers...', 'info');
    } catch (error) {
      console.error('Ride request failed:', error);
      this.notificationManager.show('Failed to request ride. Please try again.', 'error');
    }
  }

  updateFareEstimate() {
    const rideType = document.getElementById('rideTypeSelect').value;
    const fareAmount = document.getElementById('fareAmount');
    
    const fares = {
      economy: '₹120 - ₹150',
      comfort: '₹180 - ₹220',
      premium: '₹250 - ₹300',
      shared: '₹80 - ₹100'
    };

    if (fareAmount) {
      fareAmount.textContent = fares[rideType] || '₹120 - ₹150';
    }
  }

  showCurrentRideCard(rideData) {
    const currentRideCard = document.getElementById('currentRideCard');
    if (currentRideCard) {
      currentRideCard.style.display = 'block';
      
      // Animate in
      setTimeout(() => {
        currentRideCard.style.animation = 'slideUp 0.5s ease-out';
      }, 100);
    }
  }

  updateRideStatus(status) {
    const statusSteps = document.querySelectorAll('.status-step');
    const statusMap = {
      searching: 0,
      assigned: 1,
      arriving: 2,
      on_trip: 3,
      completed: 4
    };

    const activeIndex = statusMap[status] || 0;
    
    statusSteps.forEach((step, index) => {
      if (index <= activeIndex) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Update ride status badge
    const rideStatus = document.getElementById('rideStatus');
    const statusTexts = {
      searching: 'Searching for driver...',
      assigned: 'Driver assigned',
      arriving: 'Driver arriving',
      on_trip: 'On trip',
      completed: 'Ride completed'
    };

    if (rideStatus) {
      rideStatus.textContent = statusTexts[status] || 'Status unknown';
      rideStatus.className = `status-badge ${status}`;
    }
  }

  async handleCancelRide() {
    const confirmed = confirm('Are you sure you want to cancel this ride?');
    if (!confirmed) return;

    try {
      await this.api.cancelRide();
      this.rideManager.endRide();
      
      const currentRideCard = document.getElementById('currentRideCard');
      if (currentRideCard) {
        currentRideCard.style.display = 'none';
      }
      
      this.updateRideStatus('searching');
      this.notificationManager.show('Ride cancelled successfully', 'success');
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      this.notificationManager.show('Failed to cancel ride', 'error');
    }
  }

  triggerSOS() {
    console.log('🆘 SOS TRIGGERED');
    this.socketManager.emit('sos_alert', {
      riderId: 'current_rider_id',
      location: 'current_location',
      timestamp: new Date().toISOString()
    });
    
    this.notificationManager.show('Emergency services have been notified', 'warning');
    
    // Visual feedback
    document.body.style.animation = 'flash 0.5s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }

  setupSocketListeners() {
    // Listen for driver assigned
    this.socketManager.on('driver_assigned', (data) => {
      console.log('Driver assigned:', data);
      this.updateRideStatus('assigned');
      this.notificationManager.show(`Driver ${data.driverName} has been assigned!`, 'success');
    });

    // Listen for driver arriving
    this.socketManager.on('driver_arriving', (data) => {
      console.log('Driver arriving:', data);
      this.updateRideStatus('arriving');
      this.startETACountdown(data.eta);
    });

    // Listen for trip started
    this.socketManager.on('trip_started', () => {
      this.updateRideStatus('on_trip');
      this.notificationManager.show('Trip started', 'info');
    });

    // Listen for trip completed
    this.socketManager.on('trip_completed', (data) => {
      this.updateRideStatus('completed');
      this.notificationManager.show('Trip completed! Thank you for riding with us.', 'success');
      this.showTripSummary(data);
    });

    // Listen for route deviation
    this.socketManager.on('route_deviation', () => {
      const deviationModal = document.getElementById('deviationModal');
      if (deviationModal) {
        deviationModal.classList.add('active');
      }
    });

    // Listen for location updates
    this.socketManager.on('driver_location_update', (data) => {
      this.updateDriverMarker(data.location);
    });

    // Listen for notifications
    this.socketManager.on('notification', (data) => {
      this.notificationManager.addNotification(data);
    });
  }

  startETACountdown(initialETA) {
    const etaElement = document.getElementById('etaCountdown');
    if (!etaElement) return;

    let remainingMinutes = initialETA;
    
    const interval = setInterval(() => {
      if (remainingMinutes > 0) {
        etaElement.textContent = `${remainingMinutes} mins`;
        remainingMinutes--;
      } else {
        etaElement.textContent = 'Arriving now';
        clearInterval(interval);
      }
    }, 60000); // Update every minute

    // Store interval to clear later
    this.etaInterval = interval;
  }

  updateDriverMarker(location) {
    // Update Leaflet marker if map is initialized
    const ms = this.mapState;
    if (!ms || !ms.map || !ms.driverMarker) {
      console.warn('Map or driverMarker not initialized yet');
      return;
    }
    
    try {
      // Accept multiple location formats: {lat,lng} or {latitude,longitude} or [lat,lng]
      let lat, lng;
      if (Array.isArray(location)) {
        [lat, lng] = location;
      } else {
        lat = location.lat ?? location.latitude ?? location[0];
        lng = location.lng ?? location.longitude ?? location[1];
      }

      if (lat == null || lng == null) {
        console.warn('Invalid driver location received:', location);
        return;
      }

      // Move marker and pan map smoothly
      ms.driverMarker.setLatLng([lat, lng]);
      try { ms.map.panTo([lat, lng], { animate: true }); } catch(e){ /* ignore */ }
    } catch (err) {
      console.error('Failed to update driver marker:', err, location);
    }
  }

  showTripSummary(data) {
    // Hide current ride card
    const currentRideCard = document.getElementById('currentRideCard');
    if (currentRideCard) {
      currentRideCard.style.display = 'none';
    }

    // Show summary notification
    this.notificationManager.show(
      `Ride completed! Distance: ${data.distance}km, Fare: ₹${data.fare}`,
      'success'
    );

    // Add to history
    this.addToRideHistory(data);
  }

  addToRideHistory(rideData) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.style.animation = 'slideUp 0.5s ease-out';
    
    historyItem.innerHTML = `
      <div class="history-icon">🚕</div>
      <div class="history-details">
        <p class="history-route">${rideData.pickup} → ${rideData.drop}</p>
        <p class="history-meta">${new Date().toLocaleDateString()} • ${rideData.distance} km • ₹${rideData.fare}</p>
      </div>
      <button class="btn-invoice">📄</button>
    `;

    historyList.insertBefore(historyItem, historyList.firstChild);
  }

  contactDriver() {
    console.log('Contacting driver...');
    this.notificationManager.show('Calling driver...', 'info');
    
    // Close deviation modal
    document.getElementById('deviationModal').classList.remove('active');
    
    // In real app, initiate call
    setTimeout(() => {
      this.notificationManager.show('Call connected', 'success');
    }, 1000);
  }

  async handleSupportRequest() {
    this.notificationManager.show('Support request submitted successfully', 'success');
    console.log('Support request submitted');
  }

  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('rapidride_token');
      localStorage.removeItem('rapidride_driver');
      window.location.href = '../signup.html';
    }
  }

  // Initialize Leaflet map (OpenStreetMap)
  initMapbox() {
    const container = document.getElementById('mapContainer');
    if (!container) return null;

    if (typeof L === 'undefined') {
      console.error('Leaflet (L) is not loaded. Make sure Leaflet script is included before this module.');
      return null;
    }

    const map = L.map('mapContainer').setView([12.9716, 77.5946], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const pickupMarker = L.marker([12.9716, 77.5946], { title: 'Pickup' }).addTo(map);
    const driverMarker = L.marker([12.97, 77.6], { title: 'Driver' }).addTo(map);

    // Expose to window for debugging
    try { window.rapidrideMap = map; window.rapidrideDriverMarker = driverMarker; } catch(e){}

    // Leaflet needs invalidateSize if container was hidden earlier. Call once after a short delay.
    setTimeout(() => {
      try { map.invalidateSize(); } catch (e) { /* ignore */ }
    }, 200);

    return { map, pickupMarker, driverMarker };
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DashboardController();
  console.log('✅ RapidRide Dashboard initialized');
});

export default DashboardController;