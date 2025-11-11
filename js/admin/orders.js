// js/admin/orders.js - Order Management Module

// Pagination state for orders
let currentOrderPage = 1;
const ordersPerPage = 10;

// Render orders management page
const renderOrdersManagementPage = (page = 1) => {
  currentOrderPage = page;
  const tbody = document.getElementById('tbody_orders');
  if (!tbody) return;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  console.log('📊 Total users:', users.length);
  
  let allOrders = [];

  users.forEach(user => {
    if (user.orders && user.orders.length > 0) {
      console.log(`👤 User ${user.username} has ${user.orders.length} orders`);
      user.orders.forEach(order => {
        console.log(`  📦 Order ${order.code}:`, {
          orderTime: order.orderTime,
          products: order.products?.length || 0,
          isVerify: order.isVerify
        });
        
        // Filter out orders with invalid orderTime
        if (order.orderTime && order.orderTime !== 'Invalid Date' && !isNaN(new Date(order.orderTime).getTime())) {
          allOrders.push({
            ...order,
            username: user.username,
            userEmail: user.email || 'N/A'
          });
        } else {
          console.warn(`⚠️ Skipping order with invalid date:`, order);
        }
      });
    }
  });

  console.log('📊 Total valid orders:', allOrders.length);
  allOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

  if (allOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          <i class="fa-solid fa-box-open" style="font-size: 48px; color: #ccc;"></i>
          <p style="color: #999; margin-top: 10px;">Chưa có đơn hàng nào</p>
        </td>
      </tr>
    `;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  // Calculate pagination
  const totalPages = Math.ceil(allOrders.length / ordersPerPage);
  const startIndex = (currentOrderPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = allOrders.slice(startIndex, endIndex);

  const htmls = paginatedOrders.map(order => {
    const statusClass = order.isVerify === 0 ? 'pending' : order.isVerify === 1 ? 'completed' : 'cancelled';
    const statusText = order.isVerify === 0 ? 'Chờ xử lý' : order.isVerify === 1 ? 'Đã xác nhận' : 'Đã hủy';
    
    // Safe check for products
    const products = order.products || [];
    const totalProducts = products.reduce((sum, p) => sum + (p.qty || 0), 0);
    
    return `
      <tr class="order-row">
        <td><span class="order-code">${order.code}</span></td>
        <td>${order.username}</td>
        <td>${order.infoUser?.name || 'N/A'}</td>
        <td>${order.infoUser?.phone || 'N/A'}</td>
        <td>${totalProducts}</td>
        <td>${formatCurrency(order.totalPrice)}</td>
        <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-action btn-view" onclick="showOrderDetail('${order.code}', '${order.username}')">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${order.isVerify === 0 ? `
            <button class="btn-action btn-confirm" onclick="confirmOrder('${order.code}', '${order.username}')">
              <i class="fa-solid fa-check"></i>
            </button>
            <button class="btn-action btn-cancel" onclick="cancelOrder('${order.code}', '${order.username}')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  });

  try {
    const joinedHtml = htmls.join('');
    tbody.innerHTML = joinedHtml;
    console.log('✅ Orders rendered successfully');
    
    // Render pagination
    renderOrderPagination(totalPages, allOrders.length);
  } catch (error) {
    console.error('❌ Error rendering orders:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #f44336;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px;"></i>
          <p style="margin-top: 10px;">Lỗi hiển thị đơn hàng: ${error.message}</p>
        </td>
      </tr>
    `;
    document.getElementById('pagination').innerHTML = '';
  }
};

// Render pagination for orders
function renderOrderPagination(totalPages, totalOrders) {
  const paginationDiv = document.getElementById('pagination');
  if (!paginationDiv) return;

  if (totalPages <= 1) {
    paginationDiv.innerHTML = '';
    return;
  }

  let paginationHTML = `
    <div class="pagination-info">
      Hiển thị ${(currentOrderPage - 1) * ordersPerPage + 1} - ${Math.min(currentOrderPage * ordersPerPage, totalOrders)} 
      trong tổng số ${totalOrders} đơn hàng
    </div>
    <div class="pagination-controls">
  `;

  // Previous button
  if (currentOrderPage > 1) {
    paginationHTML += `
      <button class="page-btn" onclick="renderOrdersManagementPage(${currentOrderPage - 1})">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    `;
  }

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentOrderPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `
      <button class="page-btn" onclick="renderOrdersManagementPage(1)">1</button>
    `;
    if (startPage > 2) {
      paginationHTML += `<span class="page-dots">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="page-btn ${i === currentOrderPage ? 'active' : ''}" 
              onclick="renderOrdersManagementPage(${i})">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="page-dots">...</span>`;
    }
    paginationHTML += `
      <button class="page-btn" onclick="renderOrdersManagementPage(${totalPages})">${totalPages}</button>
    `;
  }

  // Next button
  if (currentOrderPage < totalPages) {
    paginationHTML += `
      <button class="page-btn" onclick="renderOrdersManagementPage(${currentOrderPage + 1})">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;
  }

  paginationHTML += `</div>`;
  paginationDiv.innerHTML = paginationHTML;
}

// Show order detail
function showOrderDetail(orderCode, username) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username);
  
  if (!user || !user.orders) {
    showNotification('Không tìm thấy đơn hàng!', 'error');
    return;
  }

  const order = user.orders.find(o => o.code === orderCode);
  if (!order) {
    showNotification('Không tìm thấy đơn hàng!', 'error');
    return;
  }

  const statusClass = order.isVerify === 0 ? 'pending' : order.isVerify === 1 ? 'completed' : 'cancelled';
  const statusText = order.isVerify === 0 ? 'Chờ xử lý' : order.isVerify === 1 ? 'Đã xác nhận' : 'Đã hủy';

  // Safe check for products
  const products = order.products || [];
  const productsHTML = products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.qty}</td>
      <td>${formatCurrency(p.price)}</td>
      <td>${formatCurrency(p.price * p.qty)}</td>
    </tr>
  `).join('');

  const detailHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <div class="order-detail-container">
      <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">
        <i class="fa-solid fa-receipt"></i> Chi Tiết Đơn Hàng
      </h2>
      
      <div class="order-info-section">
        <div class="info-row">
          <span class="info-label">Mã đơn hàng:</span>
          <span class="info-value order-code">${order.code}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-${statusClass}">${statusText}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Thời gian đặt:</span>
          <span class="info-value">${new Date(order.orderTime).toLocaleString('vi-VN')}</span>
        </div>
      </div>

      <div class="customer-info-section">
        <h3><i class="fa-solid fa-user"></i> Thông Tin Khách Hàng</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Tên:</span>
            <span class="info-value">${order.infoUser?.name || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">SĐT:</span>
            <span class="info-value">${order.infoUser?.phone || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${order.infoUser?.email || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Địa chỉ:</span>
            <span class="info-value">${order.infoUser?.address || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div class="products-section">
        <h3><i class="fa-solid fa-shopping-cart"></i> Sản Phẩm</h3>
        <table class="products-table">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; font-weight: bold;">Tổng cộng:</td>
              <td style="font-weight: bold; color: #667eea; font-size: 18px;">${formatCurrency(order.totalPrice)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="action-buttons" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        ${order.isVerify === 0 ? `
          <button class="btn_admin btn_admin-submit" onclick="confirmOrder('${orderCode}', '${username}'); overlayClose();">
            <i class="fa-solid fa-check"></i> Xác nhận
          </button>
          <button class="btn_admin btn_admin-cancel" onclick="cancelOrder('${orderCode}', '${username}'); overlayClose();">
            <i class="fa-solid fa-xmark"></i> Hủy đơn
          </button>
        ` : ''}
        <button class="btn_admin" onclick="overlayClose()" style="background: #6c757d;">
          <i class="fa-solid fa-arrow-left"></i> Đóng
        </button>
      </div>
    </div>
  `;

  showOverlay(detailHTML);
}

