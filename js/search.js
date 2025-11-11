// Cấu hình phân trang: 8 sản phẩm mỗi trang
const PRODUCTS_PER_PAGE = 8;
let currentPage = 1;

// Khởi tạo trang sản phẩm
function initProductsPage() {
  renderCategories();
  currentPage = 1;
  renderProducts("Tất cả", "", currentPage); // ← Gọi với trang 1
  setupSearch();
}

// Render danh mục
function renderCategories() {
  const list = document.querySelector(".category-list"); //chọn ul làm điểm xuất danh sách
  const categories = ["Tất cả", ...new Set(products.map((p) => p.category))]; //liệt kê các mục đồ uống có trong kho sản phẩm
  list.innerHTML = categories // xuất ra ô danh mục với mỗi danh mục là một nút bấm
    .map(
      (c, i) => `
    <li class="category-item">
      <button class="category-btn ${
        i === 0 ? "active" : ""
      }" data-cat="${c}" id="${c}">${c}</button>
    </li>
  `
    )
    .join("");

  document.querySelectorAll(".category-btn").forEach((btn) => {
    //gắn sự kiện cho từng nút
    btn.onclick = () => {
      //khi bấm nút thì lọc sản phẩm theo danh mục tương ứng
      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active")); //bỏ active của các nút khác
      btn.classList.add("active"); //thêm active cho nút hiện tại
      const query = document.querySelector(".search-input").value.trim(); //lấy từ khóa tìm kiếm hiện tại
      currentPage = 1;
      renderProducts(btn.dataset.cat, query, currentPage, {}); // Xóa bộ lọc nâng cao
    };
  });
}

// Render sản phẩm
function renderProducts(filter = "Tất cả", search = "", page = 1, advancedFilters = {}) {
  const container = document.querySelector(".product-items"); //chọn thẻ ul chứa sản phẩm
  const paginationContainer =document.querySelector(".pagination") || createPaginationContainer(); //tạo thẻ phân trang nếu chưa có
  let items = products; //bắt đầu với tất cả sản phẩm

  // 1. Lọc danh mục
  if (filter !== "Tất cả")  items = items.filter((p) => p.category === filter);

  // 2. Lọc tìm kiếm
  // Lọc tìm kiếm cơ bản (thay bằng includes cho chứa chuỗi)
  if (search) items = items.filter( (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  
  if (advancedFilters.brand) items = items.filter((p) => p.brand.toLowerCase() === advancedFilters.brand.toLowerCase());// Lọc nâng cao thương hiệu
  if (advancedFilters.minPrice > 0) items = items.filter((p) => p.price >= advancedFilters.minPrice);// Lọc theo giá tối thiểu
  if (advancedFilters.maxPrice < Infinity) items = items.filter((p) => p.price <= advancedFilters.maxPrice);// Lọc theo giá tối đa
  if (advancedFilters.volume) items = items.filter((p) => p.volume.toLowerCase() === advancedFilters.volume.toLowerCase());// Lọc nâng cao dung tích
  
  // 4. Phân trang
  const totalItems = items.length; // Tổng số sản phẩm sau lọc
  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE); // Tổng số trang
  const startIndex = (page - 1) * PRODUCTS_PER_PAGE; // Chỉ số bắt đầu của trang hiện tại
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalItems); // Chỉ số kết thúc của trang hiện tại
  const paginatedItems = items.slice(startIndex, endIndex); // Lấy sản phẩm cho trang hiện tại

  currentPage = page > totalPages ? totalPages : page < 1 ? 1 : page; // Cập nhật trang hiện tại hợp lệ

  // 5. Render sản phẩm
  container.innerHTML =
    paginatedItems.length === 0 // Nếu không có sản phẩm nào sau lọc
      ? `<p style="grid-column: 1/-1; text-align:center; color:#999; padding: 20px;">Không tìm thấy sản phẩm nào phù hợp.</p>`
      : paginatedItems
          .map(
            (p) => `
        <li class="product-card" data-id="${p.id}">
          <div class="product-thumb">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='img/product/default.png'">
            <div class="thumb-circle"></div>
          </div>
          <div class="product-info">
            <p class="product-title"><i class="fa-solid fa-star"></i> ${p.name} <i class="fa-solid fa-star"></i></p>
            <button class="btn-buy" data-id="${p.id}">Mua ngay</button>
          </div>
        </li>
      `
          )
          .join(""); // Nối các thẻ li lại với nhau

  // Gắn sự kiện cho sản phẩm

  attachProductEvents(); //gắn sự kiện cho từng thẻ sản phẩm
  // Lưu lại để phân trang dùng
  window.lastFilter = filter; // Lưu bộ lọc hiện tại
  window.lastSearch = search; // Lưu từ khóa tìm kiếm hiện tại
  window.lastAdvanced = advancedFilters; // Lưu bộ lọc nâng cao hiện tại
  renderPagination(totalPages, currentPage, filter, search, advancedFilters); // Render phân trang
}

