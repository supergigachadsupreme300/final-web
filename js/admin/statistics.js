// js/admin/statistics.js - Statistics Module

// Render statistics page
function renderStatisticsPage() {
  try {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const allOrders = getAllOrders(users);
    
    // Calculate statistics
    const stats = calculateStatistics(users, products, allOrders);
    
    // Create statistics HTML
    const statsHTML = `
      <div class="statistics-container">
        <!-- Summary Cards -->
        <div class="stats-summary">
          <div class="stat-card revenue">
            <div class="stat-icon">
              <i class="fa-solid fa-money-bill-trend-up"></i>
            </div>
            <div class="stat-content">
              <h3>Tổng Doanh Thu</h3>
              <p class="stat-value">${stats.totalRevenue.toLocaleString('vi-VN')}đ</p>
              <span class="stat-label">Từ ${stats.completedOrders} đơn hàng</span>
            </div>
          </div>

          <div class="stat-card profit">
            <div class="stat-icon">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div class="stat-content">
              <h3>Tổng Lợi Nhuận</h3>
              <p class="stat-value">${stats.totalProfit.toLocaleString('vi-VN')}đ</p>
              <span class="stat-label">Chênh lệch giá nhập-bán</span>
            </div>
          </div>

          <div class="stat-card orders">
            <div class="stat-icon">
              <i class="fa-solid fa-cart-shopping"></i>
            </div>
            <div class="stat-content">
              <h3>Tổng Đơn Hàng</h3>
              <p class="stat-value">${stats.totalOrders}</p>
              <span class="stat-label">${stats.pendingOrders} đang chờ xử lý</span>
            </div>
          </div>

          <div class="stat-card products">
            <div class="stat-icon">
              <i class="fa-solid fa-box"></i>
            </div>
            <div class="stat-content">
              <h3>Sản Phẩm</h3>
              <p class="stat-value">${stats.totalProducts}</p>
              <span class="stat-label">${stats.lowStockProducts} sắp hết hàng</span>
            </div>
          </div>

          <div class="stat-card customers">
            <div class="stat-icon">
              <i class="fa-solid fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>Khách Hàng</h3>
              <p class="stat-value">${stats.totalCustomers}</p>
              <span class="stat-label">${stats.activeCustomers} có đơn hàng</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Top Products -->
          <div class="chart-card">
            <h3><i class="fa-solid fa-trophy"></i> Top 5 Sản Phẩm Bán Chạy</h3>
            <div class="top-products-list">
              ${renderTopProducts(stats.topProducts)}
            </div>
          </div>

          <!-- Category Distribution -->
          <div class="chart-card">
            <h3><i class="fa-solid fa-chart-pie"></i> Phân Bổ Theo Danh Mục</h3>
            <div class="category-chart">
              ${renderCategoryChart(stats.categoryStats)}
            </div>
          </div>
        </div>

        <!-- Revenue by Time -->
        <div class="revenue-section">
          <div class="chart-card full-width">
            <h3><i class="fa-solid fa-chart-line"></i> Doanh Thu Theo Thời Gian</h3>
            <div class="revenue-chart">
              ${renderRevenueChart(stats.revenueByMonth)}
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="recent-orders-section">
          <div class="chart-card full-width">
            <h3><i class="fa-solid fa-clock"></i> Đơn Hàng Gần Đây</h3>
            <div class="recent-orders-table">
              ${renderRecentOrders(allOrders.slice(0, 10))}
            </div>
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById('statistics_container');
    if (container) {
      container.innerHTML = statsHTML;
    }
  } catch (error) {
    console.error('Error rendering statistics:', error);
  }
}

// Calculate all statistics
function calculateStatistics(users, products, orders) {
  const completedOrders = orders.filter(o => o.isVerify === 1);
  const pendingOrders = orders.filter(o => o.isVerify === 0);
  
  console.log('=== STATISTICS DEBUG ===');
  console.log('Total orders:', orders.length);
  console.log('Completed orders:', completedOrders.length);
  console.log('Products count:', products.length);
  
  // Total revenue and profit
  let totalRevenue = 0;
  let totalProfit = 0;
  
  completedOrders.forEach(order => {
    totalRevenue += (order.totalPrice || 0);
    
    // Calculate profit for this order
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach(item => {
        const product = products.find(p => p.id === (item.id || item.productId));
        if (product) {
          const costPrice = product.costPrice || 0;
          const sellingPrice = product.price || 0;
          const qty = item.qty || 1;
          const itemProfit = (sellingPrice - costPrice) * qty;
          totalProfit += itemProfit;
          
          console.log(`Product: ${product.name}, Cost: ${costPrice}, Price: ${sellingPrice}, Qty: ${qty}, Profit: ${itemProfit}`);
        } else {
          console.log(`Product not found: id=${item.id || item.productId}`);
        }
      });
    }
  });
  
  console.log('Total Revenue:', totalRevenue);
  console.log('Total Profit:', totalProfit);
  console.log('======================');
  
  // Product sales count
  const productSales = {};
  completedOrders.forEach(order => {
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach(item => {
        const productId = item.id || item.productId;
        if (productId) {
          productSales[productId] = (productSales[productId] || 0) + (item.qty || 1);
        }
      });
    }
  });
  
  // Top products with profit calculation
  const topProducts = products
    .map(p => {
      const soldCount = productSales[p.id] || 0;
      const revenue = soldCount * p.price;
      const cost = soldCount * (p.costPrice || 0);
      const profit = revenue - cost;
      
      return {
        ...p,
        soldCount,
        revenue,
        profit
      };
    })
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);
  
  // Category statistics with profit
  const categoryStats = {};
  completedOrders.forEach(order => {
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach(item => {
        const product = products.find(p => p.id === (item.id || item.productId));
        if (product) {
          const category = product.category;
          if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, revenue: 0, profit: 0 };
          }
          const qty = item.qty || 1;
          categoryStats[category].count += qty;
          categoryStats[category].revenue += qty * product.price;
          categoryStats[category].profit += qty * (product.price - (product.costPrice || 0));
        }
      });
    }
  });
  
  // Revenue by month
  const revenueByMonth = {};
  completedOrders.forEach(order => {
    if (order.orderTime) {
      const date = new Date(order.orderTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (order.totalPrice || 0);
    }
  });
  
  // Low stock products
  const lowStockProducts = products.filter(p => (p.quantity || 0) < 10).length;
  
  // Active customers (customers with orders)
  const activeCustomers = users.filter(u => !u.isAdmin && u.orders && u.orders.length > 0).length;
  
  return {
    totalRevenue,
    totalProfit,
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    totalProducts: products.length,
    lowStockProducts,
    totalCustomers: users.filter(u => !u.isAdmin).length,
    activeCustomers,
    topProducts,
    categoryStats,
    revenueByMonth
  };
}

// Get all orders from all users
function getAllOrders(users) {
  const allOrders = [];
  users.forEach(user => {
    if (user.orders && Array.isArray(user.orders)) {
      user.orders.forEach(order => {
        allOrders.push({
          ...order,
          customerName: user.name || user.username,
          customerPhone: user.phone || 'N/A'
        });
      });
    }
  });
  
  // Sort by time (newest first)
  return allOrders.sort((a, b) => {
    const timeA = new Date(a.orderTime || 0).getTime();
    const timeB = new Date(b.orderTime || 0).getTime();
    return timeB - timeA;
  });
}

// Render top products
function renderTopProducts(topProducts) {
  if (topProducts.length === 0) {
    return '<p style="text-align: center; color: #999; padding: 40px;">Chưa có dữ liệu</p>';
  }
  
  const maxSold = topProducts[0].soldCount;
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  
  return topProducts.map((product, index) => {
    const percentage = maxSold > 0 ? (product.soldCount / maxSold) * 100 : 0;
    
    return `
      <div class="top-product-item">
        <div class="product-rank">${medals[index]}</div>
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h4>${product.name}</h4>
          <p>${product.category}</p>
        </div>
        <div class="product-stats">
          <div class="sold-count">${product.soldCount} đã bán</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="revenue-amount">${product.revenue.toLocaleString('vi-VN')}đ</div>
        </div>
      </div>
    `;
  }).join('');
}

// Render category chart
function renderCategoryChart(categoryStats) {
  const categories = Object.keys(categoryStats);
  
  if (categories.length === 0) {
    return '<p style="text-align: center; color: #999; padding: 40px;">Chưa có dữ liệu</p>';
  }
  
  const totalCount = categories.reduce((sum, cat) => sum + categoryStats[cat].count, 0);
  
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#30cfd0', '#330867'
  ];
  
  return categories.map((category, index) => {
    const stats = categoryStats[category];
    const percentage = totalCount > 0 ? (stats.count / totalCount) * 100 : 0;
    const color = colors[index % colors.length];
    
    return `
      <div class="category-item">
        <div class="category-header">
          <span class="category-name">${category}</span>
          <span class="category-percentage">${percentage.toFixed(1)}%</span>
        </div>
        <div class="category-bar">
          <div class="category-fill" style="width: ${percentage}%; background: ${color}"></div>
        </div>
        <div class="category-stats">
          <span>${stats.count} sản phẩm</span>
          <span>${stats.revenue.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    `;
  }).join('');
}

// Render revenue chart
function renderRevenueChart(revenueByMonth) {
  const months = Object.keys(revenueByMonth).sort();
  
  if (months.length === 0) {
    return '<p style="text-align: center; color: #999; padding: 40px;">Chưa có dữ liệu</p>';
  }
  
  const maxRevenue = Math.max(...Object.values(revenueByMonth));
  
  return `
    <div class="revenue-bars">
      ${months.map(month => {
        const revenue = revenueByMonth[month];
        const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
        const [year, monthNum] = month.split('-');
        const monthName = `T${monthNum}/${year}`;
        
        return `
          <div class="revenue-bar-item">
            <div class="bar-container">
              <div class="bar-fill" style="height: ${height}%">
                <span class="bar-value">${(revenue / 1000).toFixed(0)}K</span>
              </div>
            </div>
            <div class="bar-label">${monthName}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Render recent orders
function renderRecentOrders(orders) {
  if (orders.length === 0) {
    return '<p style="text-align: center; color: #999; padding: 40px;">Chưa có đơn hàng nào</p>';
  }
  
  return `
    <table class="recent-orders-table-content">
      <thead>
        <tr>
          <th>Mã ĐH</th>
          <th>Khách hàng</th>
          <th>Thời gian</th>
          <th>Số lượng</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => {
          const itemCount = order.products ? order.products.reduce((sum, p) => sum + (p.qty || 1), 0) : 0;
          const statusClass = order.isVerify === 1 ? 'completed' : 'pending';
          const statusText = order.isVerify === 1 ? 'Đã xác nhận' : 'Chờ xử lý';
          const orderDate = new Date(order.orderTime);
          const formattedDate = orderDate.toLocaleDateString('vi-VN');
          const formattedTime = orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          
          return `
            <tr>
              <td><strong>${order.code || 'N/A'}</strong></td>
              <td>
                <div>${order.customerName || 'N/A'}</div>
                <small style="color: #999;">${order.customerPhone || ''}</small>
              </td>
              <td>
                <div>${formattedDate}</div>
                <small style="color: #999;">${formattedTime}</small>
              </td>
              <td>${itemCount}</td>
              <td><strong>${(order.totalPrice || 0).toLocaleString('vi-VN')}đ</strong></td>
              <td>
                <span class="order-status ${statusClass}">
                  ${statusText}
                </span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// Export functions
window.renderStatisticsPage = renderStatisticsPage;