// Confirm order
function confirmOrder(orderCode, username) {
  if (!confirm('Xác nhận đơn hàng này?')) {
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    showNotification('Không tìm thấy người dùng!', 'error');
    return;
  }

  const orderIndex = users[userIndex].orders.findIndex(o => o.code === orderCode);
  if (orderIndex === -1) {
    showNotification('Không tìm thấy đơn hàng!', 'error');
    return;
  }

  const order = users[userIndex].orders[orderIndex];
  
  // Update product quantities in inventory
  const products = JSON.parse(localStorage.getItem('products')) || [];
  let productUpdateSuccess = true;
  
  if (order.products && order.products.length > 0) {
    order.products.forEach(orderProduct => {
      const productIndex = products.findIndex(p => p.id === (orderProduct.id || orderProduct.productId));
      if (productIndex !== -1) {
        // Decrease quantity in stock
        const currentQty = products[productIndex].quantity || 0;
        const orderQty = orderProduct.qty || 0;
        products[productIndex].quantity = Math.max(0, currentQty - orderQty);
      } else {
        productUpdateSuccess = false;
      }
    });
    
    // Save updated products to localStorage
    if (productUpdateSuccess) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }

  // Update order status
  users[userIndex].orders[orderIndex].isVerify = 1;
  localStorage.setItem('users', JSON.stringify(users));
  
  // Sync back to end-user account
  if (typeof syncAdminToEndUser === 'function') {
    syncAdminToEndUser(username, orderCode, 1);
  }
  
  showNotification('Đã xác nhận đơn hàng thành công!');
  renderOrdersManagementPage(currentOrderPage); // Keep current page
  
  // Refresh statistics page if visible
  if (typeof renderStatisticsPage === 'function') {
    const statsContainer = document.getElementById('statistics_container');
    if (statsContainer && statsContainer.style.display !== 'none') {
      renderStatisticsPage();
    }
  }
  
  // Refresh inventory page if visible
  if (typeof renderInventoryManagementPage === 'function') {
    const tbody = document.getElementById('tbody_products');
    if (tbody && tbody.style.display !== 'none') {
      renderInventoryManagementPage();
    }
  }
}

