// js/admin/imports.js - Import Management Module

// Render imports management page
function renderImportsManagementPage() {
  const imports = getImports();
  
  const tbody = document.getElementById('tbody_products');
  if (!tbody) return;
  
  if (imports.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          <i class="fa-solid fa-inbox" style="font-size: 48px; color: #ccc;"></i>
          <p style="color: #999; margin-top: 10px;">Chưa có phiếu nhập hàng nào</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const htmls = imports.map((importItem, index) => {
    const importDate = new Date(importItem.importDate);
    const formattedDate = importDate.toLocaleDateString('vi-VN');
    const formattedTime = importDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const statusClass = importItem.isCompleted ? 'completed' : 'pending';
    const statusText = importItem.isCompleted ? 'Đã hoàn thành' : 'Chờ hoàn thành';
    const totalProducts = importItem.products ? importItem.products.length : 0;
    const totalQuantity = importItem.products ? importItem.products.reduce((sum, p) => sum + p.quantity, 0) : 0;
    
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${importItem.code}</strong></td>
        <td>
          <div>${formattedDate}</div>
          <small style="color: #999;">${formattedTime}</small>
        </td>
        <td>${totalProducts}</td>
        <td>${totalQuantity}</td>
        <td><strong>${importItem.totalCost.toLocaleString('vi-VN')}đ</strong></td>
        <td>
          <span class="status-badge status-${statusClass}">
            ${statusText}
          </span>
        </td>
        <td>
          <button class="btn-action btn-detail" onclick="showImportDetail('${importItem.code}')" title="Chi tiết">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${!importItem.isCompleted ? `
            <button class="btn-action btn-edit" onclick="showEditImportForm('${importItem.code}')" title="Sửa">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-action btn-check" onclick="completeImport('${importItem.code}')" title="Hoàn thành">
              <i class="fa-solid fa-check"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = htmls;
}

// Get imports from localStorage
function getImports() {
  return JSON.parse(localStorage.getItem('imports')) || [];
}

// Show add import form
function showAddImportForm() {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  
  if (products.length === 0) {
    showNotification('Không có sản phẩm nào! Vui lòng thêm sản phẩm trước.', 'error');
    return;
  }
  
  // Get current user safely
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser.name || currentUser.username || 'Admin';
  
  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin modern-form" id="form_addImport">
      <h2 style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 25px; font-size: 28px;">
        <i class="fa-solid fa-truck-ramp-box"></i> Thêm Phiếu Nhập Hàng
      </h2>
      
      <!-- Section 1: Thông tin phiếu nhập -->
      <div class="form-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-left: 4px solid #5a67d8;">
        <h3 class="section-title"><i class="fa-solid fa-info-circle"></i> Thông Tin Phiếu Nhập</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form_controll_admin">
            <label><i class="fa-solid fa-calendar"></i> Ngày nhập *</label>
            <input required type="date" id="import_date" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="form_controll_admin">
            <label><i class="fa-solid fa-user"></i> Người nhập</label>
            <input type="text" id="import_user" value="${userName}" readonly style="background: rgba(255,255,255,0.7);" />
          </div>
        </div>
        <div class="form_controll_admin">
          <label><i class="fa-solid fa-sticky-note"></i> Ghi chú</label>
          <textarea id="import_note" rows="2" placeholder="Ghi chú về phiếu nhập..."></textarea>
        </div>
      </div>

      <!-- Section 2: Chọn sản phẩm -->
      <div class="form-section" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-left: 4px solid #f5576c;">
        <h3 class="section-title"><i class="fa-solid fa-box"></i> Chọn Sản Phẩm Nhập</h3>
        
        <div class="form_controll_admin">
          <label><i class="fa-solid fa-search"></i> Tìm kiếm sản phẩm</label>
          <input type="text" id="search_product_import" placeholder="Nhập tên sản phẩm..." oninput="filterImportProducts()" />
        </div>
        
        <div class="import-products-list" id="import_products_list">
          ${renderImportProductsList(products)}
        </div>
      </div>

      <!-- Section 3: Tổng kết -->
      <div class="form-section" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-left: 4px solid #11998e;">
        <h3 class="section-title"><i class="fa-solid fa-calculator"></i> Tổng Kết</h3>
        <div class="import-summary">
          <div class="summary-row">
            <span>Tổng số sản phẩm:</span>
            <strong id="total_products_import">0</strong>
          </div>
          <div class="summary-row">
            <span>Tổng số lượng:</span>
            <strong id="total_quantity_import">0</strong>
          </div>
          <div class="summary-row" style="font-size: 18px; color: #fff;">
            <span>Tổng chi phí:</span>
            <strong id="total_cost_import">0đ</strong>
          </div>
        </div>
      </div>

      <div class="form_controll_admin" style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button type="submit" class="btn_admin btn_admin-submit" style="padding: 12px 30px; font-size: 16px;">
          <i class="fa-solid fa-plus"></i> Tạo phiếu nhập
        </button>
        <button type="button" onclick="overlayClose()" class="btn_admin btn_admin-cancel" style="padding: 12px 30px; font-size: 16px;">
          <i class="fa-solid fa-xmark"></i> Hủy
        </button>
      </div>
    </form>
  `;
  
  showOverlay(formHTML);
  
  const form = document.getElementById('form_addImport');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAddImport();
  });
}

// Render import products list with checkboxes
function renderImportProductsList(products) {
  return products.map(product => `
    <div class="import-product-item" data-product-id="${product.id}">
      <input type="checkbox" id="product_${product.id}" class="import-product-checkbox" onchange="toggleImportProduct(${product.id})">
      <label for="product_${product.id}" class="import-product-label">
        <img src="${product.image}" alt="${product.name}">
        <div class="import-product-info">
          <h4>${product.name}</h4>
          <p>${product.category} - ${product.volume}</p>
        </div>
      </label>
      <div class="import-product-inputs" style="display: none;">
        <div class="import-input-group">
          <label>Giá nhập (đ)</label>
          <input type="number" id="cost_${product.id}" min="0" step="1000" placeholder="Giá nhập..." onchange="updateImportTotal()">
        </div>
        <div class="import-input-group">
          <label>Số lượng</label>
          <div class="quantity-controls">
            <button type="button" onclick="changeImportQuantity(${product.id}, -1)">-</button>
            <input type="number" id="quantity_${product.id}" min="1" value="1" onchange="updateImportTotal()">
            <button type="button" onclick="changeImportQuantity(${product.id}, 1)">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Toggle import product selection
function toggleImportProduct(productId) {
  const checkbox = document.getElementById(`product_${productId}`);
  const item = checkbox.closest('.import-product-item');
  const inputs = item.querySelector('.import-product-inputs');
  
  if (checkbox.checked) {
    inputs.style.display = 'grid';
    item.classList.add('selected');
  } else {
    inputs.style.display = 'none';
    item.classList.remove('selected');
  }
  
  updateImportTotal();
}

// Change import quantity
function changeImportQuantity(productId, delta) {
  const input = document.getElementById(`quantity_${productId}`);
  const currentValue = parseInt(input.value) || 1;
  const newValue = Math.max(1, currentValue + delta);
  input.value = newValue;
  updateImportTotal();
}

// Filter import products
function filterImportProducts() {
  const searchTerm = document.getElementById('search_product_import').value.toLowerCase();
  const items = document.querySelectorAll('.import-product-item');
  
  items.forEach(item => {
    const productName = item.querySelector('h4').textContent.toLowerCase();
    if (productName.includes(searchTerm)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

// Update import total
function updateImportTotal() {
  const checkboxes = document.querySelectorAll('.import-product-checkbox:checked');
  let totalProducts = 0;
  let totalQuantity = 0;
  let totalCost = 0;
  
  checkboxes.forEach(checkbox => {
    const productId = checkbox.id.replace('product_', '');
    const quantity = parseInt(document.getElementById(`quantity_${productId}`).value) || 0;
    const cost = parseInt(document.getElementById(`cost_${productId}`).value) || 0;
    
    if (quantity > 0 && cost > 0) {
      totalProducts++;
      totalQuantity += quantity;
      totalCost += quantity * cost;
    }
  });
  
  document.getElementById('total_products_import').textContent = totalProducts;
  document.getElementById('total_quantity_import').textContent = totalQuantity;
  document.getElementById('total_cost_import').textContent = totalCost.toLocaleString('vi-VN') + 'đ';
}

// Handle add import
function handleAddImport() {
  const importDate = document.getElementById('import_date').value;
  const importUser = document.getElementById('import_user').value;
  const importNote = document.getElementById('import_note').value;
  
  const checkboxes = document.querySelectorAll('.import-product-checkbox:checked');
  if (checkboxes.length === 0) {
    showNotification('Vui lòng chọn ít nhất một sản phẩm!', 'error');
    return;
  }
  
  const products = [];
  let hasError = false;
  
  checkboxes.forEach(checkbox => {
    const productId = parseInt(checkbox.id.replace('product_', ''));
    const quantity = parseInt(document.getElementById(`quantity_${productId}`).value) || 0;
    const cost = parseInt(document.getElementById(`cost_${productId}`).value) || 0;
    
    if (quantity <= 0 || cost <= 0) {
      hasError = true;
      return;
    }
    
    products.push({
      productId,
      quantity,
      cost
    });
  });
  
  if (hasError) {
    showNotification('Vui lòng nhập đầy đủ giá nhập và số lượng!', 'error');
    return;
  }
  
  const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
  
  const newImport = {
    code: `PN${Date.now()}`,
    importDate: new Date(importDate).toISOString(),
    importUser,
    note: importNote,
    products,
    totalCost,
    isCompleted: false
  };
  
  const imports = getImports();
  imports.push(newImport);
  localStorage.setItem('imports', JSON.stringify(imports));
  
  showNotification('Tạo phiếu nhập thành công!');
  overlayClose();
  renderImportsManagementPage();
}

// Show import detail
function showImportDetail(importCode) {
  const imports = getImports();
  const importItem = imports.find(i => i.code === importCode);
  
  if (!importItem) {
    showNotification('Không tìm thấy phiếu nhập!', 'error');
    return;
  }
  
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const importProducts = importItem.products.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      name: product ? product.name : 'N/A',
      image: product ? product.image : '',
      category: product ? product.category : 'N/A'
    };
  });
  
  const importDate = new Date(importItem.importDate);
  const formattedDate = importDate.toLocaleDateString('vi-VN');
  const formattedTime = importDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  
  const detailHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <div class="import-detail-container">
      <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">
        <i class="fa-solid fa-file-invoice"></i> Chi Tiết Phiếu Nhập
      </h2>
      
      <div class="import-info-grid">
        <div class="info-item">
          <span class="info-label">Mã phiếu nhập:</span>
          <span class="info-value"><strong>${importItem.code}</strong></span>
        </div>
        <div class="info-item">
          <span class="info-label">Ngày nhập:</span>
          <span class="info-value">${formattedDate} ${formattedTime}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Người nhập:</span>
          <span class="info-value">${importItem.importUser}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Trạng thái:</span>
          <span class="info-value">
            <span class="status-badge status-${importItem.isCompleted ? 'completed' : 'pending'}">
              ${importItem.isCompleted ? 'Đã hoàn thành' : 'Chờ hoàn thành'}
            </span>
          </span>
        </div>
      </div>
      
      ${importItem.note ? `
        <div class="import-note">
          <strong>Ghi chú:</strong> ${importItem.note}
        </div>
      ` : ''}
      
      <h3 style="color: #667eea; margin: 20px 0 10px;">Danh Sách Sản Phẩm</h3>
      <table class="import-products-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá nhập</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${importProducts.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
              <td>${item.name}</td>
              <td>${item.cost.toLocaleString('vi-VN')}đ</td>
              <td>${item.quantity}</td>
              <td><strong>${(item.quantity * item.cost).toLocaleString('vi-VN')}đ</strong></td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align: right;"><strong>Tổng chi phí:</strong></td>
            <td><strong style="color: #11998e; font-size: 18px;">${importItem.totalCost.toLocaleString('vi-VN')}đ</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="overlayClose()" class="btn_admin btn_admin-cancel">
          <i class="fa-solid fa-times"></i> Đóng
        </button>
      </div>
    </div>
  `;
  
  showOverlay(detailHTML);
}

// Complete import (update inventory)
function completeImport(importCode) {
  if (!confirm('Xác nhận hoàn thành phiếu nhập? Thao tác này sẽ cập nhật số lượng tồn kho.')) {
    return;
  }
  
  const imports = getImports();
  const importIndex = imports.findIndex(i => i.code === importCode);
  
  if (importIndex === -1) {
    showNotification('Không tìm thấy phiếu nhập!', 'error');
    return;
  }
  
  const importItem = imports[importIndex];
  
  // Update inventory
  const products = JSON.parse(localStorage.getItem('products')) || [];
  
  importItem.products.forEach(item => {
    const productIndex = products.findIndex(p => p.id === item.productId);
    if (productIndex !== -1) {
      products[productIndex].quantity = (products[productIndex].quantity || 0) + item.quantity;
      products[productIndex].costPrice = item.cost; // Save cost price for profit calculation
    }
  });
  
  localStorage.setItem('products', JSON.stringify(products));
  
  // Mark as completed
  imports[importIndex].isCompleted = true;
  imports[importIndex].completedDate = new Date().toISOString();
  localStorage.setItem('imports', JSON.stringify(imports));
  
  showNotification('Hoàn thành phiếu nhập thành công! Đã cập nhật tồn kho.');
  renderImportsManagementPage();
}

// Show edit import form
function showEditImportForm(importCode) {
  const imports = getImports();
  const importItem = imports.find(i => i.code === importCode);
  
  if (!importItem) {
    showNotification('Không tìm thấy phiếu nhập!', 'error');
    return;
  }
  
  if (importItem.isCompleted) {
    showNotification('Không thể sửa phiếu nhập đã hoàn thành!', 'error');
    return;
  }
  
  const products = JSON.parse(localStorage.getItem('products')) || [];
  
  // Format date for input
  const importDate = new Date(importItem.importDate);
  const formattedDate = importDate.toISOString().split('T')[0];
  
  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin modern-form" id="form_editImport" style="max-height: 90vh; overflow-y: auto;">
      <h2 style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 25px; font-size: 28px;">
        <i class="fa-solid fa-pen-to-square"></i> Chỉnh Sửa Phiếu Nhập
      </h2>
      
      <!-- Section 1: Thông tin phiếu nhập -->
      <div class="form-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-left: 4px solid #5a67d8;">
        <h3 class="section-title"><i class="fa-solid fa-info-circle"></i> Thông Tin Phiếu Nhập</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form_controll_admin">
            <label><i class="fa-solid fa-barcode"></i> Mã phiếu</label>
            <input type="text" value="${importItem.code}" disabled style="background: #f0f0f0;" />
          </div>
          <div class="form_controll_admin">
            <label><i class="fa-solid fa-calendar"></i> Ngày nhập *</label>
            <input required type="date" id="edit_import_date" value="${formattedDate}" />
          </div>
          <div class="form_controll_admin">
            <label><i class="fa-solid fa-user"></i> Người nhập</label>
            <input type="text" id="edit_import_user" value="${importItem.importUser || ''}" placeholder="Tên người nhập" />
          </div>
          <div class="form_controll_admin">
            <label><i class="fa-solid fa-note-sticky"></i> Ghi chú</label>
            <input type="text" id="edit_import_note" value="${importItem.note || ''}" placeholder="Ghi chú thêm..." />
          </div>
        </div>
      </div>
      
      <!-- Section 2: Danh sách sản phẩm -->
      <div class="form-section" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-left: 4px solid #0f8574;">
        <h3 class="section-title"><i class="fa-solid fa-box"></i> Danh Sách Sản Phẩm</h3>
        
        <div class="import-products-list" style="max-height: 400px; overflow-y: auto;">
          ${importItem.products.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return '';
            
            return `
              <div class="import-product-item selected" data-product-id="${item.productId}" style="background: white; border: 2px solid #11998e; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                  <img src="${product.image}" alt="${product.name}" 
                       onerror="this.src='img/product/smoothie-strawberry.png'"
                       style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                  
                  <div style="flex: 1; min-width: 200px;">
                    <h4 style="margin: 0; color: #333; font-size: 16px;">${product.name}</h4>
                    <p style="margin: 5px 0 0; color: #999; font-size: 13px;">
                      <i class="fa-solid fa-tag"></i> ${product.category} | 
                      <i class="fa-solid fa-bottle-water"></i> ${product.volume}
                    </p>
                  </div>
                  
                  <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <div class="form_controll_admin" style="margin: 0;">
                      <label style="font-size: 13px; margin-bottom: 5px; display: block;">Số lượng *</label>
                      <div style="display: flex; align-items: center; gap: 5px;">
                        <button type="button" onclick="changeEditQuantity(${index}, -1)" 
                                style="width: 32px; height: 32px; border: none; background: #667eea; color: white; border-radius: 4px; cursor: pointer;">
                          <i class="fa-solid fa-minus"></i>
                        </button>
                        <input type="number" id="edit_quantity_${index}" value="${item.quantity}" min="1" 
                               onchange="updateEditTotal()" 
                               style="width: 60px; text-align: center; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
                        <button type="button" onclick="changeEditQuantity(${index}, 1)" 
                                style="width: 32px; height: 32px; border: none; background: #667eea; color: white; border-radius: 4px; cursor: pointer;">
                          <i class="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="form_controll_admin" style="margin: 0;">
                      <label style="font-size: 13px; margin-bottom: 5px; display: block;">Giá nhập (đ) *</label>
                      <input type="number" id="edit_cost_${index}" value="${item.cost}" min="0" 
                             onchange="updateEditTotal()" placeholder="Giá nhập..." 
                             style="width: 120px; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
                    </div>
                    
                    <button type="button" onclick="removeEditProduct(${index})" 
                            class="btn-action btn-delete" title="Xóa"
                            style="width: 40px; height: 40px; margin-top: 20px;">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; text-align: right; color: #667eea; font-weight: 600;">
                  Thành tiền: <span id="edit_subtotal_${index}">${(item.quantity * item.cost).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div id="edit_import_summary" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-top: 20px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
            <div>
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Tổng số loại</div>
              <div style="font-size: 24px; font-weight: bold;" id="edit_total_products">${importItem.products.length}</div>
            </div>
            <div>
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Tổng số lượng</div>
              <div style="font-size: 24px; font-weight: bold;" id="edit_total_quantity">${importItem.products.reduce((sum, p) => sum + p.quantity, 0)}</div>
            </div>
            <div>
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Tổng tiền</div>
              <div style="font-size: 24px; font-weight: bold;" id="edit_total_cost">${importItem.totalCost.toLocaleString('vi-VN')}đ</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Buttons -->
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
        <button type="submit" class="btn_admin btn_admin-success">
          <i class="fa-solid fa-save"></i> Lưu Thay Đổi
        </button>
        <button type="button" onclick="overlayClose()" class="btn_admin btn_admin-cancel">
          <i class="fa-solid fa-times"></i> Hủy
        </button>
      </div>
    </form>
  `;
  
  showOverlay(formHTML);
  
  // Handle form submit
  document.getElementById('form_editImport').onsubmit = (e) => {
    e.preventDefault();
    handleEditImport(importCode);
  };
}

// Change edit quantity
function changeEditQuantity(index, delta) {
  const input = document.getElementById(`edit_quantity_${index}`);
  const currentValue = parseInt(input.value) || 1;
  const newValue = Math.max(1, currentValue + delta);
  input.value = newValue;
  updateEditTotal();
}

// Remove product from edit list
function removeEditProduct(index) {
  if (!confirm('Xóa sản phẩm này khỏi phiếu nhập?')) return;
  
  // Find and remove the item
  const items = document.querySelectorAll('.import-product-item');
  if (items[index]) {
    items[index].remove();
    
    // Re-index remaining items
    const remainingItems = document.querySelectorAll('.import-product-item');
    remainingItems.forEach((item, newIndex) => {
      // Update input IDs
      const quantityInput = item.querySelector('input[id^="edit_quantity_"]');
      const costInput = item.querySelector('input[id^="edit_cost_"]');
      const subtotalSpan = item.querySelector('span[id^="edit_subtotal_"]');
      const minusBtn = item.querySelector('button[onclick*="changeEditQuantity"]');
      const plusBtn = item.querySelectorAll('button[onclick*="changeEditQuantity"]')[1];
      const deleteBtn = item.querySelector('button[onclick*="removeEditProduct"]');
      
      if (quantityInput) {
        quantityInput.id = `edit_quantity_${newIndex}`;
      }
      if (costInput) {
        costInput.id = `edit_cost_${newIndex}`;
      }
      if (subtotalSpan) {
        subtotalSpan.id = `edit_subtotal_${newIndex}`;
      }
      if (minusBtn) {
        minusBtn.setAttribute('onclick', `changeEditQuantity(${newIndex}, -1)`);
      }
      if (plusBtn) {
        plusBtn.setAttribute('onclick', `changeEditQuantity(${newIndex}, 1)`);
      }
      if (deleteBtn) {
        deleteBtn.setAttribute('onclick', `removeEditProduct(${newIndex})`);
      }
    });
    
    updateEditTotal();
  }
}

// Update edit total
function updateEditTotal() {
  const items = document.querySelectorAll('.import-product-item');
  let totalProducts = 0;
  let totalQuantity = 0;
  let totalCost = 0;
  
  items.forEach((item, index) => {
    const quantityInput = document.getElementById(`edit_quantity_${index}`);
    const costInput = document.getElementById(`edit_cost_${index}`);
    const subtotalSpan = document.getElementById(`edit_subtotal_${index}`);
    
    if (quantityInput && costInput && subtotalSpan) {
      const quantity = parseInt(quantityInput.value) || 0;
      const cost = parseInt(costInput.value) || 0;
      const subtotal = quantity * cost;
      
      subtotalSpan.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
      
      if (quantity > 0 && cost > 0) {
        totalProducts++;
        totalQuantity += quantity;
        totalCost += subtotal;
      }
    }
  });
  
  document.getElementById('edit_total_products').textContent = totalProducts;
  document.getElementById('edit_total_quantity').textContent = totalQuantity;
  document.getElementById('edit_total_cost').textContent = totalCost.toLocaleString('vi-VN') + 'đ';
}

// Handle edit import
function handleEditImport(importCode) {
  const importDate = document.getElementById('edit_import_date').value;
  const importUser = document.getElementById('edit_import_user').value.trim();
  const importNote = document.getElementById('edit_import_note').value.trim();
  
  if (!importDate) {
    showNotification('Vui lòng chọn ngày nhập!', 'error');
    return;
  }
  
  // Collect products
  const items = document.querySelectorAll('.import-product-item');
  const products = [];
  let hasError = false;
  
  items.forEach((item, index) => {
    const quantityInput = document.getElementById(`edit_quantity_${index}`);
    const costInput = document.getElementById(`edit_cost_${index}`);
    const productId = parseInt(item.getAttribute('data-product-id'));
    
    if (quantityInput && costInput && productId) {
      const quantity = parseInt(quantityInput.value) || 0;
      const cost = parseInt(costInput.value) || 0;
      
      if (quantity <= 0 || cost <= 0) {
        hasError = true;
        return;
      }
      
      products.push({
        productId,
        quantity,
        cost
      });
    }
  });
  
  if (hasError) {
    showNotification('Vui lòng nhập đầy đủ số lượng và giá nhập!', 'error');
    return;
  }
  
  if (products.length === 0) {
    showNotification('Vui lòng chọn ít nhất một sản phẩm!', 'error');
    return;
  }
  
  const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
  
  // Update import
  const imports = getImports();
  const importIndex = imports.findIndex(i => i.code === importCode);
  
  if (importIndex === -1) {
    showNotification('Không tìm thấy phiếu nhập!', 'error');
    return;
  }
  
  imports[importIndex] = {
    ...imports[importIndex],
    importDate: new Date(importDate).toISOString(),
    importUser,
    note: importNote,
    products,
    totalCost
  };
  
  localStorage.setItem('imports', JSON.stringify(imports));
  
  showNotification('Cập nhật phiếu nhập thành công!');
  overlayClose();
  renderImportsManagementPage();
}

// Export functions
window.renderImportsManagementPage = renderImportsManagementPage;
window.showAddImportForm = showAddImportForm;
window.showImportDetail = showImportDetail;
window.showEditImportForm = showEditImportForm;
window.completeImport = completeImport;
window.toggleImportProduct = toggleImportProduct;
window.changeImportQuantity = changeImportQuantity;
window.changeEditQuantity = changeEditQuantity;
window.removeEditProduct = removeEditProduct;
window.updateEditTotal = updateEditTotal;
window.filterImportProducts = filterImportProducts;
window.updateImportTotal = updateImportTotal;
