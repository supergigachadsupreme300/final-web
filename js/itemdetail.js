let currentProduct = null;

function showProductDetail(id) { // id sản phẩm
  const p = window.products.find(x => x.id === id);  // Tìm sản phẩm theo id
  if (!p) return;
  currentProduct = p;

  const detail = document.getElementById('product-detail');
  detail.innerHTML = `
    <div class="detail-wrapper">
      <button class="btn-back-list">Quay lại danh sách</button>
      <div class="detail-card">
        <img src="${p.image}" class="detail-img" alt="${p.name}" onerror="this.src='img/product/default.png'">
        
        <div class="detail-info">
          <h1 class="detail-title">${p.name}</h1>
          <p class="detail-price">${p.price.toLocaleString()} VNĐ</p>
          <p class="detail-desc">${p.description}</p>
          <p><strong>Dung tích:</strong> <span class="detail-volume">${p.volume}</span></p>
          <p><strong>Thương hiệu:</strong> <span class="detail-brand">${p.brand}</span></p>
          <p><strong>số lượng:</strong> <span class="detail-quantity">${p.quantity}</span></p>
          <div class="detail-actions">
            <div class="qty-group">
              <button class="qty-decrease">-</button>
              <input type="number" class="qty-input" value="1" min="1">
              <button class="qty-increase">+</button>
            </div>
            <button class="btn-add-cart">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelector('.products-grid').style.display = 'none';
  detail.style.display = 'block';

  // === SỰ KIỆN ===
  detail.querySelector('.btn-back-list').onclick = hideProductDetail;
  attachQtyEvents(detail);
  detail.querySelector('.btn-add-cart').onclick = addFromDetail;
}

function hideProductDetail() {
  const detail = document.getElementById('product-detail');
  detail.style.display = 'none';
  document.querySelector('.products-grid').style.display = 'block';
}

function attachQtyEvents(container) {
  const input = container.querySelector('.qty-input');
  container.querySelector('.qty-increase').onclick = () => {
    if(input.value < currentProduct.quantity) input.value = parseInt(input.value) + 1;
  }
    container.querySelector('.qty-decrease').onclick = () => {
    if (input.value > 1) input.value--;
  };
}

function addFromDetail() {
  const qty = parseInt(document.querySelector('.qty-input').value) || 1;
  if (!isLoggedIn()) {
    alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
    return;
  }
  if (qty > currentProduct.quantity) {
    alert(`Số lượng trong kho không đủ! Hiện có: ${currentProduct.quantity}`);
    return;
  }
  addToCart(currentProduct.name, currentProduct.price, qty);
  alert(`Đã thêm ${qty} "${currentProduct.name}" vào giỏ!`);
}

// Export để dùng ở script.js
window.showProductDetail = showProductDetail;
window.hideProductDetail = hideProductDetail;