// Cancel order
function cancelOrder(orderCode, username) {
  if (!confirm('Hủy đơn hàng này?')) {
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    showNotification('Không tìm thấy người dùng!', 'error');
    return;
  }

  const orderIndex = users[userIndex].orders.findIndex(o => o.code === orderCode);
  if (orderIndex === -1) {
    showNotification('Không tìm thấy đơn hàng!', 'error');
    return;
  }

  const order = users[userIndex].orders[orderIndex];
  
  // If order was confirmed (isVerify === 1), restore product quantities
  if (order.isVerify === 1) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (order.products && order.products.length > 0) {
      order.products.forEach(orderProduct => {
        const productIndex = products.findIndex(p => p.id === (orderProduct.id || orderProduct.productId));
        if (productIndex !== -1) {
          // Restore quantity back to stock
          const currentQty = products[productIndex].quantity || 0;
          const orderQty = orderProduct.qty || 0;
          products[productIndex].quantity = currentQty + orderQty;
        }
      });
      
      // Save updated products to localStorage
      localStorage.setItem('products', JSON.stringify(products));
    }
  }

  // Update order status to cancelled
  users[userIndex].orders[orderIndex].isVerify = -1;
  localStorage.setItem('users', JSON.stringify(users));
  
  // Sync back to end-user account
  if (typeof syncAdminToEndUser === 'function') {
    syncAdminToEndUser(username, orderCode, -1);
  }
  
  showNotification('Đã hủy đơn hàng!');
  renderOrdersManagementPage(currentOrderPage); // Keep current page
  
  // Refresh statistics page if visible
  if (typeof renderStatisticsPage === 'function') {
    const statsContainer = document.getElementById('statistics_container');
    if (statsContainer && statsContainer.style.display !== 'none') {
      renderStatisticsPage();
    }
  }
  
  // Refresh inventory page if visible
  if (typeof renderInventoryManagementPage === 'function') {
    const tbody = document.getElementById('tbody_products');
    if (tbody && tbody.style.display !== 'none') {
      renderInventoryManagementPage();
    }
  }
}

