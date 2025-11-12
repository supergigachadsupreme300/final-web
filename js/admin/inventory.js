// js/admin/inventory.js - Inventory Management Module

// Render inventory management page
function renderInventoryManagementPage() {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const tbody = document.getElementById('tbody_products');
  
  if (!tbody) return;
  
  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          <i class="fa-solid fa-box-open" style="font-size: 48px; color: #ccc;"></i>
          <p style="color: #999; margin-top: 10px;">Chưa có sản phẩm nào trong kho</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const htmls = products.map(product => {
    const stockStatus = getStockStatus(product.quantity || 0);
    const costPrice = product.costPrice || 0;
    const sellingPrice = product.price || 0;
    const profit = sellingPrice - costPrice;
    const profitPercent = costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : 0;
    
    return `
      <tr>
        <td>
          <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        </td>
        <td><strong>${product.name}</strong></td>
        <td>${product.category}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <strong style="font-size: 18px; color: ${stockStatus.color};">${product.quantity || 0}</strong>
            <span class="stock-badge stock-${stockStatus.level}">${stockStatus.text}</span>
          </div>
        </td>
        <td>${costPrice > 0 ? costPrice.toLocaleString('vi-VN') + 'đ' : 'Chưa có'}</td>
        <td><strong>${sellingPrice.toLocaleString('vi-VN')}đ</strong></td>
        <td>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <strong style="color: ${profit >= 0 ? '#28a745' : '#dc3545'};">
              ${profit.toLocaleString('vi-VN')}đ
            </strong>
            <small style="color: #666;">(${profitPercent}%)</small>
          </div>
        </td>
        <td>
          <button class="btn-action btn-detail" onclick="showStockHistory(${product.id})" title="Lịch sử">
            <i class="fa-solid fa-history"></i>
          </button>
          <button class="btn-action btn-edit" onclick="showAdjustStockForm(${product.id})" title="Điều chỉnh">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = htmls;
}

// Get stock status
function getStockStatus(quantity) {
  if (quantity === 0) {
    return { level: 'empty', text: 'Hết hàng', color: '#dc3545' };
  } else if (quantity < 10) {
    return { level: 'low', text: 'Sắp hết', color: '#ffc107' };
  } else if (quantity < 50) {
    return { level: 'medium', text: 'Bình thường', color: '#17a2b8' };
  } else {
    return { level: 'high', text: 'Còn nhiều', color: '#28a745' };
  }
}

// Show adjust stock form
function showAdjustStockForm(productId) {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    showNotification('Không tìm thấy sản phẩm!', 'error');
    return;
  }
  
  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin modern-form" id="form_adjustStock" style="max-width: 600px;">
      <h2 style="text-align: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 25px; font-size: 28px;">
        <i class="fa-solid fa-warehouse"></i> Điều Chỉnh Tồn Kho
      </h2>
      
      <div class="form-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-left: 4px solid #5a67d8;">
        <div style="text-align: center; padding: 10px;">
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; margin-bottom: 10px; border: 3px solid #fff;">
          <h3 style="color: #fff; margin: 0;">${product.name}</h3>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0;">${product.category} - ${product.volume}</p>
        </div>
      </div>
      
      <div class="form-section" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-left: 4px solid #f5576c;">
        <h3 class="section-title"><i class="fa-solid fa-box"></i> Thông Tin Tồn Kho</h3>
        
        <div class="stock-current">
          <div class="stock-display">
            <span>Tồn kho hiện tại:</span>
            <strong style="font-size: 24px; color: #fff;">${product.quantity || 0}</strong>
          </div>
        </div>
        
        <div class="form_controll_admin">
          <label><i class="fa-solid fa-edit"></i> Loại điều chỉnh</label>
          <select id="adjust_type" onchange="updateAdjustmentPreview()">
            <option value="add">Nhập thêm (+)</option>
            <option value="subtract">Xuất kho (-)</option>
            <option value="set">Đặt số lượng mới (=)</option>
          </select>
        </div>
        
        <div class="form_controll_admin">
          <label><i class="fa-solid fa-sort-numeric-up"></i> Số lượng</label>
          <input required type="number" id="adjust_quantity" min="0" value="0" oninput="updateAdjustmentPreview()" />
        </div>
        
        <div class="adjustment-preview" id="adjustment_preview">
          <i class="fa-solid fa-arrow-right"></i>
          <span>Tồn kho mới: <strong>0</strong></span>
        </div>
      </div>

      <div class="form-section" style="background: linear-gradient(135deg, #ff9a00 0%, #ff5e00 100%); border-left: 4px solid #ff5e00;">
        <h3 class="section-title"><i class="fa-solid fa-dollar-sign"></i> Cập Nhật Giá</h3>
        
        <div class="form_controll_admin">
          <label><i class="fa-solid fa-money-bill-wave"></i> Giá nhập (VNĐ)</label>
          <input type="number" id="adjust_cost_price" min="0" value="${product.costPrice || 0}" placeholder="Nhập giá nhập kho..." />
        </div>

        <div class="form_controll_admin">
          <label><i class="fa-solid fa-tag"></i> Giá bán (VNĐ)</label>
          <input required type="number" id="adjust_price" min="0" value="${product.price || 0}" placeholder="Nhập giá bán..." />
        </div>
      </div>
      <div class="form-section" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-left: 4px solid #11998e;">
        <h3 class="section-title"><i class="fa-solid fa-comment"></i> Lý Do & Ghi Chú</h3>
        
        <div class="form_controll_admin">
          <label><i class="fa-solid fa-tags"></i> Lý do</label>
          <select id="adjust_reason">
            <option value="import">Nhập hàng từ nhà cung cấp</option>
            <option value="export">Xuất hàng cho khách</option>
            <option value="damaged">Hàng hỏng/mất</option>
            <option value="inventory_check">Kiểm kê kho</option>
            <option value="return">Trả hàng nhà cung cấp</option>
            <option value="other">Khác</option>
          </select>
        </div>
        
        <div class="form_controll_admin">
          <label><i class="fa-solid fa-sticky-note"></i> Ghi chú chi tiết</label>
          <textarea id="adjust_note" rows="3" placeholder="Ghi chú thêm về điều chỉnh..."></textarea>
        </div>
      </div>
      
      <div class="form_controll_admin" style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button type="submit" class="btn_admin btn_admin-submit" style="padding: 12px 30px; font-size: 16px;">
          <i class="fa-solid fa-check"></i> Xác nhận
        </button>
        <button type="button" onclick="overlayClose()" class="btn_admin btn_admin-cancel" style="padding: 12px 30px; font-size: 16px;">
          <i class="fa-solid fa-xmark"></i> Hủy
        </button>
      </div>
    </form>
  `;
  
  showOverlay(formHTML);
  
  // Set initial preview
  window.currentProductQuantity = product.quantity || 0;
  window.currentProductId = productId;
  
  const form = document.getElementById('form_adjustStock');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAdjustStock();
  });
}

