function switchToLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("accountForm").style.display = "none";
}

function switchToRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

function switchToAccount() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("accountForm").style.display = "flex";
}

function registerToLogin(event) {
  event.preventDefault();
  const userName = document.getElementById("registerInput").value;
  if (!userName) {
    alert("Vui lòng nhập tên đăng nhập!");
    return false;
  }
  const password = document.getElementById("password").value;
  const repeatedPassword = document.getElementById("repeatedPassword").value;
  if (password !== repeatedPassword) {
    alert("Vui lòng nhập đúng mật khẩu!");
    return false;
  }

  const userKey = `user_${userName}`;
  if (localStorage.getItem(userKey)) {
    alert("Tên đăng nhập đã tồn tại!");
    return false;
  }

  const userData = { password: password, name: "", phone: "", DOB: "", email: "", address: "", orders: [],userName: userName };
  localStorage.setItem(userKey, JSON.stringify(userData));
  alert("Đăng ký thành công");
  localStorage.setItem("userName", userName);  // Set session
  switchToAccount();
  hienThiDuLieu();
}

function Login(event) {
  event.preventDefault();
  const loginUserName = document.getElementById("loginUserName").value;
  const loginPassword = document.getElementById("loginPassword").value;

  const userKey = `user_${loginUserName}`;
  const userData = JSON.parse(localStorage.getItem(userKey));
  if (userData && userData.password === loginPassword) {
    alert("Đăng nhập thành công!");
    localStorage.setItem("userName", loginUserName);
    switchToAccount();
    hienThiDuLieu();
  } else {
    alert("Tên đăng nhập hoặc mật khẩu không đúng!");
  }
}

function logout() {
  const userName = localStorage.getItem("userName");
  if (!userName) {
    alert("Bạn chưa đăng nhập!");
    return;
  }

  //  XÓA GIỎ HÀNG CỦA USER NÀY
  const cartKey = `cart_${userName}`;
  localStorage.removeItem(cartKey);

  // XÓA TRẠNG THÁI ĐĂNG NHẬP (chỉ xóa userName, giữ password để đăng nhập lại)
  localStorage.removeItem("userName");

  // GIỮ LẠI DỮ LIỆU TÀI KHOẢN: `user_${userName}` → không xóa!

  alert("Đăng xuất thành công!");
  
  // Quay về form đăng nhập
  switchToLogin();
  
  // Chuyển về trang tài khoản để hiển thị form đăng nhập
  if (typeof switchPage === "function") {
    switchPage(document.querySelector('[data-page="account"]'), 'account');
  }
}

function luuDuLieu() {
  // Lấy userName để phân biệt dữ liệu từng người
  const userName = localStorage.getItem("userName");
  if (!userName) {
    alert("Vui lòng đăng nhập!");
    return;
  }

  // Dùng key riêng cho từng user: user_nguyenvana
  const key = `user_${userName}`;
  const existingData = JSON.parse(localStorage.getItem(key)) || { orders: [] };

  const data = {
    ...existingData, // Giữ lại các dữ liệu cũ như orders
    name: document.getElementById("customer-name").value,
    phone: document.getElementById("customer-phone").value,
    DOB: document.getElementById("customer-DOB").value,
    userName: userName, // Gán lại để đảm bảo
    email: document.getElementById("customer-email").value,
    address: document.getElementById("customer-address").value,
  };

  //  Lưu vào key riêng, không ghi đè chung
  localStorage.setItem(key, JSON.stringify(data));
  alert("Lưu dữ liệu thành công!");
}

function hienThiDuLieu() {
  // Chỉ hiển thị dữ liệu của user đang đăng nhập
  const userName = localStorage.getItem("userName");
  if (!userName) return;

  const key = `user_${userName}`;
  const data = JSON.parse(localStorage.getItem(key));

  if (!data) return;

  document.getElementById("customer-name").value = data.name || "";
  document.getElementById("customer-phone").value = data.phone || "";
  document.getElementById("customer-DOB").value = data.DOB || "";
  document.getElementById("customer-user-name").value = data.userName || "";
  document.getElementById("customer-email").value = data.email || "";
  document.getElementById("customer-address").value = data.address || "";
}

