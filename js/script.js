// js/script.js

function isLoggedIn() {
  return localStorage.getItem("userName") !== null;
}
// LẤY SẢN PHẨM TỪ localStorage
window.products = window.getProducts();

// TỰ ĐỘNG CẬP NHẬT KHI ADMIN SỬA (trong tab khác)
window.addEventListener('storage', (e) => {
  if (e.key === 'products') {
    window.refreshProducts();
  }
});

// js/script.js
function switchPage(link, pageId) {
  const page = document.getElementById(pageId);
  if (!page) return console.error(`Trang #${pageId} không tồn tại!`);

  // === CHẶN TRUY CẬP GIỎ HÀNG NẾU CHƯA ĐĂNG NHẬP ===
  if (pageId === "purchase") {
    if (!isLoggedIn()) {
      alert("Vui lòng đăng nhập để xem giỏ hàng!");
      switchPage(document.querySelector('[data-page="account"]'), "account");
      return;
    } else {
      document.querySelector(".checkout-page").style.display = "none";
      document.querySelector(".cart-page").style.display = "block";
      loadCart();
    }
  }
  if (pageId === "account") {
    // Nếu đã đăng nhập, chuyển sang trang thông tin tài khoản
    if (isLoggedIn()) {
      switchToAccount();
    }
  }
  // Ẩn tất cả trang
  document
    .querySelectorAll(".page-section")
    .forEach((p) => (p.style.display = "none"));
  page.style.display = "block";

  // Active menu
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  if (link) link.classList.add("active");

  // Khởi tạo nội dung trang
  if (pageId === "products") initProductsPage();
  if (pageId === "donhang") showDonHangPage();
}

// Export toàn cục
window.switchPage = switchPage;
window.isLoggedIn = isLoggedIn; // Đảm bảo hàm có thể dùng ở nơi khác

// Kiểm tra khi load trang
document.addEventListener("DOMContentLoaded", () => {
  const currentHash = window.location.hash.slice(1);
  if (currentHash === "purchase" && !isLoggedIn()) {
    alert("Vui lòng đăng nhập để xem giỏ hàng!");
    window.location.hash = "#account";
    switchPage(document.querySelector('[data-page="account"]'), "account");
  }
});