// Hàm addToCart toàn cục
function addToCart(name, price, qty = 1) {
  // BẮT BUỘC ĐĂNG NHẬP
  if (!isLoggedIn()) { alert("Vui lòng đăng nhập để thêm vào giỏ hàng!"); return;}
  // Lấy userName từ localStorage
  const userName = localStorage.getItem("userName");
  const cartKey = `cart_${userName}`; // Key riêng cho từng user

  let cart = JSON.parse(localStorage.getItem(cartKey) || "[]"); // Lấy giỏ hàng hiện tại

  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const existing = cart.find((i) => i.name === name);
  if (existing) existing.qty += qty; // Nếu có rồi thì tăng số lượng
  else cart.push({ name, price, qty });// Nếu chưa có thì thêm mới

  localStorage.setItem(cartKey, JSON.stringify(cart)); // Lưu lại giỏ hàng
  if (typeof renderCart === "function") renderCart(); // Cập nhật hiển thị giỏ hàng nếu hàm tồn tại
}

// Gắn sự kiện sản phẩm
function attachProductEvents() {
  document.querySelectorAll(".product-card").forEach((card) => {
    //chọn tất cả thẻ sản phẩm
    card.onclick = (e) => {
      //khi bấm vào thẻ sản phẩm
      if (e.target.closest(".btn-buy")) return; //nếu bấm vào nút mua ngay thì không làm gì cả
      showProductDetail(parseInt(card.dataset.id)); //hiển thị chi tiết sản phẩm
    };
  });

  document.querySelectorAll(".btn-buy").forEach((btn) => {
    //chọn tất cả nút mua ngay
    btn.onclick = (e) => {
      //khi bấm vào nút mua ngay
      if (!isLoggedIn()) {alert("Vui lòng đăng nhập để thêm vào giỏ hàng!"); return;}
      
      e.stopPropagation(); //ngăn không cho sự kiện bấm thẻ sản phẩm kích hoạt
      const id = parseInt(btn.dataset.id); //lấy id sản phẩm từ data-id
      const p = products.find((x) => x.id === id); //tìm sản phẩm trong mảng products
      if (p.quantity==0){ alert("Sản phẩm đã hết hàng!"); return;} 
      addToCart(p.name, p.price, 1); //thêm sản phẩm vào giỏ với số lượng 1
      alert(`Đã thêm "${p.name}" vào giỏ!`);
    };
  });
}

// Thiết lập tìm kiếm
function setupSearch() {
  const input = document.querySelector(".search-input"); //chọn ô input tìm kiếm
  const btn = document.querySelector(".search-btn"); //chọn nút bấm tìm kiếm

  if (!input || !btn) return; //nếu không tìm thấy thì dừng hàm

  const search = () => {
    const q = input.value.trim(); //lấy từ khóa tìm kiếm và loại bỏ khoảng trắng thừa
    const activeBtn = document.querySelector(".category-btn.active"); //tìm nút danh mục đang được chọn
    const cat = activeBtn?.dataset.cat || "Tất cả"; //lấy danh mục từ data-cat hoặc mặc định là "Tất cả"
    currentPage = 1;
    renderProducts(cat, q, currentPage, {}); // Reset bộ lọc nâng cao
  };

  btn.onclick = search; //khi bấm nút tìm kiếm thì gọi hàm search
  input.onkeypress = (e) => {
    //khi nhấn phím trong ô input
    if (e.key === "Enter") {
      //nếu phím nhấn là Enter
      e.preventDefault(); //ngăn hành động mặc định (gửi form)
      search(); //gọi hàm search
    }
  };
}

// Export hàm để dùng ở nơi khác
window.setupSearch = setupSearch;


