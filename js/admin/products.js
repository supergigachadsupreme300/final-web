// js/admin/products.js - Product Management Module

let imgUrl = '';
let currentPage = 1;
let itemsPerPage = 10;
let currentProducts = [];
let searchTerm = '';
let currentCategory = 'all';

// Show all products
const defaultClassification = () => {
  const classificationSelectText = document.querySelector('.classification_select-text');
  
  if (classificationSelectText) {
    classificationSelectText.textContent = '-- Tất cả --';
  }
  
  currentCategory = 'all';
  currentPage = 1;
  loadAndDisplayProducts();
};

// Filter by category
const handleCategoryFilter = (category) => {
  const classificationSelectText = document.querySelector('.classification_select-text');
  
  if (classificationSelectText) {
    classificationSelectText.textContent = `-- ${category} --`;
  }
  
  currentCategory = category;
  currentPage = 1;
  loadAndDisplayProducts();
};

// Load and display products with filters
const loadAndDisplayProducts = () => {
  let productsLocal = JSON.parse(localStorage.getItem('products')) || products;
  
  // Apply category filter
  if (currentCategory !== 'all') {
    productsLocal = productsLocal.filter((product) => product.category === currentCategory);
  }
  
  // Apply search filter
  if (searchTerm) {
    productsLocal = productsLocal.filter((product) => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  currentProducts = productsLocal;
  renderAddProductPage(productsLocal);
  renderPagination();
};

// Render product table with pagination
const renderAddProductPage = (data) => {
  const tbody = document.getElementById('tbody_products');
  if (!tbody) return;
  
  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  
  if (paginatedData.length === 0 && data.length > 0) {
    currentPage = 1;
    renderAddProductPage(data);
    return;
  }
  
  const htmls = paginatedData.map((product) => {
    const formattedPrice = formatCurrency(product.price);
    return `
    <tr id="${product.id}">
      <td><span>${product.id}</span></td>
      <td>
        <div class="product_img">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='img/product/smoothie-strawberry.png'">
        </div>
      </td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formattedPrice}</td>
      <td>${product.volume}</td>
      <td>
        <button class="btn-action btn-info" onclick="showProductDetail('${product.id}')" title="Xem chi tiết">
          <i class="fa-solid fa-eye"></i>
        </button>
      </td>
      <td>
        <button class="btn-action btn-edit" onclick="handleUpdateProductsAdmin('${product.id}')" title="Sửa">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </td>
      <td>
        <button class="btn-action btn-delete" onclick="handleDeleteProductsAdmin('${product.id}')" title="Xóa">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    </tr>
    `;
  }).join('');
  
  tbody.innerHTML = htmls || '<tr><td colspan="9" style="text-align: center; padding: 30px;">Không tìm thấy sản phẩm nào</td></tr>';
};

// Render pagination controls
const renderPagination = () => {
  const paginationDiv = document.getElementById('pagination');
  if (!paginationDiv) return;
  
  const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
  
  // Chỉ hiển thị pagination khi có hơn 1 trang
  if (totalPages <= 1) {
    paginationDiv.innerHTML = '';
    return;
  }
  
  let paginationHTML = `
    <div class="pagination-info">
      Hiển thị ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, currentProducts.length)} 
      trong tổng số ${currentProducts.length} sản phẩm
    </div>
    <div class="pagination-controls">
  `;
  
  // Previous button
  if (currentPage > 1) {
    paginationHTML += `
      <button class="page-btn" onclick="changePage(${currentPage - 1})">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    `;
  }
  
  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  if (startPage > 1) {
    paginationHTML += `
      <button class="page-btn" onclick="changePage(1)">1</button>
    `;
    if (startPage > 2) {
      paginationHTML += `<span class="page-dots">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="page-dots">...</span>`;
    }
    paginationHTML += `
      <button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>
    `;
  }
  
  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `
      <button class="page-btn" onclick="changePage(${currentPage + 1})">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;
  }
  
  paginationHTML += `</div>`;
  paginationDiv.innerHTML = paginationHTML;
};

// Change page
const changePage = (page) => {
  const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderAddProductPage(currentProducts);
  renderPagination();
  
  // Scroll to top of table
  const tableContainer = document.querySelector('.container_admin');
  if (tableContainer) {
    tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Setup search functionality
const setupSearch = () => {
  const searchInput = document.getElementById('searchProductInput');
  if (!searchInput) return;
  
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchTerm = e.target.value.trim();
      currentPage = 1;
      loadAndDisplayProducts();
    }, 300); // Debounce 300ms
  });
};

// Show product detail
const showProductDetail = (productId) => {
  let productsLocal = JSON.parse(localStorage.getItem('products')) || [];
  const product = productsLocal.find(p => p.id == productId);
  
  if (!product) {
    showNotification('Không tìm thấy sản phẩm!', 'error');
    return;
  }

  const detailHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <div class="product-detail-container">
      <div class="product-detail-header">
        <h2>${product.name}</h2>
        <span class="product-id">Mã sản phẩm: ${product.id}</span>
      </div>
      
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='img/product/smoothie-strawberry.png'">
      </div>
      
      <div class="product-detail-info">
        <div class="detail-row">
          <span class="detail-label"><i class="fa-solid fa-tag"></i> Danh mục:</span>
          <span class="detail-value category">${product.category}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label"><i class="fa-solid fa-money-bill-wave"></i> Giá bán:</span>
          <span class="detail-value price">${formatCurrency(product.price)}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label"><i class="fa-solid fa-bottle-water"></i> Dung tích:</span>
          <span class="detail-value">${product.volume}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label"><i class="fa-solid fa-building"></i> Thương hiệu:</span>
          <span class="detail-value">${product.brand || 'Chưa cập nhật'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label"><i class="fa-solid fa-box"></i> Số lượng:</span>
          <span class="detail-value">${product.quantity || 0} sản phẩm</span>
        </div>
      </div>
      
      ${product.description ? `
      <div class="product-description">
        <h4><i class="fa-solid fa-circle-info"></i> Mô tả sản phẩm</h4>
        <p>${product.description}</p>
      </div>
      ` : ''}
      
      <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: center;">
        <button class="btn_admin btn_admin-submit" onclick="handleUpdateProductsAdmin('${product.id}'); overlayClose();">
          <i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa
        </button>
        <button class="btn_admin btn_admin-cancel" onclick="overlayClose()">
          <i class="fa-solid fa-times"></i> Đóng
        </button>
      </div>
    </div>
  `;

  showOverlay(detailHTML);
};

// Show add product form
function showAddProductForm() {
  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin" id="form_addProduct">
      <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">Thêm Sản Phẩm Mới</h2>
      
      <div class="form_controll_admin">
        <label for="file_product_admin" class="file_product_admin">
          <i class="fa-solid fa-upload"></i> Chọn hình ảnh sản phẩm
        </label>
        <input type="file" id="file_product_admin" accept="image/*" />
        <img src="" alt="preview" class="img_review_admin" style="display:none; max-width: 200px; margin-top: 10px;"/>
      </div>

      <div class="form_controll_admin">
        <label for="name_product_admin">Tên sản phẩm *</label>
        <input required type="text" id="name_product_admin" placeholder="Nhập tên sản phẩm..." />
      </div>

      <div class="form_controll_admin">
        <label for="category_product_admin">Danh mục *</label>
        <select id="category_product_admin" required>
          <option value="">-- Chọn danh mục --</option>
          <option value="Sinh tố">Sinh tố</option>
          <option value="Cà phê">Cà phê</option>
          <option value="Trà">Trà</option>
          <option value="Trà sữa">Trà sữa</option>
          <option value="Có ga">Có ga</option>
          <option value="Nước tăng lực">Nước tăng lực</option>
          <option value="Không ga">Không ga</option>
          <option value="Sữa">Sữa</option>
          <option value="Nước ép">Nước ép</option>
        </select>
      </div>

      <div class="form_controll_admin">
        <label for="price_product_admin">Giá sản phẩm (VNĐ) *</label>
        <input required type="number" id="price_product_admin" placeholder="Nhập giá..." min="0" step="1000" />
      </div>

      <div class="form_controll_admin">
        <label for="volume_product_admin">Dung tích *</label>
        <input required type="text" id="volume_product_admin" placeholder="VD: 500ml" />
      </div>

      <div class="form_controll_admin">
        <label for="description_product_admin">Mô tả sản phẩm</label>
        <textarea id="description_product_admin" rows="4" placeholder="Nhập mô tả sản phẩm..."></textarea>
      </div>

      <div class="form_controll_admin" style="display: flex; gap: 10px; justify-content: center;">
        <button type="submit" class="btn_admin btn_admin-submit">
          <i class="fa-solid fa-plus"></i> Thêm sản phẩm
        </button>
        <button type="button" onclick="overlayClose()" class="btn_admin btn_admin-cancel">
          <i class="fa-solid fa-xmark"></i> Hủy
        </button>
      </div>
    </form>
  `;
  
  showOverlay(formHTML);
  setupProductFormHandlers();
}

// Setup form handlers
function setupProductFormHandlers() {
  const fileInput = document.getElementById('file_product_admin');
  const imgReview = document.querySelector('.img_review_admin');
  
  if (fileInput && imgReview) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imgUrl = event.target.result;
          imgReview.src = imgUrl;
          imgReview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const form = document.getElementById('form_addProduct');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddProduct();
    });
  }
}

// Handle add product
function handleAddProduct() {
  const name = document.getElementById('name_product_admin').value.trim();
  const category = document.getElementById('category_product_admin').value;
  const price = parseInt(document.getElementById('price_product_admin').value);
  const volume = document.getElementById('volume_product_admin').value.trim();
  const description = document.getElementById('description_product_admin').value.trim();

  if (!name || !category || !price || !volume) {
    showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
    return;
  }

  let productsLocal = JSON.parse(localStorage.getItem('products')) || [];
  
  const newProduct = {
    id: parseInt(generateId()),
    name,
    category,
    price,
    volume,
    description: description || 'Chưa có mô tả',
    image: imgUrl || 'img/product/smoothie-strawberry.png',
    brand: 'Tự làm',
    quantity: 50
  };

  productsLocal.push(newProduct);
  localStorage.setItem('products', JSON.stringify(productsLocal));
  
  showNotification('Thêm sản phẩm thành công!');
  overlayClose();
  loadAndDisplayProducts();
  imgUrl = '';
}

// Handle update product
const handleUpdateProductsAdmin = (productId) => {
  let productsLocal = JSON.parse(localStorage.getItem('products')) || [];
  const product = productsLocal.find(p => p.id == productId);
  
  if (!product) {
    showNotification('Không tìm thấy sản phẩm!', 'error');
    return;
  }

  const formHTML = `
    <div class="overlay_close" onclick="overlayClose()">&times;</div>
    <form class="form_admin modern-form" id="form_updateProduct">
      <h2 style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 25px; font-size: 28px;">
        <i class="fa-solid fa-pen-to-square"></i> Chỉnh Sửa Sản Phẩm
      </h2>
      
      <!-- Section 1: Hình ảnh -->
      <div class="form-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-left: 4px solid #5a67d8;">
        <h3 class="section-title"><i class="fa-solid fa-image"></i> Hình Ảnh Sản Phẩm</h3>
        <div class="form_controll_admin" style="text-align: center;">
          <label for="file_product_admin" class="file_product_admin" style="display: inline-block; cursor: pointer; padding: 12px 24px; background: rgba(255,255,255,0.95); color: #667eea; border-radius: 8px; font-weight: 500; transition: all 0.3s ease;">
            <i class="fa-solid fa-upload"></i> Thay đổi hình ảnh
          </label>
          <input type="file" id="file_product_admin" accept="image/*" style="display: none;" />
          <img src="${product.image}" alt="preview" class="img_review_admin" style="max-width: 200px; margin-top: 15px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);"/>
        </div>
      </div>

      <!-- Section 2: Thông tin cơ bản -->
      <div class="form-section" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-left: 4px solid #f5576c;">
        <h3 class="section-title"><i class="fa-solid fa-info-circle"></i> Thông Tin Cơ Bản</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form_controll_admin">
            <label for="name_product_admin"><i class="fa-solid fa-tag"></i> Tên sản phẩm *</label>
            <input required type="text" id="name_product_admin" value="${product.name}" />
          </div>

          <div class="form_controll_admin">
            <label for="category_product_admin"><i class="fa-solid fa-list"></i> Danh mục *</label>
            <select id="category_product_admin" required>
              <option value="Sinh tố" ${product.category === 'Sinh tố' ? 'selected' : ''}>🍓 Sinh tố</option>
              <option value="Cà phê" ${product.category === 'Cà phê' ? 'selected' : ''}>☕ Cà phê</option>
              <option value="Trà" ${product.category === 'Trà' ? 'selected' : ''}>🍵 Trà</option>
              <option value="Trà sữa" ${product.category === 'Trà sữa' ? 'selected' : ''}>🧋 Trà sữa</option>
              <option value="Có ga" ${product.category === 'Có ga' ? 'selected' : ''}>🥤 Có ga</option>
              <option value="Nước tăng lực" ${product.category === 'Nước tăng lực' ? 'selected' : ''}>⚡ Nước tăng lực</option>
              <option value="Không ga" ${product.category === 'Không ga' ? 'selected' : ''}>💧 Không ga</option>
              <option value="Sữa" ${product.category === 'Sữa' ? 'selected' : ''}>🥛 Sữa</option>
              <option value="Nước ép" ${product.category === 'Nước ép' ? 'selected' : ''}>🍊 Nước ép</option>
            </select>
          </div>

          <div class="form_controll_admin">
            <label for="brand_product_admin"><i class="fa-solid fa-copyright"></i> Thương hiệu</label>
            <input type="text" id="brand_product_admin" value="${product.brand || ''}" placeholder="Ví dụ: Coca Cola, Pepsi..." />
          </div>

          <div class="form_controll_admin">
            <label for="volume_product_admin"><i class="fa-solid fa-flask"></i> Dung tích *</label>
            <input required type="text" id="volume_product_admin" value="${product.volume}" placeholder="Ví dụ: 500ml, 1L..." />
          </div>
        </div>
      </div>

      <!-- Section 3: Giá & Tồn kho -->
      <div class="form-section" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-left: 4px solid #fa709a;">
        <h3 class="section-title"><i class="fa-solid fa-coins"></i> Giá & Tồn Kho</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form_controll_admin">
            <label for="price_product_admin"><i class="fa-solid fa-dollar-sign"></i> Giá sản phẩm (VNĐ) *</label>
            <input required type="number" id="price_product_admin" value="${product.price}" min="0" step="1000" />
          </div>

          <div class="form_controll_admin">
            <label for="quantity_product_admin"><i class="fa-solid fa-boxes-stacked"></i> Số lượng tồn kho *</label>
            <input required type="number" id="quantity_product_admin" value="${product.quantity || 50}" min="0" placeholder="Nhập số lượng..." />
          </div>
        </div>
      </div>

      <!-- Section 4: Mô tả -->
      <div class="form-section" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-left: 4px solid #a8edea;">
        <h3 class="section-title"><i class="fa-solid fa-align-left"></i> Mô Tả Sản Phẩm</h3>
        <div class="form_controll_admin">
          <textarea id="description_product_admin" rows="4" placeholder="Nhập mô tả chi tiết về sản phẩm...">${product.description || ''}</textarea>
        </div>
      </div>

      <div class="form_controll_admin" style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button type="submit" class="btn_admin btn_admin-submit" style="padding: 12px 30px; font-size: 16px;">
          <i class="fa-solid fa-check"></i> Cập nhật
        </button>
        <button type="button" onclick="overlayClose()" class="btn_admin btn_admin-cancel" style="padding: 12px 30px; font-size: 16px;">
          <i class="fa-solid fa-xmark"></i> Hủy
        </button>
      </div>
    </form>
  `;

  showOverlay(formHTML);
  imgUrl = product.image;
  
  const fileInput = document.getElementById('file_product_admin');
  const imgReview = document.querySelector('.img_review_admin');
  
  if (fileInput && imgReview) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imgUrl = event.target.result;
          imgReview.src = imgUrl;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const form = document.getElementById('form_updateProduct');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name_product_admin').value.trim();
      const category = document.getElementById('category_product_admin').value;
      const price = parseInt(document.getElementById('price_product_admin').value);
      const volume = document.getElementById('volume_product_admin').value.trim();
      const description = document.getElementById('description_product_admin').value.trim();
      const brand = document.getElementById('brand_product_admin').value.trim();
      const quantity = parseInt(document.getElementById('quantity_product_admin').value) || 50;

      if (!name || !category || !price || !volume) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
      }

      const index = productsLocal.findIndex(p => p.id == productId);
      productsLocal[index] = {
        ...product,
        name,
        category,
        price,
        volume,
        description,
        image: imgUrl,
        brand: brand || 'Chưa cập nhật',
        quantity
      };

      localStorage.setItem('products', JSON.stringify(productsLocal));
      showNotification('Cập nhật sản phẩm thành công!');
      overlayClose();
      loadAndDisplayProducts();
    });
  }
};

// Handle delete product
const handleDeleteProductsAdmin = (productId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    return;
  }

  let productsLocal = JSON.parse(localStorage.getItem('products')) || [];
  productsLocal = productsLocal.filter(p => p.id != productId);
  
  localStorage.setItem('products', JSON.stringify(productsLocal));
  showNotification('Xóa sản phẩm thành công!');
  loadAndDisplayProducts();
};

// Initialize product management
function initProductManagement() {
  const addProductBtn = document.getElementById('addProductAdminBtn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', showAddProductForm);
  }
  
  setupSearch();
  loadAndDisplayProducts();
}

// Export functions
window.defaultClassification = defaultClassification;
window.handleCategoryFilter = handleCategoryFilter;
window.renderAddProductPage = renderAddProductPage;
window.handleUpdateProductsAdmin = handleUpdateProductsAdmin;
window.handleDeleteProductsAdmin = handleDeleteProductsAdmin;
window.showProductDetail = showProductDetail;
window.initProductManagement = initProductManagement;
window.changePage = changePage;
window.loadAndDisplayProducts = loadAndDisplayProducts;