// Show add order form
function showAddOrderForm() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const products = JSON.parse(localStorage.getItem('products')) || [];
  
  const usersOptions = users
    .filter(u => !u.isAdmin)
    .map(u => `<option value="${u.username}">${u.name} (${u.username})</option>`)
    .join('');

  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin" id="form_addOrder" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
      <h2 style="text-align: center; color: #667eea; margin-bottom: 25px;">
        <i class="fa-solid fa-cart-plus"></i> Thêm Đơn Hàng Mới
      </h2>
      
      <!-- Thông tin khách hàng -->
      <div style="background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #667eea;">
        <h3 style="color: #667eea; margin-bottom: 15px; font-size: 16px;">
          <i class="fa-solid fa-user"></i> Thông tin khách hàng
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form_controll_admin" style="margin: 0;">
            <label for="order_user"><i class="fa-solid fa-user-tag"></i> Chọn khách hàng *</label>
            <select id="order_user" required onchange="autoFillUserInfo(this.value)">
              <option value="">-- Chọn khách hàng --</option>
              ${usersOptions}
            </select>
          </div>

          <div class="form_controll_admin" style="margin: 0;">
            <label for="order_name"><i class="fa-solid fa-signature"></i> Tên người nhận *</label>
            <input required type="text" id="order_name" placeholder="Nhập tên người nhận..." />
          </div>

          <div class="form_controll_admin" style="margin: 0;">
            <label for="order_phone"><i class="fa-solid fa-phone"></i> Số điện thoại *</label>
            <input required type="tel" id="order_phone" placeholder="Nhập số điện thoại..." pattern="[0-9]{10,11}" />
          </div>

          <div class="form_controll_admin" style="margin: 0;">
            <label for="order_payment"><i class="fa-solid fa-credit-card"></i> Thanh toán *</label>
            <select id="order_payment" required>
              <option value="Tiền mặt">💵 Tiền mặt</option>
              <option value="Chuyển khoản">🏦 Chuyển khoản</option>
              <option value="Ví điện tử">📱 Ví điện tử</option>
            </select>
          </div>
        </div>

        <div class="form_controll_admin" style="margin-top: 15px; margin-bottom: 0;">
          <label for="order_address"><i class="fa-solid fa-location-dot"></i> Địa chỉ giao hàng *</label>
          <textarea required id="order_address" rows="2" placeholder="Nhập địa chỉ giao hàng..."></textarea>
        </div>

        <div class="form_controll_admin" style="margin-top: 15px; margin-bottom: 0;">
          <label for="order_note"><i class="fa-solid fa-comment"></i> Ghi chú</label>
          <textarea id="order_note" rows="2" placeholder="Ghi chú đơn hàng (nếu có)..."></textarea>
        </div>
      </div>

      <!-- Chọn sản phẩm -->
      <div style="background: linear-gradient(135deg, #fff5f5 0%, #fff 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #11998e;">
        <h3 style="color: #11998e; margin-bottom: 15px; font-size: 16px;">
          <i class="fa-solid fa-box-open"></i> Chọn sản phẩm *
        </h3>
        
        <div style="background: white; border-radius: 8px; padding: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <input type="text" id="search_product" placeholder="🔍 Tìm kiếm sản phẩm..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" />
          </div>
          
          <div id="products_list" style="max-height: 300px; overflow-y: auto;">
            ${products.map(p => `
              <div class="product-item" data-name="${p.name.toLowerCase()}" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #f0f0f0; transition: all 0.3s ease;">
                <input type="checkbox" class="product_checkbox" value="${p.id}" id="product_${p.id}" style="width: 18px; height: 18px; cursor: pointer;" />
                <img src="${p.image}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onerror="this.src='img/product/smoothie-strawberry.png'" />
                <label for="product_${p.id}" style="flex: 1; cursor: pointer; font-size: 14px;">
                  <div style="font-weight: 600; color: #333; margin-bottom: 3px;">${p.name}</div>
                  <div style="color: #11998e; font-weight: 700;">${formatCurrency(p.price)}</div>
                  <div style="color: #999; font-size: 12px;">${p.category} • ${p.volume}</div>
                </label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button type="button" class="qty-btn minus" data-id="${p.id}" style="width: 28px; height: 28px; border: none; background: #f0f0f0; border-radius: 5px; cursor: pointer; font-weight: bold;" disabled>−</button>
                  <input type="number" class="product_qty" data-id="${p.id}" data-price="${p.price}" data-name="${p.name}" data-image="${p.image}" data-category="${p.category}" data-volume="${p.volume}" min="1" value="1" style="width: 50px; padding: 5px; border: 1px solid #ddd; border-radius: 5px; text-align: center; font-weight: 600;" disabled />
                  <button type="button" class="qty-btn plus" data-id="${p.id}" style="width: 28px; height: 28px; border: none; background: #f0f0f0; border-radius: 5px; cursor: pointer; font-weight: bold;" disabled>+</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Tổng tiền -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; color: white; text-align: center;">
        <div style="font-size: 14px; margin-bottom: 5px; opacity: 0.9;">
          <i class="fa-solid fa-receipt"></i> TỔNG THANH TOÁN
        </div>
        <div style="font-size: 32px; font-weight: bold;" id="order_total">0₫</div>
        <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;" id="order_items_count">Chưa chọn sản phẩm</div>
      </div>

      <!-- Buttons -->
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button type="submit" class="btn_admin btn_admin-submit" style="flex: 1; max-width: 200px; padding: 12px;">
          <i class="fa-solid fa-check"></i> Tạo đơn hàng
        </button>
        <button type="button" class="btn_admin btn_admin-cancel" onclick="overlayClose()" style="flex: 1; max-width: 200px; padding: 12px;">
          <i class="fa-solid fa-times"></i> Hủy
        </button>
      </div>
    </form>
  `;

  showOverlay(formHTML);

  // Auto fill user info
  window.autoFillUserInfo = (username) => {
    if (!username) return;
    const user = users.find(u => u.username === username);
    if (user) {
      document.getElementById('order_name').value = user.name;
      document.getElementById('order_phone').value = user.phone;
    }
  };

  // Search products
  const searchInput = document.getElementById('search_product');
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const productItems = document.querySelectorAll('.product-item');
    
    productItems.forEach(item => {
      const productName = item.dataset.name;
      if (productName.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });

  // Handle checkbox and quantity
  const checkboxes = document.querySelectorAll('.product_checkbox');
  const qtyInputs = document.querySelectorAll('.product_qty');
  const minusBtns = document.querySelectorAll('.qty-btn.minus');
  const plusBtns = document.querySelectorAll('.qty-btn.plus');

  checkboxes.forEach((checkbox, index) => {
    checkbox.addEventListener('change', () => {
      qtyInputs[index].disabled = !checkbox.checked;
      minusBtns[index].disabled = !checkbox.checked;
      plusBtns[index].disabled = !checkbox.checked;
      
      const productItem = checkbox.closest('.product-item');
      if (checkbox.checked) {
        productItem.style.background = 'linear-gradient(90deg, #f0fff4 0%, #fff 100%)';
        productItem.style.borderLeft = '3px solid #11998e';
      } else {
        productItem.style.background = '';
        productItem.style.borderLeft = '';
        qtyInputs[index].value = 1;
      }
      updateOrderTotal();
    });
  });

  // Plus/Minus buttons
  minusBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const input = qtyInputs[index];
      const currentValue = parseInt(input.value) || 1;
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateOrderTotal();
      }
    });
  });

  plusBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const input = qtyInputs[index];
      const currentValue = parseInt(input.value) || 1;
      input.value = currentValue + 1;
      updateOrderTotal();
    });
  });

  qtyInputs.forEach(input => {
    input.addEventListener('input', updateOrderTotal);
  });

  // Handle form submit
  const form = document.getElementById('form_addOrder');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddOrder();
    });
  }
}