// Gọi hienThiDuLieu() thay vì đọc chung
window.onload = function () {
  hienThiDuLieu(); // Đảm bảo chỉ load dữ liệu của user hiện tại
};


function updateAfterLogin() {
  if ((document.getElementById("accountForm").display = "none")) {
    alert("Hãy đăng nhập trước khi mua hàng nhé!");
    switchPage(document.querySelector('[data-page="account"]'), "account");
  }

  // Đã đăng nhập → mở thanh toán
  document.querySelector(".cart-page").style.display = "none";
  document.querySelector(".checkout-page").style.display = "block";
  if (typeof renderCheckoutSummary === "function") renderCheckoutSummary();
}

/**
 * Kiểm tra người dùng đã đăng nhập chưa
 * @returns {boolean} true nếu đã đăng nhập
 */

function updateDefaultAddress() {
  // Hiển thị địa chỉ của user hiện tại
  const userName = localStorage.getItem("userName");
  const defaultAddrEl = document.getElementById("default-address");
  if (!userName || !defaultAddrEl) return;

  const key = `user_${userName}`;
  const data = JSON.parse(localStorage.getItem(key));
  defaultAddrEl.textContent = data?.address ? data.address : "Vui lòng nhập địa chỉ trong phần Tài khoản.";
}
//lịch sử đơn hàng
// Hiển thị trang lịch sử đơn hàng
function showOrderHistory() {
  document.getElementById("accountForm").style.display = "none";
  document.getElementById("order-history").style.display = "block";
  renderOrderHistory();
}

// Quay lại form thông tin cá nhân
function backToAccount() {
  document.getElementById("order-history").style.display = "none";
  document.getElementById("accountForm").style.display = "flex";
}

// Render danh sách đơn hàng
function renderOrderHistory() {
  // THAY ĐỔI 7: Kiểm tra đăng nhập + dùng key riêng
  const userName = localStorage.getItem("userName");
  if (!userName) {
    document.getElementById("order-history").innerHTML = `
      <div style="margin-bottom:15px;">
        <button onclick="backToAccount()" class="submit-button">Quay lại</button>
      </div>
      <p>Bạn cần đăng nhập.</p>
    `;
    return;
  }

  const key = `user_${userName}`;
  const data = JSON.parse(localStorage.getItem(key));
  const historyContainer = document.getElementById("order-history");

  let html = `
    <div style="margin-bottom:15px;">
      <button onclick="backToAccount()" class="submit-button">Quay lại</button>
    </div>
  `;

  if (!data || !data.orders || data.orders.length === 0) {
    html += '<p style="text-align:center; color:#999;">Chưa có đơn hàng nào.</p>';
  } else {
    data.orders.forEach((order, index) => {
      let total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);

      // THÊM TRẠNG THÁI VỚI MÀU SẮC
      let statusColor = "";
      let statusText = order.status || "Chờ xác nhận";  // Mặc định nếu chưa có
      if (statusText === "Chờ xác nhận") statusColor = "color: #3498db;";  // Xanh dương
      if (statusText === "Đang giao") statusColor = "color: #f39c12;";     // Cam
      if (statusText === "Hoàn thành") statusColor = "color: #27ae60;";    // Xanh lá
      if (statusText === "Đã hủy") statusColor = "color: #e74c3c;";        // Đỏ

      html += `
        <div class="order-item">
          <h3>Đơn hàng #${index + 1} <small style="color:#666;">(${order.date})</small></h3>
          <p><strong>Trạng thái:</strong> <span style="${statusColor} font-weight: bold;">${statusText}</span></p>  <!-- ← THÊM DÒNG NÀY -->
          <div class="order-items">
            ${order.items.map(item => `
              <div>
                <span>${item.name} × ${item.qty}</span>
                <span>${(item.price * item.qty).toLocaleString()} VNĐ</span>
              </div>
            `).join('')}
          </div>
          <p><strong>Tổng cộng:</strong> ${total.toLocaleString()} VNĐ</p>
          <p><strong>Thanh toán:</strong> ${order.payment}</p>
          <p><strong>Địa chỉ:</strong> ${order.address}</p>
        </div>
      `;
    });
  }

  historyContainer.innerHTML = html;
}