// ==================== CẬP NHẬT: TÌM KIẾM NÂNG CAO HIỂN THỊ NGAY KHI NHẤN APPLY====================
// Khởi tạo tìm kiếm nâng cao
function initAdvancedSearch() {
  const toggleBtn = document.querySelector(".advanced-toggle-btn"); //nút bấm mở/đóng tìm kiếm nâng cao
  const advancedBox = document.querySelector(".advanced-search-box"); //khung chứa form tìm kiếm nâng cao
  const applyBtn = document.querySelector(".apply-advanced"); //nút bấm áp dụng bộ lọc nâng cao
  const clearBtn = document.querySelector(".clear-advanced"); //nút bấm xóa bộ lọc nâng cao

  if (!toggleBtn || !advancedBox) return;

  // Nhấn "+ Nâng cao" → mở toàn bộ form ngay
  toggleBtn.onclick = () => {
    const isHidden = advancedBox.style.display === "none";
    advancedBox.style.display = isHidden ? "block" : "none";
    toggleBtn.textContent = isHidden ? "− Thu gọn" : "+ Nâng cao";
  };

  // Áp dụng bộ lọc
  if (applyBtn) {
    applyBtn.onclick = () => {
      const search = document.querySelector(".search-input").value.trim();
      const cat = document.querySelector(".category-btn.active")?.dataset.cat || "Tất cả";
      const brand = document.getElementById("brand-input").value.trim();
      const minPrice = parseInt(document.getElementById("min-price").value) || 0;
      const maxPrice = parseInt(document.getElementById("max-price").value) || Infinity;
      const volume = document.getElementById("volume-input").value.trim();

      const advancedFilters = { brand, minPrice, maxPrice, volume };

      currentPage = 1;
      renderProducts(cat, search, currentPage, advancedFilters); // ĐÚNG 4 tham số
    };
  }

  // Xóa bộ lọc
  if (clearBtn) {
    clearBtn.onclick = () => {
      document.getElementById("brand-input").value = "";
      document.getElementById("min-price").value = "";
      document.getElementById("max-price").value = "";
      document.getElementById("volume-input").value = "";

      const activeCat =
        document.querySelector(".category-btn.active")?.dataset.cat || "Tất cả";
      const search = document.querySelector(".search-input").value.trim();

      currentPage = 1;
      renderProducts(activeCat, search, currentPage, {}); // Không có bộ lọc nâng cao
    };
  }
}

// Tích hợp vào initProductsPage
if (typeof initProductsPage === "function") {
  const originalInit = initProductsPage;
  initProductsPage = function () {
    originalInit();
    initAdvancedSearch();
  };
}
window.initAdvancedSearch = initAdvancedSearch;


//container phân trang
function createPaginationContainer() {
  const main = document.querySelector(".products-main");
  let pagination = main.querySelector(".pagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.className = "pagination";
    pagination.style.cssText = "margin-top: 30px; text-align: center;";
    main.querySelector(".products-grid").after(pagination);
  }
  return pagination;
}

//thêm hàm chuyển trang và render phân trang
function renderPagination(totalPages,currentPage,filter,search,advancedFilters = {}) {
  const pagination = document.querySelector(".pagination");
  if (totalPages <= 1) { pagination.innerHTML = ""; return;}

  let html = `<div class="pagination-controls">`; // Wrapper cho các nút phân trang

  const buildOnClick = (page) => `changePage(${page})`; // Hàm xây dựng chuỗi onclick

  // Nút Trước
  if (currentPage > 1) {
    html += `<button class="page-btn" onclick="${buildOnClick(
      currentPage - 1
    )}">Trước</button>`;
  }
  else { html += `<button class="page-btn disabled">Trước</button>`;}

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += `<button class="page-btn" onclick="${buildOnClick(1)}">1</button>`;
    if (startPage > 2) html += `<span class="page-dots">...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" 
              onclick="${buildOnClick(i)}">${i}</button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
    html += `<button class="page-btn" onclick="${buildOnClick(
      totalPages
    )}">${totalPages}</button>`;
  }

  // Nút Sau

  if (currentPage < totalPages) {
    html += `<button class="page-btn" onclick="${buildOnClick(
      currentPage + 1
    )}">Sau</button>`;
  } 
  else { html += `<button class="page-btn disabled">Sau</button>`;}

  html += `</div>`;
  pagination.innerHTML = html;
}

function changePage(page) {
  // Lấy dữ liệu từ lần render trước
  const filter = window.lastFilter || "Tất cả";
  const search = window.lastSearch || "";
  const advancedFilters = window.lastAdvanced || {};

  currentPage = page;
  renderProducts(filter, search, page, advancedFilters);
  document
    .querySelector(".products-main")
    .scrollIntoView({ behavior: "smooth" });
}

// Export hàm để dùng ở nơi khác
window.setupSearch = setupSearch;