// Update order total
function updateOrderTotal() {
  const checkboxes = document.querySelectorAll('.product_checkbox:checked');
  let total = 0;
  let totalItems = 0;

  checkboxes.forEach(checkbox => {
    const qtyInput = document.querySelector(`.product_qty[data-id="${checkbox.value}"]`);
    const price = parseFloat(qtyInput.dataset.price);
    const qty = parseInt(qtyInput.value) || 0;
    total += price * qty;
    totalItems += qty;
  });

  document.getElementById('order_total').textContent = formatCurrency(total);
  
  const itemsCountEl = document.getElementById('order_items_count');
  if (itemsCountEl) {
    if (totalItems === 0) {
      itemsCountEl.textContent = 'Chưa chọn sản phẩm';
    } else {
      itemsCountEl.textContent = `${checkboxes.length} sản phẩm • ${totalItems} món`;
    }
  }
}

// Handle add order
function handleAddOrder() {
  const username = document.getElementById('order_user').value;
  const name = document.getElementById('order_name').value.trim();
  const phone = document.getElementById('order_phone').value.trim();
  const address = document.getElementById('order_address').value.trim();
  const paymentMethod = document.getElementById('order_payment').value;
  const note = document.getElementById('order_note').value.trim();

  if (!username || !name || !phone || !address) {
    showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }

  // Get selected products
  const checkboxes = document.querySelectorAll('.product_checkbox:checked');
  if (checkboxes.length === 0) {
    showNotification('Vui lòng chọn ít nhất 1 sản phẩm!', 'error');
    return;
  }

  const products = [];
  let totalPrice = 0;

  checkboxes.forEach(checkbox => {
    const qtyInput = document.querySelector(`.product_qty[data-id="${checkbox.value}"]`);
    const qty = parseInt(qtyInput.value) || 1;
    const price = parseFloat(qtyInput.dataset.price);

    products.push({
      name: qtyInput.dataset.name,
      image: qtyInput.dataset.image,
      category: qtyInput.dataset.category,
      price: price,
      qty: qty,
      volume: qtyInput.dataset.volume
    });

    totalPrice += price * qty;
  });

  // Generate order code
  const orderCode = 'DH' + Date.now().toString().slice(-6);

  const newOrder = {
    code: orderCode,
    orderTime: new Date().toISOString(),
    infoUser: {
      name,
      phone,
      address
    },
    paymentMethod,
    note: note || '',
    products,
    totalPrice,
    isVerify: 0
  };

  // Add order to user
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    showNotification('Không tìm thấy khách hàng!', 'error');
    return;
  }

  if (!users[userIndex].orders) {
    users[userIndex].orders = [];
  }

  users[userIndex].orders.push(newOrder);
  localStorage.setItem('users', JSON.stringify(users));

  showNotification('Thêm đơn hàng thành công!');
  overlayClose();
  renderOrdersManagementPage();
}

// Export functions
window.renderOrdersManagementPage = renderOrdersManagementPage;
window.showOrderDetail = showOrderDetail;
window.confirmOrder = confirmOrder;
window.cancelOrder = cancelOrder;
window.showAddOrderForm = showAddOrderForm;
