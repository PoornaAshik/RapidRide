// Notifications Module - Manages in-app notifications
export class NotificationManager {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 50;
  }

  // Show toast notification
  show(message, type = 'info', duration = 3000) {
    const toast = this.createToast(message, type);
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto remove
    setTimeout(() => {
      this.removeToast(toast);
    }, duration);
  }

  // Create toast element
  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = this.getIcon(type);
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">✕</button>
    `;

    // Add close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.removeToast(toast);
    });

    return toast;
  }

  // Get icon based on type
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  // Remove toast
  removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // Add notification to panel
  addNotification(notificationData) {
    this.notifications.unshift(notificationData);
    
    // Limit notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.updateNotificationPanel();
    this.updateNotificationBadge();

    // Show toast for new notification
    this.show(notificationData.title, 'info');
  }

  // Update notification panel
  updateNotificationPanel() {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;

    notificationList.innerHTML = '';

    this.notifications.forEach(notification => {
      const item = this.createNotificationItem(notification);
      notificationList.appendChild(item);
    });
  }

  // Create notification item
  createNotificationItem(notification) {
    const item = document.createElement('div');
    item.className = `notification-item ${notification.read ? '' : 'unread'}`;
    
    const icon = notification.icon || '📢';
    const timeAgo = this.getTimeAgo(notification.timestamp);

    item.innerHTML = `
      <span class="notif-icon">${icon}</span>
      <div class="notif-content">
        <p class="notif-title">${notification.title}</p>
        <p class="notif-text">${notification.message}</p>
        <span class="notif-time">${timeAgo}</span>
      </div>
    `;

    // Mark as read when clicked
    item.addEventListener('click', () => {
      this.markAsRead(notification.id);
      item.classList.remove('unread');
    });

    return item;
  }

  // Calculate time ago
  getTimeAgo(timestamp) {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateNotificationBadge();
    }
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateNotificationBadge();
    this.updateNotificationPanel();
  }

  // Update notification badge count
  updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;

    const unreadCount = this.notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  // Get all notifications
  getAll() {
    return this.notifications;
  }

  // Get unread notifications
  getUnread() {
    return this.notifications.filter(n => !n.read);
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.updateNotificationPanel();
    this.updateNotificationBadge();
  }

  // Request browser notification permission
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/assets/images/logo.png',
        badge: '/assets/images/badge.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
}

// Add toast styles dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast {
    position: fixed;
    bottom: -100px;
    right: 30px;
    background: white;
    border-radius: 10px;
    padding: 15px 20px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    max-width: 400px;
    z-index: 10000;
    transition: all 0.3s ease;
    border-left: 4px solid #2E4053;
  }

  .toast.show {
    bottom: 30px;
  }

  .toast-icon {
    font-size: 24px;
  }

  .toast-message {
    flex: 1;
    font-size: 14px;
    color: #2E4053;
    font-weight: 600;
  }

  .toast-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
  }

  .toast-close:hover {
    color: #2E4053;
  }

  .toast-success {
    border-left-color: #27ae60;
  }

  .toast-error {
    border-left-color: #e74c3c;
  }

  .toast-warning {
    border-left-color: #f39c12;
  }

  .toast-info {
    border-left-color: #3498db;
  }

  @media (max-width: 480px) {
    .toast {
      right: 15px;
      left: 15px;
      min-width: auto;
    }

    .toast.show {
      bottom: 15px;
    }
  }
`;

document.head.appendChild(toastStyles);

export default NotificationManager;