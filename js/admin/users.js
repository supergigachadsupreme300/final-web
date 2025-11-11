// js/admin/users.js - User Management Module

// Render user management page
const renderUserManagementPage = () => {
  const tbody = document.getElementById('tbody_users');
  if (!tbody) return;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const regularUsers = users.filter(u => !u.isAdmin);

  const totalUsers = regularUsers.length;
  const activeUsers = regularUsers.filter(u => !u.isLocked).length;
  const lockedUsers = regularUsers.filter(u => u.isLocked).length;

  if (regularUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          <i class="fa-solid fa-user-slash" style="font-size: 48px; color: #ccc;"></i>
          <p style="color: #999; margin-top: 10px;">Chưa có tài khoản nào</p>
        </td>
      </tr>
    `;
    return;
  }

  const htmls = regularUsers.map((user, index) => {
    const orderCount = user.orders ? user.orders.length : 0;
    const joinDate = user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN') : 'N/A';
    const statusClass = user.isLocked ? 'locked' : 'active';
    const statusText = user.isLocked ? 'Đã khóa' : 'Hoạt động';

    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${user.username}</strong></td>
        <td>${user.email || 'N/A'}</td>
        <td>${joinDate}</td>
        <td>${orderCount}</td>
        <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-action btn-edit" onclick="showEditUserForm('${user.username}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </td>
        <td>
          <button class="btn-action ${user.isLocked ? 'btn-unlock' : 'btn-lock'}" 
                  onclick="toggleLockUser('${user.username}')">
            <i class="fa-solid fa-${user.isLocked ? 'unlock' : 'lock'}"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = htmls;

  // Update stats
  document.getElementById('stat-total').textContent = totalUsers;
  document.getElementById('stat-active').textContent = activeUsers;
  document.getElementById('stat-locked').textContent = lockedUsers;
};

// Show add user form
function showAddUserForm() {
  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin" id="form_addUser">
      <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">
        <i class="fa-solid fa-user-plus"></i> Thêm Tài Khoản Mới
      </h2>
      
      <div class="form_controll_admin">
        <label for="username_admin">Tên đăng nhập *</label>
        <input required type="text" id="username_admin" placeholder="Nhập tên đăng nhập..." />
      </div>

      <div class="form_controll_admin">
        <label for="password_admin">Mật khẩu *</label>
        <input required type="password" id="password_admin" placeholder="Nhập mật khẩu..." />
      </div>

      <div class="form_controll_admin">
        <label for="email_admin">Email</label>
        <input type="email" id="email_admin" placeholder="Nhập email..." />
      </div>

      <div class="form_controll_admin" style="display: flex; gap: 10px; justify-content: center;">
        <button type="submit" class="btn_admin btn_admin-submit">
          <i class="fa-solid fa-plus"></i> Thêm tài khoản
        </button>
        <button type="button" onclick="overlayClose()" class="btn_admin btn_admin-cancel">
          <i class="fa-solid fa-xmark"></i> Hủy
        </button>
      </div>
    </form>
  `;

  showOverlay(formHTML);

  const form = document.getElementById('form_addUser');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAddUser();
  });
}

// Handle add user
function handleAddUser() {
  const username = document.getElementById('username_admin').value.trim();
  const password = document.getElementById('password_admin').value.trim();
  const email = document.getElementById('email_admin').value.trim();

  if (!username || !password) {
    showNotification('Vui lòng nhập tên đăng nhập và mật khẩu!', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.find(u => u.username === username)) {
    showNotification('Tên đăng nhập đã tồn tại!', 'error');
    return;
  }

  const newUser = {
    username,
    password,
    email: email || '',
    name: '',
    phone: '',
    isAdmin: false,
    isLocked: false,
    orders: [],
    joinDate: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  showNotification('Thêm tài khoản thành công!');
  overlayClose();
  renderUserManagementPage();
}

// Show edit user form
function showEditUserForm(username) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username);

  if (!user) {
    showNotification('Không tìm thấy tài khoản!', 'error');
    return;
  }

  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin" id="form_editUser">
      <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">
        <i class="fa-solid fa-user-edit"></i> Chỉnh Sửa Tài Khoản
      </h2>
      
      <div class="form_controll_admin">
        <label for="username_admin">Tên đăng nhập</label>
        <input type="text" id="username_admin" value="${user.username}" disabled style="background: #f5f5f5;" />
      </div>

      <div class="form_controll_admin">
        <label for="password_admin">Mật khẩu mới (để trống nếu không đổi)</label>
        <input type="password" id="password_admin" placeholder="Nhập mật khẩu mới..." />
      </div>

      <div class="form_controll_admin">
        <label for="email_admin">Email</label>
        <input type="email" id="email_admin" value="${user.email || ''}" placeholder="Nhập email..." />
      </div>

      <div class="form_controll_admin" style="display: flex; gap: 10px; justify-content: center;">
        <button type="submit" class="btn_admin btn_admin-submit">
          <i class="fa-solid fa-check"></i> Cập nhật
        </button>
        <button type="button" onclick="overlayClose()" class="btn_admin btn_admin-cancel">
          <i class="fa-solid fa-xmark"></i> Hủy
        </button>
      </div>
    </form>
  `;

  showOverlay(formHTML);

  const form = document.getElementById('form_editUser');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const password = document.getElementById('password_admin').value.trim();
    const email = document.getElementById('email_admin').value.trim();

    const userIndex = users.findIndex(u => u.username === username);

    if (password) {
      users[userIndex].password = password;
    }
    users[userIndex].email = email;

    localStorage.setItem('users', JSON.stringify(users));

    showNotification('Cập nhật tài khoản thành công!');
    overlayClose();
    renderUserManagementPage();
  });
}

// Toggle lock user
function toggleLockUser(username) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    showNotification('Không tìm thấy tài khoản!', 'error');
    return;
  }

  const currentStatus = users[userIndex].isLocked;
  const action = currentStatus ? 'mở khóa' : 'khóa';

  if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${username}"?`)) {
    return;
  }

  users[userIndex].isLocked = !currentStatus;
  localStorage.setItem('users', JSON.stringify(users));

  showNotification(`Đã ${action} tài khoản thành công!`);
  renderUserManagementPage();
}

// Export functions
window.renderUserManagementPage = renderUserManagementPage;
window.showAddUserForm = showAddUserForm;
window.showEditUserForm = showEditUserForm;
window.toggleLockUser = toggleLockUser;
