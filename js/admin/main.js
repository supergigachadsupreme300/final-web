// js/admin/main.js - Main Admin Controller

// Navigation handler
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav_item_admin');
  
  navItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      switch(index) {
        case 0: showProductManagement(); break;
        case 1: showOrderManagement(); break;
        case 2: showUserManagement(); break;
        case 3: showImportManagement(); break;
        case 4: showInventoryManagement(); break;
        case 5: showStatistics(); break;
        case 6: handleLogout(); break;
      }
    });
  });
}

// Show product management
function showProductManagement() {
  document.querySelector('.header_admin-classification').style.display = 'block';
  document.querySelector('.header_admin-page-btn').style.display = 'block';
  document.querySelector('.header_admin-search').style.display = 'block';
  
  // Show table, hide statistics
  document.getElementById('table_container').style.display = 'block';
  document.getElementById('statistics_container').style.display = 'none';
  
  const tableHeader = document.getElementById('table_header');
  tableHeader.innerHTML = `
    <tr>
      <th>Mã SP</th>
      <th>Hình ảnh</th>
      <th>Tên sản phẩm</th>
      <th>Danh mục</th>
      <th>Giá</th>
      <th>Dung tích</th>
      <th>Chi tiết</th>
      <th>Sửa</th>
      <th>Xóa</th>
    </tr>
  `;
  
  document.getElementById('tbody_products').style.display = '';
  document.getElementById('tbody_orders').style.display = 'none';
  document.getElementById('tbody_users').style.display = 'none';
  document.getElementById('pagination').style.display = 'flex';
  
  defaultClassification();
}

// Show order management
function showOrderManagement() {
  document.querySelector('.header_admin-classification').style.display = 'none';
  document.querySelector('.header_admin-page-btn').style.display = 'none';
  document.querySelector('.header_admin-search').style.display = 'none';
  
  // Show table, hide statistics
  document.getElementById('table_container').style.display = 'block';
  document.getElementById('statistics_container').style.display = 'none';
  
  const tableHeader = document.getElementById('table_header');
  tableHeader.innerHTML = `
    <tr>
      <th>Mã ĐH</th>
      <th>Tài khoản</th>
      <th>Khách hàng</th>
      <th>SĐT</th>
      <th>SL</th>
      <th>Tổng tiền</th>
      <th>Trạng thái</th>
      <th>Thao tác</th>
    </tr>
  `;
  
  document.getElementById('tbody_products').style.display = 'none';
  document.getElementById('tbody_orders').style.display = '';
  document.getElementById('tbody_users').style.display = 'none';
  document.getElementById('pagination').style.display = 'flex'; // Show pagination for orders
  
  renderOrdersManagementPage();
}

// Show user management
function showUserManagement() {
  document.querySelector('.header_admin-classification').style.display = 'none';
  document.querySelector('.header_admin-page-btn').style.display = 'none';
  document.querySelector('.header_admin-search').style.display = 'none';
  
  // Show table, hide statistics
  document.getElementById('table_container').style.display = 'block';
  document.getElementById('statistics_container').style.display = 'none';
  
  const tableHeader = document.getElementById('table_header');
  tableHeader.innerHTML = `
    <tr>
      <th colspan="8" style="padding: 0;">
        <div class="user-management-header">
          <h2 style="margin: 0; color: #667eea;">
            <i class="fa-solid fa-users"></i> Quản Lý Tài Khoản
          </h2>
          <button class="btn_admin btn_admin-submit" onclick="showAddUserForm()">
            <i class="fa-solid fa-user-plus"></i> Thêm tài khoản
          </button>
        </div>
      </th>
    </tr>
    <tr>
      <th colspan="8" style="padding: 0;">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="fa-solid fa-users"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value" id="stat-total">0</div>
              <div class="stat-label">Tổng tài khoản</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value" id="stat-active">0</div>
              <div class="stat-label">Hoạt động</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="fa-solid fa-user-lock"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value" id="stat-locked">0</div>
              <div class="stat-label">Đã khóa</div>
            </div>
          </div>
        </div>
      </th>
    </tr>
    <tr>
      <th>STT</th>
      <th>Tài khoản</th>
      <th>Email</th>
      <th>Ngày tham gia</th>
      <th>Đơn hàng</th>
      <th>Trạng thái</th>
      <th>Sửa</th>
      <th>Khóa</th>
    </tr>
  `;
  
  document.getElementById('tbody_products').style.display = 'none';
  document.getElementById('tbody_orders').style.display = 'none';
  document.getElementById('tbody_users').style.display = '';
  document.getElementById('pagination').style.display = 'none';
  
  renderUserManagementPage();
}

