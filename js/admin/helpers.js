// js/admin/helpers.js - Helper Functions

// Helper function to format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

// Helper function to close overlay
function overlayClose() {
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.classList.remove('active');
    const overlayContent = document.getElementById('overlay_content');
    if (overlayContent) {
      overlayContent.innerHTML = '';
    }
  }
}

// Helper function to show overlay
function showOverlay(content) {
  const overlay = document.getElementById('overlay');
  const overlayContent = document.getElementById('overlay_content');
  
  if (overlay && overlayContent) {
    overlayContent.innerHTML = content;
    overlay.classList.add('active');
  }
}

// Helper function to generate unique ID
function generateId() {
  return Date.now().toString();
}

// Helper function to show notification
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : 'linear-gradient(135deg, #f44336 0%, #e53935 100%)'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 99999;
    font-size: 15px;
    font-weight: 500;
    min-width: 250px;
    max-width: 400px;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Sync order status from admin panel back to end-user account
function syncAdminToEndUser(username, orderCode, isVerify) {
  const userKey = `user_${username}`;
  const userData = JSON.parse(localStorage.getItem(userKey));
  
  if (!userData || !userData.orders) return;
  
  // Find the order in end-user account
  const order = userData.orders.find(o => {
    // Match by code if available, or by date and items
    if (o.code) return o.code === orderCode;
    // Fallback matching logic can be added here
    return false;
  });
  
  if (order) {
    // Update status
    const statusMap = {
      0: 'Chờ xác nhận',
      1: 'Đã xác nhận',
      [-1]: 'Đã hủy'
    };
    order.status = statusMap[isVerify] || 'Chờ xác nhận';
    order.isVerify = isVerify;
    
    // Save back to end-user account
    localStorage.setItem(userKey, JSON.stringify(userData));
    console.log(`✅ Synced order ${orderCode} status to end-user ${username}`);
  }
}

// Export functions to global scope
window.formatCurrency = formatCurrency;
window.overlayClose = overlayClose;
window.showOverlay = showOverlay;
window.generateId = generateId;
window.showNotification = showNotification;
window.syncAdminToEndUser = syncAdminToEndUser;