// Update adjustment preview
function updateAdjustmentPreview() {
  const type = document.getElementById('adjust_type').value;
  const quantity = parseInt(document.getElementById('adjust_quantity').value) || 0;
  const currentStock = window.currentProductQuantity || 0;
  
  let newStock = currentStock;
  
  switch(type) {
    case 'add':
      newStock = currentStock + quantity;
      break;
    case 'subtract':
      newStock = Math.max(0, currentStock - quantity);
      break;
    case 'set':
      newStock = quantity;
      break;
  }
  
  const preview = document.getElementById('adjustment_preview');
  preview.innerHTML = `
    <i class="fa-solid fa-arrow-right"></i>
    <span>Tồn kho mới: <strong style="font-size: 20px; color: ${newStock > currentStock ? '#28a745' : newStock < currentStock ? '#dc3545' : '#fff'};">${newStock}</strong></span>
  `;
}

// Handle adjust stock
function handleAdjustStock() {
  const type = document.getElementById('adjust_type').value;
  const quantity = parseInt(document.getElementById('adjust_quantity').value) || 0;
  const reason = document.getElementById('adjust_reason').value;
  const note = document.getElementById('adjust_note').value;
  const productId = window.currentProductId;
  const newCostPrice = parseFloat(document.getElementById('adjust_cost_price').value) || 0;
  const newSellingPrice = parseFloat(document.getElementById('adjust_price').value) || 0;
  
  if (newSellingPrice <= 0) {
    showNotification('Vui lòng nhập giá bán hợp lệ!', 'error');
    return;
  }
  
  if (quantity <= 0 && type !== 'set') {
    showNotification('Vui lòng nhập số lượng điều chỉnh hợp lệ!', 'error');
    return;
  }
  
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    showNotification('Không tìm thấy sản phẩm!', 'error');
    return;
  }
  
  const product = products[productIndex];
  const oldQuantity = product.quantity || 0;
  let newQuantity = oldQuantity;
  
  switch(type) {
    case 'add':
      newQuantity = oldQuantity + quantity;
      break;
    case 'subtract':
      newQuantity = Math.max(0, oldQuantity - quantity);
      break;
    case 'set':
      newQuantity = quantity;
      break;
  }
  
  products[productIndex].quantity = newQuantity;
  products[productIndex].price = newSellingPrice;
  products[productIndex].costPrice = newCostPrice;
  
  localStorage.setItem('products', JSON.stringify(products));
  
  // Get current user safely
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser.name || currentUser.username || 'Admin';
  
  // Save stock history
  saveStockHistory({
    productId,
    productName: product.name,
    type,
    quantity,
    oldQuantity,
    newQuantity,
    reason,
    note,
    date: new Date().toISOString(),
    user: userName
  });
  
  // Close overlay first
  overlayClose();
  
  // Show notification
  showNotification('✓ Đã cập nhật sản phẩm thành công!', 'success');
  
  // Update display immediately
  setTimeout(() => {
    renderInventoryManagementPage();
  }, 100);
}