// Show statistics
function showStatistics() {
  document.querySelector('.header_admin-classification').style.display = 'none';
  document.querySelector('.header_admin-page-btn').style.display = 'none';
  document.querySelector('.header_admin-search').style.display = 'none';
  
  // Hide table, show statistics
  document.getElementById('table_container').style.display = 'none';
  document.getElementById('statistics_container').style.display = 'block';
  
  renderStatisticsPage();
}

// Show import management
function showImportManagement() {
  document.querySelector('.header_admin-classification').style.display = 'none';
  document.querySelector('.header_admin-page-btn').style.display = 'none';
  document.querySelector('.header_admin-search').style.display = 'block';
  
  // Show table, hide statistics
  document.getElementById('table_container').style.display = 'block';
  document.getElementById('statistics_container').style.display = 'none';
  
  const tableHeader = document.getElementById('table_header');
  tableHeader.innerHTML = `
    <tr>
      <th colspan="8" style="text-align: right; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px;">
        <button class="btn_admin btn_admin-submit" onclick="showAddImportForm()" style="font-size: 14px;">
          <i class="fa-solid fa-plus"></i> Tạo phiếu nhập
        </button>
      </th>
    </tr>
    <tr>
      <th>STT</th>
      <th>Mã phiếu</th>
      <th>Ngày nhập</th>
      <th>Số SP</th>
      <th>Tổng SL</th>
      <th>Chi phí</th>
      <th>Trạng thái</th>
      <th>Thao tác</th>
    </tr>
  `;
  
  document.getElementById('tbody_products').style.display = '';
  document.getElementById('tbody_orders').style.display = 'none';
  document.getElementById('tbody_users').style.display = 'none';
  document.getElementById('pagination').style.display = 'none';
  
  renderImportsManagementPage();
}

// Show inventory management
function showInventoryManagement() {
  document.querySelector('.header_admin-classification').style.display = 'none';
  document.querySelector('.header_admin-page-btn').style.display = 'none';
  document.querySelector('.header_admin-search').style.display = 'block';
  
  // Show table, hide statistics
  document.getElementById('table_container').style.display = 'block';
  document.getElementById('statistics_container').style.display = 'none';
  
  const tableHeader = document.getElementById('table_header');
  tableHeader.innerHTML = `
    <tr>
      <th colspan="8" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 15px;">
        <h3 style="margin: 0; color: white; text-align: center;">
          <i class="fa-solid fa-warehouse"></i> Quản Lý Tồn Kho
        </h3>
      </th>
    </tr>
    <tr>
      <th>Hình ảnh</th>
      <th>Tên sản phẩm</th>
      <th>Danh mục</th>
      <th>Tồn kho</th>
      <th>Giá nhập</th>
      <th>Giá bán</th>
      <th>Lợi nhuận</th>
      <th>Thao tác</th>
    </tr>
  `;
  
  document.getElementById('tbody_products').style.display = '';
  document.getElementById('tbody_orders').style.display = 'none';
  document.getElementById('tbody_users').style.display = 'none';
  document.getElementById('pagination').style.display = 'none';
  
  renderInventoryManagementPage();
}

// Handle logout
function handleLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    showNotification('Đã đăng xuất thành công!');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// Setup category dropdown
function setupCategoryDropdown() {
  const categorySelect = document.querySelector('.classification_select');
  const categoryOptions = document.querySelector('.classification_option');
  
  if (!categorySelect) return;
  
  categorySelect.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryOptions.classList.toggle('active');
  });
  
  document.addEventListener('click', () => {
    categoryOptions.classList.remove('active');
  });
}


// Initialize admin panel
function initAdminPanel() {
  setupNavigation();
  setupCategoryDropdown();
  initProductManagement();
  showProductManagement();
  initUserManagement();
  renderStatisticsPage();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
  initAdminPanel();
}

// Export functions
window.showProductManagement = showProductManagement;
window.showOrderManagement = showOrderManagement;
window.showUserManagement = showUserManagement;
window.showImportManagement = showImportManagement;
window.showInventoryManagement = showInventoryManagement;
window.showStatistics = showStatistics;
window.handleLogout = handleLogout;
