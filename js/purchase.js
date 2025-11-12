function renderCheckoutSummary() {
  const container = document.getElementById("checkout-items"); // Nơi hiển thị tóm tắt đơn hàng
  const totalEl = document.getElementById("checkout-total-price"); // Nơi hiển thị tổng tiền
  if (!container || !totalEl) return;

  const userName = localStorage.getItem("userName");
  if (!userName) {
    container.innerHTML = '<p class="cart-empty">Vui lòng đăng nhập.</p>';
    totalEl.textContent = "0 VNĐ";
    return;
  }

  const cartKey = `cart_${userName}`; // Khóa giỏ hàng theo user
  const cart = JSON.parse(localStorage.getItem(cartKey) || "[]"); // Lấy giỏ hàng

  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">Giỏ hàng trống.</p>';
    totalEl.textContent = "0 VNĐ";
    return;
  }

  container.innerHTML = ""; 
  let total = 0; 
  cart.forEach(item => { 
    const qty = item.qty || 1;
    const itemTotal = item.price * qty;
    total += itemTotal;
    const div = document.createElement("div");
    div.className = "summary-row";
    div.innerHTML = `<span>${item.name} × ${qty}</span><span>${itemTotal.toLocaleString()} VNĐ</span>`;
    container.appendChild(div);
  });
  totalEl.textContent = total.toLocaleString() + " VNĐ";
}


//  Nút "Quay lại giỏ hàng"
document.querySelector(".btn-back").onclick = function () {
  document.querySelector(".checkout-page").style.display = "none";
  document.querySelector(".cart-page").style.display = "block";
  renderCart();
};
//  Trừ quantity sau khi mua
function updateInventoryAfterPurchase(cart) {
  let products = JSON.parse(localStorage.getItem('products')) || [];
  cart.forEach(item => {
    const product = products.find(p => p.name === item.name); // Tìm theo name hoặc id nếu có
    if (product) {
      product.quantity -= item.qty;
      if (product.quantity < 0) product.quantity = 0; // Tránh âm
    }
  });
  localStorage.setItem('products', JSON.stringify(products));
  
  // Cập nhật window.products để UI user refresh
  if (window.refreshProducts) window.refreshProducts();
}


//  Nút "Xác nhận đặt hàng"
document.querySelector(".btn-confirm").onclick = function () {
  const userName = localStorage.getItem("userName");
  if (!userName) {
    alert("Vui lòng đăng nhập trước khi đặt hàng!");
    switchPage(document.querySelector('[data-page="account"]'), "account");
    return;
  }

  const cartKey = `cart_${userName}`;
  const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  // Lấy thông tin thanh toán
  const payment = document.querySelector('input[name="payment"]:checked')?.value || "cash";
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value || "default";
  
// Trong .btn-confirm.onclick
  let address = "";
  if (delivery === "new") {
    address = document.getElementById("address-input").value.trim();
    if (!address) {  // Chỉ check rỗng, bỏ "|| address === 'Chưa có địa chỉ'"
      alert("Vui lòng nhập địa chỉ giao hàng hợp lệ!");
      return;
    }
  } else {  // delivery === "default"
    const userData = JSON.parse(localStorage.getItem(`user_${userName}`));
    address = userData?.address?.trim() || "";
    if (!address || address === "Chưa có địa chỉ") {
      alert("Vui lòng nhập địa chỉ mặc định trong phần Tài khoản trước khi thanh toán!");
      return;
    }
  }


  // Tạo đơn hàng
  const order = {
    code: 'DH' + Math.floor(Math.random() * 90000 + 10000), // Generate unique order code
    date: new Date().toLocaleString(),
    orderTime: new Date().toISOString(), // ISO format for admin compatibility
    items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty || 1 })),
    payment: payment === "cash" ? "Tiền mặt" : payment === "bank" ? "Chuyển khoản" : "Trực tuyến",
    address,
    status: "Chờ xác nhận",
    isVerify: 0 // 0: pending, 1: confirmed, -1: cancelled
  };

  // Lưu đơn hàng vào lịch sử user
  const userKey = `user_${userName}`;
  const userData = JSON.parse(localStorage.getItem(userKey)) || { orders: [] };
  userData.orders = userData.orders || [];
  userData.orders.push(order);
  localStorage.setItem(userKey, JSON.stringify(userData));

  // Lưu đơn hàng tạm để hiển thị trang donhang
  localStorage.setItem("lastOrder", JSON.stringify(order));

  // Xóa giỏ hàng
  localStorage.removeItem(cartKey);
  // Gọi hàm sau xóa giỏ
  updateInventoryAfterPurchase(cart);
  // Chuyển sang trang đơn hàng
  switchPage(document.querySelector('[data-page="donhang"]'), "donhang");
};

// Cập nhật địa chỉ mặc định
function updateDefaultAddress() {
  const userName = localStorage.getItem("userName");
  const defaultAddrEl = document.getElementById("default-address");
  if (!userName || !defaultAddrEl) return;

  const key = `user_${userName}`;
  const data = JSON.parse(localStorage.getItem(key));
  defaultAddrEl.textContent = data?.address
    ? data.address
    : "Vui lòng nhập địa chỉ trong phần Tài khoản.";
    
}

// Khi load trang, cập nhật sẵn tóm tắt đơn hàng (nếu có)
document.addEventListener("DOMContentLoaded", renderCheckoutSummary);


// Hiển thị/ẩn ô nhập địa chỉ mới dựa trên lựa chọn giao hàng
document.addEventListener('DOMContentLoaded', () => {
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]'); // Radio buttons chọn phương thức giao hàng
  const newAddressSection = document.querySelector('.new-address');  // Parent của input

  if (!newAddressSection) return; // Nếu không tìm thấy, dừng

  function toggleNewAddress() {
    const selected = document.querySelector('input[name="delivery"]:checked')?.value || 'default'; // Lấy giá trị đã chọn
    newAddressSection.classList.toggle('hidden', selected !== 'new'); // Hiện nếu chọn 'new', ẩn nếu chọn 'default'
  }

  toggleNewAddress();  // Ẩn ban đầu
  deliveryRadios.forEach(radio => radio.addEventListener('change', toggleNewAddress));
});