// Save stock history
function saveStockHistory(record) {
  const history = JSON.parse(localStorage.getItem('stockHistory')) || [];
  history.push(record);
  localStorage.setItem('stockHistory', JSON.stringify(history));
}

// Show stock history
function showStockHistory(productId) {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    showNotification('Không tìm thấy sản phẩm!', 'error');
    return;
  }
  
  const history = JSON.parse(localStorage.getItem('stockHistory')) || [];
  const productHistory = history.filter(h => h.productId === productId).reverse();
  
  console.log('Product ID:', productId);
  console.log('All history:', history);
  console.log('Product history:', productHistory);
  
  const historyHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <div class="stock-history-container">
      <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">
        <i class="fa-solid fa-history"></i> Lịch Sử Tồn Kho
      </h2>
      
      <div class="product-info-card">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${product.category} - ${product.volume}</p>
          <p><strong>Tồn kho hiện tại: ${product.quantity || 0}</strong></p>
        </div>
      </div>
      
      ${productHistory.length === 0 ? `
        <div style="text-align: center; padding: 40px; color: #999;">
          <i class="fa-solid fa-inbox" style="font-size: 48px;"></i>
          <p>Chưa có lịch sử điều chỉnh</p>
          <small style="display: block; margin-top: 10px; color: #ccc;">Tổng ${history.length} bản ghi trong hệ thống</small>
        </div>
      ` : `
        <div class="history-timeline">
          ${productHistory.map(record => {
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('vi-VN');
            const formattedTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            let typeIcon, typeText, typeColor;
            switch(record.type) {
              case 'add':
                typeIcon = 'fa-plus-circle';
                typeText = 'Nhập thêm';
                typeColor = '#28a745';
                break;
              case 'subtract':
                typeIcon = 'fa-minus-circle';
                typeText = 'Xuất kho';
                typeColor = '#dc3545';
                break;
              case 'set':
                typeIcon = 'fa-edit';
                typeText = 'Đặt lại';
                typeColor = '#17a2b8';
                break;
            }
            
            const reasonMap = {
              import: 'Nhập hàng',
              export: 'Xuất hàng',
              damaged: 'Hàng hỏng',
              inventory_check: 'Kiểm kê',
              return: 'Trả hàng',
              other: 'Khác'
            };
            
            return `
              <div class="history-item">
                <div class="history-icon" style="background: ${typeColor};">
                  <i class="fa-solid ${typeIcon}"></i>
                </div>
                <div class="history-content">
                  <div class="history-header">
                    <strong style="color: ${typeColor};">${typeText}</strong>
                    <span class="history-date">${formattedDate} ${formattedTime}</span>
                  </div>
                  <div class="history-body">
                    <p><strong>Số lượng:</strong> ${record.oldQuantity} → ${record.newQuantity} (${record.type === 'add' ? '+' : record.type === 'subtract' ? '-' : ''}${record.quantity})</p>
                    <p><strong>Lý do:</strong> ${reasonMap[record.reason] || record.reason}</p>
                    ${record.note ? `<p><strong>Ghi chú:</strong> ${record.note}</p>` : ''}
                    <p><strong>Người thực hiện:</strong> ${record.user}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
      
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="overlayClose()" class="btn_admin btn_admin-cancel">
          <i class="fa-solid fa-times"></i> Đóng
        </button>
      </div>
    </div>
  `;
  
  showOverlay(historyHTML);
}

// Export functions
window.renderInventoryManagementPage = renderInventoryManagementPage;
window.showAdjustStockForm = showAdjustStockForm;
window.showStockHistory = showStockHistory;
window.updateAdjustmentPreview = updateAdjustmentPreview;
