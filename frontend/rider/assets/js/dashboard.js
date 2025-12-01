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

    // Saved preferences
    try {
      this.currentMapStyle = localStorage.getItem('rr_map_style') || 'light';
      this.currentTheme = localStorage.getItem('rr_theme') || 'light';
    } catch (e) {
      this.currentMapStyle = 'light';
      this.currentTheme = 'light';
    }

    this.mapState = null;
    this.etaInterval = null;

    this.init();
  }

  init() {
    // Apply saved theme first
    this.applyTheme(this.currentTheme);

    this.setupEventListeners();
    this.highlightInitialSettings();
    this.loadUserData();
    this.socketManager.connect();
    this.setupSocketListeners();
    this.mapState = this.initMap(); // Leaflet map
  }

  setupEventListeners() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    profileBtn?.addEventListener('click', () => {
      profileMenu?.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        profileMenu?.classList.remove('active');
      }
    });

    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');

    notificationBtn?.addEventListener('click', () => {
      notificationPanel?.classList.toggle('active');
    });

    closeNotificationBtn?.addEventListener('click', () => {
      notificationPanel?.classList.remove('active');
    });

    const rideRequestForm = document.getElementById('rideRequestForm');
    rideRequestForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRideRequest();
    });

    const rideTypeSelect = document.getElementById('rideTypeSelect');
    rideTypeSelect?.addEventListener('change', () => {
      this.updateFareEstimate();
    });

    const cancelRideBtn = document.getElementById('cancelRideBtn');
    cancelRideBtn?.addEventListener('click', () => {
      this.handleCancelRide();
    });

    // SOS
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

    // Support
    const contactSupportBtn = document.getElementById('contactSupportBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupportModalBtn = document.getElementById('closeSupportModalBtn');

    contactSupportBtn?.addEventListener('click', () => {
      supportModal?.classList.add('active');
    });

    closeSupportModalBtn?.addEventListener('click', () => {
      supportModal?.classList.remove('active');
    });

    const supportForm = document.getElementById('supportForm');
    supportForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSupportRequest();
      supportModal?.classList.remove('active');
    });

    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');

    settingsBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      settingsModal?.classList.add('active');
    });

    closeSettingsModalBtn?.addEventListener('click', () => {
      settingsModal?.classList.remove('active');
    });

    // Map style buttons
    document.querySelectorAll('[data-map-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.getAttribute('data-map-style');
        this.setMapStyle(style);
        document.querySelectorAll('[data-map-style]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Theme buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        this.applyTheme(theme);
        document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLogout();
    });

    const closeDeviationBtn = document.getElementById('closeDeviationBtn');
    closeDeviationBtn?.addEventListener('click', () => {
      document.getElementById('deviationModal')?.classList.remove('active');
    });

    const contactDriverBtn = document.getElementById('contactDriverBtn');
    contactDriverBtn?.addEventListener('click', () => {
      this.contactDriver();
    });
  }

  highlightInitialSettings() {
    document.querySelectorAll('[data-map-style]').forEach(btn => {
      const style = btn.getAttribute('data-map-style');
      btn.classList.toggle('active', style === this.currentMapStyle);
    });
    document.querySelectorAll('[data-theme]').forEach(btn => {
      const theme = btn.getAttribute('data-theme');
      btn.classList.toggle('active', theme === this.currentTheme);
    });
  }

  async loadUserData() {
    try {
      const userData = await this.api.getUserProfile();
      this.updateProfileDisplay(userData);
      
      // Load additional data
      await Promise.all([
        this.loadRideHistory(),
        this.loadRewardPoints(),
        this.loadScheduledRides(),
        this.loadNotifications(),
        this.loadAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  updateProfileDisplay(userData) {
    const user = userData.user || userData;
    const name = user.name || user.username || 'User';
    const phone = user.phone || user.mobile || 'Not provided';
    
    const profileName = document.querySelector('.profile-name');
    profileName && (profileName.textContent = name);

    const profileNameLarge = document.getElementById('profileNameLarge');
    const profilePhone = document.getElementById('profilePhone');

    profileNameLarge && (profileNameLarge.textContent = name);
    profilePhone && (profilePhone.textContent = phone);

    const initials = this.getInitials(name);
    document.querySelectorAll('.profile-avatar, .profile-avatar-large').forEach(avatar => {
      avatar.textContent = initials;
    });
  }

  getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
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
      this.updateRideStatus('searching');
      const rideData = await this.api.requestRide({ pickup, drop, rideType });
      this.rideManager.startRide(rideData);
      this.showCurrentRideCard(rideData);
      this.notificationManager.show('Searching for nearby drivers...', 'info');
    } catch (error) {
      console.error('Ride request failed:', error);
      this.notificationManager.show('Failed to request ride. Please try again.', 'error');
    }
  }

  async updateFareEstimate() {
    const rideType = document.getElementById('rideTypeSelect').value;
    const pickup = document.getElementById('pickupInput').value;
    const drop = document.getElementById('dropInput').value;
    const fareAmount = document.getElementById('fareAmount');

    if (!pickup || !drop) {
      const fares = {
        economy: '₹120 - ₹150',
        comfort: '₹180 - ₹220',
        premium: '₹250 - ₹300',
        shared: '₹80 - ₹100'
      };
      fareAmount && (fareAmount.textContent = fares[rideType] || 'Enter locations');
      return;
    }

    try {
      const estimate = await this.api.estimateFare(pickup, drop, rideType);
      fareAmount && (fareAmount.textContent = estimate.estimate || '₹--');
    } catch (error) {
      console.error('Failed to estimate fare:', error);
    }
  }

  async loadRideHistory() {
    try {
      const response = await this.api.getRideHistory(1, 10);
      const rides = response.items || [];
      
      const historyList = document.getElementById('historyList');
      if (!historyList) return;

      if (rides.length === 0) {
        historyList.innerHTML = '<p class="empty-state" style="text-align: center; color: #999; padding: 20px;">No ride history yet</p>';
        return;
      }

      historyList.innerHTML = '';
      rides.forEach(ride => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(ride.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const pickup = ride.pickupLocation?.address || 'Unknown';
        const drop = ride.dropoffLocation?.address || 'Unknown';
        const distance = ride.distanceKm || 0;
        const fare = ride.fare || 0;
        
        historyItem.innerHTML = `
          <div class="history-icon">🚕</div>
          <div class="history-details">
            <p class="history-route">${pickup} → ${drop}</p>
            <p class="history-meta">${date} • ${distance} km • ₹${fare}</p>
          </div>
          <button class="btn-invoice" data-ride-id="${ride._id}">📄</button>
        `;
        historyList.appendChild(historyItem);
      });

      // Add invoice button listeners
      document.querySelectorAll('.btn-invoice').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const rideId = e.target.getAttribute('data-ride-id');
          this.downloadInvoice(rideId);
        });
      });
    } catch (error) {
      console.error('Failed to load ride history:', error);
    }
  }

  async loadRewardPoints() {
    try {
      const response = await this.api.getRewardPoints();
      const points = response.points || 0;
      
      const rewardPointsEl = document.getElementById('rewardPoints');
      if (rewardPointsEl) {
        rewardPointsEl.textContent = points;
      }
    } catch (error) {
      console.error('Failed to load reward points:', error);
    }
  }

  async loadScheduledRides() {
    try {
      const response = await this.api.getScheduledRides();
      const rides = response.rides || [];
      
      const prebookingList = document.getElementById('prebookingList');
      if (!prebookingList) return;

      if (rides.length === 0) {
        prebookingList.innerHTML = '<p class="empty-state" style="text-align: center; color: #999; padding: 20px;">No scheduled rides</p>';
        return;
      }

      prebookingList.innerHTML = '';
      rides.forEach(ride => {
        const scheduleDate = new Date(ride.scheduledAt);
        const day = scheduleDate.getDate();
        const month = scheduleDate.toLocaleDateString('en-US', { month: 'short' });
        const time = scheduleDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const pickup = ride.pickupLocation?.address || 'Unknown';
        const drop = ride.dropoffLocation?.address || 'Unknown';
        
        const prebookingItem = document.createElement('div');
        prebookingItem.className = 'prebooking-item';
        prebookingItem.innerHTML = `
          <div class="prebooking-date">
            <span class="date-day">${day}</span>
            <span class="date-month">${month}</span>
          </div>
          <div class="prebooking-details">
            <p class="prebooking-route">${pickup} → ${drop}</p>
            <p class="prebooking-time">${time}</p>
          </div>
        `;
        prebookingList.appendChild(prebookingItem);
      });
    } catch (error) {
      console.error('Failed to load scheduled rides:', error);
    }
  }

  async loadNotifications() {
    try {
      const response = await this.api.getNotifications();
      const notifications = response.notifications || [];
      
      if (notifications.length > 0) {
        notifications.forEach(notif => {
          this.notificationManager.addNotification({
            id: notif._id,
            title: notif.title,
            message: notif.message,
            icon: notif.icon || '📢',
            timestamp: notif.createdAt,
            read: notif.read || false
          });
        });
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  async loadAnalytics() {
    try {
      const response = await this.api.getRideAnalytics();
      const series = response.series || {};
      
      const canvas = document.getElementById('analyticsChart');
      if (!canvas) return;

      const labels = series.labels || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const rides = series.rides || [0, 0, 0, 0, 0, 0, 0];
      
      const data = {
        labels: labels,
        datasets: [{
          label: 'Rides (last 7 days)',
          data: rides,
          fill: true,
          backgroundColor: 'rgba(59,130,246,0.12)',
          borderColor: 'rgba(59,130,246,1)',
          tension: 0.3,
          pointRadius: 4
        }]
      };

      new Chart(canvas, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: { display: true },
            y: { beginAtZero: true }
          }
        }
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  async downloadInvoice(rideId) {
    try {
      const blob = await this.api.downloadInvoice(rideId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${rideId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      this.notificationManager.show('Failed to download invoice', 'error');
    }
  }

  showCurrentRideCard(rideData) {
    const currentRideCard = document.getElementById('currentRideCard');
    if (currentRideCard) {
      currentRideCard.style.display = 'block';
      
      // Update driver info if available
      if (rideData.driver) {
        const driverName = document.getElementById('driverName');
        const driverAvatar = document.getElementById('driverAvatar');
        const driverRating = document.getElementById('driverRating');
        
        if (driverName) driverName.textContent = rideData.driver.name || 'Driver';
        if (driverAvatar) driverAvatar.textContent = this.getInitials(rideData.driver.name || 'D');
        if (driverRating) {
          const rating = rideData.driver.rating || 0;
          const vehicle = rideData.driver.vehicle?.model || 'Vehicle';
          driverRating.textContent = `⭐ ${rating} • ${vehicle}`;
        }
      }
      
      setTimeout(() => {
        currentRideCard.style.animation = 'slideUp 0.5s ease-out';
      }, 100);
    }
  }

  updateRideStatus(status) {
    const statusSteps = document.querySelectorAll('.status-step');
    const statusMap = { searching: 0, assigned: 1, arriving: 2, on_trip: 3, completed: 4 };

    statusSteps.forEach((step, index) => {
      step.classList.toggle('active', index <= (statusMap[status] || 0));
    });

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
    if (!confirm('Are you sure you want to cancel this ride?')) return;

    try {
      await this.api.cancelRide();
      this.rideManager.endRide();

      const currentRideCard = document.getElementById('currentRideCard');
      currentRideCard && (currentRideCard.style.display = 'none');

      this.updateRideStatus('searching');
      this.notificationManager.show('Ride cancelled successfully', 'success');
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      this.notificationManager.show('Failed to cancel ride', 'error');
    }
  }

  // ===== MAP (Leaflet + multiple styles) =====
  initMap() {
    // MapTiler key - in production, serve this from backend config endpoint
    const MAPTILER_KEY = 't1z6B2LZrqsUyffdHC1I';

    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded');
      return null;
    }

    // Default to Bangalore, will be updated with user location
    const map = L.map('mapContainer').setView([12.9716, 77.5946], 13);
    
    // Get user's current location
    this.getUserLocation(map);

    const baseLayers = {
      light: L.tileLayer(
        `https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
        {
          tileSize: 512,
          zoomOffset: -1,
          attribution: '&copy; MapTiler & OpenStreetMap contributors'
        }
      ),
      dark: L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap & CartoDB'
        }
      ),
      terrain: L.tileLayer(
        'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
        {
          attribution: '&copy; OpenStreetMap & Stamen Design'
        }
      ),
      satellite: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri & OpenStreetMap contributors'
        }
      )
    };

    // Add initial style
    const initialStyle = baseLayers[this.currentMapStyle] ? this.currentMapStyle : 'light';
    baseLayers[initialStyle].addTo(map);

    const pickupMarker = L.marker([12.9716, 77.5946]).addTo(map);
    const driverMarker = L.marker([12.975, 77.600]).addTo(map);

    setTimeout(() => {
      try { map.invalidateSize(); } catch (e) {}
    }, 300);

    return { map, pickupMarker, driverMarker, baseLayers };
  }

  getUserLocation(map) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          map.setView([lat, lng], 13);
          if (this.mapState && this.mapState.pickupMarker) {
            this.mapState.pickupMarker.setLatLng([lat, lng]);
          }
          
          console.log('📍 User location set:', lat, lng);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          console.log('Using default location (Bangalore)');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.warn('Geolocation not supported');
    }
  }

  setMapStyle(style) {
    const ms = this.mapState;
    if (!ms || !ms.baseLayers || !ms.map) return;

    if (!ms.baseLayers[style]) style = 'light';

    Object.values(ms.baseLayers).forEach(layer => {
      if (ms.map.hasLayer(layer)) {
        ms.map.removeLayer(layer);
      }
    });

    ms.baseLayers[style].addTo(ms.map);
    this.currentMapStyle = style;

    try {
      localStorage.setItem('rr_map_style', style);
    } catch (e) {}
  }

  // Driver movement for Leaflet
  updateDriverMarker(location) {
    const ms = this.mapState;
    if (!ms || !ms.driverMarker) return;

    let lat, lng;
    if (Array.isArray(location)) [lat, lng] = location;
    else {
      lat = location.lat ?? location.latitude ?? location[0];
      lng = location.lng ?? location.longitude ?? location[1];
    }

    if (lat == null || lng == null) return;

    ms.driverMarker.setLatLng([lat, lng]);
    ms.map.panTo([lat, lng]);
  }

  // ===== SOCKET EVENTS =====
  setupSocketListeners() {
    this.socketManager.on('driver_assigned', data => {
      this.updateRideStatus('assigned');
      this.notificationManager.show(`Driver ${data.driverName} assigned`, 'success');
    });

    this.socketManager.on('driver_arriving', data => {
      this.updateRideStatus('arriving');
      this.startETACountdown(data.eta);
    });

    this.socketManager.on('trip_started', () => {
      this.updateRideStatus('on_trip');
      this.notificationManager.show('Trip started', 'info');
    });

    this.socketManager.on('trip_completed', data => {
      this.updateRideStatus('completed');
      this.notificationManager.show('Trip completed successfully', 'success');
      this.showTripSummary(data);
    });

    this.socketManager.on('driver_location_update', data => {
      this.updateDriverMarker(data.location);
    });

    this.socketManager.on('route_deviation', () => {
      const deviationModal = document.getElementById('deviationModal');
      deviationModal && deviationModal.classList.add('active');
    });

    this.socketManager.on('notification', (data) => {
      this.notificationManager.addNotification(data);
    });
  }

  // ===== ETA, HISTORY, SUPPORT, LOGOUT =====
  startETACountdown(initialETA) {
    const etaElement = document.getElementById('etaCountdown');
    if (!etaElement) return;

    let remainingMinutes = initialETA;

    if (this.etaInterval) {
      clearInterval(this.etaInterval);
    }

    this.etaInterval = setInterval(() => {
      if (remainingMinutes > 0) {
        etaElement.textContent = `${remainingMinutes} mins`;
        remainingMinutes--;
      } else {
        etaElement.textContent = 'Arriving now';
        clearInterval(this.etaInterval);
      }
    }, 60000);
  }

  showTripSummary(data) {
    const currentRideCard = document.getElementById('currentRideCard');
    if (currentRideCard) {
      currentRideCard.style.display = 'none';
    }

    this.notificationManager.show(
      `Ride completed! Distance: ${data.distance}km, Fare: ₹${data.fare}`,
      'success'
    );

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
    this.notificationManager.show('Calling driver...', 'info');

    const deviationModal = document.getElementById('deviationModal');
    deviationModal && deviationModal.classList.remove('active');

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

  // ===== SOS =====
  triggerSOS() {
    console.log('🆘 SOS TRIGGERED');
    this.socketManager.emit('sos_alert', {
      riderId: 'current_rider_id',
      location: 'current_location',
      timestamp: new Date().toISOString()
    });
    
    this.notificationManager.show('Emergency services have been notified', 'warning');

    document.body.style.animation = 'flash 0.5s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }

  // ===== THEME HANDLING =====
  applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
    this.currentTheme = theme;
    try {
      localStorage.setItem('rr_theme', theme);
    } catch (e) {}
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DashboardController();
  console.log('🚀 RapidRide Dashboard initialized with Leaflet + theme & map styles');
});

export default DashboardController;

